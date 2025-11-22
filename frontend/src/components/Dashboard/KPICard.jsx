import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { formatNumber, formatCurrency } from '../../utils/helpers';

const KPICard = ({ title, value, icon: Icon, color = 'primary', prefix = '', suffix = '' }) => {
  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: `${color}.main`,
          boxShadow: 3,
        },
      }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color={`${color}.main`}>
            {prefix}
            {typeof value === 'number' && !prefix.includes('$') ? formatNumber(value) : value}
            {suffix}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color}.lighter`,
            color: `${color}.main`,
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </Box>
      </Box>
    </Paper>
  );
};

export default KPICard;

