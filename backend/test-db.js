import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
     const user = await User.findOne({ email: "51110405490@piemr.edu.in" });
     console.log(user);
     process.exit(0);
  });
