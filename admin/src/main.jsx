import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {BrowserRouter} from "react-router-dom";

const theme = createTheme({
    palette: {
        primary: {
            main: '#4caf50', // Green
        },
        secondary: {
            main: '#ff9800', // Orange
        },
        background: {
            default: '#f5f5f5', // Light gray
            paper: '#ffffff', // White for paper elements
        },
        text: {
            primary: '#212121', // Dark gray for primary text
            secondary: '#757575', // Medium gray for secondary text
        },
    },
});

createRoot(document.getElementById('root')).render(
    <ThemeProvider theme={theme}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ThemeProvider>
)
