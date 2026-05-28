# Настройка Telegram для формы RSVP (через Cloudflare Worker)

> ⚠️ **Эта инструкция заменяет `GOOGLE_SHEETS_SETUP.md`** — Google Sheets больше не используется.
> Форма отправляет данные в Telegram через Cloudflare Worker. Токен бота хранится
> в переменных окружения Worker-а и **не попадает в публичный GitHub-репозиторий**.

---

## Шаг 1: Создать Telegram бота и получить токен

1. Откройте Telegram, найдите [`@BotFather`](https://t.me/BotFather)
2. Отправьте команду: `/newbot`
3. Введите название бота, например: `InvintationRSVPBot`
4. Введите username бота, например: `InvintationRSVPBot` (должен заканчиваться на `bot`)
5. `@BotFather` пришлёт токен — **сохраните его**, он выглядит так:
   ```
   1234567890:AAF1BcC..._example_token
   ```
6. Отправьте боту **любое сообщение** (просто напишите `/start` или "привет")
7. Откройте в браузере ссылку (замените `<TOKEN>` на ваш токен):
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
8. Найдите в ответе `"chat":{"id":123456789}` — это **CHAT_ID**. Сохраните его.
   Если ответ `{"ok":true,"result":[]}` — значит боту ещё не писали, отправьте ещё одно сообщение и обновите страницу.

**Результат**: у вас есть `BOT_TOKEN` и `CHAT_ID`.

---

## Шаг 2: Создать и развернуть Cloudflare Worker

1. Зарегистрируйтесь/войдите в [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Перейдите в раздел **Workers & Pages**
3. Нажмите **Create application** → **Create Worker**
4. Дайте имя, например: `invintation-rsvp`
5. **Удалите** весь код-заглушку и **вставьте** код из файла [`E:\AI\invintation-telegram-worker.js`](E:\AI\invintation-telegram-worker.js)
6. Нажмите **Save and Deploy**

### Установить переменные окружения

1. В дашборде Worker-а перейдите на вкладку **Settings** → **Variables**
2. В разделе **Environment Variables** нажмите **Add variable**
3. Добавьте две переменные:

   | Имя | Значение |
   |-----|----------|
   | `BOT_TOKEN` | ваш токен от @BotFather |
   | `CHAT_ID` | ID чата из Шага 1 |

4. Напротив каждой отметьте **Encrypt** (зашифровать)
5. Нажмите **Save**

### Получить URL Worker-а

1. Перейдите на вкладку **Preview** (или вернитесь в **Workers & Pages** → ваш Worker)
2. URL выглядит как: `https://invintation-rsvp.YOUR_USERNAME.workers.dev`
3. **Скопируйте его** — он понадобится на следующем шаге

---

## Шаг 3: Вставить URL Worker-а в script.js

1. Откройте [`script.js`](script.js)
2. Найдите строку с `var TELEGRAM_WORKER_URL = '...';`
3. Замените `https://invintation-rsvp.YOUR_USERNAME.workers.dev` на ваш скопированный URL
4. Сохраните файл и выполните commit + push в GitHub

---

## Шаг 4: Проверить

1. Откройте сайт в браузере
2. Заполните форму (имя, статус, комментарий) и нажмите "Отправить"
3. Должно появиться зелёное сообщение об успехе
4. Проверьте Telegram — должно прийти сообщение вида:
   ```
   🎉 Новый ответ на приглашение!

   👤 Имя: Иван
   📋 Статус: ✅ Буду
   💬 Комментарий: С нетерпением жду!

   🕐 28.05.2026, 11:30
   ```

---

## Если не работает

**Worker не отвечает (ошибка соединения):**
- Проверьте, что Worker развёрнут (URL открывается в браузере — должен вернуть пустой JSONP-ответ `callback({"success":false,"error":"Name is required"})`)
- Проверьте, что в URL нет опечаток

**Сообщение не приходит в Telegram:**
- Проверьте переменные окружения в Cloudflare Dashboard (Settings → Variables)
- Убедитесь, что `CHAT_ID` — число (без кавычек)
- Ещё раз откройте `https://api.telegram.org/bot<TOKEN>/getUpdates` — проверьте, что боту писали

**Ошибка "Telegram API error":**
- Проверьте, что `BOT_TOKEN` правильный
- Проверьте, что `CHAT_ID` правильный (можно написать боту ещё раз и перепроверить)
