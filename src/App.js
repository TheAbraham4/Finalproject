import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AboutUs, Chef, FindUs, Footer, Gallery, Header, Intro, Laurels, SpecialMenu } from './container';
import { Navbar } from './components';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import CustomerProfile from './components/CustomerProfile/CustomerProfile';
import AdminDashboard from './components/Admin/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => (
  <AuthProvider>
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <Header />
              <AboutUs />
              <SpecialMenu />
              <Chef />
              <Intro />
              <Laurels />
              <Gallery />
              <FindUs />
              <Footer />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <CustomerProfile />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Routes>
      </div>
    </Router>
  </AuthProvider>
);

export default App;



