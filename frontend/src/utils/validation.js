import * as Yup from 'yup';

export const productValidationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  sku: Yup.string().required('SKU is required'),
  price: Yup.number()
    .required('Price is required')
    .min(0, 'Price must be greater than or equal to 0'),
  stock: Yup.number()
    .required('Stock is required')
    .min(0, 'Stock must be greater than or equal to 0')
    .integer('Stock must be a whole number'),
  description: Yup.string(),
});

export const amazonValidationSchema = Yup.object({
  seller_id: Yup.string().required('Seller ID is required'),
  marketplace_id: Yup.string().required('Marketplace ID is required'),
  refresh_token: Yup.string().required('Refresh token is required'),
});