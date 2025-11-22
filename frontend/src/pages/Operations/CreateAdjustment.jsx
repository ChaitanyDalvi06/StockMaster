import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Autocomplete,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { operationsAPI, productsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const CreateAdjustment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    location: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
    products: [],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 100 });
      setProducts(response.data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        { product: null, systemQuantity: 0, countedQuantity: 0 },
      ],
    });
  };

  const updateItem = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index][field] = value;
    
    // Auto-fill systemQuantity from product's current stock
    if (field === 'product' && value) {
      updatedProducts[index].systemQuantity = value.stock || 0;
    }
    
    setFormData({ ...formData, products: updatedProducts });
  };

  const removeItem = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: updatedProducts });
  };

  const calculateDifference = (item) => {
    return Number(item.countedQuantity) - Number(item.systemQuantity);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.products.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        location: formData.location || undefined,
        reference: formData.reference || undefined,
        date: formData.date,
        reason: formData.reason,
        notes: formData.notes,
        products: formData.products.map(item => ({
          product: item.product?._id,
          systemQuantity: Number(item.systemQuantity),
          countedQuantity: Number(item.countedQuantity),
        })),
      };

      await operationsAPI.createAdjustment(submitData);
      toast.success('Adjustment created successfully! Stock will update after validation.');
      navigate('/operations/adjustments');
    } catch (error) {
      console.error('Adjustment creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create adjustment');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalDifference = () => {
    return formData.products.reduce((sum, item) => {
      return sum + calculateDifference(item);
    }, 0);
  };

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/operations/adjustments')}
        sx={{ mb: 2 }}
      >
        Back to Adjustments
      </Button>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        Create Stock Adjustment
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Reconcile system quantities with physical counts
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Adjustment Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Adjustment Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Main Warehouse, Shelf A"
                helperText="Where the physical count was performed"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reference Number (Optional)"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Auto-generated if empty"
                helperText="Leave empty to auto-generate"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g., Physical inventory count, Damaged goods"
                helperText="Why this adjustment is needed"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional details about this adjustment"
                multiline
                rows={2}
              />
            </Grid>

            {/* Products Table */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Products to Adjust
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addItem}
                  size="small"
                >
                  Add Product
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="35%"><strong>Product</strong></TableCell>
                      <TableCell width="15%"><strong>System Qty</strong></TableCell>
                      <TableCell width="15%"><strong>Counted Qty</strong></TableCell>
                      <TableCell width="15%"><strong>Difference</strong></TableCell>
                      <TableCell width="15%"><strong>Current Stock</strong></TableCell>
                      <TableCell width="5%"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No products added yet. Click "Add Product" to start.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.products.map((item, index) => {
                        const difference = calculateDifference(item);
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Autocomplete
                                options={products}
                                getOptionLabel={(option) => `${option.name} (${option.sku})`}
                                value={item.product}
                                onChange={(_, newValue) => updateItem(index, 'product', newValue)}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder="Select product"
                                    size="small"
                                    required
                                  />
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                value={item.systemQuantity}
                                onChange={(e) => updateItem(index, 'systemQuantity', e.target.value)}
                                size="small"
                                inputProps={{ min: 0 }}
                                required
                                helperText="Expected"
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                value={item.countedQuantity}
                                onChange={(e) => updateItem(index, 'countedQuantity', e.target.value)}
                                size="small"
                                inputProps={{ min: 0 }}
                                required
                                helperText="Actual"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={difference > 0 ? `+${difference}` : difference}
                                color={difference > 0 ? 'success' : difference < 0 ? 'error' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {item.product?.stock || 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeItem(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                    {formData.products.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="h6" fontWeight={600}>
                            Total Difference:
                          </Typography>
                        </TableCell>
                        <TableCell colSpan={3}>
                          <Chip
                            label={calculateTotalDifference() > 0 ? `+${calculateTotalDifference()}` : calculateTotalDifference()}
                            color={calculateTotalDifference() > 0 ? 'success' : calculateTotalDifference() < 0 ? 'error' : 'default'}
                            sx={{ fontWeight: 600, fontSize: '1rem', height: 32 }}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/operations/adjustments')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading || formData.products.length === 0}
                >
                  {loading ? 'Creating...' : 'Create Adjustment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Info Box */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'warning.lighter' }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          ⚖️ How Stock Adjustments Work:
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>System Qty:</strong> What the system thinks you have</li>
            <li><strong>Counted Qty:</strong> What you actually counted physically</li>
            <li><strong>Difference:</strong> Positive = found more, Negative = found less</li>
            <li>After validation, stock levels are updated to match counted quantities</li>
            <li>All adjustments are logged in Move History for audit trail</li>
            <li>Common reasons: Physical count, damaged goods, theft, data entry errors</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
};

export default CreateAdjustment;

