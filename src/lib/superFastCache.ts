class SuperFastCache {
  private memoryCache = new Map<string, { data: any; timestamp: number; priority: number }>();
  private indexedDB: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private maxMemoryItems = 100;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initIndexedDB();
    this.startCleanup();
  }

  private initIndexedDB(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open('silver-rooster-cache', 2);

        request.onerror = () => {
          console.warn('⚠️ IndexedDB not available, using memory cache only');
          resolve();
        };

        request.onsuccess = (event) => {
          this.indexedDB = (event.target as IDBOpenDBRequest).result;
          console.log('✅ IndexedDB initialized');
          resolve();
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains('products')) {
            const store = db.createObjectStore('products');
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
          
          if (!db.objectStoreNames.contains('categories')) {
            db.createObjectStore('categories');
          }
          
          if (!db.objectStoreNames.contains('user_data')) {
            db.createObjectStore('user_data');
          }
        };
      } catch (error) {
        console.warn('⚠️ IndexedDB init error:', error);
        resolve();
      }
    });

    return this.initPromise;
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.clearOldCache();
    }, 5 * 60 * 1000);
  }

  async set(key: string, value: any, priority: number = 1): Promise<void> {
    const cacheItem = {
      data: value,
      timestamp: Date.now(),
      priority
    };

    this.memoryCache.set(key, cacheItem);

    if (this.memoryCache.size > this.maxMemoryItems) {
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].priority - b[1].priority);
      this.memoryCache.delete(entries[0][0]);
    }

    setTimeout(async () => {
      try {
        await this.initPromise;
        if (!this.indexedDB) return;

        const transaction = this.indexedDB.transaction(['products'], 'readwrite');
        const store = transaction.objectStore('products');
        store.put(cacheItem, key);
      } catch (error) {
        console.warn('⚠️ IndexedDB write failed:', error);
      }
    }, 0);
  }

  async get<T>(key: string): Promise<T | null> {
    const memoryData = this.memoryCache.get(key);
    if (memoryData && Date.now() - memoryData.timestamp < 10 * 60 * 1000) {
      return memoryData.data as T;
    }

    try {
      await this.initPromise;
      if (!this.indexedDB) return null;

      return new Promise((resolve) => {
        const transaction = this.indexedDB!.transaction(['products'], 'readonly');
        const store = transaction.objectStore('products');
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result;
          if (result && Date.now() - result.timestamp < 10 * 60 * 1000) {
            this.memoryCache.set(key, result);
            resolve(result.data);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.warn('⚠️ Cache read failed:', error);
      return null;
    }
  }

  clearOldCache(): void {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp > 30 * 60 * 1000) {
        this.memoryCache.delete(key);
      }
    }
  }

  clear(): void {
    this.memoryCache.clear();
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  async getStats() {
    await this.initPromise;
    return {
      memorySize: this.memoryCache.size,
      hasIndexedDB: !!this.indexedDB
    };
  }
}

export const superFastCache = new SuperFastCache();