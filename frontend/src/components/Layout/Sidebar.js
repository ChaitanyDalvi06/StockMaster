import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  MoveToInbox as ReceiptsIcon,
  LocalShipping as DeliveriesIcon,
  SwapHoriz as TransfersIcon,
  Tune as AdjustmentsIcon,
  History as HistoryIcon,
  Psychology as AIIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const menuItems = [
  { title: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { title: 'Products', path: '/products', icon: <ProductsIcon /> },
  { divider: true, title: 'Operations' },
  { title: 'Receipts', path: '/operations/receipts', icon: <ReceiptsIcon /> },
  { title: 'Deliveries', path: '/operations/deliveries', icon: <DeliveriesIcon /> },
  { title: 'Transfers', path: '/operations/transfers', icon: <TransfersIcon /> },
  { title: 'Adjustments', path: '/operations/adjustments', icon: <AdjustmentsIcon /> },
  { title: 'Move History', path: '/operations/history', icon: <HistoryIcon /> },
  { divider: true },
  { title: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

const Sidebar = ({ mobileOpen, onClose, drawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const drawerContent = (
    <Box>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            fontSize: '2rem',
          }}
        >
          📦
        </Box>
        <Box>
          <Box sx={{ fontWeight: 700, fontSize: '1.25rem', color: 'primary.main' }}>
            StockMaster
          </Box>
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            Inventory Management
          </Box>
        </Box>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item, index) => {
          if (item.divider) {
            return (
              <Box key={index}>
                <Divider sx={{ my: 2 }} />
                {item.title && (
                  <Box sx={{ px: 2, py: 1, fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                    {item.title}
                  </Box>
                )}
              </Box>
            );
          }

          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;

