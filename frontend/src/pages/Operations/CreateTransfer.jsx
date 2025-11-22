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
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { operationsAPI, productsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const CreateTransfer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    sourceLocation: '',
    destinationLocation: '',
    reference: '',
    scheduledDate: new Date().toISOString().split('T')[0],
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
        { product: null, requestedQuantity: 1, transferredQuantity: 1 },
      ],
    });
  };

  const updateItem = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index][field] = value;
    setFormData({ ...formData, products: updatedProducts });
  };

  const removeItem = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: updatedProducts });
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
        sourceLocation: formData.sourceLocation || undefined,
        destinationLocation: formData.destinationLocation || undefined,
        reference: formData.reference || undefined,
        scheduledDate: formData.scheduledDate,
        notes: formData.notes,
        products: formData.products.map(item => ({
          product: item.product?._id,
          requestedQuantity: Number(item.requestedQuantity),
          transferredQuantity: Number(item.transferredQuantity || item.requestedQuantity),
        })),
      };

      await operationsAPI.createTransfer(submitData);
      toast.success('Transfer created successfully! Stock location will update after validation.');
      navigate('/operations/transfers');
    } catch (error) {
      console.error('Transfer creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create transfer');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return formData.products.reduce((sum, item) => {
      return sum + Number(item.requestedQuantity);
    }, 0);
  };

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/operations/transfers')}
        sx={{ mb: 2 }}
      >
        Back to Transfers
      </Button>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        Create Internal Transfer
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Move stock between locations within your warehouse
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Location Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Location Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Source Location"
                name="sourceLocation"
                value={formData.sourceLocation}
                onChange={handleChange}
                placeholder="e.g., Main Warehouse"
                helperText="Where items are currently located"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Destination Location"
                name="destinationLocation"
                value={formData.destinationLocation}
                onChange={handleChange}
                placeholder="e.g., Production Floor"
                helperText="Where items will be moved to"
              />
            </Grid>

            {/* Transfer Details */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Transfer Details
              </Typography>
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
                label="Scheduled Date"
                name="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Transfer instructions or notes"
                multiline
                rows={2}
              />
            </Grid>

            {/* Products Table */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Products to Transfer
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
                      <TableCell width="50%"><strong>Product</strong></TableCell>
                      <TableCell width="25%"><strong>Requested Quantity</strong></TableCell>
                      <TableCell width="20%"><strong>To Transfer</strong></TableCell>
                      <TableCell width="5%"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No products added yet. Click "Add Product" to start.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.products.map((item, index) => (
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
                              value={item.requestedQuantity}
                              onChange={(e) => updateItem(index, 'requestedQuantity', e.target.value)}
                              size="small"
                              inputProps={{ min: 1 }}
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.transferredQuantity}
                              onChange={(e) => updateItem(index, 'transferredQuantity', e.target.value)}
                              size="small"
                              inputProps={{ min: 0 }}
                              placeholder={item.requestedQuantity}
                              helperText="Leave empty = requested qty"
                            />
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
                      ))
                    )}
                    {formData.products.length > 0 && (
                      <TableRow>
                        <TableCell align="right">
                          <Typography variant="h6" fontWeight={600}>
                            Total Items:
                          </Typography>
                        </TableCell>
                        <TableCell colSpan={3}>
                          <Typography variant="h6" fontWeight={600} color="primary">
                            {calculateTotal()} units
                          </Typography>
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
                  onClick={() => navigate('/operations/transfers')}
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
                  {loading ? 'Creating...' : 'Create Transfer'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Info Box */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.lighter' }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          ⇄ How Internal Transfers Work:
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Move stock between locations within your company</li>
            <li>Total stock doesn't change, only location updates</li>
            <li>Examples: Main Warehouse → Production Floor, Rack A → Rack B</li>
            <li>After validation, location tracking is updated</li>
            <li>All movements are logged in Move History</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
};

export default CreateTransfer;

