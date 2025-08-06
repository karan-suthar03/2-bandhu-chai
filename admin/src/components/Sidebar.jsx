import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Typography,
    Box,
    useTheme,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';

const Sidebar = () => {
    const theme = useTheme();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { id: 'orders', label: 'Orders', icon: <ShoppingCartIcon />, path: '/dashboard/orders' },
        { id: 'products', label: 'Products', icon: <InventoryIcon />, path: '/dashboard/products' },
        { id: 'variants', label: 'Variants', icon: <CategoryIcon />, path: '/dashboard/variants' },
        { id: 'analytics', label: 'Analytics', icon: <BarChartIcon />, path: '/dashboard/analytics' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                },
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="bold" fontSize="1.5rem">
                    🫖 Bandhu Chai
                </Typography>
            </Box>

            <List>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        end={item.id === 'dashboard'}
                        style={{ textDecoration: 'none' }}
                    >
                        {({ isActive }) => (
                            <ListItemButton
                                sx={{
                                    mx: 1,
                                    borderRadius: 2,
                                    color: isActive
                                        ? theme.palette.primary.contrastText
                                        : theme.palette.text.secondary,
                                    backgroundColor: isActive
                                        ? theme.palette.primary.main
                                        : 'transparent',
                                    '&:hover': {
                                        backgroundColor: isActive
                                            ? theme.palette.primary.main
                                            : theme.palette.action.hover,
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        )}
                    </NavLink>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;
