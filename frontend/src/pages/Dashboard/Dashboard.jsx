import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Inventory2 as InventoryIcon,
  TrendingDown as LowStockIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, productsAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { canCreateProduct, canCreateReceipt, canCreateDelivery, canCreateTransfer } from '../../utils/permissions';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const muiTheme = useMuiTheme();
  const { mode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpisRes, lowStockRes, activitiesRes] = await Promise.all([
        dashboardAPI.getKPIs(),
        productsAPI.getLowStock(),
        dashboardAPI.getRecentActivities({ limit: 10 }),
      ]);

      setKpis(kpisRes.data.kpis);
      setLowStockProducts(lowStockRes.data.products || []);
      setRecentActivities(activitiesRes.data.activities || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const stockStatusData = [
    { name: 'In Stock', value: (kpis?.totalProducts || 0) - (kpis?.lowStockItems || 0), color: '#10B981' },
    { name: 'Low Stock', value: kpis?.lowStockItems || 0, color: '#F59E0B' },
    { name: 'Out of Stock', value: 0, color: '#EF4444' },
  ];

  const operationsData = [
    { name: 'Receipts', value: 15, color: '#6366F1' },
    { name: 'Deliveries', value: kpis?.pendingDeliveries || 0, color: '#8B5CF6' },
    { name: 'Transfers', value: 8, color: '#EC4899' },
    { name: 'Adjustments', value: 3, color: '#F59E0B' },
  ];

  const monthlyData = [
    { month: 'Jan', receipts: 65, deliveries: 50 },
    { month: 'Feb', receipts: 75, deliveries: 65 },
    { month: 'Mar', receipts: 85, deliveries: 70 },
    { month: 'Apr', receipts: 90, deliveries: 80 },
    { month: 'May', receipts: 95, deliveries: 85 },
    { month: 'Jun', receipts: 100, deliveries: 90 },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Theme Toggle */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Organization Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your inventory performance and insights
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
          {canCreateProduct(user?.role) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/products/add')}
              sx={{ borderRadius: 2 }}
            >
              Add Product
            </Button>
          )}
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box
                  sx={{
                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <InventoryIcon sx={{ color: '#6366F1', fontSize: 24 }} />
                </Box>
                <Chip
                  icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                  label="+12%"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Typography variant="h4" fontWeight={700} mb={0.5}>
                {kpis?.totalProducts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Products
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box
                  sx={{
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <LowStockIcon sx={{ color: '#EF4444', fontSize: 24 }} />
                </Box>
                <Chip
                  label="-5%"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Typography variant="h4" fontWeight={700} mb={0.5}>
                {kpis?.lowStockItems || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Low Stock Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box
                  sx={{
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <MoneyIcon sx={{ color: '#10B981', fontSize: 24 }} />
                </Box>
                <Chip
                  icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                  label="+8%"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Typography variant="h4" fontWeight={700} mb={0.5}>
                {formatCurrency(kpis?.totalStockValue || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Stock Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box
                  sx={{
                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                    p: 1.5,
                    borderRadius: 2,
                  }}
                >
                  <ShippingIcon sx={{ color: '#F59E0B', fontSize: 24 }} />
                </Box>
                <Chip
                  label="3 new"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                    color: '#F59E0B',
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Typography variant="h4" fontWeight={700} mb={0.5}>
                {kpis?.pendingDeliveries || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Deliveries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={4}>
        {/* Stock Level Indicators - Unique UI */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Stock Level Overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Real-time inventory status
                  </Typography>
                </Box>
                <Chip 
                  label="Live" 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                    fontWeight: 600,
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#10B981',
                      mr: 0.5,
                      animation: 'pulse 2s infinite',
                    },
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
              </Box>

              {/* Stock Statistics Grid */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={4}>
                  <Box textAlign="center" p={2} sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight={700} color="#6366F1">
                      {(kpis?.totalProducts || 0) - (kpis?.lowStockItems || 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      In Stock
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center" p={2} sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight={700} color="#F59E0B">
                      {kpis?.lowStockItems || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Low Stock
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center" p={2} sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight={700} color="#EF4444">
                      0
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Out of Stock
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Top Products with Progress Bars */}
              <Box>
                <Typography variant="body2" fontWeight={600} mb={2} color="text.secondary">
                  TOP PRODUCTS BY STOCK
                </Typography>
                {lowStockProducts.slice(0, 4).map((product, index) => (
                  <Box key={product._id} mb={2.5}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color={
                        product.stock < 10 ? '#EF4444' : 
                        product.stock < 50 ? '#F59E0B' : '#10B981'
                      }>
                        {product.stock} units
                      </Typography>
                    </Box>
                    <Box sx={{ position: 'relative', height: 8, bgcolor: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: `${Math.min((product.stock / 100) * 100, 100)}%`,
                          bgcolor: product.stock < 10 ? '#EF4444' : 
                                  product.stock < 50 ? '#F59E0B' : '#10B981',
                          borderRadius: 4,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </Box>
                  </Box>
                ))}

                {lowStockProducts.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body2" color="text.secondary">
                      🎉 All products are well stocked!
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Quick Stats Footer */}
              <Box 
                mt={3} 
                pt={2} 
                borderTop="1px solid" 
                borderColor="divider"
                display="flex"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Stock Health
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#10B981">
                    {kpis?.totalProducts ? Math.round(((kpis.totalProducts - kpis.lowStockItems) / kpis.totalProducts) * 100) : 0}% Healthy
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Avg. Stock Level
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    65 units
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Categories
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    3 Active
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Operations Breakdown Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Operations Overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly operations distribution
                  </Typography>
                </Box>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={operationsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {operationsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: muiTheme.palette.background.paper,
                      border: `1px solid ${muiTheme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box display="flex" justifyContent="center" gap={3} mt={2} flexWrap="wrap">
                {operationsData.map((item) => (
                  <Box key={item.name} display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: item.color,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Trend Chart */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Monthly Activity Trend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track receipts and deliveries over time
                  </Typography>
                </Box>
                <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>
                  View full report
                </Button>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={muiTheme.palette.divider} />
                  <XAxis
                    dataKey="month"
                    stroke={muiTheme.palette.text.secondary}
                    style={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke={muiTheme.palette.text.secondary}
                    style={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: muiTheme.palette.background.paper,
                      border: `1px solid ${muiTheme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="receipts"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={{ fill: '#6366F1', r: 4 }}
                    name="Receipts"
                  />
                  <Line
                    type="monotone"
                    dataKey="deliveries"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    name="Deliveries"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Low Stock & Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Low Stock Alerts
                </Typography>
                <Chip
                  label={lowStockProducts.length}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    fontWeight: 600,
                  }}
                />
              </Box>

              {lowStockProducts.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <Typography variant="body2" color="text.secondary">
                    No low stock items 🎉
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <Box
                      key={product._id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={2}
                      borderBottom="1px solid"
                      borderColor="divider"
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SKU: {product.sku}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${product.stock} left`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <Button
                      fullWidth
                      onClick={() => navigate('/products?filter=low-stock')}
                      sx={{ mt: 2, borderRadius: 2 }}
                    >
                      View All ({lowStockProducts.length})
                    </Button>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Recent Activities
              </Typography>

              {recentActivities.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <Typography variant="body2" color="text.secondary">
                    No recent activities
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {recentActivities.slice(0, 6).map((activity) => (
                    <Box
                      key={activity.id}
                      display="flex"
                      gap={2}
                      py={2}
                      borderBottom="1px solid"
                      borderColor="divider"
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#6366F1',
                          mt: 1,
                          flexShrink: 0,
                        }}
                      />
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {activity.type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.product} • {activity.quantity} units
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {new Date(activity.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
