import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { operationsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Deliveries = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, deliveryId: null });

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await operationsAPI.getDeliveries();
      setDeliveries(response.data.deliveries || []);
    } catch (error) {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      waiting: 'warning',
      ready: 'info',
      done: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const handleValidate = async () => {
    try {
      await operationsAPI.validateDelivery(confirmDialog.deliveryId);
      toast.success('Delivery validated successfully! Stock levels updated.');
      setConfirmDialog({ open: false, deliveryId: null });
      fetchDeliveries();
    } catch (error) {
      toast.error('Failed to validate delivery');
      setConfirmDialog({ open: false, deliveryId: null });
    }
  };

  const openConfirmDialog = (id) => {
    setConfirmDialog({ open: true, deliveryId: id });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, deliveryId: null });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Delivery Orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage outgoing shipments to customers
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDeliveries}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/operations/deliveries/create')}
          >
            Create Delivery
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Reference</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Products</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No delivery orders yet. Create your first delivery!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/operations/deliveries/create')}
                    sx={{ mt: 2 }}
                  >
                    Create Delivery
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              deliveries.map((delivery) => (
                <TableRow key={delivery._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {delivery.reference || delivery._id.slice(-6)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {delivery.customer?.name || 'N/A'}
                    </Typography>
                    {delivery.customer?.contact && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {delivery.customer.contact}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(delivery.scheduledDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{delivery.products?.length || 0} items</TableCell>
                  <TableCell>
                    <Chip
                      label={delivery.status || 'draft'}
                      size="small"
                      color={getStatusColor(delivery.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {delivery.status === 'draft' ? (
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success"
                        onClick={() => openConfirmDialog(delivery._id)}
                      >
                        Validate
                      </Button>
                    ) : (
                      <Chip label="Validated" size="small" color="success" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Info Box */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.lighter' }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          🚚 What are Delivery Orders?
        </Typography>
        <Typography variant="body2">
          Delivery orders are used when shipping products to customers. Create a delivery, pick and pack items, then validate to decrease stock levels automatically.
        </Typography>
      </Paper>

      {/* Validation Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Validate Delivery?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary' }}>
            This will decrease stock levels and cannot be undone. Are you sure you want to validate this delivery?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={closeConfirmDialog} 
            variant="outlined"
            sx={{ borderRadius: 1.5 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleValidate} 
            variant="contained" 
            color="success"
            autoFocus
            sx={{ borderRadius: 1.5 }}
          >
            Validate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Deliveries;

