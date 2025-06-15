const express = require("express");
const app = express();
const { connectdb } = require("./config/database");
const authRouter = require("./routes/authRouter");
// const fileRouter = require('./routes/fileRoutes');
const cors = require("cors");


require('dotenv').config();

app.use(cors(
  {
    origin: "http://localhost:3000", // Adjust this to your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
));

//middleware
app.use(express.json());


//routing
app.use("/", authRouter);
// app.use("/", fileRouter);






connectdb()
  .then(() => {
    console.log("Database connected successfully");

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
