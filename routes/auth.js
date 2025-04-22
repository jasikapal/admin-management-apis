const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken } = require("../middleware/auth");

// Admin signup (can be restricted to one-time use)
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/admin/signup:
 *   post:
 *     summary: Create the initial admin account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Admin
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: Admin@123
 *     responses:
 *       201:
 *         description: Admin account created successfully
 *       400:
 *         description: Admin already exists
 */
router.post("/admin/signup", async (req, res) => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ role: "admin" });
        if (adminExists) {
            return res
                .status(400)
                .json({ message: "Admin account already exists" });
        }

        const { name, email, password } = req.body;

        const admin = new User({
            name,
            email,
            password,
            role: "admin",
            permissions: {
                dashboard: true,
                collegeManagement: true,
                contentEditing: true,
                viewData: true,
            },
        });

        await admin.save();

        const token = generateToken(admin);

        res.status(201).json({
            message: "Admin account created successfully",
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login route for both admin and sub-admin
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login as admin or sub-admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: Admin@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate token
        const token = generateToken(user);

        // Set token as HTTP-only cookie for better security
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure in production
            maxAge: 3600000, // 1 hour
        });

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
            },
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Logout route
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
});

module.exports = router;
