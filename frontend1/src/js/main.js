// Main JavaScript for Post2ProductAI

// DOM Elements
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');
const toggleSidebar = document.querySelector('.toggle-sidebar');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
const overlay = document.querySelector('.overlay');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Initialize app components
function initializeApp() {
    setupNavigation();
    setupDashboard();
    setupEventListeners();
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Initialize any page-specific functionality
    const pagePath = window.location.pathname;
    
    if (pagePath.includes('/dashboard')) {
        initializeDashboard();
    } else if (pagePath.includes('/converter')) {
        initializeConverter();
    }
}

// Setup mobile navigation
function setupNavigation() {
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// Setup dashboard sidebar
function setupDashboard() {
    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('sidebar-collapsed');
        });
    }
    
    // Handle responsive sidebar
    if (window.innerWidth <= 992 && sidebar) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('sidebar-collapsed');
        
        // Setup overlay
        if (overlay) {
            toggleSidebar.addEventListener('click', () => {
                sidebar.classList.toggle('expanded');
                overlay.classList.toggle('active');
            });
            
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('expanded');
                overlay.classList.remove('active');
            });
        }
    }
}

// General event listeners
function setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Handle window resize
function handleResize() {
    if (sidebar && mainContent) {
        if (window.innerWidth <= 992) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('sidebar-collapsed');
        } else {
            sidebar.classList.remove('expanded');
            if (overlay) overlay.classList.remove('active');
        }
    }
}

// Check authentication status
function checkAuthStatus() {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
        // User is logged in
        updateUIForLoggedInUser();
    } else {
        // User is not logged in
        updateUIForLoggedOutUser();
    }
}

// Update UI for logged in users
function updateUIForLoggedInUser() {
    const authButtons = document.querySelectorAll('.auth-button');
    const userMenus = document.querySelectorAll('.user-profile');
    
    authButtons.forEach(button => {
        button.classList.add('hidden');
    });
    
    userMenus.forEach(menu => {
        menu.classList.remove('hidden');
    });
    
    // Fetch user data
    fetchUserData();
}

// Update UI for logged out users
function updateUIForLoggedOutUser() {
    const authButtons = document.querySelectorAll('.auth-button');
    const userMenus = document.querySelectorAll('.user-profile');
    const restrictedPages = ['/dashboard', '/converter', '/account'];
    const currentPath = window.location.pathname;
    
    authButtons.forEach(button => {
        button.classList.remove('hidden');
    });
    
    userMenus.forEach(menu => {
        menu.classList.add('hidden');
    });
    
    // Redirect if on restricted page
    for (const page of restrictedPages) {
        if (currentPath.includes(page)) {
            window.location.href = '/auth/login.html';
            break;
        }
    }
}

