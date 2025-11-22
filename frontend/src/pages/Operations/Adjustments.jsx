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

const Adjustments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adjustments, setAdjustments] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, adjustmentId: null });

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const response = await operationsAPI.getAdjustments();
      setAdjustments(response.data.adjustments || []);
    } catch (error) {
      toast.error('Failed to load adjustments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      done: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const handleValidate = async () => {
    try {
      await operationsAPI.validateAdjustment(confirmDialog.adjustmentId);
      toast.success('Adjustment validated successfully! Stock levels corrected.');
      setConfirmDialog({ open: false, adjustmentId: null });
      fetchAdjustments();
    } catch (error) {
      toast.error('Failed to validate adjustment');
      setConfirmDialog({ open: false, adjustmentId: null });
    }
  };

  const openConfirmDialog = (id) => {
    setConfirmDialog({ open: true, adjustmentId: id });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, adjustmentId: null });
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
            Stock Adjustments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Correct inventory discrepancies
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAdjustments}>
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/operations/adjustments/create')}
          >
            Create Adjustment
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Reference</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Products</strong></TableCell>
              <TableCell><strong>Reason</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adjustments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No adjustments yet. Create your first adjustment!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/operations/adjustments/create')}
                    sx={{ mt: 2 }}
                  >
                    Create Adjustment
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              adjustments.map((adjustment) => (
                <TableRow key={adjustment._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {adjustment.reference || adjustment._id.slice(-6)}
                    </Typography>
                  </TableCell>
                  <TableCell>{adjustment.location || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(adjustment.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{adjustment.products?.length || 0} items</TableCell>
                  <TableCell>
                    <Chip
                      label={adjustment.reason?.replace('_', ' ') || 'other'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={adjustment.status || 'draft'}
                      size="small"
                      color={getStatusColor(adjustment.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {adjustment.status === 'draft' ? (
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="success"
                        onClick={() => openConfirmDialog(adjustment._id)}
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
          🎚️ What are Stock Adjustments?
        </Typography>
        <Typography variant="body2">
          Stock adjustments correct mismatches between recorded stock and physical count. Use them for damaged items, theft, physical inventory counts, or any discrepancies.
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
            Validate Adjustment?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary' }}>
            This will correct stock levels and cannot be undone. Are you sure you want to validate this adjustment?
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

export default Adjustments;
