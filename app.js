import "dotenv/config";
import express from "express";
import connectWithRetry from "./db/mongoose-connection.js";
import resultRouter from "./routes/result.router.js";
import cors from "cors";
const app = express();
connectWithRetry();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use("/", resultRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log("Result microservice running on port 3000");
});
