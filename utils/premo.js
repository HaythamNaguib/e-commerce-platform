// promo.js - إدارة العروض والخصومات

class PromoManager {
    constructor() {
        this.promoCodes = this.loadPromoCodes();
        this.activePromotions = this.loadActivePromotions();
    }

    // تحميل أكواد الخصم من التخزين المحلي
    loadPromoCodes() {
        const savedCodes = JSON.parse(localStorage.getItem('promoCodes') || '[]');
        return savedCodes.length > 0 ? savedCodes : [
            {
                id: 'WELCOME10',
                code: 'WELCOME10',
                discount: 10,
                type: 'percentage',
                minAmount: 50,
                maxUses: 100,
                usedCount: 0,
                expiryDate: '2024-12-31',
                isActive: true,
                description: 'خصم 10% للعملاء الجدد'
            },
            {
                id: 'SAVE20',
                code: 'SAVE20',
                discount: 20,
                type: 'fixed',
                minAmount: 100,
                maxUses: 50,
                usedCount: 0,
                expiryDate: '2024-11-30',
                isActive: true,
                description: 'خصم 20 جنيه عند الشراء بأكثر من 100 جنيه'
            },
            {
                id: 'FREESHIP',
                code: 'FREESHIP',
                discount: 0,
                type: 'free_shipping',
                minAmount: 75,
                maxUses: 200,
                usedCount: 0,
                expiryDate: '2024-12-15',
                isActive: true,
                description: 'شحن مجاني للطلبات أكثر من 75 جنيه'
            }
        ];
    }

    // تحميل العروض النشطة
    loadActivePromotions() {
        const savedPromotions = JSON.parse(localStorage.getItem('activePromotions') || '[]');
        return savedPromotions.length > 0 ? savedPromotions : [
            {
                id: 'summer_sale',
                title: 'تخفيضات الصيف',
                description: 'خصم يصل إلى 50% على مجموعة مختارة',
                discountPercentage: 30,
                startDate: '2024-06-01',
                endDate: '2024-08-31',
                applicableCategories: ['ملابس', 'أحذية'],
                isActive: true
            },
            {
                id: 'electronics_deal',
                title: 'عروض الإلكترونيات',
                description: 'خصم 25% على جميع الأجهزة الإلكترونية',
                discountPercentage: 25,
                startDate: '2024-07-01',
                endDate: '2024-07-31',
                applicableCategories: ['إلكترونيات'],
                isActive: true
            }
        ];
    }

    // التحقق من صحة كود الخصم
    validatePromoCode(code, orderTotal, userId) {
        const promo = this.promoCodes.find(p =>
            p.code.toLowerCase() === code.toLowerCase() && p.isActive
        );

        if (!promo) {
            return {
                isValid: false,
                message: 'كود الخصم غير صحيح'
            };
        }

        // التحقق من تاريخ الانتهاء
        if (new Date(promo.expiryDate) < new Date()) {
            return {
                isValid: false,
                message: 'كود الخصم منتهي الصلاحية'
            };
        }

        // التحقق من الحد الأدنى للمبلغ
        if (orderTotal < promo.minAmount) {
            return {
                isValid: false,
                message: `الحد الأدنى للطلب ${promo.minAmount} جنيه`
            };
        }

        // التحقق من عدد مرات الاستخدام
        if (promo.usedCount >= promo.maxUses) {
            return {
                isValid: false,
                message: 'تم استنفاد هذا العرض'
            };
        }

        // التحقق من استخدام المستخدم للكود من قبل
        const userUsage = JSON.parse(localStorage.getItem('userPromoUsage') || '{}');
        if (userUsage[userId] && userUsage[userId].includes(promo.id)) {
            return {
                isValid: false,
                message: 'تم استخدام هذا الكود من قبل'
            };
        }

        return {
            isValid: true,
            promo: promo,
            message: 'كود الخصم صحيح'
        };
    }

    // حساب قيمة الخصم
    calculateDiscount(promo, orderTotal, items = []) {
        let discountAmount = 0;
        let freeShipping = false;

        switch (promo.type) {
            case 'percentage':
                discountAmount = (orderTotal * promo.discount) / 100;
                break;
            case 'fixed':
                discountAmount = promo.discount;
                break;
            case 'free_shipping':
                freeShipping = true;
                discountAmount = 25; // قيمة الشحن المفترضة
                break;
        }

        return {
            discountAmount: Math.min(discountAmount, orderTotal),
            freeShipping: freeShipping,
            finalTotal: Math.max(orderTotal - discountAmount, 0)
        };
    }