// Fetch user data from API
async function fetchUserData() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const response = await fetch('/api/user/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            updateUserInterface(userData);
        } else {
            // Token might be expired
            handleAuthError();
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Update user interface with user data
function updateUserInterface(userData) {
    const userNameElements = document.querySelectorAll('.user-name');
    const userEmailElements = document.querySelectorAll('.user-email');
    const userAvatarElements = document.querySelectorAll('.avatar');
    
    userNameElements.forEach(element => {
        element.textContent = userData.name;
    });
    
    userEmailElements.forEach(element => {
        element.textContent = userData.email;
    });
    
    userAvatarElements.forEach(element => {
        if (userData.avatar) {
            element.innerHTML = `<img src="${userData.avatar}" alt="${userData.name}" />`;
        } else {
            // Set initials as avatar
            const initials = userData.name
                .split(' ')
                .map(name => name[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();
            
            element.textContent = initials;
        }
    });
}

// Handle authentication errors
function handleAuthError() {
    localStorage.removeItem('authToken');
    updateUIForLoggedOutUser();
}

// Initialize dashboard functionality
function initializeDashboard() {
    loadDashboardStats();
    loadRecentPosts();
    initializeCharts();
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const response = await fetch('/api/dashboard/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const stats = await response.json();
            updateDashboardStats(stats);
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    const postCountElement = document.getElementById('post-count');
    const productCountElement = document.getElementById('product-count');
    const conversionRateElement = document.getElementById('conversion-rate');
    const viewsCountElement = document.getElementById('views-count');
    
    if (postCountElement) {
        postCountElement.textContent = stats.postCount;
    }
    
    if (productCountElement) {
        productCountElement.textContent = stats.productCount;
    }
    
    if (conversionRateElement) {
        conversionRateElement.textContent = `${stats.conversionRate}%`;
    }
    
    if (viewsCountElement) {
        viewsCountElement.textContent = stats.viewsCount;
    }
}

// Load recent posts for dashboard
async function loadRecentPosts() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const response = await fetch('/api/posts/recent', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const posts = await response.json();
            renderRecentPosts(posts);
        }
    } catch (error) {
        console.error('Error loading recent posts:', error);
    }
}

// Render recent posts in the dashboard
function renderRecentPosts(posts) {
    const recentPostsTable = document.getElementById('recent-posts-table');
    if (!recentPostsTable) return;
    
    const tableBody = recentPostsTable.querySelector('tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    posts.forEach(post => {
        const row = document.createElement('tr');
        
        const dateFormatted = new Date(post.created_at).toLocaleDateString();
        
        row.innerHTML = `
            <td>${post.title}</td>
            <td>${post.platform}</td>
            <td>${dateFormatted}</td>
            <td>
                <span class="status-badge ${getStatusClass(post.status)}">
                    ${post.status}
                </span>
            </td>
            <td>
                <button class="btn-icon" data-id="${post.id}" data-action="edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" data-id="${post.id}" data-action="delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners for action buttons
    tableBody.querySelectorAll('.btn-icon').forEach(button => {
        button.addEventListener('click', handlePostAction);
    });
}

// Handle post actions (edit, delete)
function handlePostAction(e) {
    const button = e.currentTarget;
    const postId = button.getAttribute('data-id');
    const action = button.getAttribute('data-action');
    
    if (action === 'edit') {
        window.location.href = `/posts/edit.html?id=${postId}`;
    } else if (action === 'delete') {
        if (confirm('Are you sure you want to delete this post?')) {
            deletePost(postId);
        }
    }
}

// Delete a post
async function deletePost(postId) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Reload posts after deletion
            loadRecentPosts();
        } else {
            console.error('Failed to delete post');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}

// Get status class for badges
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'published':
            return 'status-active';
        case 'draft':
            return 'status-pending';
        case 'archived':
            return 'status-inactive';
        default:
            return '';
    }
}

// Initialize charts for dashboard
function initializeCharts() {
    if (typeof Chart === 'undefined') return;
    
    initializeConversionChart();
    initializePostActivityChart();
}

// Initialize conversion rate chart
function initializeConversionChart() {
    const conversionChartElement = document.getElementById('conversion-chart');
    if (!conversionChartElement) return;
    
    const ctx = conversionChartElement.getContext('2d');
    
    // Sample data
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Conversion Rate',
            data: [5, 12, 8, 16, 10, 15],
            backgroundColor: 'rgba(79, 70, 229, 0.2)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: 'rgba(79, 70, 229, 1)'
        }]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    };
    
    new Chart(ctx, config);
}

// Initialize post activity chart
function initializePostActivityChart() {
    const postActivityChartElement = document.getElementById('post-activity-chart');
    if (!postActivityChartElement) return;
    
    const ctx = postActivityChartElement.getContext('2d');
    
    // Sample data
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Posts',
            data: [10, 15, 8, 12, 18, 14],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2
        }]
    };
    
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    };
    
    new Chart(ctx, config);
}

// Initialize converter functionality
function initializeConverter() {
    const postInput = document.getElementById('post-input');
    const analyzeButton = document.getElementById('analyze-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultContainer = document.getElementById('result-container');
    
    if (analyzeButton) {
        analyzeButton.addEventListener('click', async () => {
            if (!postInput || !postInput.value.trim()) {
                showAlert('Please enter a social media post to analyze', 'error');
                return;
            }
            
            // Show loading indicator
            if (loadingIndicator) {
                loadingIndicator.classList.remove('hidden');
            }
            
            // Hide previous results
            if (resultContainer) {
                resultContainer.classList.add('hidden');
            }
            
            try {
                await analyzePost(postInput.value);
            } catch (error) {
                console.error('Error analyzing post:', error);
                showAlert('An error occurred while analyzing the post', 'error');
            } finally {
                // Hide loading indicator
                if (loadingIndicator) {
                    loadingIndicator.classList.add('hidden');
                }
            }
        });
    }
}

// Analyze post and get product suggestions
async function analyzePost(postContent) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/auth/login.html';
            return;
        }
        
        const response = await fetch('/api/convert', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: postContent
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            displayProductSuggestions(result);
        } else {
            const errorData = await response.json();
            showAlert(errorData.message || 'Failed to analyze post', 'error');
        }
    } catch (error) {
        console.error('Error analyzing post:', error);
        throw error;
    }
}

// Display product suggestions
function displayProductSuggestions(result) {
    const resultContainer = document.getElementById('result-container');
    if (!resultContainer) return;
    
    resultContainer.innerHTML = '';
    resultContainer.classList.remove('hidden');
    
    // Create analysis summary
    const summaryElement = document.createElement('div');
    summaryElement.className = 'analysis-summary';
    summaryElement.innerHTML = `
        <h3>Analysis Summary</h3>
        <p>${result.summary}</p>
        <div class="analysis-metadata">
            <div class="metadata-item">
                <span class="metadata-label">Sentiment:</span>
                <span class="metadata-value">${result.sentiment}</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Keywords:</span>
                <span class="metadata-value">${result.keywords.join(', ')}</span>
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Category:</span>
                <span class="metadata-value">${result.category}</span>
            </div>
        </div>
    `;
    
    resultContainer.appendChild(summaryElement);
    
    // Create product suggestions
    const suggestionsElement = document.createElement('div');
    suggestionsElement.className = 'product-suggestions';
    suggestionsElement.innerHTML = '<h3>Product Suggestions</h3>';
    
    const suggestionsGrid = document.createElement('div');
    suggestionsGrid.className = 'suggestions-grid';
    
    result.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <div class="product-meta">
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-rating">
                        <i class="fas fa-star"></i> ${product.rating}
                    </div>
                </div>
                <button class="btn btn-primary btn-sm select-product" data-id="${product.id}">
                    Select
                </button>
            </div>
        `;
        
        suggestionsGrid.appendChild(productCard);
    });
    
    suggestionsElement.appendChild(suggestionsGrid);
    resultContainer.appendChild(suggestionsElement);
    
    // Add action buttons
    const actionsElement = document.createElement('div');
    actionsElement.className = 'result-actions';
    actionsElement.innerHTML = `
        <button id="save-analysis" class="btn btn-secondary">
            <i class="fas fa-save"></i> Save Analysis
        </button>
        <button id="export-results" class="btn btn-primary">
            <i class="fas fa-file-export"></i> Export Results
        </button>
    `;
    
    resultContainer.appendChild(actionsElement);
    
    // Add event listeners for product selection
    document.querySelectorAll('.select-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.getAttribute('data-id');
            selectProduct(productId);
        });
    });
    
    // Add event listeners for action buttons
    document.getElementById('save-analysis').addEventListener('click', () => {
        saveAnalysis(result);
    });
    
    document.getElementById('export-results').addEventListener('click', () => {
        exportResults(result);
    });
}

