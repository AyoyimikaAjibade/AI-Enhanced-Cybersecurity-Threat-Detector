import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  NetworkCheck as NetworkCheckIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { AuthContext } from '../App';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Alerts', icon: <NotificationsIcon />, path: '/alerts' },
    { text: 'Network Traffic', icon: <NetworkCheckIcon />, path: '/network' },
    { text: 'System Logs', icon: <StorageIcon />, path: '/logs' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

  // Mock notifications
  const notifications = [
    { id: 1, message: 'High severity alert: Suspicious login attempt detected', time: '2 minutes ago' },
    { id: 2, message: 'Medium severity alert: Unusual file access pattern', time: '15 minutes ago' },
    { id: 3, message: 'System update available: Security patches ready to install', time: '1 hour ago' }
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: [1] }}>
        <Typography variant="h6" noWrap component="div">
          AI-Sec Defender
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 3
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            AI-Enhanced Cybersecurity Threat Detector
          </Typography>
          
          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationsOpen}
            sx={{ mr: 2 }}
          >
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationsAnchor}
            open={Boolean(notificationsAnchor)}
            onClose={handleNotificationsClose}
            PaperProps={{
              sx: { width: 320, maxHeight: 400 }
            }}
          >
            <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 'bold' }}>
              Notifications
            </Typography>
            <Divider />
            {notifications.length === 0 ? (
              <MenuItem>
                <Typography variant="body2">No new notifications</Typography>
              </MenuItem>
            ) : (
              notifications.map((notification) => (
                <MenuItem key={notification.id} onClick={handleNotificationsClose}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography variant="body2">{notification.message}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.time}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
            <Divider />
            <MenuItem onClick={handleNotificationsClose} sx={{ justifyContent: 'center' }}>
              <Typography variant="body2" color="primary">
                View all notifications
              </Typography>
            </MenuItem>
          </Menu>
          
          {/* User Menu */}
          <Button
            onClick={handleUserMenuOpen}
            color="inherit"
            startIcon={
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            }
          >
            {user?.username || 'User'}
          </Button>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
          >
            <MenuItem onClick={() => { handleUserMenuClose(); navigate('/profile'); }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleUserMenuClose(); navigate('/settings'); }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default
        }}
      >
        <Toolbar /> {/* This empty Toolbar creates space at the top */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
