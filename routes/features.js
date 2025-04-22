const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { checkPermission } = require("../middleware/rbac");

// Dashboard route - requires dashboard permission
/**
 * @swagger
 * tags:
 *   name: Features
 *   description: Feature endpoints (role/permission-based)
 */

/**
 * @swagger
 * /features/dashboard:
 *   get:
 *     summary: Access dashboard (requires dashboard permission)
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *       403:
 *         description: Access denied
 */
router.get(
    "/dashboard",
    [verifyToken, checkPermission("dashboard")],
    (req, res) => {
        res.status(200).json({
            message: "Dashboard data retrieved successfully",
            data: {
                // Dashboard data here
                stats: {
                    users: 120,
                    colleges: 45,
                    activities: 890,
                },
            },
        });
    }
);

// College management route - requires collegeManagement permission
/**
 * @swagger
 * /features/colleges:
 *   get:
 *     summary: Access college management section (requires collegeManagement permission)
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: College management data
 *       403:
 *         description: Access denied
 */
router.get(
    "/colleges",
    [verifyToken, checkPermission("collegeManagement")],
    (req, res) => {
        res.status(200).json({
            message: "College data retrieved successfully",
            data: {
                // College data here
                colleges: [
                    { id: 1, name: "Example College", students: 1200 },
                    { id: 2, name: "Sample University", students: 3500 },
                ],
            },
        });
    }
);

// Content editing route - requires contentEditing permission
/**
 * @swagger
 * /features/content:
 *   post:
 *     summary: Edit content (requires contentEditing permission)
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: Some updated content here.
 *     responses:
 *       200:
 *         description: Content updated successfully
 *       403:
 *         description: Access denied
 */
router.post(
    "/content",
    [verifyToken, checkPermission("contentEditing")],
    (req, res) => {
        // Logic to save content
        res.status(200).json({
            message: "Content updated successfully",
        });
    }
);

// Data view route - requires viewData permission
/**
 * @swagger
 * /features/data:
 *   get:
 *     summary: View specific data (requires viewData permission)
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data retrieved successfully
 *       403:
 *         description: Access denied
 */
router.get("/data", [verifyToken, checkPermission("viewData")], (req, res) => {
    res.status(200).json({
        message: "Data retrieved successfully",
        data: {
            // Some sensitive data
        },
    });
});

module.exports = router;
