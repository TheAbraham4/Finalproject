const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'customer'
  }
}, {
  timestamps: true
});

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      name: `${this.firstName} ${this.lastName}`
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '7d' }
  );
};

const User = mongoose.model('User', userSchema);

const validateUser = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label('First Name'),
    lastName: Joi.string().required().label('Last Name'),
    email: Joi.string().email().required().label('Email'),
    password: passwordComplexity().required().label('Password'),
  });
  return schema.validate(data);
};

module.exports = { User, validateUser }; 