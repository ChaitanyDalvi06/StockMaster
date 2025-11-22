import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIChatbot from '../AIChatbot';

const DRAWER_WIDTH = 260;

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} drawerWidth={DRAWER_WIDTH} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Navbar onMenuClick={handleDrawerToggle} />
        
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>

      {/* AI Chatbot */}
      <AIChatbot />
    </Box>
  );
};

export default DashboardLayout;

