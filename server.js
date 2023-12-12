/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");

// Dependancies
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss")

dotenv.config({ path: "config.env" });

const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");

const mountRoutes = require("./routes");
const { webhookCheckout } = require("./services/orderService");

// connect to the DB
dbConnection();

// Express App
const app = express();

// Enable other domains to access your application
app.use(cors());
app.options("*", cors());

// compress all responses
app.use(compression());

// Checkout webhook
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

// Middlewares
app.use(express.json({ limit: "20kb" })); // parsing to json , limit to prevent large requests to not assume the server
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// To apply data sanitization 
app.use(mongoSanitize()); // no sql query injection
app.use(xss())            // no harming scripting

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message:
    "Too many accounts created from this IP, please try again after 1 hour",
});

// Apply the rate limiting middleware to all requests.
app.use("/api", limiter);

// Middleware to protect against http parameter pollution attacks
app.use(
  hpp({
    whitelist: ["price", "rating", "ratingsQuantity", "sold", "ratingsAverage"],
  })
);

// Mount Routes
mountRoutes(app);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global Errors Handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App Running on PORT ${PORT}`);
});

// @desc    Handling rejection outside Express
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log("Shutting Down Server......");
    process.exit(1);
  });
});
