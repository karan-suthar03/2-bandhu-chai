import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import OrdersView from './components/OrdersView';
import ProductsView from './components/ProductsView';
import AnalyticsView from './components/AnalyticsView';
import DashboardContent from './components/DashboardContent';
import AddProduct from "./components/productPage/addProduct/AddProduct.jsx";
import EditProduct from "./components/productPage/editProduct/EditProduct.jsx";
import ProductDetails from "./components/productPage/viewProduct/ProductDetails.jsx";
import EditOrder from "./components/ordersPage/editOrder/EditOrder.jsx";
import OrderDetails from "./components/ordersPage/viewOrder/OrderDetails.jsx";
import VariantsView from "./components/VariantsView.jsx";

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
                    <Route path="orders/view/:orderId" element={<OrderDetails />} />
                    <Route path="orders/edit/:orderId" element={<EditOrder />} />
                    <Route path="products" element={<ProductsView />} />
                    <Route path="products/add" element={<AddProduct />} />
                    <Route path="products/view/:productId" element={<ProductDetails />} />
                    <Route path="products/edit/:productId" element={<EditProduct />} />
                    <Route path="variants" element={<VariantsView />} />
                    <Route path="analytics" element={<AnalyticsView />} />
                </Routes>
            </Box>
        </Box>
    );
};

export default Dashboard;
