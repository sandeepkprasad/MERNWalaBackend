const jwt = require("jsonwebtoken");

const JWT = "success";

const fetchUser = (req, res, next) => {
  // Geting authtoken from the header.
  const token = req.header("authtoken");

  // Checking if no token is found.
  if (!token) {
    res.status(401).send({ error: "Invalid Token" });
  }

  try {
    // Checking if requested user is same with the token.
    const data = jwt.verify(token, JWT);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(500).send({ error: "Internal server error." });
  }
};

module.exports = fetchUser;
