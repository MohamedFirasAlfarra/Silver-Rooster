# إعداد قاعدة البيانات في Supabase

## 1. إنشاء جدول المنتجات (Products)

```sql
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
  seller_id TEXT NOT NULL, -- Changed to TEXT to match 'admin-user-id'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies (Allow admin to manage all products)
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin can insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Admin can delete products" ON products FOR DELETE USING (true);
```

## 2. إنشاء جدول السلة (Cart)

```sql
CREATE TABLE cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view cart" ON cart FOR SELECT USING (true);
CREATE POLICY "Anyone can add to cart" ON cart FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update cart" ON cart FOR UPDATE USING (true);
CREATE POLICY "Anyone can remove from cart" ON cart FOR DELETE USING (true);

-- Index for better performance
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_product_id ON cart(product_id);
```

## 3. إنشاء جدول المفضلة (Favorites)

```sql
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Changed to TEXT to match 'admin-user-id' or user.id
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies (Allow anyone to manage favorites for demo purposes)
CREATE POLICY "Anyone can view favorites" ON favorites FOR SELECT USING (true);
CREATE POLICY "Anyone can add to favorites" ON favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove from favorites" ON favorites FOR DELETE USING (true);

-- Index for better performance
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

## 4. إنشاء جداول الطلبات (Orders)

```sql
-- جدول الطلبات الرئيسي
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  delivery_address TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  governorate TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول عناصر الطلب
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- سياسات الطلبات
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Admin can view all orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE USING (true);

-- سياسات عناصر الطلب
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()::text)
);
CREATE POLICY "Users can insert own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()::text)
);
```
```

## 4. إضافة بيانات تجريبية للمنتجات

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
('Mediterranean Chicken', 'دجاج متوسطي', 'Oven Roasted', 'دجاج بالفرن', 'Whole Chicken', 'دجاج كامل', 1, 'Chicken, Olive Oil, Oregano, Basil, Sun-dried Tomatoes, Olives, Feta Cheese', 'دجاج، زيت زيتون، أوريجانو، ريحان، طماطم مجففة، زيتون، جبنة فيتا', 'Mediterranean-style chicken with herbs, olives, and sun-dried tomatoes.', 'دجاج على الطريقة المتوسطية مع الأعشاب والزيتون والطماطم المجففة.', 95, 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&h=600&fit=crop', 'admin-user-id'),
('Pulled Chicken', 'دجاج مسحب', 'Oven Roasted', 'دجاج بالفرن', 'Shredded Chicken', 'دجاج مفروم', 2, 'Chicken, BBQ Sauce, Onions, Garlic, Paprika, Brown Sugar, Apple Cider Vinegar', 'دجاج، صلصة باربكيو، بصل، ثوم، بابريكا، سكر بني، خل التفاح', 'Tender pulled chicken slow-roasted to perfection with smoky BBQ flavors. Perfect for sandwiches and wraps.', 'دجاج مسحب طري مشوي ببطء بنكهة الباربكيو المدخنة. مثالي للساندويشات واللفائف.', 75, 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=800&h=600&fit=crop', 'admin-user-id'),
('Indian Butter Chicken', 'دجاج بالزبدة الهندي', 'Oven Baked', 'دجاج بالفرن', 'Chicken Pieces', 'قطع دجاج', 4, 'Chicken, Butter, Cream, Tomato Sauce, Garam Masala, Ginger, Garlic, Fenugreek', 'دجاج، زبدة، كريمة، صلصة طماطم، جارام ماسالا، زنجبيل، ثوم، حلبة', 'Rich and creamy Indian-style butter chicken with aromatic spices. A restaurant favorite at home.', 'دجاج بالزبدة الهندي الغني والكريمي مع التوابل العطرية. طبق مطعم مفضل في المنزل.', 95, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&h=600&fit=crop', 'admin-user-id'),
('Crispy Garlic Chicken', 'دجاج مقرمش بالثوم', 'Oven Baked', 'دجاج بالفرن', 'Chicken Wings', 'أجنحة دجاج', 10, 'Chicken Wings, Garlic, Butter, Parmesan Cheese, Italian Herbs, Breadcrumbs', 'أجنحة دجاج، ثوم، زبدة، جبنة بارميزان، أعشاب إيطالية، فتات الخبز', 'Extra crispy chicken wings coated with garlic butter and parmesan. Irresistibly crunchy and flavorful.', 'أجنحة دجاج مقرمشة جداً مغطاة بزبدة الثوم والبارميزان. مقرمشة ولذيذة بشكل لا يقاوم.', 55, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=600&fit=crop', 'admin-user-id');
```

## معلومات حساب المسؤول

**البريد الإلكتروني:** admin@chickenmarket.com  
**كلمة المرور:** Admin@2024!Secure

هذا الحساب له صلاحيات كاملة لإدارة المنتجات (إضافة، تعديل، حذف).

## ملاحظات مهمة

1. قم بتحديث ملف `.env` بمعلومات Supabase الخاصة بك
2. تأكد من تفعيل Row Level Security على جميع الجداول
3. المستخدمون العاديون يمكنهم فقط عرض المنتجات وإضافتها للمفضلة
4. المسؤول فقط يمكنه إدارة المنتجات
