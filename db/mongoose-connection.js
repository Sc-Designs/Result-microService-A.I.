import mongoose from "mongoose";
import debug from "debug";

const dbgr = debug("development:result");
const link = process.env.MONGO_URI;

// Mongoose Connection_Retry
const connectWithRetry = () => {
  mongoose
    .connect(link, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(async function () {
      dbgr("MongoDB connected ✅");

    })
    .catch(function (err) {
      dbgr("MongoDB connection failed ❌", err);
      setTimeout(connectWithRetry, 5000);
    });
};

export default connectWithRetry;
