const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { createToken } = require('../utils/token');

exports.register = async (req, res) => {
  const { phoneNumber, password, firstName, lastName, department, role } = req.body;
  try {
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      id: uuidv4(),
      phoneNumber,
      password: hashedPassword,
      firstName,
      lastName,
      department,
      role
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { phoneNumber, password } = req.body;
  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = createToken(user.id);
    const { id, firstName, lastName, department, role } = user;
    

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id, 
        phoneNumber, 
        firstName, 
        lastName, 
        name: `${firstName} ${lastName}`.trim(),// name 
        department, 
        role 
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  const { id, phoneNumber, firstName, lastName, department, role } = req.user;
  

  res.json({ 
    id, 
    phoneNumber, 
    firstName, 
    lastName, 
    name: `${firstName} ${lastName}`.trim(), 
    department, 
    role 
  });
};