import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { env } from "../config/env.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";


const router = Router();

router.post('/signup', async (req, res) => {
    try {

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        const existingUser = await User.findOne(
            { $or: [{ email }, { username }] }
        );
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email or username already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error', error: error });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Password must be a string'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, env.JWT_SECRET, { expiresIn: env.jwtExpiresIn });
        res.status(200).json({ success: true, message: 'Login successful', token });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ userId: req.userId });
});


export default router;