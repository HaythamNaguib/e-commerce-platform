// app.js - الملف الرئيسي لتطبيق المتجر الإلكتروني

class ECommerceApp {
    constructor() {
        this.storage = window.storage; // استخدام مثيل التخزين المنشأ في storage.js
        this.currentCategory = 'all';
        this.currentSort = 'newest';
        this.searchQuery = '';

        this.init();
    }

    // تهيئة التطبيق
    init() {
        this.setupEventListeners();
        this.renderHeader();
        this.renderFilters();
        this.renderProducts();
        this.updateCartCounter();
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // البحث
        document.addEventListener('input', (e) => {
            if (e.target.id === 'searchInput') {
                this.searchQuery = e.target.value;
                this.renderProducts();
            }
        });

        // الفلاتر
        document.addEventListener('change', (e) => {
            if (e.target.id === 'categoryFilter') {
                this.currentCategory = e.target.value;
                this.renderProducts();
            }
            if (e.target.id === 'sortFilter') {
                this.currentSort = e.target.value;
                this.renderProducts();
            }
        });

        // إضافة للسلة
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = parseInt(e.target.dataset.productId);
                this.addToCart(productId);
            }

            if (e.target.classList.contains('wishlist-btn')) {
                const productId = parseInt(e.target.dataset.productId);
                this.toggleWishlist(productId);
            }
        });
    }

    // عرض الهيدر
    renderHeader() {
        const headerHTML = `
            <header class="bg-blue-600 text-white shadow-lg">
                <div class="container mx-auto px-4 py-4">
                    
                            
                        </div>
                    </div>
                </div>
            </header>
        `;

        // إضافة الهيدر إلى بداية الصفحة
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    // عرض الفلاتر
    renderFilters() {
        const categories = this.storage.getCategories();
        const filtersContainer = document.getElementById('filtersContainer');

        const filtersHTML = `
            <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- البحث -->
                    <div>
                        <label for="searchInput" class="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                        <input 
                            type="text" 
                            id="searchInput" 
                            placeholder="ابحث عن المنتجات..." 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                    </div>
                    
                    <!-- فلتر الفئات -->
                    <div>
                        <label for="categoryFilter" class="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
                        <select id="categoryFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="all">جميع الفئات</option>
                            ${categories.map(cat => `
                                <option value="${cat.name}">${this.getCategoryNameInArabic(cat.name)} (${cat.count})</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <!-- الترتيب -->
                    <div>
                        <label for="sortFilter" class="block text-sm font-medium text-gray-700 mb-2">ترتيب حسب</label>
                        <select id="sortFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="newest">الأحدث</option>
                            <option value="price_asc">السعر: من الأقل للأعلى</option>
                            <option value="price_desc">السعر: من الأعلى للأقل</option>
                            <option value="rating">الأعلى تقييماً</option>
                            <option value="name">الاسم</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        filtersContainer.innerHTML = filtersHTML;
    }

    // عرض المنتجات
    renderProducts() {
        const filters = {
            category: this.currentCategory === 'all' ? null : this.currentCategory,
            sortBy: this.currentSort
        };

        const products = this.storage.searchProducts(this.searchQuery, filters);
        const productsContainer = document.getElementById('productsContainer');

        if (products.length === 0) {
            productsContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-500 text-lg">لا توجد منتجات مطابقة للبحث</div>
                </div>
            `;
            return;
        }

        const productsHTML = products.map(product => this.renderProductCard(product)).join('');
        productsContainer.innerHTML = productsHTML;
    }

    // عرض كارت المنتج
    renderProductCard(product) {
        const isInWishlist = this.storage.isInWishlist(product.id);
        const stockStatus = product.stock > 0 ? 'متوفر' : 'غير متوفر';
        const stockClass = product.stock > 0 ? 'text-green-600' : 'text-red-600';

        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div class="relative">
                    <img 
                        src="${product.image}" 
                        alt="${product.name}" 
                        class="w-full h-48 object-cover"
                        onerror="this.src='https://via.placeholder.com/400x300?text=صورة+غير+متوفرة'"
                    >
                    <button 
                        class="wishlist-btn absolute top-2 right-2 p-2 rounded-full ${isInWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600'} hover:bg-red-500 hover:text-white transition-colors"
                        data-product-id="${product.id}"
                        title="${isInWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}"
                    >
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                    ${product.stock <= 5 && product.stock > 0 ? `
                        <div class="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                            آخر ${product.stock} قطع
                        </div>
                    ` : ''}
                </div>
                
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">${product.name}</h3>
                        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            ${this.getCategoryNameInArabic(product.category)}
                        </span>
                    </div>
                    
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.description}</p>
                    
                    <div class="flex items-center mb-3">
                        <div class="flex items-center">
                            ${this.renderStarRating(product.rating || 0)}
                            <span class="text-sm text-gray-600 mr-2">(${product.reviews || 0})</span>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between mb-3">
                        <div class="text-xl font-bold text-blue-600">
                            ${product.price} ريال
                        </div>
                        <div class="text-sm ${stockClass} font-medium">
                            ${stockStatus}
                        </div>
                    </div>
                    
                    ${product.brand ? `
                        <div class="text-xs text-gray-500 mb-3">
                            العلامة التجارية: <span class="font-medium">${product.brand}</span>
                        </div>
                    ` : ''}
                    
                    <button 
                        class="add-to-cart-btn w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        data-product-id="${product.id}"
                        ${product.stock <= 0 ? 'disabled' : ''}
                    >
                        ${product.stock <= 0 ? 'غير متوفر' : 'إضافة للسلة'}
                    </button>
                </div>
            </div>
        `;
    }

    // عرض تقييم النجوم
    renderStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';

        // النجوم الممتلئة
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>';
        }

        // نصف نجمة
        if (hasHalfStar) {
            starsHTML += '<svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path fill="url(#half)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>';
        }

        // النجوم الفارغة
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<svg class="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>';
        }

        return `<div class="flex">${starsHTML}</div>`;
    }

    // إضافة للسلة
    addToCart(productId) {
        try {
            this.storage.addToCart(productId, 1);
            this.updateCartCounter();
            this.showNotification('تم إضافة المنتج للسلة بنجاح', 'success');
        } catch (error) {
            this.showNotification('حدث خطأ في إضافة المنتج للسلة', 'error');
        }
    }

    // تبديل المفضلة
    toggleWishlist(productId) {
        try {
            this.storage.toggleWishlist(productId);
            this.renderProducts(); // إعادة عرض المنتجات لتحديث أيقونة القلب

            const isInWishlist = this.storage.isInWishlist(productId);
            const message = isInWishlist ? 'تم إضافة المنتج للمفضلة' : 'تم إزالة المنتج من المفضلة';
            this.showNotification(message, 'success');
        } catch (error) {
            this.showNotification('حدث خطأ في تحديث المفضلة', 'error');
        }
    }

    // تحديث عداد السلة
    updateCartCounter() {
        const counter = document.getElementById('cartCounter');
        if (counter) {
            const count = this.storage.getCartItemsCount();
            counter.textContent = count;
        }
    }

    // عرض إشعار
    showNotification(message, type = 'info') {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm transition-all duration-300 transform translate-x-full`;

        // تحديد لون الإشعار حسب النوع
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        notification.classList.add(colors[type] || colors.info);
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button class="mr-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // إظهار الإشعار
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // إخفاء الإشعار تلقائياً بعد 3 ثوان
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // ترجمة أسماء الفئات للعربية
    getCategoryNameInArabic(category) {
        const translations = {
            'electronics': 'إلكترونيات',
            'clothing': 'ملابس',
            'books': 'كتب',
            'home': 'منزل وحديقة',
            'accessories': 'إكسسوارات',
            'sports': 'رياضة',
            'beauty': 'جمال وعناية',
            'toys': 'ألعاب'
        };
        return translations[category] || category;
    }

    // الحصول على إحصائيات التطبيق
    getAppStatistics() {
        return this.storage.getStatistics();
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // التأكد من وجود storage
    if (typeof window.storage !== 'undefined') {
        window.app = new ECommerceApp();
        console.log('تم تهيئة التطبيق بنجاح');
        console.log('إحصائيات التطبيق:', window.app.getAppStatistics());
    } else {
        console.error('خطأ: ملف storage.js غير محمل بشكل صحيح');
    }
});
// app.js - نسخة محدثة لحل مشكلة التزامن بين الصفحات

class ECommerceApp {
    constructor() {
        this.storage = window.storage;
        this.currentCategory = 'all';
        this.currentSort = 'newest';
        this.searchQuery = '';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupStorageListeners(); // جديد: إضافة مستمعي التخزين
        this.renderHeader();
        this.renderFilters();
        this.renderProducts();
        this.updateCartCounter();
    }

    // جديد: إعداد مستمعي التغييرات في التخزين
    setupStorageListeners() {
        // الاستماع لتغييرات السلة
        document.addEventListener('cartUpdated', () => {
            this.updateCartCounter();
            // إعادة عرض المنتجات لتحديث حالة المخزون
            this.renderProducts();
        });

        // الاستماع لتغييرات المفضلة
        document.addEventListener('wishlistUpdated', () => {
            this.renderProducts();
        });

        // الاستماع لتغييرات المنتجات (إضافة/حذف/تعديل)
        document.addEventListener('productsUpdated', () => {
            this.renderFilters(); // تحديث الفلاتر
            this.renderProducts(); // تحديث المنتجات
        });

        // الاستماع لأحداث التخزين من الصفحات الأخرى (إذا كان متاحاً)
        if (typeof Storage !== 'undefined') {
            window.addEventListener('storage', (e) => {
                // تحديث البيانات عند تغيير التخزين من صفحة أخرى
                if (e.key && (e.key.includes('cart') || e.key.includes('wishlist') || e.key.includes('products'))) {
                    this.syncWithStorage();
                }
            });
        }

        // فحص دوري للتحديثات (كحل بديل)
        this.startPeriodicSync();
    }

    // جديد: مزامنة دورية مع التخزين
    startPeriodicSync() {
        // فحص كل 5 ثوان للتحديثات
        setInterval(() => {
            this.syncWithStorage();
        }, 5000);
    }

    // جديد: مزامنة البيانات مع التخزين
    syncWithStorage() {
        const currentCartCount = document.getElementById('cartCounter')?.textContent || '0';
        const actualCartCount = this.storage.getCartItemsCount().toString();

        // تحديث العداد إذا تغير
        if (currentCartCount !== actualCartCount) {
            this.updateCartCounter();
            this.renderProducts(); // إعادة عرض المنتجات لتحديث حالة المخزون
        }
    }

    setupEventListeners() {
        // البحث
        document.addEventListener('input', (e) => {
            if (e.target.id === 'searchInput') {
                this.searchQuery = e.target.value;
                this.renderProducts();
            }
        });

        // الفلاتر
        document.addEventListener('change', (e) => {
            if (e.target.id === 'categoryFilter') {
                this.currentCategory = e.target.value;
                this.renderProducts();
            }
            if (e.target.id === 'sortFilter') {
                this.currentSort = e.target.value;
                this.renderProducts();
            }
        });

        // إضافة للسلة
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = parseInt(e.target.dataset.productId);
                this.addToCart(productId);
            }

            if (e.target.classList.contains('wishlist-btn')) {
                const productId = parseInt(e.target.dataset.productId);
                this.toggleWishlist(productId);
            }

            // جديد: زر تحديث يدوي
            if (e.target.id === 'refreshBtn') {
                this.syncWithStorage();
                this.showNotification('تم تحديث البيانات', 'success');
            }
        });
    }

    renderHeader() {
        const headerHTML = `
            <header class="bg-blue-600 text-white shadow-lg">
                <div class="container mx-auto px-4 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4 space-x-reverse">
                            <h1 class="text-2xl font-bold">متجري الإلكتروني</h1>
                            <!-- جديد: زر التحديث اليدوي -->
                            <button id="refreshBtn" class="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded text-sm transition-colors">
                                🔄 تحديث
                            </button>
                        </div>
                        <div class="flex items-center space-x-4 space-x-reverse">
                            <div class="relative">
                                <button class="flex items-center space-x-2 space-x-reverse bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13v4a2 2 0 002 2h6a2 2 0 002-2v-4m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4"></path>
                                    </svg>
                                    <span>السلة</span>
                                    <span id="cartCounter" class="bg-red-500 text-white rounded-full px-2 py-1 text-xs min-w-[20px] text-center">0</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        `;

        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    renderFilters() {
        const categories = this.storage.getCategories();
        const filtersContainer = document.getElementById('filtersContainer');

        if (!filtersContainer) return; // تجنب الأخطاء إذا لم يكن الحاوي موجود

        const filtersHTML = `
            <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                <!-- جديد: إشارة حالة المزامنة -->
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-semibold text-gray-800">فلاتر البحث</h2>
                    <div class="flex items-center text-sm text-gray-500">
                        <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        <span>متصل ومحدث</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- البحث -->
                    <div>
                        <label for="searchInput" class="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                        <input 
                            type="text" 
                            id="searchInput" 
                            placeholder="ابحث عن المنتجات..." 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value="${this.searchQuery}"
                        >
                    </div>
                    
                    <!-- فلتر الفئات -->
                    <div>
                        <label for="categoryFilter" class="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
                        <select id="categoryFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="all" ${this.currentCategory === 'all' ? 'selected' : ''}>جميع الفئات</option>
                            ${categories.map(cat => `
                                <option value="${cat.name}" ${this.currentCategory === cat.name ? 'selected' : ''}>
                                    ${this.getCategoryNameInArabic(cat.name)} (${cat.count})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <!-- الترتيب -->
                    <div>
                        <label for="sortFilter" class="block text-sm font-medium text-gray-700 mb-2">ترتيب حسب</label>
                        <select id="sortFilter" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="newest" ${this.currentSort === 'newest' ? 'selected' : ''}>الأحدث</option>
                            <option value="price_asc" ${this.currentSort === 'price_asc' ? 'selected' : ''}>السعر: من الأقل للأعلى</option>
                            <option value="price_desc" ${this.currentSort === 'price_desc' ? 'selected' : ''}>السعر: من الأعلى للأقل</option>
                            <option value="rating" ${this.currentSort === 'rating' ? 'selected' : ''}>الأعلى تقييماً</option>
                            <option value="name" ${this.currentSort === 'name' ? 'selected' : ''}>الاسم</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        filtersContainer.innerHTML = filtersHTML;
    }

    renderProducts() {
        const filters = {
            category: this.currentCategory === 'all' ? null : this.currentCategory,
            sortBy: this.currentSort
        };

        const products = this.storage.searchProducts(this.searchQuery, filters);
        const productsContainer = document.getElementById('productsContainer');

        if (!productsContainer) return; // تجنب الأخطاء إذا لم يكن الحاوي موجود

        if (products.length === 0) {
            productsContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-500 text-lg">لا توجد منتجات مطابقة للبحث</div>
                    <button onclick="window.app.syncWithStorage()" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        تحديث النتائج
                    </button>
                </div>
            `;
            return;
        }

        const productsHTML = products.map(product => this.renderProductCard(product)).join('');
        productsContainer.innerHTML = productsHTML;
    }

    renderProductCard(product) {
        const isInWishlist = this.storage.isInWishlist(product.id);
        const stockStatus = product.stock > 0 ? 'متوفر' : 'غير متوفر';
        const stockClass = product.stock > 0 ? 'text-green-600' : 'text-red-600';

        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div class="relative">
                    <img 
                        src="${product.image}" 
                        alt="${product.name}" 
                        class="w-full h-48 object-cover"
                        onerror="this.src='https://via.placeholder.com/400x300?text=صورة+غير+متوفرة'"
                    >
                    <button 
                        class="wishlist-btn absolute top-2 right-2 p-2 rounded-full ${isInWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600'} hover:bg-red-500 hover:text-white transition-colors"
                        data-product-id="${product.id}"
                        title="${isInWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}"
                    >
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                    ${product.stock <= 5 && product.stock > 0 ? `
                        <div class="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                            آخر ${product.stock} قطع
                        </div>
                    ` : ''}
                </div>
                
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">${product.name}</h3>
                        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            ${this.getCategoryNameInArabic(product.category)}
                        </span>
                    </div>
                    
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.description}</p>
                    
                    <div class="flex items-center mb-3">
                        <div class="flex items-center">
                            ${this.renderStarRating(product.rating || 0)}
                            <span class="text-sm text-gray-600 mr-2">(${product.reviews || 0})</span>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between mb-3">
                        <div class="text-xl font-bold text-blue-600">
                            ${product.price} ريال
                        </div>
                        <div class="text-sm ${stockClass} font-medium">
                            ${stockStatus}
                        </div>
                    </div>
                    
                    ${product.brand ? `
                        <div class="text-xs text-gray-500 mb-3">
                            العلامة التجارية: <span class="font-medium">${product.brand}</span>
                        </div>
                    ` : ''}
                    
                    <button 
                        class="add-to-cart-btn w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        data-product-id="${product.id}"
                        ${product.stock <= 0 ? 'disabled' : ''}
                    >
                        ${product.stock <= 0 ? 'غير متوفر' : 'إضافة للسلة'}
                    </button>
                </div>
            </div>
        `;
    }

    renderStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>';
        }

        if (hasHalfStar) {
            starsHTML += '<svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path fill="url(#half)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>';
        }

        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<svg class="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>';
        }

        return `<div class="flex">${starsHTML}</div>`;
    }

    // محدث: إضافة للسلة مع إشعار للصفحات الأخرى
    addToCart(productId) {
        try {
            this.storage.addToCart(productId, 1);
            this.updateCartCounter();

            // إشعار الصفحات الأخرى بالتغيير
            document.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { productId, action: 'add' }
            }));

            this.showNotification('تم إضافة المنتج للسلة بنجاح', 'success');
        } catch (error) {
            this.showNotification('حدث خطأ في إضافة المنتج للسلة', 'error');
        }
    }

    // محدث: تبديل المفضلة مع إشعار للصفحات الأخرى
    toggleWishlist(productId) {
        try {
            this.storage.toggleWishlist(productId);
            this.renderProducts();

            // إشعار الصفحات الأخرى بالتغيير
            document.dispatchEvent(new CustomEvent('wishlistUpdated', {
                detail: { productId, action: 'toggle' }
            }));

            const isInWishlist = this.storage.isInWishlist(productId);
            const message = isInWishlist ? 'تم إضافة المنتج للمفضلة' : 'تم إزالة المنتج من المفضلة';
            this.showNotification(message, 'success');
        } catch (error) {
            this.showNotification('حدث خطأ في تحديث المفضلة', 'error');
        }
    }

    updateCartCounter() {
        const counter = document.getElementById('cartCounter');
        if (counter) {
            const count = this.storage.getCartItemsCount();
            counter.textContent = count;

            // إضافة تأثير بصري عند التحديث
            counter.classList.add('animate-bounce');
            setTimeout(() => {
                counter.classList.remove('animate-bounce');
            }, 500);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm transition-all duration-300 transform translate-x-full`;

        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        notification.classList.add(colors[type] || colors.info);
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button class="mr-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    getCategoryNameInArabic(category) {
        const translations = {
            'electronics': 'إلكترونيات',
            'clothing': 'ملابس',
            'books': 'كتب',
            'home': 'منزل وحديقة',
            'accessories': 'إكسسوارات',
            'sports': 'رياضة',
            'beauty': 'جمال وعناية',
            'toys': 'ألعاب'
        };
        return translations[category] || category;
    }

    getAppStatistics() {
        return this.storage.getStatistics();
    }

    // جديد: إعادة تحميل البيانات بالكامل
    refreshApp() {
        this.syncWithStorage();
        this.renderFilters();
        this.renderProducts();
        this.updateCartCounter();
        this.showNotification('تم تحديث التطبيق بنجاح', 'success');
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.storage !== 'undefined') {
        window.app = new ECommerceApp();
        console.log('تم تهيئة التطبيق بنجاح');
        console.log('إحصائيات التطبيق:', window.app.getAppStatistics());

        // إضافة وظيفة تحديث سريع للاختبار
        window.refreshApp = () => window.app.refreshApp();
    } else {
        console.error('خطأ: ملف storage.js غير محمل بشكل صحيح');
    }
});