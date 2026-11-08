import type { RequestRow } from "./db";

export function formatRequestMessage(request: RequestRow): string {
  return [
    `Заявка №${request.id}`,
    "",
    `Клиент: ${request.name}`,
    "",
    `Телефон: ${request.phone}`,
    "",
    `Авто: ${request.car}`,
    "",
    `Комментарий: ${request.comment || "—"}`,
  ].join("\n");
}

export function formatClosedMessage(request: RequestRow): string {
  return `${formatRequestMessage(request)}\n\n✅ Заявка закрыта`;
}

export function formatStatusMessage(counts: {
  open: number;
  closed: number;
}): string {
  return `Открытых заявок: ${counts.open}\nЗакрытых заявок: ${counts.closed}`;
}
