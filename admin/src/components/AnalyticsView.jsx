import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  Paper
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
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
      setError('');
      
      const [analyticsRes, statsRes] = await Promise.all([
        getSystemAnalytics(),
        getDashboardStats()
      ]);

      setAnalytics(analyticsRes.data.analytics);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load analytics data';
      setError(errorMessage);
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

  const getProductImageUrl = (product) => {
    if (!product?.image) return null;
    
    let imageObj = product.image;
    
    // Handle case where image might be a JSON string
    if (typeof imageObj === 'string') {
      try {
        imageObj = JSON.parse(imageObj);
      } catch (e) {
        console.warn('Failed to parse product image JSON:', imageObj);
        return null;
      }
    }
    
    // Return the appropriate image URL (preferring smaller sizes for thumbnails)
    return imageObj?.smallUrl || imageObj?.mediumUrl || imageObj?.largeUrl || imageObj?.originalUrl || null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96 flex-col gap-4">
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading analytics...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96 p-6">
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchAnalyticsData}
            color="primary"
          >
            Retry
          </Button>
        </Paper>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1" fontWeight="bold">
          Analytics Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchAnalyticsData}
          color="primary"
        >
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <MetricCard
          title="Order Completion Rate"
          value={formatPercentage(analytics?.orderCompletionRate)}
          subtitle="Success rate"
          icon={<CheckIcon />}
          color="primary"
        />
        <MetricCard
          title="Low Stock Items"
          value={analytics?.lowStockCount || 0}
          subtitle="Need attention"
          icon={<WarningIcon />}
          color="warning"
        />
      </div>

      {/* Order Status Distribution & Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Order Status Distribution
            </Typography>
            <div className="mt-6 space-y-4">
              <OrderStatusBar
                label="Pending"
                count={stats?.pendingOrders || 0}
                total={stats?.totalOrders || 1}
                color="warning"
              />
              <OrderStatusBar
                label="Delivered"
                count={stats?.completedOrders || 0}
                total={stats?.totalOrders || 1}
                color="success"
              />
              <OrderStatusBar
                label="Others"
                count={(stats?.totalOrders || 0) - (stats?.pendingOrders || 0) - (stats?.completedOrders || 0)}
                total={stats?.totalOrders || 1}
                color="inherit"
              />
            </div>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent className="p-6">
            <Typography variant="h6" gutterBottom fontWeight="bold" className="mb-4">
              Top Performing Products
            </Typography>
            <div className="space-y-1">
              {stats?.topProducts?.slice(0, 5).map((item, index) => (
                <div key={item.product?.id || index}>
                  <div className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28, fontSize: '0.875rem' }}>
                        {index + 1}
                      </Avatar>
                      <Avatar
                        src={getProductImageUrl(item.product)}
                        alt={item.product?.name}
                        sx={{ width: 48, height: 48 }}
                        variant="rounded"
                      >
                        <InventoryIcon />
                      </Avatar>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="medium" 
                          className="truncate"
                          sx={{ fontSize: '0.95rem' }}
                        >
                          {item.product?.name || 'Unknown Product'}
                        </Typography>
                        {item.variant?.size && (
                          <Chip 
                            label={item.variant.size} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              height: '20px', 
                              fontSize: '0.75rem',
                              flexShrink: 0
                            }}
                          />
                        )}
                      </div>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: '0.85rem' }}
                      >
                        Sold: {item.totalSold} units
                      </Typography>
                    </div>
                  </div>
                  {index < 4 && <Divider sx={{ my: 0 }} />}
                </div>
              )) || (
                <div className="flex justify-center py-8">
                  <Typography variant="body2" color="text.secondary">
                    No product data available
                  </Typography>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            System Health
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Order Processing
              </Typography>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">Success Rate:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatPercentage(analytics?.orderCompletionRate)}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">Total Orders:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {stats?.totalOrders || 0}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">Pending Orders:</Typography>
                  <Typography variant="body2" fontWeight="medium" color="warning.main">
                    {stats?.pendingOrders || 0}
                  </Typography>
                </div>
              </div>
            </div>
            
            <div>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Inventory Status
              </Typography>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">Low Stock Items:</Typography>
                  <Typography variant="body2" fontWeight="medium" color="warning.main">
                    {analytics?.lowStockCount || 0}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body2" color="text.secondary">Out of Stock:</Typography>
                  <Typography variant="body2" fontWeight="medium" color="error.main">
                    0
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper Components
const MetricCard = ({ title, value, subtitle, icon, color }) => {
  return (
    <Card elevation={2}>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </div>
          <Avatar 
            sx={{ 
              bgcolor: `${color}.main`,
              width: 56, 
              height: 56 
            }}
          >
            {icon}
          </Avatar>
        </div>
      </CardContent>
    </Card>
  );
};

const OrderStatusBar = ({ label, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between mb-2">
        <Typography variant="body2" fontWeight="medium">
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {count} ({percentage.toFixed(1)}%)
        </Typography>
      </div>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </div>
  );
};

export default AnalyticsView;
