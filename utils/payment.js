// payment.js - نظام إدارة المدفوعات

class PaymentManager {
    constructor() {
        this.paymentMethods = this.loadPaymentMethods();
        this.transactions = this.loadTransactions();
        this.currencies = {
            'EGP': { symbol: 'ج.م', name: 'جنيه مصري' },
            'USD': { symbol: '$', name: 'دولار أمريكي' },
            'EUR': { symbol: '€', name: 'يورو' }
        };
        this.defaultCurrency = 'EGP';
    }

    // تحميل طرق الدفع المتاحة
    loadPaymentMethods() {
        const savedMethods = JSON.parse(localStorage.getItem('paymentMethods') || '[]');
        return savedMethods.length > 0 ? savedMethods : [
            {
                id: 'cash_on_delivery',
                name: 'الدفع عند الاستلام',
                nameEn: 'Cash on Delivery',
                icon: '💰',
                isActive: true,
                fees: 0,
                description: 'ادفع نقداً عند استلام طلبك',
                minAmount: 0,
                maxAmount: 5000
            },
            {
                id: 'credit_card',
                name: 'بطاقة ائتمان',
                nameEn: 'Credit Card',
                icon: '💳',
                isActive: true,
                fees: 2.5, // نسبة مئوية
                description: 'فيزا أو ماستركارد',
                minAmount: 10,
                maxAmount: 50000
            },
            {
                id: 'debit_card',
                name: 'بطاقة خصم مباشر',
                nameEn: 'Debit Card',
                icon: '💳',
                isActive: true,
                fees: 1.5,
                description: 'بطاقة خصم مباشر من البنك',
                minAmount: 10,
                maxAmount: 25000
            },
            {
                id: 'vodafone_cash',
                name: 'فودافون كاش',
                nameEn: 'Vodafone Cash',
                icon: '📱',
                isActive: true,
                fees: 0,
                description: 'ادفع من محفظة فودافون كاش',
                minAmount: 5,
                maxAmount: 10000
            },
            {
                id: 'orange_money',
                name: 'أورانج موني',
                nameEn: 'Orange Money',
                icon: '📱',
                isActive: true,
                fees: 0,
                description: 'ادفع من محفظة أورانج موني',
                minAmount: 5,
                maxAmount: 8000
            },
            {
                id: 'etisalat_cash',
                name: 'اتصالات كاش',
                nameEn: 'Etisalat Cash',
                icon: '📱',
                isActive: true,
                fees: 0,
                description: 'ادفع من محفظة اتصالات كاش',
                minAmount: 5,
                maxAmount: 7000
            },
            {
                id: 'bank_transfer',
                name: 'تحويل بنكي',
                nameEn: 'Bank Transfer',
                icon: '🏦',
                isActive: true,
                fees: 5, // رسوم ثابتة
                description: 'تحويل مباشر من حسابك البنكي',
                minAmount: 50,
                maxAmount: 100000
            },
            {
                id: 'paypal',
                name: 'باي بال',
                nameEn: 'PayPal',
                icon: '🅿️',
                isActive: true,
                fees: 3.5,
                description: 'ادفع باستخدام حساب PayPal',
                minAmount: 1,
                maxAmount: 20000
            }
        ];
    }

    // تحميل المعاملات السابقة
    loadTransactions() {
        return JSON.parse(localStorage.getItem('transactions') || '[]');
    }

    // الحصول على طرق الدفع المتاحة للمبلغ المحدد
    getAvailablePaymentMethods(amount) {
        return this.paymentMethods.filter(method =>
            method.isActive &&
            amount >= method.minAmount &&
            amount <= method.maxAmount
        );
    }

    // حساب رسوم طريقة الدفع
    calculatePaymentFees(methodId, amount) {
        const method = this.paymentMethods.find(m => m.id === methodId);
        if (!method) return 0;

        if (method.fees <= 0) return 0;

        // إذا كانت الرسوم أقل من 100، فهي نسبة مئوية
        if (method.fees < 100) {
            return (amount * method.fees) / 100;
        }

        // وإلا فهي رسوم ثابتة
        return method.fees;
    }

    // التحقق من صحة بيانات الدفع
    validatePaymentData(paymentData) {
        const { methodId, amount, customerInfo } = paymentData;
        const errors = [];

        // التحقق من طريقة الدفع
        const method = this.paymentMethods.find(m => m.id === methodId);
        if (!method) {
            errors.push('طريقة دفع غير صحيحة');
        } else if (!method.isActive) {
            errors.push('طريقة الدفع غير متاحة حالياً');
        } else if (amount < method.minAmount || amount > method.maxAmount) {
            errors.push(`المبلغ يجب أن يكون بين ${method.minAmount} و ${method.maxAmount} جنيه`);
        }

        // التحقق من المبلغ
        if (!amount || amount <= 0) {
            errors.push('مبلغ غير صحيح');
        }

        // التحقق من بيانات العميل
        if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
            errors.push('بيانات العميل مطلوبة');
        }

