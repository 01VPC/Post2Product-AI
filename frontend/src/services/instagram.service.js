import api from './api';

export const instagramService = {
  getAuthUrl: () => api.get('/api/instagram/auth-url'),
  
  getPosts: () => api.get('/api/instagram/posts'),
  
  syncPosts: () => api.post('/api/instagram/sync'),
  
  linkProductToPost: (postId, productId) => 
    api.post(`/api/instagram/posts/${postId}/product`, { product_id: productId }),
  
  getPostAnalytics: (postId) => 
    api.get(`/api/instagram/posts/${postId}/analytics`),
};