// Select a product
function selectProduct(productId) {
    // Highlight selected product
    document.querySelectorAll('.product-card').forEach(card => {
        const selectButton = card.querySelector(`.select-product[data-id="${productId}"]`);
        if (selectButton) {
            card.classList.add('selected');
            selectButton.textContent = 'Selected';
            selectButton.classList.add('btn-success');
        } else {
            card.classList.remove('selected');
            const otherButton = card.querySelector('.select-product');
            if (otherButton) {
                otherButton.textContent = 'Select';
                otherButton.classList.remove('btn-success');
            }
        }
    });
}

// Save analysis to user account
async function saveAnalysis(result) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const response = await fetch('/api/analysis/save', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: result
            })
        });
        
        if (response.ok) {
            showAlert('Analysis saved successfully', 'success');
        } else {
            showAlert('Failed to save analysis', 'error');
        }
    } catch (error) {
        console.error('Error saving analysis:', error);
        showAlert('An error occurred while saving', 'error');
    }
}

// Export results as PDF or CSV
function exportResults(result) {
    // Show export options modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Export Results</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p>Choose an export format:</p>
                <div class="export-options">
                    <button class="btn btn-outline export-option" data-format="pdf">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                    <button class="btn btn-outline export-option" data-format="csv">
                        <i class="fas fa-file-csv"></i> CSV
                    </button>
                    <button class="btn btn-outline export-option" data-format="json">
                        <i class="fas fa-file-code"></i> JSON
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary close-modal">Cancel</button>
                <button class="btn btn-primary" id="confirm-export">Export</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Add event listeners
    const closeButtons = modal.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal(modal);
        });
    });
    
    // Handle export format selection
    const exportOptions = modal.querySelectorAll('.export-option');
    let selectedFormat = null;
    
    exportOptions.forEach(option => {
        option.addEventListener('click', () => {
            exportOptions.forEach(op => op.classList.remove('selected'));
            option.classList.add('selected');
            selectedFormat = option.getAttribute('data-format');
        });
    });
    
    // Handle export confirmation
    const confirmButton = modal.querySelector('#confirm-export');
    confirmButton.addEventListener('click', () => {
        if (!selectedFormat) {
            alert('Please select an export format');
            return;
        }
        
        // Perform export based on selected format
        performExport(result, selectedFormat);
        closeModal(modal);
    });
}

// Close modal with animation
function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        document.body.removeChild(modal);
    }, 300);
}

// Perform export based on format
function performExport(data, format) {
    switch (format) {
        case 'pdf':
            exportAsPDF(data);
            break;
        case 'csv':
            exportAsCSV(data);
            break;
        case 'json':
            exportAsJSON(data);
            break;
    }
}

// Export data as PDF
function exportAsPDF(data) {
    // In a real implementation, you would use a library like jsPDF
    // For this example, we'll show a success message
    showAlert('PDF export functionality will be implemented with jsPDF', 'info');
}

// Export data as CSV
function exportAsCSV(data) {
    try {
        // Convert products to CSV
        let csvContent = 'Name,Description,Price,Rating\n';
        
        data.products.forEach(product => {
            const row = [
                `"${product.name.replace(/"/g, '""')}"`,
                `"${product.description.replace(/"/g, '""')}"`,
                product.price,
                product.rating
            ].join(',');
            
            csvContent += row + '\n';
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'product_suggestions.csv');
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('CSV file downloaded successfully', 'success');
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showAlert('Failed to export as CSV', 'error');
    }
}

// Export data as JSON
function exportAsJSON(data) {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'analysis_results.json');
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('JSON file downloaded successfully', 'success');
    } catch (error) {
        console.error('Error exporting JSON:', error);
        showAlert('Failed to export as JSON', 'error');
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    
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