import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './context/AuthContext';

import DashboardLayout from './components/Layout/DashboardLayout';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

import Dashboard from './pages/Dashboard/Dashboard';
import Products from './pages/Products/Products';
import ProductDetails from './pages/Products/ProductDetails';
import AddProduct from './pages/Products/AddProduct';
import Receipts from './pages/Operations/Receipts';
import CreateReceipt from './pages/Operations/CreateReceipt';
import Deliveries from './pages/Operations/Deliveries';
import CreateDelivery from './pages/Operations/CreateDelivery';
import Transfers from './pages/Operations/Transfers';
import CreateTransfer from './pages/Operations/CreateTransfer';
import Adjustments from './pages/Operations/Adjustments';
import CreateAdjustment from './pages/Operations/CreateAdjustment';
import MoveHistory from './pages/Operations/MoveHistory';
import AIInsights from './pages/AI/AIInsights';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="operations/receipts" element={<Receipts />} />
        <Route path="operations/receipts/create" element={<CreateReceipt />} />
        <Route path="operations/deliveries" element={<Deliveries />} />
        <Route path="operations/deliveries/create" element={<CreateDelivery />} />
        <Route path="operations/transfers" element={<Transfers />} />
        <Route path="operations/transfers/create" element={<CreateTransfer />} />
        <Route path="operations/adjustments" element={<Adjustments />} />
        <Route path="operations/adjustments/create" element={<CreateAdjustment />} />
        <Route path="operations/history" element={<MoveHistory />} />
        <Route path="ai-insights" element={<AIInsights />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
