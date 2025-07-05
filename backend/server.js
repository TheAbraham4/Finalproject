const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");

const db = require("./db");
const connectMongoDB = require("./config/mongodb");

const Reservation = require("./models/reservation");
const BotpressReservation = require("./models/botpressReservation");

const reservationRoutes = require("./routes/reservations");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const botpressReservationsRoutes = require("./routes/botpressReservations");

const { syncUserData } = require("./utils/syncUsers");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectMongoDB();

// Test MySQL connection
const testConnection = async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ MySQL connection successful");
  } catch (error) {
    console.error("❌ MySQL connection error:", error);
    process.exit(1);
  }
};

// Initialize DB Tables
const initDb = async () => {
  try {
    await Reservation.createTable();
    await BotpressReservation.createTable();
    console.log("✅ Database tables initialized");
  } catch (error) {
    console.error("❌ Error initializing database tables:", error);
    process.exit(1);
  }
};

// Run startup DB functions
testConnection();
initDb();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/botpress-reservations", botpressReservationsRoutes);
app.use("/api/admin", adminRoutes);

// Scheduled job to sync user data daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("🔁 Running scheduled user data sync...");
  await syncUserData();
});

// Botpress Webhook Endpoint
app.post("/api/botpress/webhook", async (req, res) => {
  try {
    console.log("🤖 Received Botpress webhook:", JSON.stringify(req.body, null, 2));

    const { type, payload } = req.body;

    if (type === "create_reservation") {
      const reservationData = {
        userId: "botpress",
        email: payload.customer?.email || payload.email || '',
        date: payload.reservation?.date || payload.date,
        time: payload.reservation?.time || payload.time,
        partySize: parseInt(payload.reservation?.partySize || payload.partySize),
        status: "pending"
      };

      if (!reservationData.email || !reservationData.date || !reservationData.time || !reservationData.partySize) {
        return res.status(400).json({ success: false, message: "Missing reservation fields", received: reservationData });
      }

      const reservationId = await Reservation.create(reservationData);

      const botpressReservationData = {
        email: reservationData.email,
        datetime: `${reservationData.date} ${reservationData.time}:00`,
        partySize: reservationData.partySize,
        reservationId,
        status: "pending"
      };

      const botpressReservationId = await BotpressReservation.create(botpressReservationData);

      res.json({
        success: true,
        reservationId,
        botpressReservationId,
        message: "Reservation created successfully",
        data: reservationData
      });
    } else {
      res.status(400).json({ success: false, message: "Unknown webhook type" });
    }
  } catch (error) {
    console.error("❌ Error processing Botpress webhook:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
}).on("error", (err) => {
  console.error("❌ Server failed to start:", err);
});
