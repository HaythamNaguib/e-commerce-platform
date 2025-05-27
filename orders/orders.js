// orders.js - إدارة الطلبات

class OrderManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadOrders();
    }

    setupEventListeners() {
        // استماع لأحداث إتمام الطلب
        document.addEventListener('checkout-complete', (e) => {
            this.createOrder(e.detail);
        });
    }

    // إنشاء طلب جديد
    createOrder(orderData) {
        try {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                throw new Error('يجب تسجيل الدخول لإنشاء طلب');
            }

            const order = {
                id: this.generateOrderId(),
                userId: currentUser.username,
                userEmail: currentUser.email,
                items: orderData.items || [],
                total: orderData.total || 0,
                status: 'pending',
                date: new Date().toISOString(),
                shippingAddress: orderData.shippingAddress || '',
                paymentMethod: orderData.paymentMethod || 'cash',
                notes: orderData.notes || ''
            };

            // حفظ الطلب
            const orders = this.getOrders();
            orders.push(order);
            saveToStorage('orders', orders);

            // تفريغ السلة
            saveToStorage('cart', []);

            // إرسال حدث إتمام الطلب
            this.dispatchOrderCreated(order);

            return order;
        } catch (error) {
            console.error('خطأ في إنشاء الطلب:', error);
            throw error;
        }
    }

    // توليد رقم طلب فريد
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORD-${timestamp}-${random}`;
    }

    // الحصول على جميع الطلبات
    getOrders() {
        return getFromStorage('orders') || [];
    }

    // الحصول على طلبات المستخدم الحالي
    getUserOrders() {
        const currentUser = getCurrentUser();
        if (!currentUser) return [];

        const allOrders = this.getOrders();
        return allOrders.filter(order => order.userId === currentUser.username);
    }

    // الحصول على طلب بواسطة الرقم
    getOrderById(orderId) {
        const orders = this.getOrders();
        return orders.find(order => order.id === orderId);
    }

    // تحديث حالة الطلب
    updateOrderStatus(orderId, newStatus) {
        try {
            const orders = this.getOrders();
            const orderIndex = orders.findIndex(order => order.id === orderId);

            if (orderIndex === -1) {
                throw new Error('الطلب غير موجود');
            }

            orders[orderIndex].status = newStatus;
            orders[orderIndex].updatedAt = new Date().toISOString();

            saveToStorage('orders', orders);

            // إرسال حدث تحديث الطلب
            this.dispatchOrderUpdated(orders[orderIndex]);

            return orders[orderIndex];
        } catch (error) {
            console.error('خطأ في تحديث حالة الطلب:', error);
            throw error;
        }
    }

    // إلغاء الطلب
    cancelOrder(orderId) {
        try {
            const order = this.getOrderById(orderId);
            if (!order) {
                throw new Error('الطلب غير موجود');
            }

            if (order.status === 'delivered' || order.status === 'cancelled') {
                throw new Error('لا يمكن إلغاء هذا الطلب');
            }

            return this.updateOrderStatus(orderId, 'cancelled');
        } catch (error) {
            console.error('خطأ في إلغاء الطلب:', error);
            throw error;
        }
    }

    // تحميل وعرض الطلبات
    loadOrders() {
        const ordersContainer = document.getElementById('orders-container');
        if (!ordersContainer) return;

        const userOrders = this.getUserOrders();

        if (userOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="no-orders">
                    <h3>لا توجد طلبات</h3>
                    <p>لم تقم بأي طلبات حتى الآن</p>
                    <a href="../products/products.html" class="btn btn-primary">تصفح المنتجات</a>
                </div>
            `;
            return;
        }

        // ترتيب الطلبات حسب التاريخ (الأحدث أولاً)
        userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

        ordersContainer.innerHTML = userOrders.map(order => this.createOrderCard(order)).join('');

        // إضافة مستمعي الأحداث
        this.attachOrderEvents();
    }

    // إنشاء بطاقة الطلب
    createOrderCard(order) {
        const statusText = this.getStatusText(order.status);
        const statusClass = this.getStatusClass(order.status);
        const orderDate = new Date(order.date).toLocaleDateString('ar-EG');

        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <h3>طلب رقم: ${order.id}</h3>
                        <p class="order-date">تاريخ الطلب: ${orderDate}</p>
                    </div>
                    <div class="order-status ${statusClass}">
                        ${statusText}
                    </div>
                </div>
                
                <div class="order-items">
                    <h4>المنتجات:</h4>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span class="item-name">${item.name}</span>
                            <span class="item-quantity">الكمية: ${item.quantity}</span>
                            <span class="item-price">${item.price * item.quantity} ج.م</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-details">
                    <div class="order-total">
                        <strong>المجموع الكلي: ${order.total} ج.م</strong>
                    </div>
                    ${order.shippingAddress ? `
                        <div class="shipping-address">
                            <strong>عنوان التوصيل:</strong> ${order.shippingAddress}
                        </div>
                    ` : ''}
                    <div class="payment-method">
                        <strong>طريقة الدفع:</strong> ${this.getPaymentMethodText(order.paymentMethod)}
                    </div>
                </div>
                
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button class="btn btn-danger cancel-order" data-order-id="${order.id}">
                            إلغاء الطلب
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary view-details" data-order-id="${order.id}">
                        عرض التفاصيل
                    </button>
                </div>
            </div>
        `;
    }

    // الحصول على نص حالة الطلب
    getStatusText(status) {
        const statusMap = {
            'pending': 'قيد المراجعة',
            'confirmed': 'تم التأكيد',
            'shipped': 'قيد التوصيل',
            'delivered': 'تم التوصيل',
            'cancelled': 'ملغي'
        };
        return statusMap[status] || 'غير محدد';
    }

    // الحصول على كلاس حالة الطلب
    getStatusClass(status) {
        const classMap = {
            'pending': 'status-pending',
            'confirmed': 'status-confirmed',
            'shipped': 'status-shipped',
            'delivered': 'status-delivered',
            'cancelled': 'status-cancelled'
        };
        return classMap[status] || '';
    }

    // الحصول على نص طريقة الدفع
    getPaymentMethodText(method) {
        const methodMap = {
            'cash': 'الدفع عند التوصيل',
            'card': 'بطاقة ائتمانية',
            'bank': 'تحويل بنكي'
        };
        return methodMap[method] || 'غير محدد';
    }

    // إضافة مستمعي أحداث الطلبات
    attachOrderEvents() {
        // إلغاء الطلب
        document.querySelectorAll('.cancel-order').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                this.handleCancelOrder(orderId);
            });
        });

        // عرض تفاصيل الطلب
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                this.showOrderDetails(orderId);
            });
        });
    }

    // معالجة إلغاء الطلب
    handleCancelOrder(orderId) {
        if (confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
            try {
                this.cancelOrder(orderId);
                this.loadOrders(); // إعادة تحميل الطلبات
                this.showNotification('تم إلغاء الطلب بنجاح', 'success');
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }
    }

    // عرض تفاصيل الطلب
    showOrderDetails(orderId) {
        const order = this.getOrderById(orderId);
        if (!order) {
            this.showNotification('الطلب غير موجود', 'error');
            return;
        }

        // إنشاء مودال لعرض التفاصيل
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>تفاصيل الطلب ${order.id}</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="order-full-details">
                        <p><strong>رقم الطلب:</strong> ${order.id}</p>
                        <p><strong>تاريخ الطلب:</strong> ${new Date(order.date).toLocaleString('ar-EG')}</p>
                        <p><strong>الحالة:</strong> ${this.getStatusText(order.status)}</p>
                        <p><strong>طريقة الدفع:</strong> ${this.getPaymentMethodText(order.paymentMethod)}</p>
                        ${order.shippingAddress ? `<p><strong>عنوان التوصيل:</strong> ${order.shippingAddress}</p>` : ''}
                        ${order.notes ? `<p><strong>ملاحظات:</strong> ${order.notes}</p>` : ''}
                        
                        <h3>المنتجات المطلوبة:</h3>
                        <div class="order-items-detailed">
                            ${order.items.map(item => `
                                <div class="item-detailed">
                                    <p><strong>${item.name}</strong></p>
                                    <p>السعر: ${item.price} ج.م</p>
                                    <p>الكمية: ${item.quantity}</p>
                                    <p>المجموع: ${item.price * item.quantity} ج.م</p>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="order-total-detailed">
                            <h3>المجموع الكلي: ${order.total} ج.م</h3>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // إغلاق المودال
        modal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // إرسال حدث إنشاء طلب
    dispatchOrderCreated(order) {
        const event = new CustomEvent('order-created', {
            detail: order
        });
        document.dispatchEvent(event);
    }

    // إرسال حدث تحديث طلب
    dispatchOrderUpdated(order) {
        const event = new CustomEvent('order-updated', {
            detail: order
        });
        document.dispatchEvent(event);
    }

    // عرض إشعار
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // تصدير بيانات الطلبات (للمشرف)
    exportOrders() {
        const orders = this.getOrders();
        const dataStr = JSON.stringify(orders, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `orders_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    // إحصائيات الطلبات
    getOrderStats() {
        const orders = this.getOrders();
        const userOrders = this.getUserOrders();

        return {
            total: orders.length,
            userTotal: userOrders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
            totalRevenue: orders
                .filter(o => o.status === 'delivered')
                .reduce((sum, o) => sum + o.total, 0)
        };
    }
}

// تهيئة مدير الطلبات
let orderManager;

document.addEventListener('DOMContentLoaded', () => {
    orderManager = new OrderManager();
});

// تصدير الوظائف للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OrderManager };
}