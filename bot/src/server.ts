import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { config } from "./config";
import { createRequest } from "./db";
import { sendRequestNotification } from "./bot";

const requestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(5).max(30),
  car: z.string().trim().min(1).max(150),
  comment: z.string().trim().max(1000).optional().default(""),
  website: z.string().max(200).optional().default(""),
});

export const app = express();

app.use(express.json({ limit: "20kb" }));
app.use(
  cors({
    origin: config.allowedOrigins.length > 0 ? config.allowedOrigins : false,
  })
);

const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/requests", formLimiter, async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ ok: false, error: "invalid_data" });
    return;
  }

  // Поле-приманка для ботов: если заполнено, тихо отвечаем «успехом»
  if (parsed.data.website) {
    res.json({ ok: true });
    return;
  }

  const request = createRequest({
    name: parsed.data.name,
    phone: parsed.data.phone,
    car: parsed.data.car,
    comment: parsed.data.comment || null,
  });

  try {
    await sendRequestNotification(request);
  } catch (error) {
    console.error("Не удалось отправить уведомление в Telegram:", error);
  }

  res.json({ ok: true });
});
