// Authentication JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
});

// Initialize authentication functionality
function initializeAuth() {
    setupAuthTabs();
    setupPasswordVisibility();
    setupPasswordStrength();
    setupFormSubmission();
}

// Setup authentication tabs
function setupAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetForm = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show target form
            forms.forEach(form => {
                form.classList.remove('active');
                
                if (form.id === `${targetForm}-form`) {
                    form.classList.add('active');
                }
            });
        });
    });
}

// Setup password visibility toggle
function setupPasswordVisibility() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            const icon = button.querySelector('i');
            
            // Toggle password visibility
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Setup password strength meter
function setupPasswordStrength() {
    const passwordInput = document.getElementById('register-password');
    if (!passwordInput) return;
    
    const strengthIndicator = document.querySelector('.strength-indicator');
    const strengthText = document.querySelector('.strength-text');
    
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = checkPasswordStrength(password);
        
        // Update strength indicator
        if (strengthIndicator) {
            strengthIndicator.style.width = `${strength.score * 25}%`;
            strengthIndicator.style.backgroundColor = strength.color;
        }
        
        // Update strength text
        if (strengthText) {
            strengthText.textContent = strength.text;
            strengthText.style.color = strength.color;
        }
    });
}

// Check password strength
function checkPasswordStrength(password) {
    if (!password) {
        return {
            score: 0,
            text: 'Password strength',
            color: '#d1d5db'
        };
    }
    
    let score = 0;
    
    // Check length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Check complexity
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // Determine strength
    let text, color;
    
    switch (true) {
        case score <= 1:
            text = 'Weak';
            color = '#ef4444';
            break;
        case score <= 2:
            text = 'Fair';
            color = '#f59e0b';
            break;
        case score <= 3:
            text = 'Good';
            color = '#10b981';
            break;
        default:
            text = 'Strong';
            color = '#059669';
            break;
    }
    
    return {
        score: Math.min(score, 4),
        text: text,
        color: color
    };
}

// Setup form submission
function setupFormSubmission() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    if (!username || !password) {
        showAlert('Please enter both username and password', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                remember_me: rememberMe
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save auth token
            localStorage.setItem('authToken', data.token);
            
            // Show success message
            showAlert('Login successful. Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            showAlert(data.message || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('An error occurred during login. Please try again.', 'error');
    }
}

// Handle registration form submission
async function handleRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const termsAgreed = document.getElementById('terms-agreement').checked;
    
    // Validate inputs
    if (!name || !email || !username || !password) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    if (!termsAgreed) {
        showAlert('You must agree to the Terms of Service and Privacy Policy', 'error');
        return;
    }
    
    // Check password strength
    const strength = checkPasswordStrength(password);
    if (strength.score < 2) {
        showAlert('Please use a stronger password', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                username,
                password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save auth token
            localStorage.setItem('authToken', data.token);
            
            // Show success message
            showAlert('Registration successful. Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            showAlert(data.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('An error occurred during registration. Please try again.', 'error');
    }
}

// Handle forgot password
function handleForgotPassword() {
    const email = prompt('Enter your email address to reset your password:');
    
    if (!email) return;
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Send reset password request
    fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Password reset instructions have been sent to your email', 'success');
        } else {
            showAlert(data.message || 'Failed to send reset instructions', 'error');
        }
    })
    .catch(error => {
        console.error('Reset password error:', error);
        showAlert('An error occurred. Please try again later.', 'error');
    });
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    
    // Clear previous alerts
    alertContainer.innerHTML = '';
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} show`;
    alert.innerHTML = `
        <span>${message}</span>
        <button class="close-alert">&times;</button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Add close button functionality
    const closeButton = alert.querySelector('.close-alert');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            alert.classList.remove('show');
            setTimeout(() => {
                alertContainer.removeChild(alert);
            }, 300);
        });
    }
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (alertContainer.contains(alert)) {
            alert.classList.remove('show');
            setTimeout(() => {
                if (alertContainer.contains(alert)) {
                    alertContainer.removeChild(alert);
                }
            }, 300);
        }
    }, 5000);
}

// Add event listener for forgot password link
document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordLink = document.querySelector('.forgot-password');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', e => {
            e.preventDefault();
            handleForgotPassword();
        });
    }
});