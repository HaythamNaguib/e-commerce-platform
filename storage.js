// storage.js - إدارة التخزين المحلي للمتجر الإلكتروني

class StorageManager {
    constructor() {
        this.keys = {
            PRODUCTS: 'ecommerce_products',
            CART: 'ecommerce_cart',
            ORDERS: 'ecommerce_orders',
            USER: 'ecommerce_user',
            USERS: 'ecommerce_users',
            CURRENT_USER: 'ecommerce_current_user',
            WISHLIST: 'ecommerce_wishlist',
            SETTINGS: 'ecommerce_settings'
        };

        // تهيئة البيانات الافتراضية
        this.initializeDefaultData();
    }

    // تهيئة البيانات الافتراضية
    initializeDefaultData() {
        // تهيئة المستخدمين إذا لم توجد
        if (!this.getUsers().length) {
            this.initializeUsers();
        }

        // تهيئة المنتجات إذا لم توجد
        if (!this.getProducts().length) {
            this.initializeProducts();
        }

        // تهيئة السلة إذا لم توجد
        if (!this.getCart().length) {
            this.setCart([]);
        }

        // تهيئة الطلبات إذا لم توجد
        if (!this.getOrders().length) {
            this.setOrders([]);
        }

        // تهيئة قائمة الأمنيات إذا لم توجد
        if (!this.getWishlist().length) {
            this.setWishlist([]);
        }
    }

