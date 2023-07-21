const connectDB = require("./db.js");
const express = require("express");
const cors = require("cors");

// Calling this function to connect to database.
connectDB();

const app = express();
// Allow to use JSON files.
app.use(express.json());
// Allow to use CORS.
app.use(cors());

const port = 5000;

// Available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/contacts", require("./routes/contacts"));

app.listen(port, () => {
  console.log(`MERNWALA is connected on port : ${port}`);
});
