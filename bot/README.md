# anticor-pro-bot

Telegram-бот и HTTP API для приёма заявок с формы на сайте [anticor.pro](https://anticor.pro).

Стек: Node.js (>=22.5) + TypeScript, [grammY](https://grammy.dev), Express, встроенный в Node модуль `node:sqlite`.

## Как это работает

1. Форма на сайте отправляет `POST /api/requests` с полями `name`, `phone`, `car`, `comment`.
2. Заявка сохраняется в SQLite (`requests`), получает порядковый номер и статус `open`.
3. В чат `ADMIN_CHAT_ID` отправляется сообщение с кнопкой «✅ Закрыть».
4. Нажатие кнопки переводит заявку в статус `closed` и обновляет сообщение.
5. Команда `/status` в этом же чате показывает количество открытых и закрытых заявок.
6. Раз в сутки бот удаляет заявки старше `RETENTION_YEARS` лет (по умолчанию 5) — в соответствии со сроком хранения, указанным в политике обработки персональных данных на сайте.

## Настройка

1. Создайте бота у [@BotFather](https://t.me/BotFather), получите `BOT_TOKEN`.
2. Добавьте бота в чат/группу, куда должны приходить заявки, и узнайте её `ADMIN_CHAT_ID` (например, через [@getidsbot](https://t.me/getidsbot)).
3. Скопируйте `.env.example` в `.env` и заполните значения.

```bash
cp .env.example .env
```

## Требования

На сервере нужен Node.js версии 22.5 или новее (используется встроенный модуль `node:sqlite`, без нативной компиляции зависимостей).

## Разработка

```bash
npm install
npm run dev
```

## Деплой на VPS

```bash
npm install
npm run build
```

Запуск через [pm2](https://pm2.keymetrics.io/):

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Reverse proxy (nginx) + HTTPS

Сайт на GitHub Pages обращается к API по отдельному (под)домену, например `bot.anticor.pro`. Нужен nginx с SSL-сертификатом (Let's Encrypt / certbot), проксирующий на `localhost:3000`:

```nginx
server {
    listen 443 ssl;
    server_name bot.anticor.pro;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

После настройки домена укажите его в `ALLOWED_ORIGINS` (домены сайта, с которых разрешены запросы) и в `API_URL` на сайте — см. `index.html`.
