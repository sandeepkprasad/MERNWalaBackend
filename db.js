const mongoose = require("mongoose");

const URI =
  "mongodb+srv://sandeepkprasad:success2022@mycluster.s12lxcc.mongodb.net/?retryWrites=true&w=majority";

const connectDB = () => {
  mongoose.connect(URI);
};

module.exports = connectDB;
