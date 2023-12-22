import { config } from "dotenv";
import express from "express";
import userRouter from "./routes/userRoute.js";
import userProduct from "./routes/productRoute.js";
import userOrder from "./routes/orderRoute.js";
import userPayment from "./routes/paymentRoutes.js";
import { errorMiddleware } from "./middleware/error.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import morgan from "morgan";
// import { logRequests } from "./middleware/logreqs.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import fakeRoute from "./routes/fakeRoute.js";
import cartRoute from "./routes/cartRoute.js";

export const app = express();

const swaggerDocument = YAML.load("./swagger.yaml");
config({
  path: "./data/config.env",
});
//Using Middleware
app.use(fileUpload());
// app.use(logRequests);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    // origin: ["https://main--celebrated-gingersnap-ce2bea.netlify.app"],
    methods: ["POST", "GET", "PUT"],
    credentials: true,
  })
);
//swaggerUI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Using routes
app.use("/api/v1", userRouter);
app.use("/api/v1", userProduct);
app.use("/api/v1", userOrder);
app.use("/api/v1", userPayment);
app.use("/api/v1", fakeRoute);
app.use("/api/v1", cartRoute);

//Using Error Middileware
app.use(errorMiddleware);
