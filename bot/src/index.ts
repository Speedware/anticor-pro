import { config } from "./config";
import { bot } from "./bot";
import { app } from "./server";
import { startRetentionCleanup } from "./cleanup";

bot.start();
startRetentionCleanup();

app.listen(config.port, () => {
  console.log(`API сервер запущен на порту ${config.port}`);
});
