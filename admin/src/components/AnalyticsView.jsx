import React, { useState, useEffect } from 'react';
import { getSystemAnalytics, getDashboardStats } from '../api';

const AnalyticsView = () => {
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, statsRes] = await Promise.all([
        getSystemAnalytics(),
        getDashboardStats()
      ]);

      setAnalytics(analyticsRes.data.analytics);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <button
          onClick={fetchAnalyticsData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue)}
          subtitle="All time"
          icon="💰"
          color="bg-green-500"
        />
        <MetricCard
          title="Order Completion Rate"
          value={formatPercentage(analytics?.orderCompletionRate)}
          subtitle="Success rate"
          icon="✅"
          color="bg-blue-500"
        />
        <MetricCard
          title="Average Order Value"
          value={formatCurrency(analytics?.averageOrderValue)}
          subtitle="Per order"
          icon="📊"
          color="bg-purple-500"
        />
        <MetricCard
          title="Low Stock Items"
          value={analytics?.lowStockCount || 0}
          subtitle="Need attention"
          icon="⚠️"
          color="bg-orange-500"
        />
      </div>

      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Order Status Distribution</h2>
          <div className="space-y-4">
            <OrderStatusBar
              label="Pending"
              count={stats?.pendingOrders || 0}
              total={stats?.totalOrders || 1}
              color="bg-yellow-500"
            />
            <OrderStatusBar
              label="Delivered"
              count={stats?.completedOrders || 0}
              total={stats?.totalOrders || 1}
              color="bg-green-500"
            />
            <OrderStatusBar
              label="Others"
              count={(stats?.totalOrders || 0) - (stats?.pendingOrders || 0) - (stats?.completedOrders || 0)}
              total={stats?.totalOrders || 1}
              color="bg-gray-500"
            />
          </div>
        </div>

        {/* Product Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Top Performing Products</h2>
          <div className="space-y-3">
            {stats?.topProducts?.slice(0, 5).map((item, index) => (
              <div key={item.product?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.product?.name}</p>
                    <p className="text-sm text-gray-600">Sold: {item.totalSold} units</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Insights */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Revenue Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(stats?.totalRevenue)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              From {stats?.completedOrders || 0} completed orders
            </p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">Average Order Value</h3>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(analytics?.averageOrderValue)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Revenue per order
            </p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">Total Products</h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats?.totalProducts || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              In inventory
            </p>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Order Processing</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate:</span>
                <span className="font-medium">{formatPercentage(analytics?.orderCompletionRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders:</span>
                <span className="font-medium">{stats?.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Orders:</span>
                <span className="font-medium text-yellow-600">{stats?.pendingOrders || 0}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Inventory Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Products:</span>
                <span className="font-medium">{stats?.totalProducts || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Low Stock Items:</span>
                <span className="font-medium text-orange-600">{analytics?.lowStockCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Out of Stock:</span>
                <span className="font-medium text-red-600">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const MetricCard = ({ title, value, subtitle, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const OrderStatusBar = ({ label, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AnalyticsView;
