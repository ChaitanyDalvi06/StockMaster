import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Warehouses = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Warehouses & Locations
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage your storage locations
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Warehouse and location management will be displayed here</Typography>
      </Paper>
    </Box>
  );
};

export default Warehouses;

