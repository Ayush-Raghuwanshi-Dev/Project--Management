import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
     await User.deleteMany({});
     console.log("All users deleted");
     process.exit(0);
  });
