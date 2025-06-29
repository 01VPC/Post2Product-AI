import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import AddIcon from '@mui/icons-material/Add';
import api from '../../services/api';
import ProductForm from './ProductForm';
import toast from 'react-hot-toast';

const ProductList = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery('products', () =>
    api.get('/api/products').then((res) => res.data.products)
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/api/products/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete product');
      },
    }
  );

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'sku', headerName: 'SKU', flex: 1 },
    { field: 'price', headerName: 'Price', flex: 1 },
    { field: 'stock', headerName: 'Stock', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button
            size="small"
            onClick={() => {
              setSelectedProduct(params.row);
              setOpenDialog(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => deleteMutation.mutate(params.row.id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Products</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedProduct(null);
            setOpenDialog(true);
          }}
        >
          Add Product
        </Button>
      </Box>

      <Paper sx={{ height: '100%', width: '100%' }}>
        <DataGrid
          rows={products || []}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          loading={isLoading}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <ProductForm
          product={selectedProduct}
          onClose={() => setOpenDialog(false)}
        />
      </Dialog>
    </Box>
  );
};

export default ProductList;