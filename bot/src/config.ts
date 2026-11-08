import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Не задана переменная окружения ${name}`);
  }
  return value;
}

export const config = {
  botToken: required("BOT_TOKEN"),
  adminChatId: required("ADMIN_CHAT_ID"),
  port: Number(process.env.PORT ?? 3000),
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  dbPath: process.env.DB_PATH ?? "./data/requests.sqlite",
  retentionYears: Number(process.env.RETENTION_YEARS ?? 5),
};