        // التحقق الخاص بكل طريقة دفع
        if (method && method.id === 'credit_card' || method.id === 'debit_card') {
            if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
                errors.push('بيانات البطاقة مطلوبة');
            }
        }

        if (method && (method.id.includes('cash') || method.id.includes('money'))) {
            if (!paymentData.mobileNumber) {
                errors.push('رقم المحفظة الإلكترونية مطلوب');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // معالجة عملية الدفع
    async processPayment(paymentData) {
        const validation = this.validatePaymentData(paymentData);

        if (!validation.isValid) {
            return {
                success: false,
                message: validation.errors.join(', '),
                errors: validation.errors
            };
        }

        try {
            const transaction = await this.createTransaction(paymentData);

            // محاكاة معالجة الدفع حسب طريقة الدفع
            const result = await this.simulatePaymentProcessing(transaction);

            if (result.success) {
                transaction.status = 'completed';
                transaction.completedAt = new Date().toISOString();
                transaction.confirmationNumber = this.generateConfirmationNumber();
            } else {
                transaction.status = 'failed';
                transaction.failureReason = result.message;
            }

            // حفظ المعاملة
            this.saveTransaction(transaction);

            return {
                success: result.success,
                message: result.message,
                transaction: transaction,
                confirmationNumber: transaction.confirmationNumber
            };

        } catch (error) {
            return {
                success: false,
                message: 'حدث خطأ أثناء معالجة الدفع',
                error: error.message
            };
        }
    }

    // إنشاء معاملة جديدة
    async createTransaction(paymentData) {
        const method = this.paymentMethods.find(m => m.id === paymentData.methodId);
        const fees = this.calculatePaymentFees(paymentData.methodId, paymentData.amount);
        const totalAmount = paymentData.amount + fees;

        const transaction = {
            id: this.generateTransactionId(),
            orderId: paymentData.orderId,
            customerId: paymentData.customerId,
            paymentMethod: method,
            amount: paymentData.amount,
            fees: fees,
            totalAmount: totalAmount,
            currency: paymentData.currency || this.defaultCurrency,
            status: 'pending',
            createdAt: new Date().toISOString(),
            customerInfo: paymentData.customerInfo,
            paymentDetails: this.sanitizePaymentDetails(paymentData),
            attempts: 1
        };

        return transaction;
    }

    // محاكاة معالجة الدفع
    async simulatePaymentProcessing(transaction) {
        // تأخير لمحاكاة وقت المعالجة
        await new Promise(resolve => setTimeout(resolve, 2000));

        // محاكاة نسبة نجاح مختلفة لكل طريقة دفع
        const successRates = {
            'cash_on_delivery': 0.95,
            'credit_card': 0.85,
            'debit_card': 0.88,
            'vodafone_cash': 0.92,
            'orange_money': 0.90,
            'etisalat_cash': 0.91,
            'bank_transfer': 0.87,
            'paypal': 0.89
        };

        const successRate = successRates[transaction.paymentMethod.id] || 0.80;
        const isSuccessful = Math.random() < successRate;

        if (isSuccessful) {
            return {
                success: true,
                message: 'تمت عملية الدفع بنجاح'
            };
        } else {
            const failureReasons = [
                'رصيد غير كافي',
                'بيانات خاطئة',
                'انتهت صلاحية البطاقة',
                'تم رفض المعاملة من البنك',
                'خطأ في الشبكة'
            ];

            return {
                success: false,
                message: failureReasons[Math.floor(Math.random() * failureReasons.length)]
            };
        }
    }

    // تنظيف بيانات الدفع الحساسة
    sanitizePaymentDetails(paymentData) {
        const sanitized = { ...paymentData };

        // إخفاء أرقام البطاقات
        if (sanitized.cardNumber) {
            sanitized.cardNumber = '**** **** **** ' + sanitized.cardNumber.slice(-4);
        }

        // حذف CVV
        delete sanitized.cvv;

        // إخفاء جزء من رقم المحفظة
        if (sanitized.mobileNumber) {
            sanitized.mobileNumber = sanitized.mobileNumber.slice(0, 3) +
                '****' + sanitized.mobileNumber.slice(-2);
        }

        return sanitized;
    }

    // إنشاء رقم معاملة فريد
    generateTransactionId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `TXN${timestamp}${random}`;
    }

    // إنشاء رقم تأكيد
    generateConfirmationNumber() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // حفظ المعاملة
    saveTransaction(transaction) {
        this.transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    // الحصول على معاملة بالرقم المرجعي
    getTransactionById(transactionId) {
        return this.transactions.find(t => t.id === transactionId);
    }

    // الحصول على معاملات العميل
    getCustomerTransactions(customerId) {
        return this.transactions.filter(t => t.customerId === customerId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // استرداد المبلغ
    async refundPayment(transactionId, refundAmount, reason) {
        const transaction = this.getTransactionById(transactionId);

        if (!transaction) {
            return {
                success: false,
                message: 'معاملة غير موجودة'
            };
        }

        if (transaction.status !== 'completed') {
            return {
                success: false,
                message: 'لا يمكن استرداد معاملة غير مكتملة'
            };
        }

        if (refundAmount > transaction.totalAmount) {
            return {
                success: false,
                message: 'مبلغ الاسترداد أكبر من مبلغ المعاملة'
            };
        }

        // إنشاء معاملة استرداد
        const refundTransaction = {
            id: this.generateTransactionId(),
            originalTransactionId: transactionId,
            type: 'refund',
            amount: refundAmount,
            reason: reason,
            status: 'completed',
            createdAt: new Date().toISOString()
        };

        // تحديث حالة المعاملة الأصلية
        transaction.refundAmount = (transaction.refundAmount || 0) + refundAmount;
        transaction.refundStatus = transaction.refundAmount >= transaction.totalAmount ? 'fully_refunded' : 'partially_refunded';

        this.saveTransaction(refundTransaction);
        localStorage.setItem('transactions', JSON.stringify(this.transactions));

        return {
            success: true,
            message: 'تم الاسترداد بنجاح',
            refundTransaction: refundTransaction
        };
    }

    // إحصائيات المدفوعات
    getPaymentStatistics(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();

        const filteredTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.createdAt);
            return transactionDate >= start && transactionDate <= end;
        });

        const completed = filteredTransactions.filter(t => t.status === 'completed');
        const failed = filteredTransactions.filter(t => t.status === 'failed');

        const totalRevenue = completed.reduce((sum, t) => sum + t.amount, 0);
        const totalFees = completed.reduce((sum, t) => sum + t.fees, 0);

        // إحصائيات طرق الدفع
        const methodStats = {};
        completed.forEach(t => {
            const methodId = t.paymentMethod.id;
            if (!methodStats[methodId]) {
                methodStats[methodId] = {
                    name: t.paymentMethod.name,
                    count: 0,
                    amount: 0
                };
            }
            methodStats[methodId].count++;
            methodStats[methodId].amount += t.amount;
        });

        return {
            totalTransactions: filteredTransactions.length,
            completedTransactions: completed.length,
            failedTransactions: failed.length,
            successRate: (completed.length / filteredTransactions.length * 100).toFixed(2),
            totalRevenue: totalRevenue,
            totalFees: totalFees,
            averageTransactionValue: completed.length > 0 ? (totalRevenue / completed.length).toFixed(2) : 0,
            paymentMethodStats: methodStats
        };
    }

    // تحديث طريقة دفع
    updatePaymentMethod(methodId, updates) {
        const methodIndex = this.paymentMethods.findIndex(m => m.id === methodId);
        if (methodIndex !== -1) {
            this.paymentMethods[methodIndex] = { ...this.paymentMethods[methodIndex], ...updates };
            localStorage.setItem('paymentMethods', JSON.stringify(this.paymentMethods));
            return true;
        }
        return false;
    }

    // تحويل العملة (بسيط)
    convertCurrency(amount, fromCurrency, toCurrency) {
        // أسعار تحويل مبسطة - في التطبيق الحقيقي يجب استخدام API للأسعار الحقيقية
        const rates = {
            'EGP': { 'USD': 0.032, 'EUR': 0.029 },
            'USD': { 'EGP': 31.5, 'EUR': 0.91 },
            'EUR': { 'EGP': 34.6, 'USD': 1.10 }
        };

        if (fromCurrency === toCurrency) return amount;

        const rate = rates[fromCurrency]?.[toCurrency];
        return rate ? (amount * rate).toFixed(2) : amount;
    }
}

// تصدير الكلاس
if (typeof module !== 'undefined') {
    module.exports = PaymentManager;
}

// إنشاء مثيل عام
const paymentManager = new PaymentManager();
function processPayment() {
    const statusElement = document.getElementById('payment-status');

    statusElement.innerText = "جاري معالجة الدفع...";

    setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate

        if (success) {
            statusElement.innerText = "✅ تم الدفع بنجاح";
            updateOrderStatus('Paid');
        } else {
            statusElement.innerText = "❌ فشل الدفع، حاول مرة أخرى";
            updateOrderStatus('Failed');
        }
    }, 2000);
}

function updateOrderStatus(status) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const lastOrder = orders[orders.length - 1];

    if (lastOrder) {
        lastOrder.status = status;
        localStorage.setItem('orders', JSON.stringify(orders));
    }
}
