# معلومات Supabase الحقيقية

لقد لاحظت أنك تستخدم Supabase حقيقي! 🎉

## ⚠️ تحذير أمني مهم جداً

**لا تشارك مفتاح `anon key` الحقيقي علناً!** 

لقد قمت بوضع مفتاح مؤقت في الكود. يجب عليك:

1. **الحصول على المفتاح الصحيح:**
   - اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
   - اختر مشروعك: `okxbrblabltnmqxtbpap`
   - اذهب إلى Settings → API
   - انسخ `anon/public key`

2. **تحديث الملفات:**
   - افتح ملف `src/lib/supabase.ts`
   - استبدل `supabaseAnonKey` بالمفتاح الحقيقي
   - افتح ملف `.env`
   - استبدل `VITE_SUPABASE_ANON_KEY` بالمفتاح الحقيقي

3. **تأكد من إنشاء الجداول:**
   - افتح SQL Editor في Supabase
   - نفذ الكود من ملف `SUPABASE_SETUP.md`

## 🔧 إصلاح الخطأ 400

الخطأ الذي تواجهه سببه:

1. **الجدول غير موجود** - تأكد من إنشاء جدول `products`
2. **الأعمدة غير متطابقة** - تأكد من أن الأعمدة في الجدول تطابق البيانات المرسلة
3. **صلاحيات RLS** - تأكد من تفعيل السياسات الصحيحة

## ✅ خطوات الحل:

### 1. إنشاء جدول المنتجات

```sql
-- حذف الجدول القديم إن وجد
DROP TABLE IF EXISTS products CASCADE;

-- إنشاء الجدول الجديد
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
  seller_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- السياسات (السماح للجميع بالإدارة للتجربة)
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete products" ON products FOR DELETE USING (true);
```

### 2. إنشاء جدول السلة

```sql
-- حذف الجدول القديم إن وجد
DROP TABLE IF EXISTS cart CASCADE;

-- إنشاء الجدول الجديد
CREATE TABLE cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- تفعيل Row Level Security
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- السياسات
CREATE POLICY "Anyone can view cart" ON cart FOR SELECT USING (true);
CREATE POLICY "Anyone can add to cart" ON cart FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update cart" ON cart FOR UPDATE USING (true);
CREATE POLICY "Anyone can remove from cart" ON cart FOR DELETE USING (true);

-- Index للأداء
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_product_id ON cart(product_id);
```

### 3. إنشاء جدول المفضلة

```sql
-- حذف الجدول القديم إن وجد
DROP TABLE IF EXISTS favorites CASCADE;

-- إنشاء الجدول الجديد
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- تفعيل Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- السياسات
CREATE POLICY "Anyone can view favorites" ON favorites FOR SELECT USING (true);
CREATE POLICY "Anyone can add to favorites" ON favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove from favorites" ON favorites FOR DELETE USING (true);

-- Index للأداء
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);
```

### 4. إضافة بيانات تجريبية (9 منتجات متنوعة)

