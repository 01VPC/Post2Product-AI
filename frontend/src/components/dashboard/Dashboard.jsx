import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { useQuery } from 'react-query';
import { Line } from 'recharts';
import { getDashboardStats } from '../../services/analytics.service';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery('dashboardStats', getDashboardStats);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Products</Typography>
            <Typography variant="h4">{stats.totalProducts}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Instagram Posts</Typography>
            <Typography variant="h4">{stats.totalPosts}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Amazon Listings</Typography>
            <Typography variant="h4">{stats.totalListings}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Sales Overview</Typography>
            {/* Add Recharts Line Chart here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;