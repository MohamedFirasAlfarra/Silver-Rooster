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

-- 3. إنشاء جدول Profiles (الملفات الشخصية)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  full_name TEXT,
  age INTEGER,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- 9. إنشاء جداول الطلبات (Orders)
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
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

-- 10. إدراج بعض المنتجات الافتراضية
INSERT INTO products (
  name, name_ar, category, category_ar, type, type_ar, 
  quantity, ingredients, ingredients_ar, description, description_ar, 
  price, image_url
) VALUES 
(
  'Fresh Chicken Breast',
  'صدور دجاج طازجة',
  'chicken',
  'دجاج',
  'breast',
  'صدر',
  50,
  '100% fresh chicken breast',
  '١٠٠٪ صدور دجاج طازجة',
  'Premium quality fresh chicken breast, perfect for grilling or cooking',
  'صدور دجاج طازجة عالية الجودة، مثالية للشوي أو الطهي',
  25.99,
  '/images/chicken-breast.jpg'
),
(
  'Whole Chicken',
  'دجاجة كاملة',
  'chicken', 
  'دجاج',
  'whole',
  'كاملة',
  30,
  'Fresh whole chicken',
  'دجاجة كاملة طازجة',
  'Fresh whole chicken, ready for roasting or cutting',
  'دجاجة كاملة طازجة، جاهزة للتحمير أو التقطيع',
  45.50,
  '/images/whole-chicken.jpg'
),
(
  'Chicken Thighs',
  'أفخاذ دجاج',
  'chicken',
  'دجاج', 
  'thighs',
  'أفخاذ',
  40,
  'Fresh chicken thighs',
  'أفخاذ دجاج طازجة',
  'Tender and juicy chicken thighs, great for various recipes',
  'أفخاذ دجاج طرية وعصارية، ممتازة للوصفات المختلفة',
  20.75,
  '/images/chicken-thighs.jpg'
)
ON CONFLICT (id) DO NOTHING;

-- 11. إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 12. إنشاء أو تحديث حساب المسؤول
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- البحث عن مستخدم المسؤول في auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@chickenmarket.com';
    
    -- إذا وجد المستخدم، إنشاء/تحديث البروفايل
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, email, role)
        VALUES (admin_user_id, 'admin@chickenmarket.com', 'admin')
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin',
            email = EXCLUDED.email;
        
        RAISE NOTICE '✅ تم إنشاء/تحديث حساب المسؤول بنجاح';
    ELSE
        RAISE NOTICE '⚠️  لم يتم العثور على المستخدم admin@chickenmarket.com في auth.users';
        RAISE NOTICE '📧 يرجى إنشاء المستخدم أولاً عبر Authentication في Supabase';
    END IF;
END $$;

-- 13. التحقق النهائي من التهيئة
DO $$
DECLARE
    profiles_count INTEGER;
    products_count INTEGER;
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profiles_count FROM profiles;
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
    
    RAISE NOTICE '=========================================';
    RAISE NOTICE '✅ تم تهيئة قاعدة البيانات بنجاح';
    RAISE NOTICE '📊 عدد البروفايلات: %', profiles_count;
    RAISE NOTICE '🛒 عدد المنتجات: %', products_count;
    RAISE NOTICE '👑 عدد المسؤولين: %', admin_count;
    RAISE NOTICE '=========================================';
    
    IF admin_count = 0 THEN
        RAISE NOTICE '⚠️  لم يتم إنشاء أي حساب مسؤول بعد';
        RAISE NOTICE '💡 تأكد من إنشاء المستخدم في Authentication أولاً';
    END IF;
END $$;