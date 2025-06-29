import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
  seller_id: Yup.string().required('Seller ID is required'),
  refresh_token: Yup.string().required('Refresh Token is required'),
});

const AmazonConnect = () => {
  const { user } = useAuth();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Connect Amazon Seller Account
      </Typography>

      {user?.amazon_connected ? (
        <Box>
          <Typography color="success.main" gutterBottom>
            Amazon seller account connected!
          </Typography>
          <Button variant="outlined" color="primary">
            Update Connection
          </Button>
        </Box>
      ) : (
        <Formik
          initialValues={{
            seller_id: '',
            refresh_token: '',
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await api.post('/api/amazon/connect', values);
              toast.success('Amazon account connected successfully');
            } catch (error) {
              toast.error(error.response?.data?.error || 'Connection failed');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, handleChange, errors, touched, isSubmitting }) => (
            <Form>
              <TextField
                fullWidth
                margin="normal"
                name="seller_id"
                label="Seller ID"
                value={values.seller_id}
                onChange={handleChange}
                error={touched.seller_id && Boolean(errors.seller_id)}
                helperText={touched.seller_id && errors.seller_id}
              />
              <TextField
                fullWidth
                margin="normal"
                name="refresh_token"
                label="Refresh Token"
                value={values.refresh_token}
                onChange={handleChange}
                error={touched.refresh_token && Boolean(errors.refresh_token)}
                helperText={touched.refresh_token && errors.refresh_token}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                Connect Amazon Account
              </Button>
            </Form>
          )}
        </Formik>
      )}
    </Paper>
  );
};

export default AmazonConnect;