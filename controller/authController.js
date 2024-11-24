

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../Models/userSchema.js';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET;  

export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields (name, email, password, role) are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, password: hashedPassword, role });

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, secret, { expiresIn: '1d' });

    res.status(201).json({ message: 'User created successfully', userId: newUser._id, token });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};




export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }


    const token = jwt.sign({ userId: user._id, role: user.role }, secret, { expiresIn: '1d' });

    res.json({ userId: user._id, token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