```sql
INSERT INTO products (name, name_ar, category, category_ar, type, type_ar, quantity, ingredients, ingredients_ar, description, description_ar, price, image_url, seller_id) VALUES
('Grilled Whole Chicken', 'دجاج كامل مشوي', 'Oven Roasted', 'دجاج بالفرن', 'Whole Chicken', 'دجاج كامل', 1, 'Chicken, Salt, Black Pepper, Garlic, Lemon, Olive Oil, Herbs', 'دجاج، ملح، فلفل أسود، ثوم، ليمون، زيت زيتون، أعشاب', 'Perfectly roasted whole chicken with aromatic herbs and spices. Juicy and tender.', 'دجاج كامل مشوي بالفرن مع الأعشاب والتوابل العطرية. طري ولذيذ.', 85, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=600&fit=crop', 'admin-user-id'),
('Spicy Chicken Wings', 'أجنحة دجاج حارة', 'Oven Baked', 'دجاج بالفرن', 'Chicken Wings', 'أجنحة دجاج', 12, 'Chicken Wings, Hot Sauce, Butter, Garlic Powder, Paprika, Salt', 'أجنحة دجاج، صلصة حارة، زبدة، بودرة ثوم، بابريكا، ملح', 'Crispy oven-baked chicken wings with a spicy kick. Perfect for sharing.', 'أجنحة دجاج مقرمشة بالفرن مع نكهة حارة. مثالية للمشاركة.', 45, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&h=600&fit=crop', 'admin-user-id'),
('Herb Roasted Chicken Breast', 'صدور دجاج بالأعشاب', 'Oven Roasted', 'دجاج بالفرن', 'Chicken Breast', 'صدور دجاج', 2, 'Chicken Breast, Rosemary, Thyme, Garlic, Olive Oil, Lemon, Salt, Pepper', 'صدور دجاج، إكليل الجبل، زعتر، ثوم، زيت زيتون، ليمون، ملح، فلفل', 'Tender chicken breast marinated with fresh herbs and roasted to perfection.', 'صدور دجاج طرية متبلة بالأعشاب الطازجة ومشوية بالفرن.', 55, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=600&fit=crop', 'admin-user-id'),
('BBQ Chicken Thighs', 'أفخاذ دجاج بالباربكيو', 'Oven Baked', 'دجاج بالفرن', 'Chicken Thighs', 'أفخاذ دجاج', 6, 'Chicken Thighs, BBQ Sauce, Honey, Garlic, Onion Powder, Smoked Paprika', 'أفخاذ دجاج، صلصة باربكيو، عسل، ثوم، بودرة بصل، بابريكا مدخنة', 'Juicy chicken thighs glazed with sweet and tangy BBQ sauce.', 'أفخاذ دجاج طرية مغطاة بصلصة الباربكيو الحلوة والحامضة.', 50, 'https://images.unsplash.com/photo-1633964913295-ceb43826e36f?w=800&h=600&fit=crop', 'admin-user-id'),
('Lemon Garlic Chicken', 'دجاج بالليمون والثوم', 'Oven Roasted', 'دجاج بالفرن', 'Whole Chicken', 'دجاج كامل', 1, 'Chicken, Fresh Lemon, Garlic Cloves, Butter, Parsley, Salt, Black Pepper', 'دجاج، ليمون طازج، فصوص ثوم، زبدة، بقدونس، ملح، فلفل أسود', 'Aromatic whole chicken roasted with fresh lemon and garlic. A classic favorite.', 'دجاج كامل عطري مشوي بالليمون الطازج والثوم. طبق كلاسيكي مفضل.', 90, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=600&fit=crop', 'admin-user-id'),
('Honey Mustard Chicken', 'دجاج بالعسل والخردل', 'Oven Baked', 'دجاج بالفرن', 'Chicken Breast', 'صدور دجاج', 4, 'Chicken Breast, Honey, Dijon Mustard, Garlic, Olive Oil, Thyme', 'صدور دجاج، عسل، خردل ديجون، ثوم، زيت زيتون، زعتر', 'Sweet and savory chicken breast with honey mustard glaze.', 'صدور دجاج حلوة ولذيذة مع صلصة العسل والخردل.', 60, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=600&fit=crop', 'admin-user-id'),
('Teriyaki Chicken', 'دجاج تيرياكي', 'Oven Baked', 'دجاج بالفرن', 'Chicken Thighs', 'أفخاذ دجاج', 4, 'Chicken Thighs, Teriyaki Sauce, Ginger, Garlic, Sesame Seeds, Green Onions', 'أفخاذ دجاج، صلصة تيرياكي، زنجبيل، ثوم، سمسم، بصل أخضر', 'Asian-inspired teriyaki chicken with a sweet and savory glaze.', 'دجاج تيرياكي بنكهة آسيوية مع صلصة حلوة ولذيذة.', 65, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800&h=600&fit=crop', 'admin-user-id'),
('Cajun Spiced Chicken', 'دجاج بالتوابل الكاجون', 'Oven Roasted', 'دجاج بالفرن', 'Chicken Breast', 'صدور دجاج', 3, 'Chicken Breast, Cajun Spices, Paprika, Cayenne Pepper, Garlic Powder, Onion Powder', 'صدور دجاج، توابل كاجون، بابريكا، فلفل حار، بودرة ثوم، بودرة بصل', 'Bold and spicy Cajun-seasoned chicken breast with a kick.', 'صدور دجاج متبلة بتوابل الكاجون الجريئة والحارة.', 58, 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&h=600&fit=crop', 'admin-user-id'),
('Mediterranean Chicken', 'دجاج متوسطي', 'Oven Roasted', 'دجاج بالفرن', 'Whole Chicken', 'دجاج كامل', 1, 'Chicken, Olive Oil, Oregano, Basil, Sun-dried Tomatoes, Olives, Feta Cheese', 'دجاج، زيت زيتون، أوريجانو، ريحان، طماطم مجففة، زيتون، جبنة فيتا', 'Mediterranean-style chicken with herbs, olives, and sun-dried tomatoes.', 'دجاج على الطريقة المتوسطية مع الأعشاب والزيتون والطماطم المجففة.', 95, 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&h=600&fit=crop', 'admin-user-id');  ```

## 🎯 ملاحظات مهمة:

1. **seller_id** تم تغييره من `UUID` إلى `TEXT` لأننا نستخدم `'admin-user-id'` كنص
2. **السياسات** تم تبسيطها للسماح للجميع بالإدارة (للتجربة فقط)
3. **المفتاح الحقيقي** يجب وضعه في الملفات المذكورة أعلاه

بعد تنفيذ هذه الخطوات، سيعمل الموقع بشكل كامل! 🚀
