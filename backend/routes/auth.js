const router = require("express").Router();
const { User } = require("../models/userMongo");
const bcrypt = require("bcrypt");
const Joi = require("joi");

// Login route
router.post("/", async (req, res) => {
  try {
    // Validate request body
    const { error } = validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // Check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(401).json({ message: "Invalid Email or Password" });

    // Check if password is correct
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(401).json({ message: "Invalid Email or Password" });

    // Generate auth token
    const token = user.generateAuthToken();
    
    // Return user info and token
    res.status(200).json({ 
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Validation function
const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = router;