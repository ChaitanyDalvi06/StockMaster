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

const Transfers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, transferId: null });

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const response = await operationsAPI.getTransfers();
      setTransfers(response.data.transfers || []);
    } catch (error) {
      toast.error('Failed to load transfers');
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
      await operationsAPI.validateTransfer(confirmDialog.transferId);
      toast.success('Transfer validated successfully! Stock locations updated.');
      setConfirmDialog({ open: false, transferId: null });
      fetchTransfers();
    } catch (error) {
      toast.error('Failed to validate transfer');
      setConfirmDialog({ open: false, transferId: null });
    }
  };

  const openConfirmDialog = (id) => {
    setConfirmDialog({ open: true, transferId: id });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, transferId: null });
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
            Internal Transfers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Move stock between locations
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchTransfers}>
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/operations/transfers/create')}
          >
            Create Transfer
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Reference</strong></TableCell>
              <TableCell><strong>From → To</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Products</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No transfers yet. Create your first transfer!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/operations/transfers/create')}
                    sx={{ mt: 2 }}
                  >
                    Create Transfer
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              transfers.map((transfer) => (
                <TableRow key={transfer._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {transfer.reference || transfer._id.slice(-6)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {transfer.sourceLocation || 'N/A'} → {transfer.destinationLocation || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(transfer.scheduledDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transfer.products?.length || 0} items</TableCell>
                  <TableCell>
                    <Chip
                      label={transfer.status || 'draft'}
                      size="small"
                      color={getStatusColor(transfer.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {transfer.status === 'draft' ? (
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success"
                        onClick={() => openConfirmDialog(transfer._id)}
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
          ⇄ What are Internal Transfers?
        </Typography>
        <Typography variant="body2">
          Internal transfers move stock between locations within your company. Total stock doesn't change, only the location is updated. Example: Main Warehouse → Production Floor.
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
            Validate Transfer?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary' }}>
            This will move stock between locations and cannot be undone. Are you sure you want to validate this transfer?
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

export default Transfers;
