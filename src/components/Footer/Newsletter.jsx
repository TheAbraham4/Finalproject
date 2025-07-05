import React, { useState } from 'react';
import SubHeading from '../SubHeading/SubHeading';
import './Newsletter.css';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email.');
      return;
    }
    try {
      await addDoc(collection(db, 'subscribers'), { email });
      setMessage('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      setMessage('Subscription failed. Try again.');
    }
  };

  return (
    <div className="app__newsletter">
      <div className="app__newsletter-heading">
        <SubHeading title="Newsletter" />
        <h1 className="headtext__cormorant">Subscribe To Our Newsletter</h1>
        <p className="p__opensans">And never miss latest Updates!</p>
      </div>
      <form className="app__newsletter-input flex__center" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="custom__button">Subscribe</button>
      </form>
      {message && <div className="newsletter__message">{message}</div>}
    </div>
  );
};

export default Newsletter;