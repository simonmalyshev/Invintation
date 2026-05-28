# ❌ УСТАРЕЛО — больше не используется

> **Форма RSVP теперь отправляет данные в Telegram, а не в Google Sheets.**
> См. [`TELEGRAM_SETUP.md`](TELEGRAM_SETUP.md) для новой инструкции.
> Этот файл оставлен для истории и может быть удалён.

# (Архив) Настройка Google Sheets для формы RSVP (JSONP)

## Шаг 1: Создайте Google Sheets таблицу

1. Откройте [Google Sheets](https://sheets.google.com)
2. Создайте новую таблицу
3. Назовите её, например, "RSVP — Семен и Анастасия"
4. В первой строке (заголовки) напишите:
   - A1: `Timestamp`
   - B1: `Имя`
   - C1: `Статус`
   - D1: `Комментарий`

## Шаг 2: Откройте редактор скриптов

1. В меню **Extensions (Расширения)** → **Apps Script**
2. Откроется редактор с файлом `Code.gs`
3. **Удалите старый код** и скопируйте туда этот (**ВАЖНО: используем `doGet` с JSONP**):

```javascript
/**
 * Обработка GET-запроса (JSONP).
 * Google Apps Script не отдаёт CORS-заголовки для POST/fetch,
 * поэтому используем JSONP — единственный надёжный способ из браузера.
 *
 * Параметры запроса (query string):
 *   name     — имя гостя
 *   status   — статус (yes/no)
 *   comment  — комментарий
 *   callback — имя функции для JSONP (обязателен)
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const name = e.parameter.name || '';
    const status = e.parameter.status || '';
    const comment = e.parameter.comment || '';
    const callback = e.parameter.callback || 'callback';

    // Добавляем строку в таблицу
    sheet.appendRow([
      new Date(),       // A: Timestamp
      name,             // B: Имя
      status,           // C: Статус (yes/no/пусто)
      comment           // D: Комментарий
    ]);

    // Возвращаем JSONP-ответ: callbackName({"success": true})
    const result = JSON.stringify({ success: true });
    return ContentService
      .createTextOutput(callback + '(' + result + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (error) {
    const result = JSON.stringify({ success: false, error: error.toString() });
    return ContentService
      .createTextOutput(callback + '(' + result + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

/**
 * POST тоже поддерживается (на случай тестов через curl и т.п.)
 */
function doPost(e) {
  return doGet(e);
}
```

4. Нажмите **Save** (дискета) и назовите проект, например `RSVP Form`

## Шаг 3: Разверните НОВОЕ веб-приложение

> ⚠️ **ВАЖНО**: Нужно сделать именно **New deployment**, а не редактировать старый.

1. В редакторе скриптов нажмите **Deploy** (синяя кнопка) → **New deployment**
2. В поле **Select type** выберите **Web app**
3. Настройки:
   - **Description**: `RSVP form receiver v2 (JSONP)`
   - **Execute as**: `Me` (ваш email)
   - **Who has access**: `Anyone`
4. Нажмите **Deploy**
5. **Разрешите доступ**: появится окно с запросом разрешений — нажмите **Review permissions** → выберите свой аккаунт → **Allow** (это обязательный шаг при первом деплое)
6. Скопируйте URL веб-приложения (выглядит как `https://script.google.com/macros/s/.../exec`)
7. Нажмите **Done**

## Шаг 4: Вставьте НОВЫЙ URL в script.js

1. Откройте [`script.js`](script.js)
2. Найдите строку с `var APPS_SCRIPT_URL = '...';`
3. Замените URL на новый скопированный
4. Сохраните файл

## Шаг 5: Проверьте

1. Откройте сайт в браузере (локально или на GitHub Pages)
2. Заполните форму и нажмите "Отправить"
3. Должно появиться зелёное сообщение об успехе
4. Откройте Google Sheets — данные должны появиться в таблице

---

## Если не работает

**Ошибка соединения:**
- Убедитесь, что сделали **New deployment** (не редактировали старый)
- Проверьте, что в настройках деплоя стоит **Execute as: Me** и **Who has access: Anyone**
- Откройте URL в браузере — должен вернуться `{"status":"ok"}` (без параметров) или `callback({"success":true})` (с `?callback=test`)

**Нет данных в таблице:**
- Проверьте, что в строке 1 есть заголовки `Timestamp`, `Имя`, `Статус`, `Комментарий`
- Откройте редактор скриптов → **Executions** — там видно ошибки выполнения
- Убедитесь, что таблица активна (открыт нужный лист)
