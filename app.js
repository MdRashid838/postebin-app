import 'dotenv/config'; // Shortcut for require("dotenv").config()
import express from 'express';
import connectMongoDB from "./src/utils/connectMongoDB.js"; 
import pasteRoute from './src/routes/pasteRoute.js';
import healthCheckRoute from "./src/routes/healthCheckRoute.js"
import pasteViewRoute from "./src/routes/pasteViewRoute.js"
const app = express();
const port = process.env.PORT || 3000;

// Connect to Database
connectMongoDB();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Pastebin Lite API is running...");
});

app.use("/api", pasteRoute);
app.use("/api", healthCheckRoute);
app.use("/", pasteViewRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});