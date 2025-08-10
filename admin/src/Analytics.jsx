import { Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import AnalyticsView from './components/AnalyticsView';

const Analytics = ({ onLogout, currentAdmin }) => {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', }}>
            <Sidebar />
            <Box sx={{ flex: 1, overflowX: 'auto' }}>
                <AnalyticsView />
            </Box>
        </Box>
    );
};

export default Analytics;
