class SupabaseKeepAliveService {
  private static instance: SupabaseKeepAliveService;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private maxRetries = 5;

  private constructor() {}

  static getInstance(): SupabaseKeepAliveService {
    if (!SupabaseKeepAliveService.instance) {
      SupabaseKeepAliveService.instance = new SupabaseKeepAliveService();
    }
    return SupabaseKeepAliveService.instance;
  }

  async pingSupabase(): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      const response = await fetch(
        `https://okxbrblabltnmqxtbpap.supabase.co/rest/v1/products?select=id&limit=1`,
        {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reGJyYmxhYmx0bm1xeHRicGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzY0MjksImV4cCI6MjA3ODUxMjQyOX0.aSAl8zU79bX_0QNibFer08fjLx8lVmYuyp6IDgo8HQw',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reGJyYmxhYmx0bm1xeHRicGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzY0MjksImV4cCI6MjA3ODUxMjQyOX0.aSAl8zU79bX_0QNibFer08fjLx8lVmYuyp6IDgo8HQw`,
            'Prefer': 'count=exact'
          },
          mode: 'cors',
          cache: 'no-store'
        }
      );

      const elapsed = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`✅ Supabase ping successful (${elapsed}ms)`);
        this.retryCount = 0;
        return true;
      } else {
        console.warn(`⚠️ Supabase ping failed (${response.status})`);
        return false;
      }
    } catch (error) {
      console.error('❌ Supabase ping error:', error);
      this.retryCount++;
      
      if (this.retryCount <= this.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
        console.log(`⏳ Retrying in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.pingSupabase();
      }
      
      return false;
    }
  }

  start(): void {
    if (this.isRunning) return;
    
    console.log('🚀 Starting Supabase Keep-Alive Service');
    this.isRunning = true;
    
    // Ping immediately on start
    this.pingSupabase();
    
    // Ping every 4 minutes (less than 5 to prevent sleep)
    this.intervalId = setInterval(() => {
      this.pingSupabase();
    }, 4 * 60 * 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Stopped Supabase Keep-Alive Service');
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

export const supabaseKeepAlive = SupabaseKeepAliveService.getInstance();