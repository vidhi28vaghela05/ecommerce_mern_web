const mongoose = require("mongoose");

const connectToDb = async () => {
  const mongoUri =
    process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ecommerce_pro";

  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

module.exports = connectToDb;
