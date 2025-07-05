import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { images } from '../../constants';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

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
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      // Redirect to home page after successful registration
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create an account. Please try again.');
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
        <h1 className="headtext__cormorant">Create Account</h1>
        <p className="p__opensans">Join us for a delightful experience</p>
        
        {error && <div className="app__auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="app__auth-form">
          <div className="app__auth-input-group">
            <label htmlFor="firstName" className="p__opensans">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Enter your first name"
            />
          </div>
          
          <div className="app__auth-input-group">
            <label htmlFor="lastName" className="p__opensans">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Enter your last name"
            />
          </div>
          
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
              placeholder="Create a password"
              minLength="6"
            />
          </div>
          
          <div className="app__auth-input-group">
            <label htmlFor="confirmPassword" className="p__opensans">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="custom__button" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p className="p__opensans app__auth-redirect">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;



