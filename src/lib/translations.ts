import { Language } from "../types";

export const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    about: 'من نحن',
    products: 'المنتجات',
    contact: 'اتصل بنا',
    favorites: 'المفضلة',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    admin: 'لوحة التحكم',
    
    // Branding
    siteName: 'الديك الفضي',
    siteTagline: 'جودة وطعم لا يُقاوم',
    
    // Home Page
    featuredChickens: 'دجاج مميز',
    recentlyListed: 'المضاف حديثاً',
    viewAll: 'عرض الكل',
    
    // Products
    filters: 'التصفية',
    category: 'قسم الدجاج بالفرن',
    type: 'النوع',
    quantity: 'الكمية',
    ingredients: 'المكونات',
    priceRange: 'نطاق السعر',
    applyFilters: 'تطبيق',
    clearFilters: 'مسح',
    noProducts: 'لا توجد منتجات',
    
    // Product Details
    price: 'السعر',
    description: 'الوصف',
    contactSeller: 'تواصل مع البائع',
    buyNow: 'اشتري الآن',
    buyWithDelivery: 'شراء مع توصيل',
    buyPickup: 'شراء واستلام من المتجر',
    
    // Auth
    fullName: 'الاسم الكامل',
    age: 'العمر',
    mobileNumber: 'رقم الموبايل',
    address: 'العنوان',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    switchToSignup: 'ليس لديك حساب؟ سجل الآن',
    switchToLogin: 'لديك حساب؟ سجل الدخول',
    adminLogin: 'تسجيل دخول المسؤول',
    phoneValidationSyria: 'رقم الموبايل يجب أن يبدأ بـ +963 ويتكون من 12 رقمًا',
    guestMode: 'تصفح كضيف',
    continueAsGuest: 'متابعة كضيف',
    guestModeDescription: 'استكشف الموقع بدون إنشاء حساب',
    guestRestriction: 'عذراً، يجب تسجيل الدخول للمتابعة',
    guestRestrictionMessage: 'هذه الميزة متاحة فقط للمستخدمين المسجلين. يرجى تسجيل الدخول أو إنشاء حساب جديد للاستمتاع بجميع المزايا.',
    loginNow: 'تسجيل الدخول الآن',
    createAccount: 'إنشاء حساب',
    
    // Admin
    dashboard: 'لوحة التحكم',
    addProduct: 'إضافة منتج',
    editProduct: 'تعديل منتج',
    deleteProduct: 'حذف منتج',
    productList: 'قائمة المنتجات',
    ordersList: 'قائمة الطلبات',
    customer: 'العميل',
    name: 'الاسم',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    confirmDelete: 'هل أنت متأكد من حذف هذا المنتج؟',
    imageUrl: 'رابط الصورة',
    uploadImage: 'رفع صورة',
    selectImage: 'اختر صورة',
    changeImage: 'تغيير الصورة',
    updateStatus: 'تحديث الحالة',
    statusUpdated: 'تم تحديث حالة الطلب بنجاح',
    
    // Messages
    loginSuccess: 'تم تسجيل الدخول بنجاح',
    loginError: 'خطأ في تسجيل الدخول',
    signupSuccess: 'تم إنشاء الحساب بنجاح',
    signupError: 'خطأ في إنشاء الحساب',
    productAdded: 'تم إضافة المنتج بنجاح',
    productUpdated: 'تم تحديث المنتج بنجاح',
    productDeleted: 'تم حذف المنتج بنجاح',
    error: 'حدث خطأ',
    
    // Favorites
    addToFavorites: 'إضافة للمفضلة',
    removeFromFavorites: 'إزالة من المفضلة',
    noFavorites: 'لا توجد منتجات في المفضلة',
    favoriteAdded: 'تمت الإضافة للمفضلة',
    favoriteRemoved: 'تمت الإزالة من المفضلة',
    
    // Cart
    cart: 'السلة',
    addToCart: 'أضف إلى السلة',
    removeFromCart: 'إزالة من السلة',
    cartAdded: 'تمت الإضافة إلى السلة',
    cartRemoved: 'تمت الإزالة من السلة',
    emptyCart: 'السلة فارغة',
    checkout: 'إتمام الشراء',
    total: 'المجموع',
    continueShopping: 'متابعة التسوق',
    delivery: 'توصيل',
    deliveryAddress: 'العنوان',
    deliveryLocation: 'مكان التوصيل',
    governorate: 'المحافظة',
    orderNotes: 'ملاحظات على الطلب',
    confirmDelivery: 'تأكيد التوصيل',
    deliverySuccess: 'تم تأكيد طلب التوصيل بنجاح!',
    deliveryError: 'حدث خطأ أثناء تأكيد التوصيل',
    deliveryType: 'نوع التوصيل',
    pickup: 'استلام من المتجر',
    deliveryCost: 'تكلفة التوصيل',
    
    // About Page
    aboutTitle: 'من نحن',
    aboutSubtitle: 'قصتنا ورؤيتنا',
    ourStory: 'قصتنا',
    ourMission: 'مهمتنا',
    ourVision: 'رؤيتنا',
    
    // Contact Page
    contactTitle: 'اتصل بنا',
    contactSubtitle: 'نحن هنا للمساعدة',
    yourName: 'اسمك',
    yourEmail: 'بريدك الإلكتروني',
    subject: 'الموضوع',
    message: 'رسالتك',
    sendMessage: 'إرسال الرسالة',
    messageSent: 'تم إرسال رسالتك بنجاح',
    phone: 'الهاتف',
    // address: 'العنوان',
    workingHours: 'ساعات العمل',
    
    // Orders
    myOrders: 'طلباتي',
    orderId: 'رقم الطلب',
    orderDate: 'تاريخ الطلب',
    orderStatus: 'الحالة',
    orderTotal: 'الإجمالي',
    orderDetails: 'تفاصيل الطلب',
    items: 'المنتجات',
    status_pending: 'قيد الانتظار',
    status_processing: 'قيد التجهيز',
    status_shipped: 'تم الشحن',
    status_delivered: 'تم التوصيل',
    status_cancelled: 'ملغي',
    noOrders: 'ليس لديك طلبات سابقة',
    startShopping: 'ابدأ التسوق الآن',
    backToOrders: 'العودة للطلبات',
    orderSummary: 'ملخص الطلب',
    deliveryInfo: 'معلومات التوصيل',
    
    // Footer
    copyright: '© 2024 الديك الفضي. جميع الحقوق محفوظة.',
  },
  en: {
    // Navigation
    home: 'Home',
    about: 'About Us',
    products: 'Products',
    contact: 'Contact Us',
    favorites: 'Favorites',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    admin: 'Admin Dashboard',
    
    // Branding
    siteName: 'Silver Rooster',
    siteTagline: 'Quality & Taste',
    
    // Home Page
    featuredChickens: 'Featured Chickens',
    recentlyListed: 'Recently Listed',
    viewAll: 'View All',
    
    // Products
    filters: 'Filters',
    category: 'Oven Chicken Category',
    type: 'Type',
    quantity: 'Quantity',
    ingredients: 'Ingredients',
    priceRange: 'Price Range',
    applyFilters: 'Apply',
    clearFilters: 'Clear',
    noProducts: 'No products found',
    
    // Product Details
    price: 'Price',
    description: 'Description',
    contactSeller: 'Contact Seller',
    buyNow: 'Buy Now',
    buyWithDelivery: 'Buy with Delivery',
    buyPickup: 'Buy & Pickup',
    
    // Auth
    fullName: 'Full Name',
    age: 'Age',
    mobileNumber: 'Mobile Number',
    address: 'Address',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    switchToSignup: "Don't have an account? Sign up",
    switchToLogin: 'Have an account? Login',
    adminLogin: 'Admin Login',
    phoneValidationSyria: 'Mobile number must start with +963 and be 12 digits',
    guestMode: 'Browse as Guest',
    continueAsGuest: 'Continue as Guest',
    guestModeDescription: 'Explore the site without creating an account',
    guestRestriction: 'Sorry, you need to login to continue',
    guestRestrictionMessage: 'This feature is only available for registered users. Please login or create a new account to enjoy all features.',
    loginNow: 'Login Now',
    createAccount: 'Create Account',
    
    // Admin
    dashboard: 'Dashboard',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    productList: 'Product List',
    ordersList: 'Orders List',
    customer: 'Customer',
    name: 'Name',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirmDelete: 'Are you sure you want to delete this product?',
    imageUrl: 'Image URL',
    uploadImage: 'Upload Image',
    selectImage: 'Select Image',
    changeImage: 'Change Image',
    updateStatus: 'Update Status',
    statusUpdated: 'Order status updated successfully',
    
    // Messages
    loginSuccess: 'Login successful',
    loginError: 'Login error',
    signupSuccess: 'Account created successfully',
    signupError: 'Signup error',
    productAdded: 'Product added successfully',
    productUpdated: 'Product updated successfully',
    productDeleted: 'Product deleted successfully',
    error: 'An error occurred',
    
    // Favorites
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    noFavorites: 'No favorites yet',
    favoriteAdded: 'Added to favorites',
    favoriteRemoved: 'Removed from favorites',
    
    // Cart
    cart: 'Cart',
    addToCart: 'Add to Cart',
    removeFromCart: 'Remove from Cart',
    cartAdded: 'Added to cart',
    cartRemoved: 'Removed from cart',
    emptyCart: 'Your cart is empty',
    checkout: 'Checkout',
    total: 'Total',
    continueShopping: 'Continue Shopping',
    delivery: 'Delivery',
    deliveryAddress: 'Address',
    deliveryLocation: 'Delivery Location',
    governorate: 'Governorate',
    orderNotes: 'Order Notes',
    confirmDelivery: 'Confirm Delivery',
    deliverySuccess: 'Delivery order confirmed successfully!',
    deliveryError: 'An error occurred while confirming delivery',
    deliveryType: 'Delivery Type',
    pickup: 'Pickup from Store',
    deliveryCost: 'Delivery Cost',
    
    // About Page
    aboutTitle: 'About Us',
    aboutSubtitle: 'Our Story & Vision',
    ourStory: 'Our Story',
    ourMission: 'Our Mission',
    ourVision: 'Our Vision',
    
    // Contact Page
    contactTitle: 'Contact Us',
    contactSubtitle: 'We\'re Here to Help',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    subject: 'Subject',
    message: 'Your Message',
    sendMessage: 'Send Message',
    messageSent: 'Your message has been sent successfully',
    phone: 'Phone',
    // address: 'Address',
    workingHours: 'Working Hours',
    
    // Orders
    myOrders: 'My Orders',
    orderId: 'Order ID',
    orderDate: 'Order Date',
    orderStatus: 'Status',
    orderTotal: 'Total',
    orderDetails: 'Order Details',
    items: 'Items',
    status_pending: 'Pending',
    status_processing: 'Processing',
    status_shipped: 'Shipped',
    status_delivered: 'Delivered',
    status_cancelled: 'Cancelled',
    noOrders: 'You have no previous orders',
    startShopping: 'Start Shopping Now',
    backToOrders: 'Back to Orders',
    orderSummary: 'Order Summary',
    deliveryInfo: 'Delivery Info',

    // Footer
    copyright: '© 2024 Silver Rooster. All rights reserved.',
  },
};

export const useTranslation = (language: Language) => {
  return (key: keyof typeof translations.en): string => {
    return translations[language][key] || key;
  };
};
