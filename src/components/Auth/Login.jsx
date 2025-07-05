import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { images } from '../../constants';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(formData.email, formData.password);
      // Redirect to home page after successful login
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app__auth-container">
      <div className="app__auth-form-container">
        <div className="app__auth-logo">
          <img src={images.gericht} alt="Gericht Logo" />
        </div>
        <h1 className="headtext__cormorant">Welcome Back</h1>
        <p className="p__opensans">Sign in to your account</p>
        
        {error && <div className="app__auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="app__auth-form">
          <div className="app__auth-input-group">
            <label htmlFor="email" className="p__opensans">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="app__auth-input-group">
            <label htmlFor="password" className="p__opensans">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="custom__button" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="p__opensans app__auth-redirect">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;




