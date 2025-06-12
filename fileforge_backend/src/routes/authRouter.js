const express = require('express');
const User = require('../models/user'); 

const authRouter = express.Router();

//auth API
authRouter.post('/register', async (req, res) => {
    const { phoneNumber, password, firstName, lastName, department } = req.body;

    try {
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({
            phoneNumber,
            password,
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

authRouter.get('/test', (req, res) => {
  res.send('Auth router working!');
});


module.exports = authRouter;


