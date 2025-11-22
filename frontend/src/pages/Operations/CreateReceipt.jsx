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

const CreateReceipt = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    supplier: {
      name: '',
      contact: '',
      email: '',
    },
    reference: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    notes: '',
    products: [], // Changed from items to products
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
    if (name.startsWith('supplier.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        supplier: { ...formData.supplier, [field]: value }
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
        { product: null, orderedQuantity: 1, receivedQuantity: 1 },
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
        supplier: formData.supplier,
        reference: formData.reference || undefined, // Will be auto-generated if empty
        scheduledDate: formData.scheduledDate,
        notes: formData.notes,
        products: formData.products.map(item => ({
          product: item.product?._id,
          orderedQuantity: Number(item.orderedQuantity),
          receivedQuantity: Number(item.receivedQuantity || item.orderedQuantity),
        })),
      };

      await operationsAPI.createReceipt(submitData);
      toast.success('Receipt created successfully! Stock will increase after validation.');
      navigate('/operations/receipts');
    } catch (error) {
      console.error('Receipt creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create receipt');
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
        onClick={() => navigate('/operations/receipts')}
        sx={{ mb: 2 }}
      >
        Back to Receipts
      </Button>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        Create Receipt
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Record incoming stock from vendors/suppliers
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Header Information */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier/Vendor Name"
                name="supplier.name"
                value={formData.supplier.name}
                onChange={handleChange}
                required
                placeholder="Enter supplier name"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier Contact"
                name="supplier.contact"
                value={formData.supplier.contact}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier Email"
                name="supplier.email"
                type="email"
                value={formData.supplier.email}
                onChange={handleChange}
                placeholder="email@example.com"
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
                label="Scheduled Date"
                name="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes"
              />
            </Grid>

            {/* Products Table */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Products
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
                      <TableCell width="20%"><strong>Received Quantity</strong></TableCell>
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
                              value={item.receivedQuantity}
                              onChange={(e) => updateItem(index, 'receivedQuantity', e.target.value)}
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
                  onClick={() => navigate('/operations/receipts')}
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
                  {loading ? 'Creating...' : 'Create Receipt'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Info Box */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.lighter' }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          ℹ️ How Receipts Work:
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Create a receipt when items arrive from vendors</li>
            <li>Add products and quantities received</li>
            <li>After creation, validate the receipt to increase stock</li>
            <li>Example: Receive 50 units of Steel Rods → stock +50</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
};

export default CreateReceipt;

