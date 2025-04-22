// Role-based middleware
const checkRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        if (req.user.role !== role) {
            return res
                .status(403)
                .json({ message: "Access denied: Insufficient permissions" });
        }

        next();
    };
};

// Permission-based middleware
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        // Admin has all permissions by default
        if (req.user.role === "admin") {
            return next();
        }

        // Check if sub-admin has the specific permission
        if (!req.user.permissions || !req.user.permissions[permission]) {
            return res
                .status(403)
                .json({
                    message: `Access denied: '${permission}' permission required`,
                });
        }

        next();
    };
};

module.exports = { checkRole, checkPermission };