    // إضافة المستخدمين الافتراضيين
    initializeUsers() {
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@store.com',
                password: 'admin123',
                fullName: 'مدير المتجر',
                isAdmin: true,
                phone: '01234567890',
                address: 'جمهورية مصر العربية',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: 'user',
                email: 'user@example.com',
                password: 'user123',
                fullName: 'عميل المتجر',
                isAdmin: false,
                phone: '012345678901',
                address: 'المنيا جمهورية مصر العربية',
                createdAt: new Date().toISOString()
            }
        ];

        this.setUsers(defaultUsers);
    }

    // إضافة المنتجات الافتراضية
    initializeProducts() {
        const defaultProducts = [
            {
                id: 1,
                name: 'جهاز كمبيوتر محمول HP',
                price: 2500,
                category: 'electronics',
                image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
                description: 'جهاز كمبيوتر محمول عالي الأداء مناسب للعمل والألعاب، معالج Intel Core i7، ذاكرة 16GB RAM، قرص صلب SSD 512GB',
                stock: 15,
                rating: 4.5,
                reviews: 124,
                brand: 'HP',
                dateAdded: new Date().toISOString()
            },
            {
                id: 2,
                name: 'قميص قطني أزرق',
                price: 85,
                category: 'clothing',
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
                description: 'قميص قطني عالي الجودة 100% قطن، مريح للارتداء اليومي، متوفر بعدة أحجام ومقاوم للانكماش',
                stock: 50,
                rating: 4.2,
                reviews: 67,
                brand: 'Fashion Brand',
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['أزرق', 'أبيض', 'أسود'],
                dateAdded: new Date().toISOString()
            },
            {
                id: 3,
                name: 'كتاب تعلم البرمجة',
                price: 120,
                category: 'books',
                image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
                description: 'كتاب شامل لتعلم البرمجة من الصفر إلى الاحتراف، يغطي عدة لغات برمجة مع أمثلة عملية ومشاريع تطبيقية',
                stock: 30,
                rating: 4.8,
                reviews: 89,
                author: 'أحمد محمد',
                publisher: 'دار التقنية',
                pages: 450,
                dateAdded: new Date().toISOString()
            },
            {
                id: 4,
                name: 'هاتف ذكي سامسونج Galaxy',
                price: 1800,
                category: 'electronics',
                image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
                description: 'هاتف ذكي بمواصفات عالية، شاشة 6.7 بوصة، كاميرا 108 ميجابكسل، بطارية 5000 مللي أمبير',
                stock: 25,
                rating: 4.6,
                reviews: 203,
                brand: 'Samsung',
                storage: '128GB',
                ram: '8GB',
                dateAdded: new Date().toISOString()
            },
            {
                id: 5,
                name: 'فستان صيفي أنيق',
                price: 150,
                category: 'clothing',
                image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop',
                description: 'فستان صيفي أنيق ومريح، مصنوع من قماش خفيف ومناسب للطقس الحار، تصميم عصري وألوان جذابة',
                stock: 20,
                rating: 4.4,
                reviews: 45,
                brand: 'Summer Collection',
                sizes: ['S', 'M', 'L'],
                colors: ['أحمر', 'أزرق', 'أخضر'],
                dateAdded: new Date().toISOString()
            },
            {
                id: 6,
                name: 'مصباح طاولة LED ذكي',
                price: 95,
                category: 'home',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
                description: 'مصباح طاولة بإضاءة LED قابلة للتعديل، يمكن التحكم فيه عبر التطبيق، موفر للطاقة ومتعدد الألوان',
                stock: 40,
                rating: 4.3,
                reviews: 78,
                brand: 'Smart Home',
                power: '12W',
                features: ['تحكم ذكي', 'ألوان متعددة', 'موفر للطاقة'],
                dateAdded: new Date().toISOString()
            },
            {
                id: 7,
                name: 'سماعات رأس لاسلكية',
                price: 299,
                category: 'electronics',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
                description: 'سماعات رأس لاسلكية عالية الجودة مع إلغاء الضوضاء، بطارية تدوم 30 ساعة، صوت نقي وواضح',
                stock: 35,
                rating: 4.7,
                reviews: 156,
                brand: 'Audio Pro',
                batteryLife: '30 ساعة',
                features: ['إلغاء الضوضاء', 'بلوتوث 5.0', 'مقاوم للماء'],
                dateAdded: new Date().toISOString()
            },
            {
                id: 8,
                name: 'حقيبة ظهر رياضية',
                price: 125,
                category: 'accessories',
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
                description: 'حقيبة ظهر رياضية متعددة الاستخدامات، مقاومة للماء، عدة جيوب للتنظيم، مريحة للحمل',
                stock: 60,
                rating: 4.1,
                reviews: 92,
                brand: 'Sport Gear',
                capacity: '25 لتر',
                material: 'نايلون مقاوم للماء',
                dateAdded: new Date().toISOString()
            }
        ];

        this.setProducts(defaultProducts);
    }

    // ================ إدارة المستخدمين ================

    // الحصول على جميع المستخدمين
    getUsers() {
        return this.getItem(this.keys.USERS) || [];
    }

    // حفظ المستخدمين
    setUsers(users) {
        this.setItem(this.keys.USERS, users);
    }

    // إضافة مستخدم جديد
    addUser(userData) {
        const users = this.getUsers();
        const existingUser = users.find(u => u.email === userData.email);

        if (existingUser) {
            throw new Error('البريد الإلكتروني مسجل مسبقاً');
        }

        const newUser = {
            id: Math.max(...users.map(u => u.id), 0) + 1,
            ...userData,
            isAdmin: false,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.setUsers(users);
        return newUser;
    }

    // تسجيل دخول المستخدم
    loginUser(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.setCurrentUser(user);
            return user;
        }

        throw new Error('بيانات الدخول غير صحيحة');
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.getItem(this.keys.CURRENT_USER) || null;
    }

    // حفظ المستخدم الحالي
    setCurrentUser(user) {
        this.setItem(this.keys.CURRENT_USER, user);
    }

    // تسجيل خروج المستخدم
    logoutUser() {
        this.removeItem(this.keys.CURRENT_USER);
    }

    // التحقق من تسجيل دخول المستخدم
    isUserLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // التحقق من صلاحيات المدير
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.isAdmin === true;
    }

    // ================ إدارة المنتجات ================

    // الحصول على جميع المنتجات
    getProducts() {
        return this.getItem(this.keys.PRODUCTS) || [];
    }

    // حفظ المنتجات
    setProducts(products) {
        this.setItem(this.keys.PRODUCTS, products);
    }

    // إضافة منتج جديد
    addProduct(product) {
        const products = this.getProducts();
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        const newProduct = {
            ...product,
            id: newId,
            dateAdded: new Date().toISOString()
        };
        products.push(newProduct);
        this.setProducts(products);
        return newProduct;
    }

    // تحديث منتج
    updateProduct(productId, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) {
            products[index] = { ...products[index], ...updates };
            this.setProducts(products);
            return products[index];
        }
        return null;
    }

    // حذف منتج
    deleteProduct(productId) {
        const products = this.getProducts();
        const filteredProducts = products.filter(p => p.id !== parseInt(productId));
        this.setProducts(filteredProducts);
        return filteredProducts.length !== products.length;
    }

    // البحث عن منتج بالـ ID
    getProductById(productId) {
        const products = this.getProducts();
        return products.find(p => p.id === parseInt(productId));
    }

    // ================ إدارة السلة ================

    // الحصول على محتويات السلة
    getCart() {
        return this.getItem(this.keys.CART) || [];
    }

    // حفظ السلة
    setCart(cart) {
        this.setItem(this.keys.CART, cart);
    }

    // إضافة منتج للسلة
    addToCart(productId, quantity = 1, options = {}) {
        const cart = this.getCart();
        const product = this.getProductById(productId);

        if (!product) {
            throw new Error('المنتج غير موجود');
        }

        if (product.stock < quantity) {
            throw new Error('الكمية المطلوبة غير متوفرة');
        }

        // البحث عن المنتج في السلة
        const existingItemIndex = cart.findIndex(item =>
            item.productId === parseInt(productId) &&
            JSON.stringify(item.options) === JSON.stringify(options)
        );

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                productId: parseInt(productId),
                quantity: quantity,
                options: options,
                addedAt: new Date().toISOString()
            });
        }

        this.setCart(cart);
        return cart;
    }

    // تحديث كمية منتج في السلة
    updateCartItemQuantity(productId, quantity, options = {}) {
        const cart = this.getCart();
        const itemIndex = cart.findIndex(item =>
            item.productId === parseInt(productId) &&
            JSON.stringify(item.options) === JSON.stringify(options)
        );

        if (itemIndex !== -1) {
            if (quantity <= 0) {
                cart.splice(itemIndex, 1);
            } else {
                cart[itemIndex].quantity = quantity;
            }
            this.setCart(cart);
        }
        return cart;
    }

    // إزالة منتج من السلة
    removeFromCart(productId, options = {}) {
        const cart = this.getCart();
        const filteredCart = cart.filter(item =>
            !(item.productId === parseInt(productId) &&
                JSON.stringify(item.options) === JSON.stringify(options))
        );
        this.setCart(filteredCart);
        return filteredCart;
    }

    // مسح السلة بالكامل
    clearCart() {
        this.setCart([]);
    }

    // حساب إجمالي السلة
    getCartTotal() {
        const cart = this.getCart();
        const products = this.getProducts();

        return cart.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    // الحصول على عدد العناصر في السلة
    getCartItemsCount() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    }

    // الحصول على تفاصيل السلة مع معلومات المنتجات
    getCartDetails() {
        const cart = this.getCart();
        const products = this.getProducts();

        return cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                ...item,
                product: product,
                subtotal: product ? product.price * item.quantity : 0
            };
        });
    }

    // ================ إدارة الطلبات ================

    // الحصول على جميع الطلبات
    getOrders() {
        return this.getItem(this.keys.ORDERS) || [];
    }

    // حفظ الطلبات
    setOrders(orders) {
        this.setItem(this.keys.ORDERS, orders);
    }

    // إنشاء طلب جديد
    createOrder(orderData) {
        const orders = this.getOrders();
        const cart = this.getCart();
        const products = this.getProducts();
        const currentUser = this.getCurrentUser();

        if (cart.length === 0) {
            throw new Error('السلة فارغة');
        }

        if (!currentUser) {
            throw new Error('يجب تسجيل الدخول أولاً');
        }

        // إنشاء عناصر الطلب
        const orderItems = cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                productId: item.productId,
                productName: product ? product.name : 'منتج غير معروف',
                productPrice: product ? product.price : 0,
                quantity: item.quantity,
                options: item.options,
                subtotal: product ? product.price * item.quantity : 0
            };
        });

        const newOrder = {
            id: Math.max(...orders.map(o => o.id), 0) + 1,
            userId: currentUser.id,
            userName: currentUser.fullName,
            userEmail: currentUser.email,
            items: orderItems,
            total: this.getCartTotal(),
            status: 'pending', // pending, confirmed, shipped, delivered, cancelled
            customerInfo: orderData.customerInfo || {},
            shippingAddress: orderData.shippingAddress || {},
            paymentMethod: orderData.paymentMethod || 'cash',
            notes: orderData.notes || '',
            orderDate: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        orders.push(newOrder);
        this.setOrders(orders);

        // تحديث مخزون المنتجات
        cart.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                product.stock -= item.quantity;
            }
        });
        this.setProducts(products);

        // مسح السلة بعد إنشاء الطلب
        this.clearCart();

        return newOrder;
    }

    // تحديث حالة الطلب
    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === parseInt(orderId));

        if (order) {
            order.status = status;
            order.statusUpdatedAt = new Date().toISOString();
            this.setOrders(orders);
            return order;
        }
        return null;
    }

    // الحصول على طلب بالـ ID
    getOrderById(orderId) {
        const orders = this.getOrders();
        return orders.find(o => o.id === parseInt(orderId));
    }

    // الحصول على طلبات المستخدم
    getUserOrders(userId) {
        const orders = this.getOrders();
        return orders.filter(order => order.userId === parseInt(userId));
    }

    // ================ إدارة قائمة الأمنيات ================

    // الحصول على قائمة الأمنيات
    getWishlist() {
        return this.getItem(this.keys.WISHLIST) || [];
    }

    // حفظ قائمة الأمنيات
    setWishlist(wishlist) {
        this.setItem(this.keys.WISHLIST, wishlist);
    }

    // إضافة/إزالة منتج من قائمة الأمنيات
    toggleWishlist(productId) {
        const wishlist = this.getWishlist();
        const index = wishlist.findIndex(item => item.productId === parseInt(productId));

        if (index !== -1) {
            wishlist.splice(index, 1);
        } else {
            wishlist.push({
                productId: parseInt(productId),
                addedAt: new Date().toISOString()
            });
        }

        this.setWishlist(wishlist);
        return wishlist;
    }

    // التحقق من وجود منتج في قائمة الأمنيات
    isInWishlist(productId) {
        const wishlist = this.getWishlist();
        return wishlist.some(item => item.productId === parseInt(productId));
    }

    // ================ دوال مساعدة للتخزين ================

    // حفظ عنصر في التخزين المحلي
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            return false;
        }
    }

    // استرجاع عنصر من التخزين المحلي
    getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('خطأ في استرجاع البيانات:', error);
            return null;
        }
    }

    // حذف عنصر من التخزين المحلي
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('خطأ في حذف البيانات:', error);
            return false;
        }
    }

    // مسح جميع البيانات
    clearAll() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('خطأ في مسح البيانات:', error);
            return false;
        }
    }

    // ================ البحث والفلترة ================

    // البحث في المنتجات
    searchProducts(query = '', filters = {}) {
        const products = this.getProducts();
        let filteredProducts = [...products];

        // البحث بالاسم أو الوصف
        if (query.trim()) {
            const searchQuery = query.toLowerCase().trim();
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchQuery) ||
                product.description.toLowerCase().includes(searchQuery) ||
                (product.brand && product.brand.toLowerCase().includes(searchQuery))
            );
        }

        // فلترة بالفئة
        if (filters.category && filters.category !== 'all') {
            filteredProducts = filteredProducts.filter(product =>
                product.category === filters.category
            );
        }

        // فلترة بالسعر
        if (filters.minPrice !== undefined) {
            filteredProducts = filteredProducts.filter(product =>
                product.price >= filters.minPrice
            );
        }

        if (filters.maxPrice !== undefined) {
            filteredProducts = filteredProducts.filter(product =>
                product.price <= filters.maxPrice
            );
        }

        // فلترة بالتقييم
        if (filters.minRating !== undefined) {
            filteredProducts = filteredProducts.filter(product =>
                (product.rating || 0) >= filters.minRating
            );
        }

        // ترتيب النتائج
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'price_asc':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                    break;
                case 'newest':
                    filteredProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                    break;
                case 'name':
                    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }
        }

        return filteredProducts;
    }

    // الحصول على الفئات المتاحة
    getCategories() {
        const products = this.getProducts();
        const categories = [...new Set(products.map(p => p.category))];
        return categories.map(category => ({
            name: category,
            count: products.filter(p => p.category === category).length
        }));
    }
}

// إنشاء مثيل واحد من StorageManager
const storage = new StorageManager();

// تصدير للاستخدام في المتصفح
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
    window.storage = storage;
}

// تصدير للاستخدام في Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, storage };
}