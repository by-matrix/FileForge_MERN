const express = require('express');
const User = require('../models/user'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authRouter = express.Router();

//auth APIs

// Register API
authRouter.post('/register', async (req, res) => {
    const { phoneNumber, password, firstName, lastName, department } = req.body;

    try {
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password using bcrypt with salt round 10 is genrated
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        //user interface
        const newUser = new User({
            phoneNumber,
            password: hashedPassword, // Store the hashed password
            firstName,
            lastName,
            department
        });

        const savedUser = await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// Login API

authRouter.post('/login', async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    // Step 1: Check if user exists
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(400).json({ message: 'Invalid phone number or password' });
    }

    // Step 2: Compare provided password with hashed password stored in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid phone number or password' });
    }

    // Step 3: Generate JWT (JSON Web Token)
    const token = await jwt.sign(
      { _id: user._id, phoneNumber: user.phoneNumber }, // Data in the payload
      process.env.NEED_THIS_WHY, // Secret key for signing the token (ensure it's in .env)
      { expiresIn: '1h' }  // Expiration time (1 hour)
    );

      res.cookie("token", token)

    // Step 4: Return success response with token and user data
    return res.status(200).json({
      message: 'Login successful',
      token, // The generated JWT token
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        department: user.department
      }
    });

  } catch (error) {
    console.error('Login Error:', error); // Detailed error log for debugging
    return res.status(500).json({
      message: 'Error logging in',
      error: error.message || error
    });
  }
});

// logout API
authRouter.post('/logout', (req, res) => {
    // Invalidate the token on the client side
    // This can be done by clearing the token from cookies or local storage
    res.clearCookie('token'); // Assuming you're using cookies to store the token
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = authRouter;