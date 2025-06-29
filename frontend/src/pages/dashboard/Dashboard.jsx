import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { useQuery } from 'react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import DashboardCard from '../../components/dashboard/DashboardCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    () => api.get('/api/analytics/dashboard').then((res) => res.data)
  );

  const { data: salesData, isLoading: salesLoading } = useQuery(
    'salesAnalytics',
    () => api.get('/api/analytics/sales').then((res) => res.data.sales_data)
  );

  if (statsLoading || salesLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <DashboardCard
            title="Total Products"
            value={stats.total_products}
            icon="inventory"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard
            title="Instagram Posts"
            value={stats.total_posts}
            icon="photo_camera"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard
            title="Amazon Listings"
            value={stats.total_listings}
            icon="shopping_cart"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;