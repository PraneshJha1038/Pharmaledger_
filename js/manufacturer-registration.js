    
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = document.getElementById('theme-icon');
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);

        this.themeToggle?.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (this.themeIcon) {
            this.themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}

// Multi-Step Form Manager
class RegistrationForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.form = document.getElementById('manufacturer-registration-form');
        this.formData = {};

        this.init();
    }

    init() {
        // Initialize form navigation
        this.setupNavigation();

        // Initialize form validation
        this.setupValidation();

        // Initialize file uploads
        this.setupFileUploads();

        // Initialize other features
        this.setupPasswordStrength();
        this.setupAddressSync();
        this.setupCharacterCount();

        // Form submission
        this.form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    setupNavigation() {
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const submitBtn = document.getElementById('submit-btn');

        nextBtn?.addEventListener('click', () => {
            if (this.validateCurrentStep()) {
                this.nextStep();
            }
        });

        prevBtn?.addEventListener('click', () => {
            this.prevStep();
        });

        // Step indicators clickable
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.addEventListener('click', () => {
                if (index + 1 <= this.currentStep || this.isStepCompleted(index + 1)) {
                    this.goToStep(index + 1);
                }
            });
        });
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.saveStepData();
            this.currentStep++;
            this.updateStepDisplay();

            if (this.currentStep === this.totalSteps) {
                this.populateReview();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    goToStep(step) {
        if (step >= 1 && step <= this.totalSteps) {
            this.saveStepData();
            this.currentStep = step;
            this.updateStepDisplay();

            if (step === this.totalSteps) {
                this.populateReview();
            }
        }
    }

    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        document.getElementById(`step-${this.currentStep}`).classList.add('active');

        // Update progress indicators
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');

            if (index + 1 < this.currentStep) {
                step.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });

        // Update navigation buttons
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const submitBtn = document.getElementById('submit-btn');

        prevBtn.style.display = this.currentStep > 1 ? 'inline-flex' : 'none';

        if (this.currentStep === this.totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    saveStepData() {
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        const inputs = currentStepElement.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                this.formData[input.name] = input.checked;
            } else if (input.type === 'file') {
                if (input.files.length > 0) {
                    this.formData[input.name] = input.files;
                }
            } else {
                this.formData[input.name] = input.value;
            }
        });
    }

    validateCurrentStep() {
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        const requiredInputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });

        // Additional step-specific validations
        if (this.currentStep === 1) {
            isValid = this.validateStep1() && isValid;
        } else if (this.currentStep === 2) {
            isValid = this.validateStep2() && isValid;
        } else if (this.currentStep === 3) {
            isValid = this.validateStep3() && isValid;
        }

        return isValid;
    }

    validateInput(input) {
        const value = input.value.trim();
        let isValid = true;

        // Clear previous errors
        this.clearFieldError(input);

        // Check required fields
        if (input.hasAttribute('required') && !value) {
            this.showFieldError(input, 'This field is required');
            return false;
        }

        // Specific validations
        if (input.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(input, 'Please enter a valid email address');
                isValid = false;
            }
        }

        if (input.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9]?\d{9,15}$/;
            if (!phoneRegex.test(value.replace(/\s+/g, ''))) {
                this.showFieldError(input, 'Please enter a valid phone number');
                isValid = false;
            }
        }

        if (input.name === 'gstin' && value) {
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstinRegex.test(value)) {
                this.showFieldError(input, 'Please enter a valid GSTIN number');
                isValid = false;
            }
        }

        if (input.name === 'pan' && value) {
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(value)) {
                this.showFieldError(input, 'Please enter a valid PAN number');
                isValid = false;
            }
        }

        return isValid;
    }

    validateStep1() {
        // Additional validations for step 1
        const companyProfile = document.getElementById('company-profile').value;
        if (companyProfile.length > 500) {
            this.showFieldError(document.getElementById('company-profile'), 'Company profile must be under 500 characters');
            return false;
        }
        return true;
    }

    validateStep2() {
        // Check license expiry date
        const expiryDate = document.getElementById('license-expiry').value;
        if (expiryDate) {
            const expiry = new Date(expiryDate);
            const today = new Date();

            if (expiry <= today) {
                this.showFieldError(document.getElementById('license-expiry'), 'License expiry date must be in the future');
                return false;
            }
        }
        return true;
    }

    validateStep3() {
        // Password validation
        const password = document.getElementById('password').value;
        if (password.length < 8) {
            this.showFieldError(document.getElementById('password'), 'Password must be at least 8 characters long');
            return false;
        }

        // Check if license document is uploaded
        const licenseDoc = document.getElementById('license-document');
        if (licenseDoc.files.length === 0) {
            this.showFieldError(licenseDoc, 'Manufacturing license document is required');
            return false;
        }

        return true;
    }

    showFieldError(input, message) {
        this.clearFieldError(input);

        const errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        errorEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;

        errorEl.style.cssText = `
            color: var(--danger);
            font-size: 0.85rem;
            margin-top: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideDown 0.3s ease;
        `;

        input.parentNode.appendChild(errorEl);
        input.style.borderColor = 'var(--danger)';

        // Scroll to error
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    clearFieldError(input) {
        const errorEl = input.parentNode.querySelector('.field-error');
        if (errorEl) {
            errorEl.remove();
        }
        input.style.borderColor = '';
    }

    setupValidation() {
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value.trim()) {
                    this.validateInput(input);
                }
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    setupFileUploads() {
        // License document upload
        const licenseUpload = document.getElementById('license-upload');
        const licenseInput = document.getElementById('license-document');

        this.setupFileUploadArea(licenseUpload, licenseInput, false);

        // Other documents upload
        const otherUpload = document.getElementById('other-upload');
        const otherInput = document.getElementById('other-documents');

        this.setupFileUploadArea(otherUpload, otherInput, true);
    }

    setupFileUploadArea(uploadArea, input, multiple) {
        const uploadContent = uploadArea.querySelector('.upload-content');
        const preview = uploadArea.querySelector('.file-preview, .files-preview');

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary)';
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                input.files = files;
                this.handleFileUpload(input, uploadContent, preview, multiple);
            }
        });

        // File input change
        input.addEventListener('change', () => {
            this.handleFileUpload(input, uploadContent, preview, multiple);
        });
    }

    handleFileUpload(input, uploadContent, preview, multiple) {
        const files = Array.from(input.files);

        if (files.length === 0) return;

        // Validate file size and type
        let validFiles = [];

        files.forEach(file => {
            const maxSize = 10 * 1024 * 1024; // 10MB
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

            if (file.size > maxSize) {
                alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                return;
            }

            if (!allowedTypes.includes(file.type)) {
                alert(`File ${file.name} type is not supported. Please use PDF, JPG, or PNG.`);
                return;
            }

            validFiles.push(file);
        });

        if (validFiles.length > 0) {
            uploadContent.style.display = 'none';
            preview.style.display = 'block';

            preview.innerHTML = '';

            validFiles.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <div class="file-info">
                        <i class="fas fa-file-pdf"></i>
                        <span>${file.name}</span>
                        <small>(${this.formatFileSize(file.size)})</small>
                    </div>
                    <button type="button" class="file-remove" onclick="registrationForm.removeFile('${input.id}', ${index})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                preview.appendChild(fileItem);
            });
        }
    }

    removeFile(inputId, fileIndex) {
        const input = document.getElementById(inputId);
        const uploadArea = input.closest('.file-upload-area');
        const uploadContent = uploadArea.querySelector('.upload-content');
        const preview = uploadArea.querySelector('.file-preview, .files-preview');

        // Clear the input
        input.value = '';

        // Reset display
        uploadContent.style.display = 'flex';
        preview.style.display = 'none';
        preview.innerHTML = '';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('password');
        const strengthIndicator = document.getElementById('password-strength');

        passwordInput?.addEventListener('input', () => {
            const password = passwordInput.value;
            const strength = this.checkPasswordStrength(password);

            strengthIndicator.className = `password-strength ${strength.level}`;
            strengthIndicator.title = strength.feedback.join(', ');
        });

        // Password toggle
        const passwordToggle = document.getElementById('password-toggle');
        passwordToggle?.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;

            const icon = passwordToggle.querySelector('i');
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    }

    checkPasswordStrength(password) {
        let score = 0;
        const feedback = [];

        if (password.length >= 8) score++;
        else feedback.push('At least 8 characters');

        if (/[a-z]/.test(password)) score++;
        else feedback.push('Lowercase letter');

        if (/[A-Z]/.test(password)) score++;
        else feedback.push('Uppercase letter');

        if (/\d/.test(password)) score++;
        else feedback.push('Number');

        if (/[^\w\s]/.test(password)) score++;
        else feedback.push('Special character');

        let level = 'weak';
        if (score >= 3) level = 'medium';
        if (score >= 4) level = 'strong';

        return { score, level, feedback };
    }

    setupAddressSync() {
        const sameAddressCheckbox = document.getElementById('same-address');
        const factoryAddress = document.getElementById('factory-address');
        const registeredAddress = document.getElementById('registered-address');

        sameAddressCheckbox?.addEventListener('change', () => {
            if (sameAddressCheckbox.checked) {
                registeredAddress.value = factoryAddress.value;
                registeredAddress.disabled = true;
            } else {
                registeredAddress.disabled = false;
            }
        });

        factoryAddress?.addEventListener('input', () => {
            if (sameAddressCheckbox?.checked) {
                registeredAddress.value = factoryAddress.value;
            }
        });
    }

    setupCharacterCount() {
        const profileTextarea = document.getElementById('company-profile');
        const counter = document.getElementById('profile-count');

        profileTextarea?.addEventListener('input', () => {
            const length = profileTextarea.value.length;
            counter.textContent = length;

            if (length > 500) {
                counter.style.color = 'var(--danger)';
            } else if (length > 400) {
                counter.style.color = 'var(--warning)';
            } else {
                counter.style.color = 'var(--text-light)';
            }
        });
    }

    populateReview() {
        // Company information
        const companyReview = document.getElementById('review-company');
        companyReview.innerHTML = this.createReviewItems([
            ['Company Name', this.formData['company-name'] || ''],
            ['GSTIN', this.formData['gstin'] || ''],
            ['PAN', this.formData['pan'] || 'Not provided'],
            ['Website', this.formData['website'] || 'Not provided']
        ]);

        // License details
        const licenseReview = document.getElementById('review-license');
        licenseReview.innerHTML = this.createReviewItems([
            ['License Number', this.formData['license-number'] || ''],
            ['Issuing Authority', this.formData['license-authority'] || ''],
            ['Expiry Date', this.formData['license-expiry'] || ''],
            ['Certifications', this.formData['certifications'] || 'None']
        ]);

        // Contact information
        const contactReview = document.getElementById('review-contact');
        contactReview.innerHTML = this.createReviewItems([
            ['Contact Person', this.formData['contact-name'] || ''],
            ['Designation', this.formData['contact-designation'] || ''],
            ['Phone', this.formData['contact-phone'] || ''],
            ['Email', this.formData['contact-email'] || '']
        ]);
    }

    createReviewItems(items) {
        return items.map(([label, value]) => `
            <div class="review-item">
                <div class="review-label">${label}</div>
                <div class="review-value">${value}</div>
            </div>
        `).join('');
    }

    async handleSubmit() {
        // Final validation
        const declaration = document.getElementById('declaration');
        const terms = document.getElementById('terms');

        if (!declaration.checked) {
            alert('Please confirm the declaration');
            return;
        }

        if (!terms.checked) {
            alert('Please accept the terms and conditions');
            return;
        }

        // Show loading
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.style.display = 'flex';

        try {
            // Save current step data
            this.saveStepData();

            // Prepare form data for submission
            const submissionData = new FormData();

            // Add all text data
            Object.keys(this.formData).forEach(key => {
                if (this.formData[key] instanceof FileList) {
                    // Handle files
                    Array.from(this.formData[key]).forEach(file => {
                        submissionData.append(key, file);
                    });
                } else {
                    submissionData.append(key, this.formData[key]);
                }
            });

            // Simulate API submission
            const result = await this.submitRegistration(submissionData);

            if (result.success) {
                this.showSuccess();
            } else {
                throw new Error(result.message || 'Registration failed');
            }

        } catch (error) {
            console.error('Registration submission error:', error);
            alert('Registration failed: ' + error.message);
        } finally {
            loadingOverlay.style.display = 'none';
        }
    }

    async submitRegistration(formData) {
        // Simulate API call - replace with actual endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                // Demo logic - in real implementation, send to /api/register/manufacturer
                resolve({
                    success: true,
                    message: 'Registration submitted successfully',
                    registrationId: 'MFG-' + Date.now()
                });
            }, 3000);
        });
    }

    showSuccess() {
        // Hide form, show success message
        this.form.style.display = 'none';
        document.getElementById('success-message').style.display = 'block';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Store registration completion in localStorage
        localStorage.setItem('registrationCompleted', 'manufacturer');
    }

    isStepCompleted(step) {
        // Logic to check if a step has been completed
        return step < this.currentStep;
    }
}

// Utility functions
const utils = {
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN');
    },

    sanitizeInput(input) {
        return input.replace(/<script[^>]*>.*?<\/script>/gi, '');
    },

    generateRegistrationId() {
        return 'MFG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
};

// Initialize Application
class ManufacturerRegistrationApp {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            this.themeManager = new ThemeManager();
            this.registrationForm = new RegistrationForm();

            // Initialize keyboard shortcuts
            this.initKeyboardShortcuts();

            // Initialize error handling
            this.initErrorHandling();

            console.log('Manufacturer Registration app initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to go to next step
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                const nextBtn = document.getElementById('next-btn');
                const submitBtn = document.getElementById('submit-btn');

                if (nextBtn.style.display !== 'none') {
                    nextBtn.click();
                } else if (submitBtn.style.display !== 'none') {
                    submitBtn.click();
                }
            }
        });
    }

    initErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        });
    }
}

// Global variable for external access
let registrationForm;

// Start the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new ManufacturerRegistrationApp();
    registrationForm = app.registrationForm;
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ManufacturerRegistrationApp, utils };
}