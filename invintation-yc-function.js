/**
 * Yandex Cloud Function: RSVP + выбор горячего через Telegram Bot API.
 * Переменные окружения: BOT_TOKEN и CHAT_ID.
 */

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function jsonp(callback, payload) {
    var safeCallback = /^[a-zA-Z_$][\w$]*$/.test(callback || '') ? callback : 'callback';
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'no-store'
        },
        body: safeCallback + '(' + JSON.stringify(payload) + ')'
    };
}

function formatDate() {
    return new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Europe/Moscow',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date());
}

function formatMenuMessage(guests) {
    var rows = guests.map(function (guest, index) {
        return (index + 1) + '. <b>' + escapeHtml(guest.name) + '</b> — ' + escapeHtml(guest.dish);
    });

    return [
        '🍽 <b>Выбор горячего</b>',
        '',
        rows.join('\n'),
        '',
        '🕐 ' + formatDate()
    ].join('\n');
}

function formatRsvpMessage(params) {
    var status = params.status === 'yes' ? '✅ Буду' : params.status === 'no' ? '❌ Не смогу' : 'Не указан';
    var lines = [
        '🎉 <b>Новый ответ на приглашение!</b>',
        '',
        '👤 Имя: ' + escapeHtml(params.name || ''),
        '📋 Статус: ' + status
    ];

    if (params.comment) lines.push('💬 Комментарий: ' + escapeHtml(params.comment));
    lines.push('', '🕐 ' + formatDate());
    return lines.join('\n');
}

async function sendTelegram(text) {
    var token = process.env.BOT_TOKEN;
    var chatId = process.env.CHAT_ID;
    if (!token || !chatId) throw new Error('Telegram environment variables are missing');

    var response = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
    });

    if (!response.ok) throw new Error('Telegram API error');
}

module.exports.handler = async function (event) {
    var params = event.queryStringParameters || {};
    var callback = params.callback;

    if (params.ping === '1') return jsonp(callback, { success: true, pong: true });

    try {
        var message;

        if (params.type === 'menu') {
            var guests = JSON.parse(params.guests || '[]');
            if (!Array.isArray(guests) || guests.length === 0) {
                return jsonp(callback, { success: false, error: 'Guests are required' });
            }
            if (guests.some(function (guest) { return !guest || !guest.name || !guest.dish; })) {
                return jsonp(callback, { success: false, error: 'Every guest needs a name and dish' });
            }
            message = formatMenuMessage(guests);
        } else {
            if (!params.name) return jsonp(callback, { success: false, error: 'Name is required' });
            message = formatRsvpMessage(params);
        }

        await sendTelegram(message);
        return jsonp(callback, { success: true });
    } catch (error) {
        console.error(error);
        return jsonp(callback, { success: false, error: 'Unable to send message' });
    }
};
