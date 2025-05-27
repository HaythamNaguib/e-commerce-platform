// product.js - نظام إدارة المنتجات الموحد والمحدث

class ProductManager {
    constructor() {
        this.products = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentFilters = {
            category: 'all',
            minPrice: null,
            maxPrice: null,
            minRating: null,
            sortBy: 'newest',
            searchQuery: ''
        };
        this.currentUser = this.getCurrentUser();
        this.searchTimeout = null;
        this.init();
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('خطأ في جلب بيانات المستخدم:', error);
            return null;
        }
    }

    // تهيئة النظام
    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.setupModalEvents();
        this.renderProducts();
        this.updateCartCount();
        this.setupAdvancedFilters();
    }

    // تحميل المنتجات
    async loadProducts() {
        try {
            // محاولة جلب من localStorage أولاً
            const storedProducts = localStorage.getItem('products');

            if (storedProducts) {
                this.products = JSON.parse(storedProducts);
                console.log('تم تحميل المنتجات من localStorage:', this.products.length);
            } else {
                // جلب من FakeStore API
                console.log('جاري تحميل المنتجات من API...');
                const response = await fetch('https://fakestoreapi.com/products');
                const apiProducts = await response.json();

                // تحويل البيانات للصيغة المطلوبة
                this.products = apiProducts.map(product => ({
                    id: product.id,
                    title: product.title,
                    name: product.title,
                    price: Math.round(product.price * 50), // تحويل للجنيه المصري
                    originalPrice: product.price > 50 ? Math.round(product.price * 55) : null,
                    description: product.description,
                    category: product.category,
                    image: product.image,
                    rating: product.rating?.rate || 0,
                    reviews: product.rating?.count || 0,
                    stock: Math.floor(Math.random() * 100) + 10,
                    brand: this.getBrandByCategory(product.category),
                    isNew: Math.random() > 0.7,
                    features: this.getFeaturesByCategory(product.category),
                    colors: this.getColorsByCategory(product.category),
                    sizes: this.getSizesByCategory(product.category),
                    tags: this.getTagsByCategory(product.category)
                }));

                // حفظ في localStorage للاستخدام المستقبلي
                localStorage.setItem('products', JSON.stringify(this.products));
                console.log('تم تحميل وحفظ', this.products.length, 'منتج من API');
            }
        } catch (error) {
            console.error('خطأ في تحميل المنتجات:', error);
            this.products = this.getDefaultProducts();
        }
    }

    // الحصول على علامة تجارية حسب الفئة
    getBrandByCategory(category) {
        const brands = {
            'electronics': ['Samsung', 'Apple', 'Sony', 'LG', 'HP'],
            "men's clothing": ['Nike', 'Adidas', 'Zara', 'H&M'],
            "women's clothing": ['Zara', 'H&M', 'Forever 21', 'Mango'],
            'jewelery': ['Pandora', 'Tiffany', 'Cartier']
        };
        const categoryBrands = brands[category] || ['Generic'];
        return categoryBrands[Math.floor(Math.random() * categoryBrands.length)];
    }

    // الحصول على ألوان حسب الفئة
    getColorsByCategory(category) {
        const colors = {
            'electronics': ['أسود', 'أبيض', 'فضي', 'رمادي'],
            "men's clothing": ['أزرق', 'أسود', 'أبيض', 'رمادي', 'أخضر'],
            "women's clothing": ['أحمر', 'أزرق', 'أسود', 'أبيض', 'وردي', 'أخضر'],
            'jewelery': ['ذهبي', 'فضي', 'أبيض', 'أسود']
        };
        return colors[category] || ['متعدد الألوان'];
    }

    // الحصول على أحجام حسب الفئة
    getSizesByCategory(category) {
        const sizes = {
            'electronics': ['صغير', 'متوسط', 'كبير'],
            "men's clothing": ['S', 'M', 'L', 'XL', 'XXL'],
            "women's clothing": ['XS', 'S', 'M', 'L', 'XL'],
            'jewelery': ['صغير', 'متوسط', 'كبير']
        };
        return sizes[category] || ['مقاس واحد'];
    }

    // الحصول على علامات حسب الفئة
    getTagsByCategory(category) {
        const tags = {
            'electronics': ['تقنية', 'حديث', 'عالي الجودة'],
            "men's clothing": ['رجالي', 'أنيق', 'مريح'],
            "women's clothing": ['نسائي', 'عصري', 'أنيق'],
            'jewelery': ['فاخر', 'أنيق', 'مميز']
        };
        return tags[category] || ['جودة عالية'];
    }

    // الحصول على مميزات حسب الفئة
    getFeaturesByCategory(category) {
        const features = {
            'electronics': ['ضمان سنتين', 'توصيل مجاني', 'خدمة عملاء 24/7'],
            "men's clothing": ['قطن 100%', 'قابل للغسيل', 'مقاوم للانكماش'],
            "women's clothing": ['تصميم عصري', 'خامات عالية الجودة', 'مريح للارتداء'],
            'jewelery': ['معدن أصلي', 'مقاوم للصدأ', 'تصميم فريد']
        };
        return features[category] || ['جودة عالية', 'توصيل سريع'];
    }

    // منتجات افتراضية في حالة عدم توفر الاتصال
    getDefaultProducts() {
        return [
            {
                id: 1,
                title: "لاب توب HP عالي الأداء",
                name: "لاب توب HP عالي الأداء",
                price: 25000,
                originalPrice: 28000,
                description: "لاب توب HP عالي الأداء مثالي للعمل والألعاب مع معالج Intel Core i7 وذاكرة 16GB",
                category: "electronics",
                image: "https://via.placeholder.com/400x300/007bff/ffffff?text=HP+Laptop",
                rating: 4.5,
                reviews: 120,
                stock: 15,
                brand: "HP",
                isNew: true,
                features: ["ضمان سنتين", "توصيل مجاني", "خدمة عملاء 24/7"],
                colors: ["أسود", "فضي"],
                sizes: ["متوسط", "كبير"],
                tags: ["تقنية", "حديث"]
            },
            {
                id: 2,
                title: "هاتف Samsung Galaxy الذكي",
                name: "هاتف Samsung Galaxy الذكي",
                price: 12000,
                originalPrice: 14000,
                description: "هاتف Samsung Galaxy بأحدث المواصفات وكاميرا عالية الدقة",
                category: "electronics",
                image: "https://via.placeholder.com/400x300/28a745/ffffff?text=Samsung+Phone",
                rating: 4.3,
                reviews: 89,
                stock: 25,
                brand: "Samsung",
                isNew: false,
                features: ["ضمان سنة", "شاشة AMOLED", "كاميرا 108MP"],
                colors: ["أسود", "أبيض", "أزرق"],
                sizes: ["مقاس واحد"],
                tags: ["تقنية", "ذكي"]
            },
            {
                id: 3,
                title: "قميص قطني رجالي كلاسيكي",
                name: "قميص قطني رجالي كلاسيكي",
                price: 350,
                description: "قميص قطني عالي الجودة ومريح للارتداء اليومي",
                category: "men's clothing",
                image: "https://via.placeholder.com/400x300/dc3545/ffffff?text=Cotton+Shirt",
                rating: 4.1,
                reviews: 45,
                stock: 50,
                brand: "Zara",
                isNew: false,
                features: ["قطن 100%", "قابل للغسيل", "مقاوم للانكماش"],
                colors: ["أبيض", "أزرق", "أسود"],
                sizes: ["S", "M", "L", "XL"],
                tags: ["رجالي", "كلاسيكي"]
            }
        ];
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // إضافة للسلة
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn') ||
                e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                const button = e.target.classList.contains('add-to-cart-btn') ?
                    e.target : e.target.closest('.add-to-cart-btn');
                const productId = parseInt(button.dataset.productId);
                this.addToCart(productId, button);
            }

            // عرض تفاصيل المنتج
            if (e.target.classList.contains('product-details-btn') ||
                e.target.closest('.product-details-btn')) {
                const button = e.target.classList.contains('product-details-btn') ?
                    e.target : e.target.closest('.product-details-btn');
                const productId = parseInt(button.dataset.productId);
                this.showProductModal(productId);
            }

            // إضافة للسلة مع خيارات من المودال
            if (e.target.classList.contains('add-to-cart-with-options-btn')) {
                const productId = parseInt(e.target.dataset.productId);
                this.addToCartWithOptions(productId);
            }

            // زيادة/تقليل الكمية في المودال
            if (e.target.classList.contains('quantity-btn')) {
                const action = e.target.dataset.action;
                const input = e.target.parentElement.querySelector('input');
                let quantity = parseInt(input.value);

                if (action === 'increase') {
                    quantity++;
                } else if (action === 'decrease' && quantity > 1) {
                    quantity--;
                }

                input.value = quantity;
            }

            // المفضلة
            if (e.target.classList.contains('wishlist-btn') ||
                e.target.closest('.wishlist-btn')) {
                const button = e.target.classList.contains('wishlist-btn') ?
                    e.target : e.target.closest('.wishlist-btn');
                const productId = parseInt(button.dataset.productId);
                this.toggleWishlist(productId);
            }
        });

        // البحث المباشر
        const searchInput = document.getElementById('search-input') ||
            document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.searchQuery = e.target.value.toLowerCase();
                this.searchQuery = e.target.value.toLowerCase();
                this.debounceSearch();
            });
        }

        // تصفية الفئات
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.currentFilters.category = e.target.value;
                this.renderProducts();
            });
        }

        // تحديث الفئات في dropdown
        this.populateCategories();
    }

    // إعداد التصفية المتقدمة
    setupAdvancedFilters() {
        // تصفية السعر
        const priceMinInput = document.getElementById('price-min');
        const priceMaxInput = document.getElementById('price-max');

        if (priceMinInput && priceMaxInput) {
            [priceMinInput, priceMaxInput].forEach(input => {
                input.addEventListener('input', () => {
                    this.currentFilters.minPrice = priceMinInput.value ? parseInt(priceMinInput.value) : null;
                    this.currentFilters.maxPrice = priceMaxInput.value ? parseInt(priceMaxInput.value) : null;
                    this.debounceSearch();
                });
            });
        }

        // تصفية التقييم
        const ratingFilter = document.getElementById('rating-filter');
        if (ratingFilter) {
            ratingFilter.addEventListener('change', (e) => {
                this.currentFilters.minRating = e.target.value ? parseFloat(e.target.value) : null;
                this.renderProducts();
            });
        }

        // ترتيب المنتجات
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentFilters.sortBy = e.target.value;
                this.renderProducts();
            });
        }
    }

    // إعداد أحداث المودال
    setupModalEvents() {
        // إغلاق المودال
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') ||
                e.target.classList.contains('close-modal-btn')) {
                this.closeModal();
            }
        });

        // إغلاق المودال بالـ ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // البحث مع تأخير
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.renderProducts();
        }, 300);
    }

    // إضافة منتج للسلة
    addToCart(productId, buttonElement = null) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error('المنتج غير موجود:', productId);
            this.showNotification('المنتج غير موجود', 'error');
            return;
        }

        // التحقق من المخزون
        if (product.stock <= 0) {
            this.showNotification('هذا المنتج غير متوفر حالياً', 'error');
            return;
        }

        try {
            // الحصول على السلة الحالية
            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            // البحث عن المنتج في السلة
            const existingItemIndex = cart.findIndex(item => item.id === productId);

            if (existingItemIndex > -1) {
                // إذا كان المنتج موجود، زيادة الكمية
                cart[existingItemIndex].quantity += 1;
                cart[existingItemIndex].totalPrice = cart[existingItemIndex].quantity * product.price;
            } else {
                // إضافة منتج جديد للسلة
                const cartItem = {
                    id: product.id,
                    title: product.title || product.name,
                    name: product.title || product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1,
                    totalPrice: product.price,
                    category: product.category,
                    brand: product.brand
                };
                cart.push(cartItem);
            }

            // حفظ السلة
            localStorage.setItem('cart', JSON.stringify(cart));

            // تحديث عداد السلة
            this.updateCartCount();

            // تأثير بصري على الزر
            if (buttonElement) {
                const originalText = buttonElement.innerHTML;
                buttonElement.innerHTML = '<i class="fas fa-check me-1"></i>تم الإضافة';
                buttonElement.style.backgroundColor = '#28a745';
                buttonElement.disabled = true;

                setTimeout(() => {
                    buttonElement.innerHTML = originalText;
                    buttonElement.style.backgroundColor = '';
                    buttonElement.disabled = false;
                }, 2000);
            }

            this.showNotification('تم إضافة المنتج للسلة بنجاح', 'success');
            return true;

        } catch (error) {
            console.error('خطأ في إضافة المنتج للسلة:', error);
            this.showNotification('حدث خطأ في إضافة المنتج للسلة', 'error');
            return false;
        }
    }

    // إضافة للسلة مع خيارات من المودال
    addToCartWithOptions(productId) {
        const quantity = parseInt(document.getElementById('productQuantity')?.value || 1);
        const size = document.getElementById('productSize')?.value;
        const color = document.getElementById('productColor')?.value;

        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showNotification('المنتج غير موجود', 'error');
            return;
        }

        try {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            // البحث عن المنتج بنفس الخيارات
            const existingItemIndex = cart.findIndex(item =>
                item.id === productId &&
                item.size === size &&
                item.color === color
            );

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += quantity;
                cart[existingItemIndex].totalPrice = cart[existingItemIndex].quantity * product.price;
            } else {
                const cartItem = {
                    id: product.id,
                    title: product.title || product.name,
                    name: product.title || product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity,
                    totalPrice: product.price * quantity,
                    category: product.category,
                    brand: product.brand,
                    size: size,
                    color: color
                };
                cart.push(cartItem);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            this.updateCartCount();
            this.showNotification('تم إضافة المنتج للسلة بنجاح', 'success');
            this.closeModal();

        } catch (error) {
            console.error('خطأ في إضافة المنتج للسلة:', error);
            this.showNotification('حدث خطأ في إضافة المنتج للسلة', 'error');
        }
    }

    // تحديث عداد السلة
    updateCartCount() {
        try {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

            // تحديث جميع عدادات السلة في الصفحة
            const cartCounters = document.querySelectorAll('.cart-count, #cart-count, .cart-counter');
            cartCounters.forEach(counter => {
                counter.textContent = totalItems;
                counter.style.display = totalItems > 0 ? 'inline' : 'none';
            });

            // تحديث cartManager إذا كان موجوداً
            if (typeof cartManager !== 'undefined' && cartManager.updateCartCount) {
                cartManager.updateCartCount();
            }

        } catch (error) {
            console.error('خطأ في تحديث عداد السلة:', error);
        }
    }

    // إدارة المفضلة
    toggleWishlist(productId) {
        try {
            let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            const existingIndex = wishlist.findIndex(item => item.id === productId);

            if (existingIndex > -1) {
                wishlist.splice(existingIndex, 1);
                this.showNotification('تم إزالة المنتج من المفضلة', 'info');
            } else {
                const product = this.products.find(p => p.id === productId);
                if (product) {
                    wishlist.push({
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        image: product.image,
                        addedAt: new Date().toISOString()
                    });
                    this.showNotification('تم إضافة المنتج للمفضلة', 'success');
                }
            }

            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            this.renderProducts(); // إعادة رسم المنتجات لتحديث أيقونة القلب

        } catch (error) {
            console.error('خطأ في إدارة المفضلة:', error);
            this.showNotification('حدث خطأ في إدارة المفضلة', 'error');
        }
    }

    // التحقق من وجود المنتج في المفضلة
    isInWishlist(productId) {
        try {
            const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            return wishlist.some(item => item.id === productId);
        } catch (error) {
            return false;
        }
    }

    // ملء dropdown الفئات
    populateCategories() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) return;

        const categories = [...new Set(this.products.map(p => p.category))];

        categoryFilter.innerHTML = '<option value="all">جميع الفئات</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = this.translateCategory(category);
            categoryFilter.appendChild(option);
        });
    }

    // ترجمة أسماء الفئات
    translateCategory(category) {
        const translations = {
            'electronics': 'إلكترونيات',
            "men's clothing": 'ملابس رجالية',
            "women's clothing": 'ملابس نسائية',
            'jewelery': 'مجوهرات'
        };
        return translations[category] || category;
    }

    // تصفية المنتجات
    getFilteredProducts() {
        let filtered = [...this.products];

        // تصفية حسب الفئة
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(product => product.category === this.currentCategory);
        }

        // البحث
        if (this.searchQuery || this.currentFilters.searchQuery) {
            const query = this.searchQuery || this.currentFilters.searchQuery;
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query) ||
                (product.brand && product.brand.toLowerCase().includes(query)) ||
                (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        }

        // تصفية السعر
        if (this.currentFilters.minPrice !== null) {
            filtered = filtered.filter(product => product.price >= this.currentFilters.minPrice);
        }
        if (this.currentFilters.maxPrice !== null) {
            filtered = filtered.filter(product => product.price <= this.currentFilters.maxPrice);
        }

        // تصفية التقييم
        if (this.currentFilters.minRating !== null) {
            filtered = filtered.filter(product => product.rating >= this.currentFilters.minRating);
        }

        // ترتيب المنتجات
        filtered = this.sortProducts(filtered, this.currentFilters.sortBy);

        return filtered;
    }

    // ترتيب المنتجات
    sortProducts(products, sortBy) {
        const sorted = [...products];

        switch (sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price);
            case 'rating':
                return sorted.sort((a, b) => b.rating - a.rating);
            case 'name':
                return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
            case 'newest':
                return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            default:
                return sorted;
        }
    }

    // عرض المنتجات
    renderProducts() {
        const container = document.getElementById('products-container') ||
            document.getElementById('productsContainer');
        if (!container) {
            console.error('لم يتم العثور على حاوي المنتجات');
            return;
        }

        const filteredProducts = this.getFilteredProducts();

        if (filteredProducts.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        // تحديد نوع التخطيط
        const isBootstrap = container.classList.contains('row') ||
            document.querySelector('.row') !== null;

        if (isBootstrap) {
            // Bootstrap layout
            container.innerHTML = '';
            filteredProducts.forEach(product => {
                const productCard = this.createBootstrapProductCard(product);
                container.appendChild(productCard);
            });
        } else {
            // Grid layout
            const productsHTML = filteredProducts.map(product =>
                this.renderProductCard(product)
            ).join('');
            container.innerHTML = productsHTML;
        }

        this.addProductAnimations();
        console.log(`تم عرض ${filteredProducts.length} منتج`);
    }

    // حالة فارغة
    renderEmptyState() {
        return `
            <div class="empty-state text-center py-5">
                <div class="mb-4">
                    <i class="fas fa-search fa-3x text-muted"></i>
                </div>
                <h4 class="text-muted mb-3">لا توجد منتجات</h4>
                <p class="text-muted">لم يتم العثور على منتجات تطابق معايير البحث الخاصة بك</p>
                <button class="btn btn-primary mt-3" onclick="productManager.clearFilters()">
                    مسح جميع الفلاتر
                </button>
            </div>
        `;
    }

    // مسح الفلاتر
    clearFilters() {
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentFilters = {
            category: 'all',
            minPrice: null,
            maxPrice: null,
            minRating: null,
            sortBy: 'newest',
            searchQuery: ''
        };

        // مسح القيم من الواجهة
        const searchInput = document.getElementById('search-input') || document.getElementById('productSearch');
        if (searchInput) searchInput.value = '';

        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) categoryFilter.value = 'all';

        const priceMinInput = document.getElementById('price-min');
        const priceMaxInput = document.getElementById('price-max');
        if (priceMinInput) priceMinInput.value = '';
        if (priceMaxInput) priceMaxInput.value = '';

        const ratingFilter = document.getElementById('rating-filter');
        if (ratingFilter) ratingFilter.value = '';

        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) sortFilter.value = 'newest';

        this.renderProducts();
    }

    // إنشاء بطاقة منتج Bootstrap
    createBootstrapProductCard(product) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 mb-4';

        const isInWishlist = this.isInWishlist(product.id);
        const stockClass = product.stock > 0 ? 'text-success' : 'text-danger';
        const stockText = product.stock > 0 ? `متوفر (${product.stock})` : 'غير متوفر';

        col.innerHTML = `
            <div class="card product-card h-100 shadow-sm">
                <div class="product-image-container position-relative">
                    <img src="${product.image}" alt="${product.title}" class="card-img-top product-image">
                    <div class="product-overlay">
                        <button class="btn btn-primary btn-sm product-details-btn" data-product-id="${product.id}">
                            <i class="fas fa-eye"></i> عرض
                        </button>
                    </div>
                    <button class="wishlist-btn btn ${isInWishlist ? 'btn-danger' : 'btn-outline-danger'} btn-sm position-absolute" 
                            style="top: 10px; right: 10px;" data-product-id="${product.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                    ${product.isNew ? `
                        <span class="badge bg-success position-absolute" style="top: 10px; left: 10px;">جديد</span>
                    ` : ''}
                </div>
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title">${product.title}</h6>
                    <p class="card-text text-muted small flex-grow-1">${product.description.substring(0, 100)}...</p>
                    <div class="product-rating mb-2">
                        ${this.renderStars(product.rating)}
                        <small class="text-muted ms-2">(${product.reviews})</small>
                    </div>
                    <div class="mb-2">
                        <span class="badge bg-secondary">${this.translateCategory(product.category)}</span>
                        ${product.brand ? `<span class="badge bg-info ms-1">${product.brand}</span>` : ''}
                    </div>
                    <div class="mb-2 ${stockClass}">
                        <small>${stockText}</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <div>
                            <span class="price-tag h5 text-primary mb-0">${this.formatPrice(product.price)} ج.م</span>
                            ${product.originalPrice ? `
                                <br><small class="text-muted text-decoration-line-through">${this.formatPrice(product.originalPrice)} ج.م</small>
                            ` : ''}
                        </div>
                        <button class="btn btn-success btn-sm add-to-cart-btn" 
                                data-product-id="${product.id}" 
                                ${product.stock <= 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus me-1"></i>أضف للسلة
                        </button>
                    </div>
                </div>
            </div>
        `;

        return col;
    }

    // عرض كارت المنتج المحسن للتخطيط Grid
    renderProductCard(product) {
        const isInWishlist = this.isInWishlist(product.id);
        const stockClass = product.stock > 0 ? 'text-green-600' : 'text-red-600';
        const stockText = product.stock > 0 ? `متوفر (${product.stock})` : 'غير متوفر';

        return `
            <div class="product-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-product-id="${product.id}">
                <div class="relative group">
                    <img 
                        src="${product.image}" 
                        alt="${product.name || product.title}" 
                        class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onerror="this.src='https://via.placeholder.com/400x300?text=صورة+غير+متوفرة'"
                    >
                    
                    <!-- أزرار الإجراءات السريعة -->
                    <div class="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            class="wishlist-btn p-2 rounded-full ${isInWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600'} hover:bg-red-500 hover:text-white transition-colors shadow-md"
                            data-product-id="${product.id}"
                            title="${isInWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}"
                        >
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- شارة الخصم أو التوفر -->
                    <div class="absolute top-3 left-3">
                        ${product.stock <= 5 && product.stock > 0 ? `
                            <span class="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                آخر ${product.stock} قطع
                            </span>
                        ` : ''}
                        ${product.isNew ? `
                            <span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                جديد
                            </span>
                        ` : ''}
                    </div>

                    <!-- زر المعاينة السريعة -->
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <button 
                            class="product-details-btn bg-white text-gray-800 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-gray-100"
                            data-product-id="${product.id}"
                        >
                            معاينة سريعة
                        </button>
                    </div>
                </div>
                
                <div class="p-5">
                    <!-- معلومات المنتج الأساسية -->
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <h3 class="text-lg font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer product-details-btn" data-product-id="${product.id}">
                                ${product.title || product.name}
                            </h3>
                            ${product.brand ? `
                                <p class="text-sm text-gray-500 mt-1">${product.brand}</p>
                            ` : ''}
                        </div>
                        <div class="text-right">
                            <span class="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                                ${this.translateCategory(product.category)}
                            </span>
                        </div>
                    </div>
                    
                    <!-- الوصف -->
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description}</p>
                    
                    <!-- التقييم والمراجعات -->
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-2 space-x-reverse">
                            ${this.renderStarRating(product.rating)}
                            <span class="text-sm text-gray-500">(${product.reviews})</span>
                        </div>
                        <div class="text-sm ${stockClass} font-medium">
                            ${stockText}
                        </div>
                    </div>
                    
                    <!-- السعر -->
                    <div class="flex items-center justify-between mb-4">
                        <div class="text-2xl font-bold text-blue-600">
                            ${this.formatPrice(product.price)} ج.م
                        </div>
                        ${product.originalPrice && product.originalPrice > product.price ? `
                            <div class="text-right">
                                <span class="text-sm text-gray-500 line-through">${this.formatPrice(product.originalPrice)} ج.م</span>
                                <span class="text-xs text-green-600 font-medium block">
                                    وفر ${this.formatPrice(product.originalPrice - product.price)} ج.م
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- أزرار الإجراءات -->
                    <div class="flex space-x-2 space-x-reverse">
                        <button 
                            class="add-to-cart-btn flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            data-product-id="${product.id}"
                            ${product.stock <= 0 ? 'disabled' : ''}
                        >
                            <i class="fas fa-cart-plus mr-1"></i>
                            ${product.stock <= 0 ? 'غير متوفر' : 'أضف للسلة'}
                        </button>
                        <button 
                            class="product-details-btn bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                            data-product-id="${product.id}"
                        >
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // عرض تفاصيل المنتج في المودال
    showProductModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showNotification('المنتج غير موجود', 'error');
            return;
        }

        const modalHTML = `
            <div id="productModal" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="modal-content bg-white rounded-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
                    <div class="modal-header flex justify-between items-center p-6 border-b">
                        <h2 class="text-2xl font-bold text-gray-900">${product.title}</h2>
                        <button class="close-modal-btn text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <!-- صورة المنتج -->
                            <div class="product-image-section">
                                <img src="${product.image}" alt="${product.title}" class="w-full h-96 object-cover rounded-lg">
                                <div class="flex space-x-2 space-x-reverse mt-4">
                                    ${product.colors ? product.colors.map(color => `
                                        <div class="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer hover:border-blue-500" 
                                             title="${color}" style="background-color: ${this.getColorHex(color)}"></div>
                                    `).join('') : ''}
                                </div>
                            </div>
                            
                            <!-- تفاصيل المنتج -->
                            <div class="product-details-section">
                                <!-- التقييم والعلامة التجارية -->
                                <div class="flex items-center justify-between mb-4">
                                    <div class="flex items-center space-x-2 space-x-reverse">
                                        ${this.renderStarRating(product.rating)}
                                        <span class="text-sm text-gray-500">(${product.reviews} تقييم)</span>
                                    </div>
                                    ${product.brand ? `
                                        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                            ${product.brand}
                                        </span>
                                    ` : ''}
                                </div>
                                
                                <!-- السعر -->
                                <div class="mb-6">
                                    <div class="text-3xl font-bold text-blue-600 mb-2">
                                        ${this.formatPrice(product.price)} ج.م
                                    </div>
                                    ${product.originalPrice && product.originalPrice > product.price ? `
                                        <div class="flex items-center space-x-2 space-x-reverse">
                                            <span class="text-lg text-gray-500 line-through">${this.formatPrice(product.originalPrice)} ج.م</span>
                                            <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                                وفر ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                            </span>
                                        </div>
                                    ` : ''}
                                </div>
                                
                                <!-- الوصف -->
                                <div class="mb-6">
                                    <h3 class="text-lg font-semibold mb-3">الوصف</h3>
                                    <p class="text-gray-600 leading-relaxed">${product.description}</p>
                                </div>
                                
                                <!-- المميزات -->
                                ${product.features ? `
                                    <div class="mb-6">
                                        <h3 class="text-lg font-semibold mb-3">المميزات</h3>
                                        <ul class="list-disc list-inside space-y-1">
                                            ${product.features.map(feature => `<li class="text-gray-600">${feature}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                
                                <!-- خيارات المنتج -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    ${product.sizes && product.sizes.length > 1 ? `
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">المقاس</label>
                                            <select id="productSize" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                                ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                                            </select>
                                        </div>
                                    ` : ''}
                                    
                                    ${product.colors && product.colors.length > 1 ? `
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">اللون</label>
                                            <select id="productColor" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                                ${product.colors.map(color => `<option value="${color}">${color}</option>`).join('')}
                                            </select>
                                        </div>
                                    ` : ''}
                                </div>
                                
                                <!-- الكمية -->
                                <div class="mb-6">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">الكمية</label>
                                    <div class="flex items-center space-x-2 space-x-reverse">
                                        <button class="quantity-btn bg-gray-200 text-gray-700 w-10 h-10 rounded-lg hover:bg-gray-300" data-action="decrease">-</button>
                                        <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}" class="w-20 text-center border border-gray-300 rounded-lg px-3 py-2">
                                        <button class="quantity-btn bg-gray-200 text-gray-700 w-10 h-10 rounded-lg hover:bg-gray-300" data-action="increase">+</button>
                                        <span class="text-sm text-gray-500">متوفر ${product.stock} قطعة</span>
                                    </div>
                                </div>
                                
                                <!-- أزرار الإجراءات -->
                                <div class="flex space-x-4 space-x-reverse">
                                    <button 
                                        class="add-to-cart-with-options-btn flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        data-product-id="${product.id}"
                                        ${product.stock <= 0 ? 'disabled' : ''}
                                    >
                                        <i class="fas fa-cart-plus mr-2"></i>
                                        ${product.stock <= 0 ? 'غير متوفر' : 'أضف للسلة'}
                                    </button>
                                    <button class="wishlist-btn bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors" data-product-id="${product.id}">
                                        <i class="fas fa-heart mr-2"></i>
                                        المفضلة
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // إضافة المودال للصفحة
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
    }

    // إغلاق المودال
    closeModal() {
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = ''; // إعادة تمكين التمرير
        }
    }

    // عرض النجوم للتقييم (Bootstrap)
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star text-warning"></i>';
        }

        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt text-warning"></i>';
        }

        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star text-warning"></i>';
        }

        return starsHTML;
    }

    // عرض النجوم للتقييم (Tailwind)
    renderStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>';
        }

        if (hasHalfStar) {
            starsHTML += '<svg class="w-4 h-4 text-yellow-400" viewBox="0 0 20 20"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path fill="url(#half)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>';
        }

        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<svg class="w-4 h-4 text-gray-300" viewBox="0 0 20 20"><path fill="currentColor" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>';
        }

        return starsHTML;
    }

    // تنسيق السعر
    formatPrice(price) {
        return new Intl.NumberFormat('ar-EG').format(price);
    }

    // الحصول على رمز اللون الهكسا
    getColorHex(colorName) {
        const colors = {
            'أحمر': '#DC2626',
            'أزرق': '#2563EB',
            'أخضر': '#16A34A',
            'أسود': '#000000',
            'أبيض': '#FFFFFF',
            'رمادي': '#6B7280',
            'وردي': '#EC4899',
            'ذهبي': '#F59E0B',
            'فضي': '#9CA3AF'
        };
        return colors[colorName] || '#6B7280';
    }

    // إضافة تحريكات للمنتجات
    addProductAnimations() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }

    // عرض الإشعارات
    showNotification(message, type = 'info') {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} fixed-top m-3`;
        notification.style.cssText = 'z-index: 9999; max-width: 400px; margin-left: auto !important; margin-right: 20px !important;';

        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(notification);

        // إزالة الإشعار تلقائياً بعد 3 ثوانٍ
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // حفظ منتج جديد (للإدارة)
    saveProduct(productData) {
        try {
            const newProduct = {
                id: Date.now(), // معرف مؤقت
                ...productData,
                createdAt: new Date().toISOString()
            };

            this.products.push(newProduct);
            localStorage.setItem('products', JSON.stringify(this.products));
            this.renderProducts();

            this.showNotification('تم حفظ المنتج بنجاح', 'success');
            return newProduct;
        } catch (error) {
            console.error('خطأ في حفظ المنتج:', error);
            this.showNotification('حدث خطأ في حفظ المنتج', 'error');
            return null;
        }
    }

    // تحديث منتج موجود
    updateProduct(productId, updatedData) {
        try {
            const productIndex = this.products.findIndex(p => p.id === productId);
            if (productIndex === -1) {
                this.showNotification('المنتج غير موجود', 'error');
                return false;
            }

            this.products[productIndex] = {
                ...this.products[productIndex],
                ...updatedData,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem('products', JSON.stringify(this.products));
            this.renderProducts();

            this.showNotification('تم تحديث المنتج بنجاح', 'success');
            return true;
        } catch (error) {
            console.error('خطأ في تحديث المنتج:', error);
            this.showNotification('حدث خطأ في تحديث المنتج', 'error');
            return false;
        }
    }

    // حذف منتج
    deleteProduct(productId) {
        try {
            const productIndex = this.products.findIndex(p => p.id === productId);
            if (productIndex === -1) {
                this.showNotification('المنتج غير موجود', 'error');
                return false;
            }

            this.products.splice(productIndex, 1);
            localStorage.setItem('products', JSON.stringify(this.products));
            this.renderProducts();

            this.showNotification('تم حذف المنتج بنجاح', 'success');
            return true;
        } catch (error) {
            console.error('خطأ في حذف المنتج:', error);
            this.showNotification('حدث خطأ في حذف المنتج', 'error');
            return false;
        }
    }

    // البحث المتقدم
    advancedSearch(criteria) {
        let results = [...this.products];

        // البحث في النص
        if (criteria.query) {
            const query = criteria.query.toLowerCase();
            results = results.filter(product =>
                product.title.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.brand?.toLowerCase().includes(query) ||
                product.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // تصفية الفئة
        if (criteria.category && criteria.category !== 'all') {
            results = results.filter(product => product.category === criteria.category);
        }

        // تصفية السعر
        if (criteria.minPrice !== null && criteria.minPrice !== undefined) {
            results = results.filter(product => product.price >= criteria.minPrice);
        }
        if (criteria.maxPrice !== null && criteria.maxPrice !== undefined) {
            results = results.filter(product => product.price <= criteria.maxPrice);
        }

        // تصفية التقييم
        if (criteria.minRating !== null && criteria.minRating !== undefined) {
            results = results.filter(product => product.rating >= criteria.minRating);
        }

        // تصفية العلامة التجارية
        if (criteria.brand) {
            results = results.filter(product => product.brand === criteria.brand);
        }

        // تصفية التوفر
        if (criteria.inStock !== null && criteria.inStock !== undefined) {
            results = results.filter(product => criteria.inStock ? product.stock > 0 : product.stock === 0);
        }

        return results;
    }

    // الحصول على إحصائيات المنتجات
    getProductStats() {
        const stats = {
            total: this.products.length,
            inStock: this.products.filter(p => p.stock > 0).length,
            outOfStock: this.products.filter(p => p.stock === 0).length,
            newProducts: this.products.filter(p => p.isNew).length,
            categories: {},
            brands: {},
            averagePrice: 0,
            totalValue: 0
        }
    }
}
const container = document.getElementById("product-list");

function renderProducts() {
    container.innerHTML = "";
    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
      <h3>${product.name}</h3>
      <p>السعر: ${product.price} جنيه</p>
      <button onclick="addToCart(${product.id})">أضف للسلة</button>
    `;
        container.appendChild(card);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("تمت إضافة المنتج للسلة!");
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").textContent = count;
}

// عند تشغيل الصفحة
renderProducts();
updateCartCount();

