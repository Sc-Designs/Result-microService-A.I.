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
app.use("/",(req, res)=>{
  res.send("Health Check");
});
app.use("/api", resultRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
