import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const InstagramConnect = () => {
  const { user } = useAuth();

  const handleConnect = async () => {
    try {
      const response = await api.get('/api/instagram/auth-url');
      window.location.href = response.data.auth_url;
    } catch (error) {
      toast.error('Failed to get Instagram authorization URL');
    }
  };

  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Connect Instagram Account
      </Typography>
      
      {user?.instagram_connected ? (
        <Box>
          <Typography color="success.main" gutterBottom>
            Instagram account connected!
          </Typography>
          <Button variant="outlined" color="primary">
            Refresh Connection
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography gutterBottom>
            Connect your Instagram account to manage your posts and products
          </Typography>
          <Button variant="contained" color="primary" onClick={handleConnect}>
            Connect Instagram
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default InstagramConnect;