/* ==========================================================================
   USER REGISTRATION WEBSITE - JAVASCRIPT CLIENT-SIDE VALIDATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
    // Get Form and Success Banner Elements
    const form = document.getElementById('registrationForm');
    const successBanner = document.getElementById('successBanner');

    // Get Input Elements
    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const dob = document.getElementById('dob');
    const gender = document.getElementById('gender');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const address = document.getElementById('address');
    const city = document.getElementById('city');
    const state = document.getElementById('state');
    const pincode = document.getElementById('pincode');
    const terms = document.getElementById('terms');

    // ==========================================================================
    // VALIDATION HELPER FUNCTIONS
    // ==========================================================================

    /**
     * Display error message and apply invalid styling
     */
    function showError(input, errorElementId, message) {
        const errorSpan = document.getElementById(errorElementId);
        if (errorSpan) {
            errorSpan.textContent = message;
        }
        if (input.type === 'checkbox') {
            input.parentElement.classList.add('is-invalid');
        } else {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
        }
    }

    /**
     * Clear error message and apply valid styling
     */
    function showSuccess(input, errorElementId) {
        const errorSpan = document.getElementById(errorElementId);
        if (errorSpan) {
            errorSpan.textContent = '';
        }
        if (input.type === 'checkbox') {
            input.parentElement.classList.remove('is-invalid');
        } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
    }

    // ==========================================================================
    // INDIVIDUAL FIELD VALIDATORS
    // ==========================================================================

    // 1. Full Name Validation
    function validateFullname() {
        const val = fullname.value.trim();
        if (val === '') {
            showError(fullname, 'fullnameError', 'Full Name is required.');
            return false;
        } else if (val.length < 3) {
            showError(fullname, 'fullnameError', 'Full Name must be at least 3 characters long.');
            return false;
        } else if (!/^[a-zA-Z\s]+$/.test(val)) {
            showError(fullname, 'fullnameError', 'Full Name should contain only letters and spaces.');
            return false;
        }
        showSuccess(fullname, 'fullnameError');
        return true;
    }

    // 2. Email ID Validation
    function validateEmail() {
        const val = email.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (val === '') {
            showError(email, 'emailError', 'Email Address is required.');
            return false;
        } else if (!emailRegex.test(val)) {
            showError(email, 'emailError', 'Please enter a valid email address (e.g. name@domain.com).');
            return false;
        }
        showSuccess(email, 'emailError');
        return true;
    }

    // 3. Phone Number Validation (10 digits)
    function validatePhone() {
        const val = phone.value.trim();
        const phoneRegex = /^[0-9]{10}$/;
        if (val === '') {
            showError(phone, 'phoneError', 'Phone Number is required.');
            return false;
        } else if (!phoneRegex.test(val)) {
            showError(phone, 'phoneError', 'Phone Number must be exactly 10 numeric digits.');
            return false;
        }
        showSuccess(phone, 'phoneError');
        return true;
    }

    // 4. Date of Birth Validation
    function validateDOB() {
        const val = dob.value;
        if (val === '') {
            showError(dob, 'dobError', 'Date of Birth is required.');
            return false;
        }
        const selectedDate = new Date(val);
        const today = new Date();
        if (selectedDate >= today) {
            showError(dob, 'dobError', 'Date of Birth must be in the past.');
            return false;
        }
        showSuccess(dob, 'dobError');
        return true;
    }

    // 5. Gender Selection Validation
    function validateGender() {
        if (gender.value === '') {
            showError(gender, 'genderError', 'Please select your gender.');
            return false;
        }
        showSuccess(gender, 'genderError');
        return true;
    }

    // 6. Password Strength Validation
    function validatePassword() {
        const val = password.value;
        if (val === '') {
            showError(password, 'passwordError', 'Password is required.');
            return false;
        } else if (val.length < 8) {
            showError(password, 'passwordError', 'Password must be at least 8 characters long.');
            return false;
        } else if (!/[A-Z]/.test(val)) {
            showError(password, 'passwordError', 'Password must contain at least one uppercase letter (A-Z).');
            return false;
        } else if (!/[a-z]/.test(val)) {
            showError(password, 'passwordError', 'Password must contain at least one lowercase letter (a-z).');
            return false;
        } else if (!/[0-9]/.test(val)) {
            showError(password, 'passwordError', 'Password must contain at least one number (0-9).');
            return false;
        }
        showSuccess(password, 'passwordError');
        
        // Also re-check Confirm Password if it has content
        if (confirmPassword.value.length > 0) {
            validateConfirmPassword();
        }

        return true;
    }

    // 7. Confirm Password Matching Validation
    function validateConfirmPassword() {
        const val = confirmPassword.value;
        if (val === '') {
            showError(confirmPassword, 'confirmPasswordError', 'Please confirm your password.');
            return false;
        } else if (val !== password.value) {
            showError(confirmPassword, 'confirmPasswordError', 'Passwords do not match.');
            return false;
        }
        showSuccess(confirmPassword, 'confirmPasswordError');
        return true;
    }

    // 8. Address Validation
    function validateAddress() {
        const val = address.value.trim();
        if (val === '') {
            showError(address, 'addressError', 'Street Address is required.');
            return false;
        }
        showSuccess(address, 'addressError');
        return true;
    }

    // 9. City Validation
    function validateCity() {
        const val = city.value.trim();
        if (val === '') {
            showError(city, 'cityError', 'City is required.');
            return false;
        }
        showSuccess(city, 'cityError');
        return true;
    }

    // 10. State Validation
    function validateState() {
        const val = state.value.trim();
        if (val === '') {
            showError(state, 'stateError', 'State is required.');
            return false;
        }
        showSuccess(state, 'stateError');
        return true;
    }

    // 11. PIN Code Validation (6 digits)
    function validatePincode() {
        const val = pincode.value.trim();
        const pinRegex = /^[0-9]{6}$/;
        if (val === '') {
            showError(pincode, 'pincodeError', 'PIN Code is required.');
            return false;
        } else if (!pinRegex.test(val)) {
            showError(pincode, 'pincodeError', 'PIN Code must be exactly 6 numeric digits.');
            return false;
        }
        showSuccess(pincode, 'pincodeError');
        return true;
    }

    // 12. Terms & Conditions Validation
    function validateTerms() {
        if (!terms.checked) {
            showError(terms, 'termsError', 'You must agree to the Terms & Conditions.');
            return false;
        }
        showSuccess(terms, 'termsError');
        return true;
    }

    // ==========================================================================
    // REAL-TIME INPUT EVENT LISTENERS (Clear errors on typing)
    // ==========================================================================
    fullname.addEventListener('input', validateFullname);
    email.addEventListener('input', validateEmail);
    phone.addEventListener('input', validatePhone);
    dob.addEventListener('change', validateDOB);
    gender.addEventListener('change', validateGender);
    password.addEventListener('input', validatePassword);
    confirmPassword.addEventListener('input', validateConfirmPassword);
    address.addEventListener('input', validateAddress);
    city.addEventListener('input', validateCity);
    state.addEventListener('input', validateState);
    pincode.addEventListener('input', validatePincode);
    terms.addEventListener('change', validateTerms);

    // Filter Phone & PIN Code inputs to numeric characters only
    phone.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    pincode.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // ==========================================================================
    // FORM SUBMISSION EVENT HANDLER
    // ==========================================================================
    form.addEventListener('submit', function (e) {
        // Prevent default form submission
        e.preventDefault();

        // Run all field validations
        const isFullnameValid = validateFullname();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isDOBValid = validateDOB();
        const isGenderValid = validateGender();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();
        const isAddressValid = validateAddress();
        const isCityValid = validateCity();
        const isStateValid = validateState();
        const isPincodeValid = validatePincode();
        const isTermsValid = validateTerms();

        // Check if all fields are valid
        const isFormValid = isFullnameValid && isEmailValid && isPhoneValid && 
                            isDOBValid && isGenderValid && isPasswordValid && 
                            isConfirmPasswordValid && isAddressValid && 
                            isCityValid && isStateValid && isPincodeValid && isTermsValid;

        if (isFormValid) {
            // Display success notification banner
            successBanner.classList.remove('hidden');
            
            // Scroll smoothly to top to show success banner
            window.scrollTo({ top: 0, behavior: 'smooth' });

            console.log('Registration details valid! Form ready for submission.');
        } else {
            // Hide success banner if previously shown
            successBanner.classList.add('hidden');

            // Scroll to first invalid field
            const firstInvalid = form.querySelector('.is-invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    // ==========================================================================
    // FORM RESET EVENT HANDLER
    // ==========================================================================
    form.addEventListener('reset', function () {
        // Hide success banner
        successBanner.classList.add('hidden');

        // Reset error messages and validation classes
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });

        const errorSpans = form.querySelectorAll('.error-msg');
        errorSpans.forEach(span => {
            span.textContent = '';
        });
    });
});
