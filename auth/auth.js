// ========== فئة إدارة المصادقة ==========
class AuthManager {
    constructor() {
        this.storage = window.storage || new StorageManager();
        this.currentForm = 'login';
        this.isLoading = false;

        this.init();
    }

    // تهيئة النظام
    init() {
        this.bindEvents();
        // إزالة التحقق التلقائي من حالة المصادقة في صفحة auth.html
        // this.checkAuthStatus(); - تم إزالة هذا السطر
        this.setupFormValidation();
        this.setupPasswordToggle();
        this.setupDemoAccounts();
    }

    // ربط الأحداث
    bindEvents() {
        // أحداث تبديل النماذج
        document.querySelectorAll('.switch-form').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('data-target');
                this.switchForm(target);
            });
        });

        // أحداث إرسال النماذج
        const loginForm = document.getElementById('loginFormElement');
        const registerForm = document.getElementById('registerFormElement');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAlerts();
            }
        });

        // التحقق من صحة كلمة المرور أثناء الكتابة
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                this.validatePasswordConfirmation();
            });
        }
    }

    // فحص حالة المصادقة (للاستخدام في الصفحات الأخرى فقط)
    checkAuthStatus() {
        if (this.storage.isUserLoggedIn()) {
            // إذا كان المستخدم مسجل دخول، توجيهه للصفحة الرئيسية
            const user = this.storage.getCurrentUser();
            this.showAlert(`مرحباً ${user.fullName}! جارِ توجيهك...`, 'success');

            setTimeout(() => {
                // تحديد الصفحة بناءً على نوع المستخدم
                if (user.isAdmin) {
                    window.location.href = '../admin/admin.html';
                } else {
                    window.location.href = '../index.html';
                }
            }, 1500);
        }
    }

    // إعداد التحقق من صحة النماذج
    setupFormValidation() {
        // التحقق من صحة البريد الإلكتروني
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateEmail(input);
            });
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });

        // التحقق من صحة كلمة المرور
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validatePassword(input);
            });
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });

        // التحقق من صحة رقم الهاتف
        const phoneInput = document.getElementById('registerPhone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => {
                this.validatePhone(phoneInput);
            });
            phoneInput.addEventListener('input', () => {
                this.clearFieldError(phoneInput);
            });
        }
    }

    // إعداد أزرار إظهار/إخفاء كلمة المرور
    setupPasswordToggle() {
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = button.getAttribute('data-target');
                const input = document.getElementById(targetId);
                const icon = button.querySelector('.eye-icon');

                if (input.type === 'password') {
                    input.type = 'text';
                    icon.textContent = '🙈';
                } else {
                    input.type = 'password';
                    icon.textContent = '👁️';
                }
            });
        });
    }

    // إعداد الحسابات التجريبية
    setupDemoAccounts() {
        const adminDemo = document.querySelector('.admin-demo');
        const userDemo = document.querySelector('.user-demo');

        if (adminDemo) {
            adminDemo.addEventListener('click', () => {
                this.fillDemoCredentials('admin');
            });
        }

        if (userDemo) {
            userDemo.addEventListener('click', () => {
                this.fillDemoCredentials('user');
            });
        }
    }

    // ملء بيانات الحسابات التجريبية
    fillDemoCredentials(type) {
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');

        if (type === 'admin') {
            emailInput.value = 'admin@store.com';
            passwordInput.value = 'admin123';
            this.showAlert('تم ملء بيانات حساب المدير', 'info');
        } else if (type === 'user') {
            emailInput.value = 'user@example.com';
            passwordInput.value = 'user123';
            this.showAlert('تم ملء بيانات حساب العميل', 'info');
        }

        // تركيز على زر تسجيل الدخول
        const submitBtn = document.querySelector('#loginFormElement .submit-btn');
        if (submitBtn) {
            setTimeout(() => {
                submitBtn.focus();
            }, 500);
        }
    }

    // تبديل النماذج
    switchForm(target) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (target === 'register') {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            registerForm.classList.add('fade-in');
            this.currentForm = 'register';
        } else {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            loginForm.classList.add('fade-in');
            this.currentForm = 'login';
        }

        // مسح الرسائل السابقة
        this.closeAlerts();

        // إعادة تعيين النماذج
        this.resetForms();
    }

    // معالجة تسجيل الدخول
    async handleLogin(e) {
        e.preventDefault();

        if (this.isLoading) return;

        const formData = new FormData(e.target);
        const email = formData.get('email')?.trim();
        const password = formData.get('password')?.trim();

        // التحقق من صحة البيانات
        if (!this.validateLoginForm(email, password)) {
            return;
        }

        this.setLoading(true, 'login');

        try {
            // محاولة تسجيل الدخول
            const user = this.storage.loginUser(email, password);

            this.showAlert(`مرحباً ${user.fullName}! تم تسجيل الدخول بنجاح`, 'success');

            // توجيه المستخدم بناءً على نوعه
            setTimeout(() => {
                if (user.isAdmin) {
                    // إذا كنا في مجلد auth، اذهب للمدير
                    window.location.href = '../admin/admin.html';
                } else {
                    // إذا كنا في مجلد auth، اذهب للصفحة الرئيسية
                    window.location.href = '../index.html';
                }
            }, 1500);

        } catch (error) {
            this.showAlert(error.message, 'error');
        } finally {
            this.setLoading(false, 'login');
        }
    }

    // معالجة التسجيل
    async handleRegister(e) {
        e.preventDefault();

        if (this.isLoading) return;

        const formData = new FormData(e.target);
        const userData = {
            fullName: formData.get('fullName')?.trim(),
            username: formData.get('username')?.trim(),
            email: formData.get('email')?.trim(),
            password: formData.get('password')?.trim(),
            phone: formData.get('phone')?.trim(),
            address: formData.get('address')?.trim()
        };

        const confirmPassword = formData.get('confirmPassword')?.trim();
        const agreeTerms = formData.get('agreeTerms');

        // التحقق من صحة البيانات
        if (!this.validateRegisterForm(userData, confirmPassword, agreeTerms)) {
            return;
        }

        this.setLoading(true, 'register');

        try {
            // إنشاء المستخدم الجديد
            const newUser = this.storage.addUser(userData);

            this.showAlert('تم إنشاء الحساب بنجاح! جارِ تسجيل الدخول...', 'success');

            // تسجيل دخول تلقائي
            setTimeout(() => {
                this.storage.setCurrentUser(newUser);
                window.location.href = '../index.html';
            }, 2000);

        } catch (error) {
            this.showAlert(error.message, 'error');
        } finally {
            this.setLoading(false, 'register');
        }
    }

    // التحقق من صحة نموذج تسجيل الدخول
    validateLoginForm(email, password) {
        let isValid = true;

        if (!email) {
            this.showFieldError('loginEmail', 'البريد الإلكتروني مطلوب');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showFieldError('loginEmail', 'البريد الإلكتروني غير صحيح');
            isValid = false;
        }

        if (!password) {
            this.showFieldError('loginPassword', 'كلمة المرور مطلوبة');
            isValid = false;
        }

        return isValid;
    }

    // التحقق من صحة نموذج التسجيل
    validateRegisterForm(userData, confirmPassword, agreeTerms) {
        let isValid = true;

        // التحقق من الاسم الكامل
        if (!userData.fullName) {
            this.showFieldError('registerFullName', 'الاسم الكامل مطلوب');
            isValid = false;
        } else if (userData.fullName.length < 3) {
            this.showFieldError('registerFullName', 'الاسم يجب أن يكون 3 أحرف على الأقل');
            isValid = false;
        }

        // التحقق من اسم المستخدم
        if (!userData.username) {
            this.showFieldError('registerUsername', 'اسم المستخدم مطلوب');
            isValid = false;
        } else if (userData.username.length < 3) {
            this.showFieldError('registerUsername', 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
            isValid = false;
        }

        // التحقق من البريد الإلكتروني
        if (!userData.email) {
            this.showFieldError('registerEmail', 'البريد الإلكتروني مطلوب');
            isValid = false;
        } else if (!this.isValidEmail(userData.email)) {
            this.showFieldError('registerEmail', 'البريد الإلكتروني غير صحيح');
            isValid = false;
        }

        // التحقق من كلمة المرور
        if (!userData.password) {
            this.showFieldError('registerPassword', 'كلمة المرور مطلوبة');
            isValid = false;
        } else if (userData.password.length < 6) {
            this.showFieldError('registerPassword', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            isValid = false;
        }

        // التحقق من تأكيد كلمة المرور
        if (!confirmPassword) {
            this.showFieldError('confirmPassword', 'تأكيد كلمة المرور مطلوب');
            isValid = false;
        } else if (userData.password !== confirmPassword) {
            this.showFieldError('confirmPassword', 'كلمة المرور غير متطابقة');
            isValid = false;
        }

        // التحقق من رقم الهاتف
        if (!userData.phone) {
            this.showFieldError('registerPhone', 'رقم الهاتف مطلوب');
            isValid = false;
        } else if (!this.isValidPhone(userData.phone)) {
            this.showFieldError('registerPhone', 'رقم الهاتف غير صحيح');
            isValid = false;
        }

        // التحقق من العنوان
        if (!userData.address) {
            this.showFieldError('registerAddress', 'العنوان مطلوب');
            isValid = false;
        } else if (userData.address.length < 10) {
            this.showFieldError('registerAddress', 'العنوان يجب أن يكون 10 أحرف على الأقل');
            isValid = false;
        }

        // التحقق من الموافقة على الشروط
        if (!agreeTerms) {
            this.showAlert('يجب الموافقة على الشروط والأحكام', 'warning');
            isValid = false;
        }

        return isValid;
    }

    // التحقق من صحة البريد الإلكتروني
    validateEmail(input) {
        const email = input.value.trim();
        if (email && !this.isValidEmail(email)) {
            this.showFieldError(input.id, 'البريد الإلكتروني غير صحيح');
            return false;
        }
        this.clearFieldError(input);
        return true;
    }

    // التحقق من صحة كلمة المرور
    validatePassword(input) {
        const password = input.value.trim();
        if (password && password.length < 6) {
            this.showFieldError(input.id, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return false;
        }
        this.clearFieldError(input);
        return true;
    }

    // التحقق من صحة رقم الهاتف
    validatePhone(input) {
        const phone = input.value.trim();
        if (phone && !this.isValidPhone(phone)) {
            this.showFieldError(input.id, 'رقم الهاتف غير صحيح');
            return false;
        }
        this.clearFieldError(input);
        return true;
    }

    // التحقق من تطابق كلمة المرور
    validatePasswordConfirmation() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (confirmPassword && password !== confirmPassword) {
            this.showFieldError('confirmPassword', 'كلمة المرور غير متطابقة');
            return false;
        }
        this.clearFieldError(document.getElementById('confirmPassword'));
        return true;
    }

    // فحص صحة البريد الإلكتروني
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // فحص صحة رقم الهاتف
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\-\(\)\s]{10,15}$/;
        return phoneRegex.test(phone);
    }

    // إظهار خطأ الحقل
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const wrapper = field.closest('.input-wrapper');

        // إزالة الخطأ السابق
        const existingError = wrapper.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // إضافة كلاس الخطأ
        field.classList.add('error');
        wrapper.classList.add('error');

        // إضافة رسالة الخطأ
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        wrapper.appendChild(errorElement);

        // تركيز على الحقل
        field.focus();
    }

    // مسح خطأ الحقل
    clearFieldError(field) {
        const wrapper = field.closest('.input-wrapper');
        const errorElement = wrapper.querySelector('.field-error');

        if (errorElement) {
            errorElement.remove();
        }

        field.classList.remove('error');
        wrapper.classList.remove('error');
    }

    // تعيين حالة التحميل
    setLoading(loading, formType) {
        this.isLoading = loading;

        const form = formType === 'login' ? 'loginFormElement' : 'registerFormElement';
        const button = document.querySelector(`#${form} .submit-btn`);
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');

        if (loading) {
            button.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
        } else {
            button.disabled = false;
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
        }
    }

    // إظهار رسالة تنبيه
    showAlert(message, type = 'info', duration = 4000) {
        const container = document.getElementById('alertContainer');
        const alert = document.createElement('div');

        alert.className = `alert ${type}`;
        alert.textContent = message;

        // إضافة حدث النقر للإغلاق
        alert.addEventListener('click', () => {
            this.removeAlert(alert);
        });

        container.appendChild(alert);

        // إزالة تلقائية بعد فترة
        setTimeout(() => {
            this.removeAlert(alert);
        }, duration);
    }

    // إزالة رسالة تنبيه
    removeAlert(alert) {
        if (alert && alert.parentNode) {
            alert.classList.add('fade-out');
            setTimeout(() => {
                alert.remove();
            }, 300);
        }
    }

    // إغلاق جميع الرسائل
    closeAlerts() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            this.removeAlert(alert);
        });
    }

    // إعادة تعيين النماذج
    resetForms() {
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.reset();

            // مسح الأخطاء
            const errorFields = form.querySelectorAll('.error');
            errorFields.forEach(field => {
                field.classList.remove('error');
            });

            const errorMessages = form.querySelectorAll('.field-error');
            errorMessages.forEach(msg => {
                msg.remove();
            });
        });
    }

    // تسجيل الخروج (للاستخدام في صفحات أخرى)
    logout() {
        this.storage.logoutUser();
        this.showAlert('تم تسجيل الخروج بنجاح', 'success');
        setTimeout(() => {
            window.location.href = 'auth/auth.html';
        }, 1500);
    }

    // التحقق من حالة المصادقة (للاستخدام في صفحات أخرى)
    requireAuth(adminOnly = false) {
        if (!this.storage.isUserLoggedIn()) {
            this.showAlert('يجب تسجيل الدخول أولاً', 'warning');
            setTimeout(() => {
                window.location.href = 'auth/auth.html';
            }, 1500);
            return false;
        }

        if (adminOnly && !this.storage.isAdmin()) {
            this.showAlert('ليس لديك صلاحية للوصول لهذه الصفحة', 'error');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
            return false;
        }

        return true;
    }
}

// إضافة أنماط CSS للأخطاء
const errorStyles = `
    .input-wrapper.error input,
    .input-wrapper.error textarea {
        border-color: var(--error-color) !important;
        box-shadow: 0 0 0 3px rgba(245, 54, 92, 0.1) !important;
    }
    
    .field-error {
        color: var(--error-color);
        font-size: 0.8rem;
        margin-top: 0.5rem;
        display: block;
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;

// إضافة الأنماط للصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = errorStyles;
document.head.appendChild(styleSheet);

// تهيئة نظام المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// تصدير للاستخدام العام
if (typeof window !== 'undefined') {
    window.AuthManager = AuthManager;
}