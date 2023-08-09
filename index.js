const express = require("express");
const app = express();
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path"); // Import the 'path' module

// Routes imports
const employeeRoute = require("./routes/employee");
const userRoute = require("./routes/user");
const timeSheetRoute = require("./routes/timesheet");
const timeSheetRoute2 = require("./routes/timesheet2");

// DB connection
mongoose.connect('mongodb+srv://jonnysins2024:0774450965@cluster0.v50bq57.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Db is connected successfully");
  })
  .catch((error) => {
    console.error("DB connection error:", error);
  });

// Middleware
app.use(express.json());

app.use(morgan("common"));
app.use(cors());

// Serve static files from the "uploads" directory
app.use('/uploads', express.static('uploads'));

// Serve the frontend build from the 'Phase1/client/dist' directory
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));


// Custom middleware for Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:8080"] // Add your other allowed domains here
    }
  }
}));

// Initializing routes
app.use("/api/user", userRoute);
app.use("/api/employee", employeeRoute);
app.use("/api/timesheet", timeSheetRoute);
app.use("/api/timesheet2", timeSheetRoute2);

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
