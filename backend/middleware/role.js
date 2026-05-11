const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json("Not authorized");
  }

  if (req.user.role !== "admin") {
    return res.status(403).json("Admin only");
  }

  next();
};

export default verifyAdmin;