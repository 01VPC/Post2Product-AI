import api from './api';

export const amazonService = {
  connect: (credentials) => 
    api.post('/api/amazon/connect', credentials),
  
  getListings: () => 
    api.get('/api/amazon/listings'),
  
  createListing: (productId) => 
    api.post('/api/amazon/listings', { product_id: productId }),
  
  updateInventory: (listingId, quantity) => 
    api.put(`/api/amazon/listings/${listingId}/inventory`, { quantity }),
  
  getOrders: (params) => 
    api.get('/api/amazon/orders', { params }),
  
  syncInventory: () => 
    api.post('/api/amazon/sync-inventory'),
};