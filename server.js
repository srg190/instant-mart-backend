import { app } from "./app.js";
import mongoose from "mongoose";
// import { connectDB } from "./data/database.js";
import cloudinary from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// connectDB().then(() => {
//   app.listen(process.env.PORT || 5000, () => {
//     console.log(`Server is running on port:${process.env.PORT}`);
//   });
// });

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "Insta-Mart",
    })
    .then((c) => console.log(`connected with ${c.connection.host}`))
    .then(() => {
      app.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running on port:${process.env.PORT}`);
      });
    })
    .catch((e) => console.log(e));
};

connectDB();
