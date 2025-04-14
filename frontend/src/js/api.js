// API Service JavaScript

// Base API URL
const API_BASE_URL = '/api';

// API Service Class
class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }
    
    // Get authorization header
    getAuthHeader() {
        const token = localStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
    
    // Make API request
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Default headers
        const headers = {
            'Content-Type': 'application/json',
            ...this.getAuthHeader(),
            ...options.headers
        };
        
        // Request options
        const fetchOptions = {
            method: options.method || 'GET',
            headers,
            ...options
        };
        
        // Add body for non-GET requests
        if (options.body && fetchOptions.method !== 'GET') {
            fetchOptions.body = JSON.stringify(options.body);
        }
        
        try {
            const response = await fetch(url, fetchOptions);
            
            // Handle authentication errors
            if (response.status === 401) {
                this.handleAuthError();
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }
    
    // Handle authentication errors
    handleAuthError() {
        // Clear token
        localStorage.removeItem('authToken');
        
        // Redirect to login if not already on auth page
        if (!window.location.pathname.includes('/auth/')) {
            window.location.href = '/auth/login.html';
        }
    }
    
    // Authentication API
    
    // Login
    async login(username, password, rememberMe = false) {
        return this.request('/auth/login', {
            method: 'POST',
            body: { username, password, remember_me: rememberMe }
        });
    }
    
    // Register
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
    }
    
    // Logout
    async logout() {
        const result = await this.request('/auth/logout', { method: 'POST' });
        localStorage.removeItem('authToken');
        return result;
    }
    
    // Request password reset
    async requestPasswordReset(email) {
        return this.request('/auth/reset-password', {
            method: 'POST',
            body: { email }
        });
    }
    
    // Reset password with token
    async resetPassword(token, newPassword) {
        return this.request('/auth/reset-password/confirm', {
            method: 'POST',
            body: { token, password: newPassword }
        });
    }
    
    // User API
    
    // Get current user profile
    async getCurrentUser() {
        return this.request('/user/profile');
    }
    
    // Update user profile
    async updateProfile(profileData) {
        return this.request('/user/profile', {
            method: 'PUT',
            body: profileData
        });
    }
    
    // Change password
    async changePassword(currentPassword, newPassword) {
        return this.request('/user/change-password', {
            method: 'POST',
            body: { current_password: currentPassword, new_password: newPassword }
        });
    }
    
    // Post API
    
    // Get user posts
    async getPosts(page = 1, limit = 10) {
        return this.request(`/posts?page=${page}&limit=${limit}`);
    }
    
    // Get recent posts
    async getRecentPosts(limit = 5) {
        return this.request(`/posts/recent?limit=${limit}`);
    }
    
    // Get post by ID
    async getPost(id) {
        return this.request(`/posts/${id}`);
    }
    
    // Create new post
    async createPost(postData) {
        return this.request('/posts', {
            method: 'POST',
            body: postData
        });
    }
    
    // Update post
    async updatePost(id, postData) {
        return this.request(`/posts/${id}`, {
            method: 'PUT',
            body: postData
        });
    }
    
    // Delete post
    async deletePost(id) {
        return this.request(`/posts/${id}`, {
            method: 'DELETE'
        });
    }
    
    // Converter API
    
    // Analyze post
    async analyzePost(content) {
        return this.request('/convert', {
            method: 'POST',
            body: { content }
        });
    }
    
    // Save analysis
    async saveAnalysis(analysisData) {
        return this.request('/analysis/save', {
            method: 'POST',
            body: { data: analysisData }
        });
    }
    
    // Get saved analyses
    async getSavedAnalyses(page = 1, limit = 10) {
        return this.request(`/analysis?page=${page}&limit=${limit}`);
    }
    
    // Get analysis by ID
    async getAnalysis(id) {
        return this.request(`/analysis/${id}`);
    }
    
    // Delete analysis
    async deleteAnalysis(id) {
        return this.request(`/analysis/${id}`, {
            method: 'DELETE'
        });
    }
    
    // Dashboard API
    
    // Get dashboard stats
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }
    
    // Get conversion rate history
    async getConversionRateHistory(period = 'month') {
        return this.request(`/dashboard/conversion-rate?period=${period}`);
    }
    
    // Get post activity
    async getPostActivity(period = 'month') {
        return this.request(`/dashboard/post-activity?period=${period}`);
    }
    
    // Product API
    
    // Get product suggestions
    async getProductSuggestions(filters = {}) {
        const queryParams = Object.entries(filters)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
            
        return this.request(`/products/suggestions?${queryParams}`);
    }
    
    // Get product by ID
    async getProduct(id) {
        return this.request(`/products/${id}`);
    }
    
    // Search products
    async searchProducts(query, page = 1, limit = 10) {
        return this.request(`/products/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    }
}

// Create and export API instance
const api = new ApiService();

// For debugging purposes
window.api = api;