require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectToDb = require("./config/db");
const apiRouter = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5000";
const frontendPath = path.join(__dirname, "..", "frontend");

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(frontendPath));

app.get("/", (_req, res) => {
  res.json({
    message: "E-commerce API is running.",
    docs: "/api/health",
  });
});

app.use("/api", apiRouter);

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(frontendPath, "admin.html"));
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.method !== "GET") {
    return next();
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong.",
  });
});

const startServer = async () => {
  try {
    await connectToDb();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
