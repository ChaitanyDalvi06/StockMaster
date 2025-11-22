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

const Receipts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, receiptId: null });

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await operationsAPI.getReceipts();
      setReceipts(response.data.receipts || []);
    } catch (error) {
      toast.error('Failed to load receipts');
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
      await operationsAPI.validateReceipt(confirmDialog.receiptId);
      toast.success('Receipt validated successfully! Stock levels updated.');
      setConfirmDialog({ open: false, receiptId: null });
      fetchReceipts();
    } catch (error) {
      toast.error('Failed to validate receipt');
      setConfirmDialog({ open: false, receiptId: null });
    }
  };

  const openConfirmDialog = (id) => {
    setConfirmDialog({ open: true, receiptId: id });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, receiptId: null });
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
            Receipts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage incoming stock from vendors
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchReceipts}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/operations/receipts/create')}
          >
            Create Receipt
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Reference</strong></TableCell>
              <TableCell><strong>Supplier</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Products</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No receipts yet. Create your first receipt!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/operations/receipts/create')}
                    sx={{ mt: 2 }}
                  >
                    Create Receipt
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow key={receipt._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {receipt.reference || receipt._id.slice(-6)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {receipt.supplier?.name || 'N/A'}
                    </Typography>
                    {receipt.supplier?.contact && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {receipt.supplier.contact}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(receipt.scheduledDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{receipt.products?.length || 0} items</TableCell>
                  <TableCell>
                    <Chip
                      label={receipt.status || 'draft'}
                      size="small"
                      color={getStatusColor(receipt.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {receipt.status === 'draft' ? (
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success"
                        onClick={() => openConfirmDialog(receipt._id)}
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
          📦 What are Receipts?
        </Typography>
        <Typography variant="body2">
          Receipts are used when items arrive from vendors. Create a receipt, add products and quantities, then validate to increase your stock levels automatically.
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
            Validate Receipt?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary' }}>
            This will update stock levels and cannot be undone. Are you sure you want to validate this receipt?
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

export default Receipts;

