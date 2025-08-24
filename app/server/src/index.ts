import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import { errorMiddleware, notFoundMiddleware } from "./middlewares/error";
import authRouter from "./routes/auth";
import propertiesRouter from "./routes/properties";
import bookingsRouter from "./routes/bookings";
import exchangeRouter from "./routes/exchange";
import adminRouter from "./routes/admin";
import { initBot } from "./telegram/bot";

const app = express();

app.set("trust proxy", true);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/exchange", exchangeRouter);
app.use("/api/admin", adminRouter);

// Serve client
const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = Number(process.env.PORT || 3000);
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`[server] listening at http://${HOST}:${PORT}`);
});

initBot().catch((e) => console.error("Bot init error:", e));