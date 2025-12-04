-- 1. حذف الجداول القديمة (لتجنب التعارضات)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. إنشاء دالة مساعدة للتحقق من دور المسؤول (يجب إنشاؤها أولاً)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. إنشاء جدول Profiles (الملفات الشخصية) مع إضافة telegram_chat_id
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  full_name TEXT,
  age INTEGER,
  phone TEXT,
  address TEXT,
  telegram_chat_id TEXT, -- ⬅️ الحقل الجديد لإشعارات التلجرام
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW() -- ⬅️ أضفنا updated_at هنا أيضًا
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. سياسات Profiles المبسطة بدون تكرار
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can do everything on profiles" ON profiles
FOR ALL USING (is_admin());

-- 5. دالة Trigger لإنشاء Profile تلقائياً عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. إنشاء جدول المنتجات (Products)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  category TEXT NOT NULL,
  category_ar TEXT NOT NULL,
  type TEXT NOT NULL,
  type_ar TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  ingredients TEXT NOT NULL,
  ingredients_ar TEXT NOT NULL,
  description TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT NOT NULL,
  seller_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- سياسات المنتجات
CREATE POLICY "Anyone can view products" ON products
FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON products
FOR ALL USING (is_admin());

-- 7. إنشاء جدول السلة (Cart)
CREATE TABLE cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for user own cart" ON cart
FOR ALL USING (auth.uid() = user_id);

-- 8. إنشاء جدول المفضلة (Favorites)
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for user own favorites" ON favorites
FOR ALL USING (auth.uid() = user_id);

-- 9. إنشاء جداول الطلبات (Orders) مع حقل updated_at
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  delivery_address TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  governorate TEXT NOT NULL,
  notes TEXT,
  delivery_type TEXT NOT NULL DEFAULT 'delivery',
  delivery_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW() -- ⬅️ هذا هو الحقل المفقود!
);

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- سياسات الطلبات
CREATE POLICY "Users can view own orders" ON orders
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage orders" ON orders
FOR ALL USING (is_admin());

-- سياسات عناصر الطلب
CREATE POLICY "Users can view own order items" ON order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own order items" ON order_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage order items" ON order_items
FOR ALL USING (is_admin());

-- 10. Trigger لتحديث updated_at تلقائياً في جدول orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_orders_updated_at ON orders;
CREATE TRIGGER trigger_update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- 11. Trigger لتحديث updated_at تلقائياً في جدول order_items
CREATE OR REPLACE FUNCTION update_order_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_order_items_updated_at ON order_items;
CREATE TRIGGER trigger_update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_items_updated_at();

-- 12. Trigger لتحديث updated_at تلقائياً في جدول profiles
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- 13. Trigger لتحديث updated_at تلقائياً في جدول products
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_products_updated_at ON products;
CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- 14. إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_chat_id ON profiles(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 15. دالة لإرسال إشعارات التلجرام (للاستخدام في Triggers أو دوال مستقبلية)
CREATE OR REPLACE FUNCTION notify_telegram_on_order()
RETURNS TRIGGER AS $$
DECLARE
  user_profile profiles;
  admin_message TEXT;
  user_message TEXT;
BEGIN
  -- الحصول على بيانات المستخدم
  SELECT * INTO user_profile FROM profiles WHERE id = NEW.user_id;
  
  -- هنا يمكنك إضافة كود HTTP لإرسال رسائل التلجرام
  -- نستخدم كود الجافاسكريبت في التطبيق الرئيسي لهذا
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. Trigger لإرسال الإشعارات (اختياري)
DROP TRIGGER IF EXISTS on_order_created_telegram ON orders;
CREATE TRIGGER on_order_created_telegram
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_telegram_on_order();

-- 17. إنشاء أو تحديث حساب المسؤول
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- البحث عن مستخدم المسؤول في auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@silverrooster.com'; -- ⬅️ تأكد من أن البريد صحيح
    
    -- إذا وجد المستخدم، إنشاء/تحديث البروفايل
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, role)
        VALUES (admin_user_id, 'admin@silverrooster.com', 'admin')
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin',
            email = EXCLUDED.email,
            updated_at = NOW();
        
        RAISE NOTICE '✅ تم إنشاء/تحديث حساب المسؤول بنجاح';
        RAISE NOTICE '👑 البريد: admin@silverrooster.com';
        RAISE NOTICE '🔑 الدور: admin';
    ELSE
        RAISE NOTICE '⚠️  لم يتم العثور على المستخدم admin@silverrooster.com في auth.users';
        RAISE NOTICE '📧 يرجى إنشاء المستخدم أولاً عبر Authentication في Supabase';
    END IF;
END $$;

-- 18. التحقق النهائي من التهيئة
DO $$
DECLARE
    profiles_count INTEGER;
    products_count INTEGER;
    orders_count INTEGER;
    admin_count INTEGER;
    has_orders_updated_at BOOLEAN;
    has_products_updated_at BOOLEAN;
    has_profiles_updated_at BOOLEAN;
    admin_emails TEXT;
BEGIN
    SELECT COUNT(*) INTO profiles_count FROM profiles;
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO orders_count FROM orders;
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
    
    -- جمع جميع بريدات المسؤولين في سلسلة واحدة
    SELECT STRING_AGG(email, ', ') INTO admin_emails 
    FROM profiles WHERE role = 'admin' LIMIT 5;
    
    -- التحقق من وجود الحقول updated_at
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'updated_at'
    ) INTO has_orders_updated_at;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'updated_at'
    ) INTO has_products_updated_at;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'updated_at'
    ) INTO has_profiles_updated_at;
    
    RAISE NOTICE '=========================================';
    RAISE NOTICE '✅ تم تهيئة قاعدة البيانات بنجاح';
    RAISE NOTICE '📊 عدد البروفايلات: %', profiles_count;
    RAISE NOTICE '🛒 عدد المنتجات: %', products_count;
    RAISE NOTICE '📦 عدد الطلبات: %', orders_count;
    RAISE NOTICE '👑 عدد المسؤولين: %', admin_count;
    
    IF admin_count > 0 AND admin_emails IS NOT NULL THEN
        RAISE NOTICE '📧 حسابات المسؤولين المتاحة:';
        RAISE NOTICE '   %', admin_emails;
    END IF;
    
    RAISE NOTICE '🕒 حقل updated_at في الطلبات: %', CASE WHEN has_orders_updated_at THEN '✅ مضاف' ELSE '❌ غير مضاف' END;
    RAISE NOTICE '🕒 حقل updated_at في المنتجات: %', CASE WHEN has_products_updated_at THEN '✅ مضاف' ELSE '❌ غير مضاف' END;
    RAISE NOTICE '🕒 حقل updated_at في البروفايلات: %', CASE WHEN has_profiles_updated_at THEN '✅ مضاف' ELSE '❌ غير مضاف' END;
    RAISE NOTICE '=========================================';
    
    IF admin_count = 0 THEN
        RAISE NOTICE '⚠️  لم يتم إنشاء أي حساب مسؤول بعد';
        RAISE NOTICE '💡 خطوات إنشاء حساب المسؤول:';
        RAISE NOTICE '   1. اذهب إلى Authentication في Supabase';
        RAISE NOTICE '   2. أنشئ مستخدم جديد بالبريد: admin@silverrooster.com';
        RAISE NOTICE '   3. ارجع وشغل هذا الكود مرة أخرى';
    END IF;
END $$;