    // تطبيق كود الخصم
    applyPromoCode(code, orderTotal, userId, items = []) {
        const validation = this.validatePromoCode(code, orderTotal, userId);

        if (!validation.isValid) {
            return validation;
        }

        const discount = this.calculateDiscount(validation.promo, orderTotal, items);

        // تسجيل استخدام الكود
        this.recordPromoUsage(validation.promo.id, userId);

        return {
            isValid: true,
            promo: validation.promo,
            discount: discount,
            message: `تم تطبيق الخصم بنجاح - وفرت ${discount.discountAmount} جنيه`
        };
    }

    // تسجيل استخدام كود الخصم
    recordPromoUsage(promoId, userId) {
        // تحديث عداد الاستخدام
        const promo = this.promoCodes.find(p => p.id === promoId);
        if (promo) {
            promo.usedCount++;
            this.savePromoCodes();
        }

        // تسجيل استخدام المستخدم
        const userUsage = JSON.parse(localStorage.getItem('userPromoUsage') || '{}');
        if (!userUsage[userId]) {
            userUsage[userId] = [];
        }
        userUsage[userId].push(promoId);
        localStorage.setItem('userPromoUsage', JSON.stringify(userUsage));
    }

    // الحصول على العروض النشطة للفئة
    getActivePromotionsForCategory(category) {
        const now = new Date();
        return this.activePromotions.filter(promo => {
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            return promo.isActive &&
                now >= startDate &&
                now <= endDate &&
                (promo.applicableCategories.includes(category) ||
                    promo.applicableCategories.includes('الكل'));
        });
    }

    // تطبيق خصم العرض على المنتج
    applyPromotionDiscount(product, promotions) {
        let maxDiscount = 0;
        let appliedPromotion = null;

        promotions.forEach(promotion => {
            if (promotion.applicableCategories.includes(product.category) ||
                promotion.applicableCategories.includes('الكل')) {
                const discount = (product.price * promotion.discountPercentage) / 100;
                if (discount > maxDiscount) {
                    maxDiscount = discount;
                    appliedPromotion = promotion;
                }
            }
        });

        return {
            originalPrice: product.price,
            discountAmount: maxDiscount,
            finalPrice: product.price - maxDiscount,
            appliedPromotion: appliedPromotion
        };
    }

    // حفظ أكواد الخصم
    savePromoCodes() {
        localStorage.setItem('promoCodes', JSON.stringify(this.promoCodes));
    }

    // حفظ العروض
    savePromotions() {
        localStorage.setItem('activePromotions', JSON.stringify(this.activePromotions));
    }

    // إضافة كود خصم جديد
    addPromoCode(promoData) {
        const newPromo = {
            id: 'PROMO_' + Date.now(),
            ...promoData,
            usedCount: 0,
            isActive: true
        };

        this.promoCodes.push(newPromo);
        this.savePromoCodes();
        return newPromo;
    }

    // تعطيل كود خصم
    deactivatePromoCode(promoId) {
        const promo = this.promoCodes.find(p => p.id === promoId);
        if (promo) {
            promo.isActive = false;
            this.savePromoCodes();
            return true;
        }
        return false;
    }

    // الحصول على إحصائيات العروض
    getPromoStatistics() {
        const totalCodes = this.promoCodes.length;
        const activeCodes = this.promoCodes.filter(p => p.isActive).length;
        const expiredCodes = this.promoCodes.filter(p =>
            new Date(p.expiryDate) < new Date()
        ).length;
        const totalUsage = this.promoCodes.reduce((sum, p) => sum + p.usedCount, 0);

        return {
            totalCodes,
            activeCodes,
            expiredCodes,
            totalUsage,
            mostUsedCode: this.promoCodes.reduce((max, p) =>
                p.usedCount > max.usedCount ? p : max, this.promoCodes[0]
            )
        };
    }
}

// تصدير الكلاس للاستخدام في ملفات أخرى
if (typeof module !== 'undefined') {
    module.exports = PromoManager;
}

// إنشاء مثيل عام للاستخدام
const promoManager = new PromoManager();
function applyPromoCode() {
    const code = document.getElementById('promo-code').value.trim().toUpperCase();
    const totalElement = document.getElementById('total-price');
    let total = parseFloat(totalElement.innerText);

    let discount = 0;

    if (code === "DISCOUNT10") {
        discount = total * 0.10;
    } else if (code === "FLAT50") {
        discount = 50;
    } else {
        document.getElementById('promo-message').innerText = "❌ الكود غير صحيح";
        return;
    }

    const newTotal = total - discount;
    totalElement.innerText = newTotal.toFixed(2);
    document.getElementById('promo-message').innerText = `✅ تم تطبيق الخصم: -${discount.toFixed(2)} جنيه`;
}
