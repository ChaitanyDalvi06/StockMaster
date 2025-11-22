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
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import { Refresh as RefreshIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { operationsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const MoveHistory = () => {
  const [loading, setLoading] = useState(true);
  const [moves, setMoves] = useState([]);
  const [filters, setFilters] = useState({
    documentType: 'all',
    status: 'all',
  });

  useEffect(() => {
    fetchMoves();
  }, []);

  const fetchMoves = async () => {
    setLoading(true);
    try {
      const response = await operationsAPI.getMoveHistory();
      setMoves(response.data.moves || []);
    } catch (error) {
      toast.error('Failed to load move history');
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

  const getDocTypeColor = (type) => {
    const colors = {
      receipt: 'success',
      delivery: 'info',
      transfer: 'warning',
      adjustment: 'secondary',
    };
    return colors[type] || 'default';
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredMoves = moves.filter(move => {
    if (filters.documentType !== 'all' && move.documentType !== filters.documentType) return false;
    if (filters.status !== 'all' && move.status !== filters.status) return false;
    return true;
  });

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
            Move History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete audit trail of all stock movements
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchMoves}>
          Refresh
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FilterIcon color="action" />
          </Grid>
          <Grid item xs>
            <TextField
              select
              size="small"
              label="Document Type"
              name="documentType"
              value={filters.documentType}
              onChange={handleFilterChange}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="receipt">Receipts</MenuItem>
              <MenuItem value="delivery">Deliveries</MenuItem>
              <MenuItem value="transfer">Transfers</MenuItem>
              <MenuItem value="adjustment">Adjustments</MenuItem>
            </TextField>
          </Grid>
          <Grid item>
            <TextField
              select
              size="small"
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="waiting">Waiting</MenuItem>
              <MenuItem value="ready">Ready</MenuItem>
              <MenuItem value="done">Done</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Reference</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Product</strong></TableCell>
              <TableCell><strong>From</strong></TableCell>
              <TableCell><strong>To</strong></TableCell>
              <TableCell><strong>Quantity</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMoves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    {moves.length === 0 
                      ? 'No stock movements yet. Create receipts, deliveries, or transfers to see movements here.'
                      : 'No movements match your filters. Try adjusting the filter criteria.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredMoves.map((move) => (
                <TableRow key={move._id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(move.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(move.date).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {move.documentReference}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={move.documentType}
                      size="small"
                      color={getDocTypeColor(move.documentType)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {move.product?.name || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {move.product?.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {move.sourceLocation?.name || '—'}
                  </TableCell>
                  <TableCell>
                    {move.destinationLocation?.name || '—'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {move.quantity} units
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={move.status || 'draft'}
                      size="small"
                      color={getStatusColor(move.status)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Stats */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Total Movements
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {moves.length}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Receipts
            </Typography>
            <Typography variant="h6" fontWeight={600} color="success.main">
              {moves.filter(m => m.documentType === 'receipt').length}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Deliveries
            </Typography>
            <Typography variant="h6" fontWeight={600} color="info.main">
              {moves.filter(m => m.documentType === 'delivery').length}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" color="text.secondary">
              Transfers
            </Typography>
            <Typography variant="h6" fontWeight={600} color="warning.main">
              {moves.filter(m => m.documentType === 'transfer').length}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Info Box */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.lighter' }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          🕐 What is Move History?
        </Typography>
        <Typography variant="body2">
          Move History provides a complete audit trail of all stock movements in your system. Every receipt, delivery, transfer, and adjustment is logged here for full traceability. Use filters to find specific movements.
        </Typography>
      </Paper>
    </Box>
  );
};

export default MoveHistory;
