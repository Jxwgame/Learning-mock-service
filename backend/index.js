require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const routes = require("./src/routes/index");
const db = require("./src/database/models");
const { initRedis } = require("./src/config/redis");

const requestContext = require("./src/core/middlewares/requestContext");

const app = express();

/* ===================== DB ===================== */
db.sequelize
  .sync({ alter: true })
  .then(() => console.log("Synced db"))
  .catch((err) => console.log("Failed to sync db: " + err.message));

/* ===================== CORS ===================== */
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-Id",
      "X-Device-Id",
    ],
  })
);

/* ===================== Middlewares ===================== */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(requestContext);
app.set("etag", false);

/* ===================== Routes ===================== */
app.get("/", (req, res) => {
  res.json({ message: "API is running." });
});

// Serve uploaded files statically
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

app.use("/api", routes);

/* ===================== Error Handling ===================== */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ ok: false, error: "INVALID_JSON" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  let status = err.status || 500;
  if (typeof status !== "number") {
    console.error("Invalid status code:", status);
    status = 500;
  }
  const message = err.message || "INTERNAL_SERVER_ERROR";

  res.header("Access-Control-Allow-Origin", FRONTEND_URL);
  res.header("Access-Control-Allow-Credentials", "true");

  if (process.env.NODE_ENV !== "production") console.error(err);
  res.status(status).json({ ok: false, error: message });
});

/* ===================== Start Server ===================== */
async function start() {
  try {
    if (typeof initRedis === "function") await initRedis();
    const PORT = process.env.PORT;
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (e) {
    console.error("Failed to start server:", e);
    process.exit(1);
  }
}

start();
module.exports = app;
