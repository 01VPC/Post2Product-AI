import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useQuery } from 'react-query';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AnalyticsCard from './AnalyticsCard';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30');
  
  const { data: analyticsData, isLoading } = useQuery(
    ['analytics', timeRange],
    () => api.get(`/api/analytics/sales?days=${timeRange}`).then(res => res.data)
  );

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Analytics</Typography>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
        >
          <ToggleButton value="7">7 Days</ToggleButton>
          <ToggleButton value="30">30 Days</ToggleButton>
          <ToggleButton value="90">90 Days</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <AnalyticsCard
            title="Total Revenue"
            value={analyticsData.totalRevenue}
            trend={analyticsData.revenueTrend}
            prefix="$"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <AnalyticsCard
            title="Orders"
            value={analyticsData.totalOrders}
            trend={analyticsData.ordersTrend}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <AnalyticsCard
            title="Average Order Value"
            value={analyticsData.averageOrderValue}
            trend={analyticsData.aovTrend}
            prefix="$"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
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

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Products
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Platform Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.platformDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;