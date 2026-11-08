import { Bot, InlineKeyboard } from "grammy";
import { config } from "./config";
import {
  closeRequest,
  countByStatus,
  getRequest,
  setTelegramMessage,
  type RequestRow,
} from "./db";
import {
  formatClosedMessage,
  formatRequestMessage,
  formatStatusMessage,
} from "./format";

export const bot = new Bot(config.botToken);

function isAdminChat(chatId: number | string): boolean {
  return String(chatId) === config.adminChatId;
}

function closeKeyboard(requestId: number): InlineKeyboard {
  return new InlineKeyboard().text("✅ Закрыть", `close:${requestId}`);
}

export async function sendRequestNotification(request: RequestRow) {
  const message = await bot.api.sendMessage(
    config.adminChatId,
    formatRequestMessage(request),
    { reply_markup: closeKeyboard(request.id) }
  );
  setTelegramMessage(request.id, String(message.chat.id), message.message_id);
}

bot.command("status", async (ctx) => {
  if (!ctx.chat || !isAdminChat(ctx.chat.id)) return;
  const counts = countByStatus();
  await ctx.reply(formatStatusMessage(counts));
});

bot.callbackQuery(/^close:(\d+)$/, async (ctx) => {
  if (!ctx.chat || !isAdminChat(ctx.chat.id)) {
    await ctx.answerCallbackQuery();
    return;
  }

  const id = Number(ctx.match[1]);
  const existing = getRequest(id);

  if (!existing) {
    await ctx.answerCallbackQuery({ text: "Заявка не найдена" });
    return;
  }

  if (existing.status === "closed") {
    await ctx.answerCallbackQuery({ text: "Заявка уже закрыта" });
    return;
  }

  const closed = closeRequest(id)!;
  await ctx.editMessageText(formatClosedMessage(closed));
  await ctx.answerCallbackQuery({ text: "Заявка закрыта" });
});
