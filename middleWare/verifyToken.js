const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.Secret_Key, (error, result) => {
    if (!error) {
      req.uid = result.uid;
      next();
    } else {
      return res
        .status(401)
        .json({ message: "Unauthorized or don't have access " });
    }
  });
};

module.exports = { verifyToken };
