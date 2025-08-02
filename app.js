import "dotenv/config";
import express from "express";
import connectWithRetry from "./db/mongoose-connection.js";
import { Result } from "./models/result.model.js";
import {subscribeToQueue } from "./services/rabbit.service.js";
import { rpcReply } from "./utils/rpcReply.js"; 

const app = express();
connectWithRetry();

subscribeToQueue("get-result", async (data, msg) => {
  try {
    const start = Date.now();
    const results = await Result.find({ user: data.id }).lean()
    console.log("Query time:", Date.now() - start);

    const resultArr = results.map((item) => ({
      id: item._id,
      testName: item.testName,
      score: item.score,
    }));

    console.log("✅ Sending result:", resultArr);
    await rpcReply(
      resultArr,
      msg.properties.replyTo,
      msg.properties.correlationId
    );
  } catch (err) {
    console.error("Error in get-result subscriber:", err);
    await rpcReply(
      { error: "Internal server error" },
      msg.properties.replyTo,
      msg.properties.correlationId
    );
  }
});


app.listen(3005, () => {
  console.log("Result microservice running on port 3005");
});
