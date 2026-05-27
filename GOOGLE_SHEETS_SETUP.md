# Настройка Google Sheets для формы RSVP

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
3. Скопируйте туда этот код:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const name = e.parameter.name || '';
    const status = e.parameter.status || '';
    const comment = e.parameter.comment || '';

    sheet.appendRow([
      new Date(),       // A: Timestamp
      name,             // B: Имя
      status,           // C: Статус (yes/no)
      comment           // D: Комментарий
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Нажмите **Save** (дискета) и назовите проект, например `RSVP Form`

## Шаг 3: Разверните как веб-приложение

1. В редакторе скриптов нажмите **Deploy** (синяя кнопка) → **New deployment**
2. В поле **Select type** выберите **Web app**
3. Настройки:
   - **Description**: `RSVP form receiver`
   - **Execute as**: `Me` (ваш email)
   - **Who has access**: `Anyone` (или `Anyone with link`)
4. Нажмите **Deploy**
5. **ВАЖНО**: Скопируйте URL веб-приложения (выглядит как `https://script.google.com/macros/s/.../exec`)
6. Нажмите **Done**

## Шаг 4: Вставьте URL в script.js

1. Откройте [`script.js`](script.js)
2. Найдите строку с `const APPS_SCRIPT_URL = '...';`
3. Вставьте скопированный URL между кавычками

## Шаг 5: Проверьте

1. Откройте сайт в браузере
2. Заполните форму и нажмите "Отправить"
3. Должно появиться зелёное сообщение об успехе
4. Откройте Google Sheets — данные должны появиться в таблице

---

## Если не работает

**Ошибка CORS (проверка в браузере):**
- Убедитесь, что веб-приложение развёрнуто с доступом `Anyone`
- Попробуйте открыть URL веб-приложения в браузере — должно вернуть `{"status":"ok"}`
- Если после деплоя меняли скрипт — нужно сделать **Deploy → New deployment** заново

**Нет данных в таблице:**
- Проверьте, что в строке 1 есть заголовки `Timestamp`, `Имя`, `Статус`, `Комментарий`
- Откройте редактор скриптов → **Executions** — там видно ошибки выполнения
