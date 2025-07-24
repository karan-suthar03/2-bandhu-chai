import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import PrivateRoute from './PrivateRoute';
import { isAdminLoggedIn, isAdminLoggedInSync, getAdminFromStorage, logoutAdmin } from './api';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const initialLoggedIn = isAdminLoggedInSync();
      const admin = getAdminFromStorage();
      
      setLoggedIn(initialLoggedIn);
      setCurrentAdmin(admin);
      if (initialLoggedIn) {
        const verifiedLoggedIn = await isAdminLoggedIn();
        if (!verifiedLoggedIn) {
          setLoggedIn(false);
          setCurrentAdmin(null);
          await logoutAdmin();
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (admin) => {
    setLoggedIn(true);
    setCurrentAdmin(admin);
    navigate('/dashboard')
  };

  const handleLogout = async () => {
    setLoggedIn(false);
    setCurrentAdmin(null);
    await logoutAdmin();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute loggedIn={loggedIn}>
              <Dashboard onLogout={handleLogout} currentAdmin={currentAdmin} />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to={loggedIn ? "/dashboard" : "/login"} replace />} />
      </Routes>
  );
}

export default App;
