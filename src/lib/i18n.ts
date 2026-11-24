export const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    allEquipment: 'جميع المعدات',
    categories: 'فئات المعدات',
    contactUs: 'اتصل بنا',
    showroomLocation: 'موقع المعرض',
    lookingForEquipment: 'تبحث عن معدة غير متوفرة؟',
    notifyMe: 'أبلغني عند التوفر',
    
    // Hero
    heroTitle: 'معرض الطيب للمعدات الثقيلة',
    heroSubtitle: 'نوفر لك المعدات التي تحتاجها بأفضل الاختيارات',
    
    // Equipment
    brand: 'العلامة التجارية',
    model: 'الموديل',
    year: 'سنة الصنع',
    price: 'السعر',
    contactForPrice: 'اتصل للسعر',
    available: 'متوفر',
    sold: 'مباع',
    reserved: 'محجوز',
    requestNow: 'اطلب الآن',
    callNow: 'اتصال',
    specifications: 'المواصفات الفنية',
    description: 'الوصف',
    relatedEquipment: 'معدات مشابهة',
    viewDetails: 'عرض التفاصيل',
    viewAll: 'عرض الكل',
    noEquipment: 'لا توجد معدات حالياً',
    featured: 'مميز',
    
    // Categories
    browseByCategory: 'تصفح حسب الفئة',
    allCategories: 'جميع الفئات',
    
    // Request Form
    requestTitle: 'محتاج معدة غير موجودة؟',
    requestSubtitle: 'أخبرنا بالمعدة التي تبحث عنها وسنتواصل معك عند توفرها',
    customerName: 'الاسم',
    phoneNumber: 'رقم الهاتف',
    equipmentName: 'اسم المعدة',
    desiredBrand: 'العلامة التجارية المطلوبة',
    desiredModel: 'الموديل المطلوب',
    additionalSpecs: 'مواصفات إضافية',
    notes: 'ملاحظات',
    submitRequest: 'إرسال الطلب',
    requestSuccess: 'تم إرسال طلبك بنجاح!',
    requestRef: 'رقم المرجع',
    requestSuccessMessage: 'سنتواصل معك في أقرب وقت',
    required: 'مطلوب',
    
    // Contact
    contactTitle: 'تواصل معنا',
    ourLocations: 'فروعنا',
    getDirections: 'احصل على الاتجاهات',
    followUs: 'تابعنا',
    
    // Footer
    allRightsReserved: 'جميع الحقوق محفوظة',
    
    // Intro
    skipIntro: 'تخطي المقدمة',
    
    // Common
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    retry: 'إعادة المحاولة',
    close: 'إغلاق',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    status: 'الحالة',
    actions: 'الإجراءات',
    confirm: 'تأكيد',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    yes: 'نعم',
    no: 'لا',
    
    // Language
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
  },
  en: {
    // Navigation
    home: 'Home',
    allEquipment: 'All Equipment',
    categories: 'Equipment Categories',
    contactUs: 'Contact Us',
    showroomLocation: 'Showroom Location',
    lookingForEquipment: 'Looking for Unavailable Equipment?',
    notifyMe: 'Notify Me When Available',
    
    // Hero
    heroTitle: 'Al Tayeb Heavy Equipment',
    heroSubtitle: 'Discover quality heavy machinery for your business',
    
    // Equipment
    brand: 'Brand',
    model: 'Model',
    year: 'Manufacturing Year',
    price: 'Price',
    contactForPrice: 'Contact for Price',
    available: 'Available',
    sold: 'Sold',
    reserved: 'Reserved',
    requestNow: 'Request Now',
    callNow: 'Call Now',
    specifications: 'Technical Specifications',
    description: 'Description',
    relatedEquipment: 'Related Equipment',
    viewDetails: 'View Details',
    viewAll: 'View All',
    noEquipment: 'No equipment available at the moment',
    featured: 'Featured',
    
    // Categories
    browseByCategory: 'Browse by Category',
    allCategories: 'All Categories',
    
    // Request Form
    requestTitle: 'Looking for Equipment Not Available?',
    requestSubtitle: 'Tell us what equipment you need and we will contact you when available',
    customerName: 'Full Name',
    phoneNumber: 'Phone Number',
    equipmentName: 'Equipment Name',
    desiredBrand: 'Desired Brand',
    desiredModel: 'Desired Model',
    additionalSpecs: 'Additional Specifications',
    notes: 'Notes',
    submitRequest: 'Submit Request',
    requestSuccess: 'Your request has been submitted successfully!',
    requestRef: 'Reference Number',
    requestSuccessMessage: 'We will contact you as soon as possible',
    required: 'Required',
    
    // Contact
    contactTitle: 'Contact Us',
    ourLocations: 'Our Locations',
    getDirections: 'Get Directions',
    followUs: 'Follow Us',
    
    // Footer
    allRightsReserved: 'All Rights Reserved',
    
    // Intro
    skipIntro: 'Skip Intro',
    
    // Common
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    status: 'Status',
    actions: 'Actions',
    confirm: 'Confirm',
    confirmDelete: 'Are you sure you want to delete this?',
    yes: 'Yes',
    no: 'No',
    
    // Language
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
  },
};

export type Locale = 'ar' | 'en';
export type TranslationKey = keyof typeof translations.ar;

export function t(key: TranslationKey, locale: Locale = 'ar'): string {
  return translations[locale]?.[key] || translations.ar[key] || key;
}
