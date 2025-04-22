const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");

// Middleware chain for admin-only routes
const adminOnly = [verifyToken, checkRole("admin")];

// Create sub-admin (admin only)
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /admin/sub-admin:
 *   post:
 *     summary: Create a new sub-admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *                 example: SubAdmin1
 *               email:
 *                 type: string
 *                 example: subadmin1@example.com
 *               password:
 *                 type: string
 *                 example: SubAdmin@123
 *               permissions:
 *                 type: object
 *                 properties:
 *                   dashboard:
 *                     type: boolean
 *                     example: true
 *                   collegeManagement:
 *                     type: boolean
 *                     example: true
 *                   contentEditing:
 *                     type: boolean
 *                     example: false
 *                   viewData:
 *                     type: boolean
 *                     example: true
 *     responses:
 *       201:
 *         description: Sub-admin created successfully
 *       400:
 *         description: Email already in use
 */
router.post("/sub-admin", adminOnly, async (req, res) => {
    try {
        const { name, email, password, permissions } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const subAdmin = new User({
            name,
            email,
            password,
            role: "sub-admin",
            permissions: permissions || {},
        });

        await subAdmin.save();

        res.status(201).json({
            message: "Sub-admin created successfully",
            subAdmin: {
                id: subAdmin._id,
                name: subAdmin.name,
                email: subAdmin.email,
                permissions: subAdmin.permissions,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /admin/sub-admins:
 *   get:
 *     summary: Get all sub-admins
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sub-admins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subAdmins:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/sub-admins", adminOnly, async (req, res) => {
    try {
        const subAdmins = await User.find({ role: "sub-admin" }).select(
            "-password"
        );
        res.status(200).json({ subAdmins });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single sub-admin (admin only)
/**
 * @swagger
 * /admin/sub-admin/{id}:
 *   get:
 *     summary: Get a single sub-admin by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Sub-admin ID
 *     responses:
 *       200:
 *         description: Sub-admin data
 *       404:
 *         description: Sub-admin not found
 */
router.get("/sub-admin/:id", adminOnly, async (req, res) => {
    try {
        const subAdmin = await User.findOne({
            _id: req.params.id,
            role: "sub-admin",
        }).select("-password");

        if (!subAdmin) {
            return res.status(404).json({ message: "Sub-admin not found" });
        }

        res.status(200).json({ subAdmin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update sub-admin permissions (admin only)
/**
 * @swagger
 * /admin/sub-admin/{id}:
 *   put:
 *     summary: Update a sub-admin's details or permissions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Sub-admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: SubAdmin1 Updated
 *               email:
 *                 type: string
 *                 example: subadmin1@example.com
 *               permissions:
 *                 type: object
 *                 properties:
 *                   dashboard:
 *                     type: boolean
 *                   collegeManagement:
 *                     type: boolean
 *                   contentEditing:
 *                     type: boolean
 *                   viewData:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Sub-admin updated successfully
 *       404:
 *         description: Sub-admin not found
 */
router.put("/sub-admin/:id", adminOnly, async (req, res) => {
    try {
        const { name, email, permissions } = req.body;

        const subAdmin = await User.findOneAndUpdate(
            { _id: req.params.id, role: "sub-admin" },
            {
                $set: {
                    name: name,
                    email: email,
                    permissions: permissions,
                },
            },
            { new: true, runValidators: true }
        ).select("-password");

        if (!subAdmin) {
            return res.status(404).json({ message: "Sub-admin not found" });
        }

        res.status(200).json({
            message: "Sub-admin updated successfully",
            subAdmin,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete sub-admin (admin only)
/**
 * @swagger
 * /admin/sub-admin/{id}:
 *   delete:
 *     summary: Delete a sub-admin by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Sub-admin ID
 *     responses:
 *       200:
 *         description: Sub-admin deleted successfully
 *       404:
 *         description: Sub-admin not found
 */
router.delete("/sub-admin/:id", adminOnly, async (req, res) => {
    try {
        const subAdmin = await User.findOneAndDelete({
            _id: req.params.id,
            role: "sub-admin",
        });

        if (!subAdmin) {
            return res.status(404).json({ message: "Sub-admin not found" });
        }

        res.status(200).json({ message: "Sub-admin deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
