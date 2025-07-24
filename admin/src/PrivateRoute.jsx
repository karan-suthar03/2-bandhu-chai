import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, loggedIn }) => {
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;
