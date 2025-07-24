import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import OrdersView from './components/OrdersView';
import ProductsView from './components/ProductsView';
import AnalyticsView from './components/AnalyticsView';
import DashboardContent from './components/DashboardContent';

const Dashboard = ({ onLogout, currentAdmin }) => {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', }}>
            <Sidebar />
            <Box sx={{ flex: 1, overflowX: 'auto' }}>
                <Routes>
                    <Route
                        path=""
                        element={
                            <DashboardContent
                                onLogout={onLogout}
                                currentAdmin={currentAdmin}
                            />
                        }
                    />
                    <Route path="orders" element={<OrdersView />} />
                    <Route path="products" element={<ProductsView />} />
                    <Route path="analytics" element={<AnalyticsView />} />
                </Routes>
            </Box>
        </Box>
    );
};

export default Dashboard;
