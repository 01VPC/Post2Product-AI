import React from 'react';
import { Formik, Form } from 'formik';
import {
  Box,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useMutation, useQueryClient } from 'react-query';
import { productValidationSchema } from '../../utils/validation';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProductForm = ({ product, onClose }) => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation(
    (values) => {
      if (product) {
        return api.put(`/api/products/${product.id}`, values);
      }
      return api.post('/api/products', values);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success(`Product ${product ? 'updated' : 'created'} successfully`);
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Operation failed');
      },
    }
  );

  return (
    <>
      <DialogTitle>
        {product ? 'Edit Product' : 'Create New Product'}
      </DialogTitle>
      <Formik
        initialValues={{
          name: product?.name || '',
          sku: product?.sku || '',
          price: product?.price || '',
          stock: product?.stock || '',
          description: product?.description || '',
        }}
        validationSchema={productValidationSchema}
        onSubmit={(values, { setSubmitting }) => {
          mutation.mutate(values);
          setSubmitting(false);
        }}
      >
        {({ values, handleChange, errors, touched, isSubmitting }) => (
          <Form>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                name="name"
                label="Product Name"
                value={values.name}
                onChange={handleChange}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
              <TextField
                fullWidth
                margin="normal"
                name="sku"
                label="SKU"
                value={values.sku}
                onChange={handleChange}
                error={touched.sku && Boolean(errors.sku)}
                helperText={touched.sku && errors.sku}
              />
              <TextField
                fullWidth
                margin="normal"
                name="price"
                label="Price"
                type="number"
                value={values.price}
                onChange={handleChange}
                error={touched.price && Boolean(errors.price)}
                helperText={touched.price && errors.price}
              />
              <TextField
                fullWidth
                margin="normal"
                name="stock"
                label="Stock"
                type="number"
                value={values.stock}
                onChange={handleChange}
                error={touched.stock && Boolean(errors.stock)}
                helperText={touched.stock && errors.stock}
              />
              <TextField
                fullWidth
                margin="normal"
                name="description"
                label="Description"
                multiline
                rows={4}
                value={values.description}
                onChange={handleChange}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {product ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ProductForm;