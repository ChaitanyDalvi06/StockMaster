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

const CreateDelivery = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customer: {
      name: '',
      contact: '',
      email: '',
      address: '',
    },
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
    const { name, value } = e.target;
    if (name.startsWith('customer.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        customer: { ...formData.customer, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        { product: null, orderedQuantity: 1, deliveredQuantity: 1 },
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
        customer: formData.customer,
        reference: formData.reference || undefined,
        scheduledDate: formData.scheduledDate,
        notes: formData.notes,
        products: formData.products.map(item => ({
          product: item.product?._id,
          orderedQuantity: Number(item.orderedQuantity),
          deliveredQuantity: Number(item.deliveredQuantity || item.orderedQuantity),
        })),
      };

      await operationsAPI.createDelivery(submitData);
      toast.success('Delivery order created successfully! Stock will decrease after validation.');
      navigate('/operations/deliveries');
    } catch (error) {
      console.error('Delivery creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create delivery');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return formData.products.reduce((sum, item) => {
      return sum + Number(item.orderedQuantity);
    }, 0);
  };

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/operations/deliveries')}
        sx={{ mb: 2 }}
      >
        Back to Deliveries
      </Button>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        Create Delivery Order
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Record outgoing shipments to customers
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Customer Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Customer Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                name="customer.name"
                value={formData.customer.name}
                onChange={handleChange}
                required
                placeholder="Enter customer name"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Contact"
                name="customer.contact"
                value={formData.customer.contact}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Email"
                name="customer.email"
                type="email"
                value={formData.customer.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Delivery Address"
                name="customer.address"
                value={formData.customer.address}
                onChange={handleChange}
                placeholder="Shipping address"
              />
            </Grid>

            {/* Order Details */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Order Details
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
                placeholder="Delivery instructions or notes"
                multiline
                rows={2}
              />
            </Grid>

            {/* Products Table */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Products to Deliver
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
                      <TableCell width="25%"><strong>Ordered Quantity</strong></TableCell>
                      <TableCell width="20%"><strong>To Deliver</strong></TableCell>
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
                              value={item.orderedQuantity}
                              onChange={(e) => updateItem(index, 'orderedQuantity', e.target.value)}
                              size="small"
                              inputProps={{ min: 1 }}
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.deliveredQuantity}
                              onChange={(e) => updateItem(index, 'deliveredQuantity', e.target.value)}
                              size="small"
                              inputProps={{ min: 0 }}
                              placeholder={item.orderedQuantity}
                              helperText="Leave empty = ordered qty"
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
                  onClick={() => navigate('/operations/deliveries')}
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
                  {loading ? 'Creating...' : 'Create Delivery'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Info Box */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.lighter' }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          🚚 How Delivery Orders Work:
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Create a delivery order when shipping products to customers</li>
            <li>Add products and quantities to deliver</li>
            <li>Pick items from warehouse → Pack → Validate</li>
            <li>After validation, stock decreases automatically</li>
            <li>Example: Deliver 10 chairs → stock -10</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
};

export default CreateDelivery;

