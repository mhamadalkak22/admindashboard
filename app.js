const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const auth = require("./middleware/auth");

// Load env vars
require("dotenv").config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mount routers
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const bookingRoutes = require("./routes/bookings");
const reportRoutes = require("./routes/reports");
const accountRecoveryRoutes = require("./routes/accountRecovery");
const blogRoutes = require("./routes/blogs");
const feedbackRoutes = require("./routes/feedback");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/account-recovery", accountRecoveryRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/feedback", feedbackRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
