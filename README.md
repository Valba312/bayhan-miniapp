# Bayhan – Telegram Mini-App (WebApp)

Мини‑приложение в Telegram для владельцев долей недвижимости: бронирования недель, обмены, уведомления, история.

## Быстрый старт (Replit)
1. Создайте `.env` из `.env.example` и заполните `BOT_TOKEN`, `SESSION_SECRET`.
2. Нажмите **Run**. Скрипт:
   - соберёт фронт (`/app/client`),
   - применит схему (`prisma db push`) и сид (`prisma db seed`),
   - запустит Express‑сервер, который отдаёт API и статический фронт.

## Dev без Telegram
- Можно указать `DEV_TG_USER_ID` (например `1001`) — для локальной отладки.

## Скрипты
- `npm run build` — билд фронта и сервера.
- `npm start` — запуск prod‑сервера (отдаёт `/client/dist`).
- `npm run dev` — параллельно Vite + сервер.
- `npm test` — Vitest (HMAC initData, создание заявки).

## API (основное)
- `POST /api/auth/telegram` — HMAC‑проверка initData и JWT.
- `GET /api/auth/verify` — проверка токена.
- `POST /api/auth/dev` — dev‑JWT (если разрешено).
- `GET /api/properties`
- `GET /api/properties/:id/slots?from&to`
- `POST /api/bookings/:slotId/request`
- `GET /api/bookings/history?type=bookings|exchanges`
- `GET/PATCH /api/bookings/profile`
- `GET /api/exchange/search`
- `POST /api/exchange/request`
- `POST /api/exchange/:id/accept|decline`
- Admin: `/api/admin/*`

## Очередность
После подтверждения владелец уходит в конец очереди. Для праздничных недель — отдельная очередь.

## Уведомления
Бот сохраняет `chat_id` по `/start`, сервис уведомлений рассылает события.