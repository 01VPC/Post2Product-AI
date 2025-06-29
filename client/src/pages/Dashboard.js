import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeListing: 0,
    totalSales: 0,
    recentSales: [],
    dailySales: []
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get('/api/analytics/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, []);

  // Chart configuration
  // const chartData = {
  //   labels: stats.dailySales.map(sale => sale._id),
  //   datasets: [
  //     {
  //       label: 'Sales',
  //       data: stats.dailySales.map(sale => sale.total),
  //       borderColor: 'rgb(59, 130, 246)',
  //       backgroundColor: 'rgba(59, 130, 246, 0.5)',
  //       tension: 0.4
  //     }
  //   ]
  // };
  const chartData = {
    labels: (stats.dailySales && stats.dailySales.length > 0) ? stats.dailySales.map(sale => sale._id) : [],
    datasets: [
      {
        label: 'Sales',
        data: (stats.dailySales && stats.dailySales.length > 0) ? stats.dailySales.map(sale => sale.total) : [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      }
    ]
  };
  

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Sales Trend (Last 7 Days)'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-white dark:bg-[#23272f] rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {stats.totalProducts > 0 ? stats.totalProducts : 'N/A'}
          </p>
          <div className="text-sm text-green-600 mt-2">
            ↑ 12% from last month
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-white dark:bg-[#23272f] rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Active Listings</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {stats.activeListing > 0 ? stats.activeListing : 'N/A'}
          </p>
          <div className="text-sm text-green-600 mt-2">
            ↑ 8% from last month
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white dark:bg-[#23272f] rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Sales</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {stats.totalSales > 0 ? `$${stats.totalSales.toLocaleString()}` : 'N/A'}
          </p>
          <div className="text-sm text-green-600 mt-2">
            ↑ 15% from last month
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white dark:bg-[#23272f] rounded-lg shadow p-6 mb-8">
        <Line options={chartOptions} data={chartData} height={80} />
      </div>

      {/* Recent Sales */}
      <div className="bg-white dark:bg-[#23272f] rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Recent Sales</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {(stats.recentSales && stats.recentSales.length > 0) ? (
            stats.recentSales.map((sale) => (
            <div key={sale.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Order #{sale.id.slice(-6)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  ${sale.amount ? sale.amount.toLocaleString() : '0'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-4">
            <p className="text-sm text-gray-500 dark:text-gray-300">No recent sales</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 