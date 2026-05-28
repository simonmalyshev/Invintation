# Настройка Telegram для формы RSVP

> ⚠️ **Cloudflare Worker больше НЕ ИСПОЛЬЗУЕТСЯ.**
> Cloudflare массово блокируется в РФ с июня 2025 года (РКН фильтрует IP-адреса Cloudflare).
> Для отправки данных из формы используется **Yandex Cloud Function** (российская инфраструктура).

---

## Инструкция по настройке

➡️ **Перейдите к файлу [`YANDEX_CLOUD_SETUP.md`](YANDEX_CLOUD_SETUP.md)** — там пошаговая инструкция:

1. Создать Telegram бота (Шаг 1)
2. Создать Yandex Cloud Function (Шаг 2)
3. Вставить URL функции в `script.js` (Шаг 3)
4. Проверить (Шаг 4)

---

## Если что-то пошло не так

См. раздел **"Если не работает"** в [`YANDEX_CLOUD_SETUP.md`](YANDEX_CLOUD_SETUP.md).

---

## Для отладки

- Код функции для Yandex Cloud: [`E:\AI\invintation-yc-function.js`](E:\AI\invintation-yc-function.js)
- Старый код Cloudflare Worker: [`E:\AI\invintation-telegram-worker.js`](E:\AI\invintation-telegram-worker.js) (больше не используется)
