const router = require("express").Router();
const { User, validateUser } = require("../models/userMongo");
const bcrypt = require("bcrypt");

// Register route
router.post("/", async (req, res) => {
  try {
    // Validate request body
    const { error } = validateUser(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res
        .status(409)
        .json({ message: "User with given email already exists!" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashPassword
    });

    // Save user to database
    await newUser.save();

    // Generate auth token
    const token = newUser.generateAuthToken();
    
    // Return success message and token
    res.status(201).json({ 
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;