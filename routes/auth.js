const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchUser");

const JWT = "success";

// ROUTE POST 1 : Create a user using POST "api/auth/createuser". No Login Required
router.post(
  "/createuser",
  [
    body("name", "Minimum character should be 5.").isLength({ min: 5 }),
    body("email", "Email not valid").isEmail(),
    body("password", "Minimum character should be 8.").isLength({ min: 8 }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    // Checking if error is there and sending error message.
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, error: errors.array() });
    }

    try {
      // Finding if requested user is already registered by same email.
      let user = await User.findOne({ email: req.body.email });

      // If email is already in database then sending error message.
      if (user) {
        return res
          .status(400)
          .json({ success, error: "Email is already registered." });
      }

      // Hashing the password befor saving in database.
      const salt = await bcrypt.genSalt(10);
      const genPassword = await bcrypt.hash(req.body.password, salt);

      // Saving the user by requested data in the database.
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: genPassword,
      });

      // Getting the user id from database to create jwtData.
      const data = {
        user: {
          id: user.id,
        },
      };

      // Creating the jwtData and sending to client side.
      const jwtData = jwt.sign(data, JWT);
      success = true;
      res.json({ success, jwtData });
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
);

// ROUTE POST 2 : Login a user using POST "/api/auth/login". Login
router.post(
  "/login",
  [
    body("email", "Email not valid.").isEmail(),
    body("password", "Password must be 8 characters.").isLength({ min: 8 }),
  ],
  async (req, res) => {
    let success = false;

    // Checking user input using express-validator.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      // Finding the user by requested email in the database.
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).json({ error: "Invalid Credentials" });
      }

      // Comparing the user input passowrd & database user password using bcrypt.compare.
      const passCompared = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!passCompared) {
        return res.status(400).json({ error: "Invalid Credentials." });
      }

      // Getting user id from the database to create and send jwtData to client side.
      const payload = {
        user: {
          id: user.id,
        },
      };
      const jwtData = jwt.sign(payload, JWT);
      success = true;
      res.json({ success, jwtData });
    } catch (error) {
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE POST 3 : Getting a Logged In user details using "/api/auth/getuser". Login Required.
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    // Getting requested user id.
    const userId = req.user.id;
    // Getting user details from database using the user id.
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

module.exports = router;
