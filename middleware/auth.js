const jwt = require("jsonwebtoken");

// Environment variables (store in .env file)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

// Generate token function
const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

// Verify token middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = { generateToken, verifyToken };
