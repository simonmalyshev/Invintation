(function () {
    'use strict';

    var TELEGRAM_FUNCTION_URL = 'https://functions.yandexcloud.net/d4eeasrjvr6vjid7tkt0';
    var IS_LOCAL_PREVIEW = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '::1';
    var DISHES = [
        'Пшеничная лапша с овощами в соусе наполи',
        'Карбонара с беконом',
        'Фузилли с красной рыбой и икрой кеты',
        'Мальтальяти с томлёной уткой и муссом из пармезана',
        'Орзо с белыми грибами и пармезаном',
        'Мраморная грудинка с трюфельным пюре',
        'Осьминог по-сицилийски с печёным бататом',
        'Томлёная утиная ножка с кремом из печёных яблок',
        'Форель с пюре из брокколи и ананасовой сальсой',
        'Щучьи котлеты с картофельным пюре и трюфельным соусом',
        'Определюсь в ресторане'
    ];

    var form = document.getElementById('menuForm');
    var guestList = document.getElementById('guestList');
    var guestTemplate = document.getElementById('guestTemplate');
    var addGuestButton = document.getElementById('addGuest');
    var submitButton = document.getElementById('submitButton');
    var feedback = document.getElementById('formFeedback');
    var successPanel = document.getElementById('successPanel');
    var successList = document.getElementById('successList');
    var editChoiceButton = document.getElementById('editChoice');

    function initPetals() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var mobileFactor = window.innerWidth <= 480 ? 0.45 : 1;

        function spawn(containerId, count, settings) {
            var container = document.getElementById(containerId);
            var total = Math.max(1, Math.round(count * mobileFactor));

            for (var i = 0; i < total; i++) {
                var petal = document.createElement('span');
                var size = settings.minSize + Math.random() * (settings.maxSize - settings.minSize);
                var duration = settings.minDuration + Math.random() * (settings.maxDuration - settings.minDuration);

                petal.className = 'petal';
                petal.style.width = (size * 0.72) + 'px';
                petal.style.height = size + 'px';
                petal.style.left = (Math.random() * 98) + '%';
                petal.style.setProperty('--duration', duration + 's');
                petal.style.setProperty('--delay', -(Math.random() * duration) + 's');
                petal.style.setProperty('--shade', settings.shade);
                petal.style.setProperty('--opacity', settings.opacity);
                petal.style.setProperty('--drift-a', ((Math.random() - 0.5) * 90) + 'px');
                petal.style.setProperty('--drift-b', ((Math.random() - 0.5) * 130) + 'px');
                petal.style.setProperty('--drift-c', ((Math.random() - 0.5) * 110) + 'px');
                petal.style.setProperty('--drift-d', ((Math.random() - 0.5) * 80) + 'px');
                petal.style.setProperty('--rotate-a', ((Math.random() - 0.5) * 420) + 'deg');
                petal.style.setProperty('--rotate-b', ((Math.random() - 0.5) * 780) + 'deg');
                petal.style.setProperty('--rotate-c', ((Math.random() - 0.5) * 1140) + 'deg');
                petal.style.setProperty('--rotate-d', ((Math.random() - 0.5) * 1500) + 'deg');
                container.appendChild(petal);
            }
        }

        spawn('petalsLarge', 45, { minSize: 18, maxSize: 28, minDuration: 150, maxDuration: 230, shade: 0.17, opacity: 0.38 });
        spawn('petalsMedium', 36, { minSize: 11, maxSize: 17, minDuration: 210, maxDuration: 310, shade: 0.13, opacity: 0.31 });
        spawn('petalsSmall', 28, { minSize: 6, maxSize: 10, minDuration: 280, maxDuration: 390, shade: 0.1, opacity: 0.24 });
    }

    function fillDishSelect(select) {
        DISHES.forEach(function (dish) {
            var option = document.createElement('option');
            option.value = dish;
            option.textContent = dish;
            select.appendChild(option);
        });
    }

    function updateGuestCards() {
        var cards = guestList.querySelectorAll('.guest-card');
        guestList.dataset.count = cards.length;
        cards.forEach(function (card, index) {
            var number = index + 1;
            var nameInput = card.querySelector('.guest-name');
            var dishSelect = card.querySelector('.guest-dish');
            var nameLabel = card.querySelectorAll('.field label')[0];
            var dishLabel = card.querySelectorAll('.field label')[1];

            card.querySelector('.guest-number').textContent = number;
            nameInput.id = 'guestName' + number;
            dishSelect.id = 'guestDish' + number;
            nameLabel.htmlFor = nameInput.id;
            dishLabel.htmlFor = dishSelect.id;
        });
    }

    function addGuest(focusNewGuest) {
        var fragment = guestTemplate.content.cloneNode(true);
        var card = fragment.querySelector('.guest-card');
        var select = card.querySelector('.guest-dish');
        fillDishSelect(select);
        guestList.appendChild(fragment);
        updateGuestCards();

        if (focusNewGuest) {
            guestList.lastElementChild.querySelector('.guest-name').focus();
        }
    }

    function validateField(control) {
        var field = control.closest('.field');
        var isValid = control.value.trim() !== '';
        field.classList.toggle('is-invalid', !isValid);
        control.setAttribute('aria-invalid', String(!isValid));
        return isValid;
    }

    function validateForm() {
        var controls = guestList.querySelectorAll('input, select');
        var isValid = true;
        var firstInvalid = null;

        controls.forEach(function (control) {
            if (!validateField(control)) {
                isValid = false;
                firstInvalid = firstInvalid || control;
            }
        });

        if (firstInvalid) firstInvalid.focus();
        return isValid;
    }

    function collectGuests() {
        return Array.from(guestList.querySelectorAll('.guest-card')).map(function (card) {
            return {
                name: card.querySelector('.guest-name').value.trim(),
                dish: card.querySelector('.guest-dish').value
            };
        });
    }

    function showSuccess(guests) {
        successList.textContent = '';
        guests.forEach(function (guest) {
            var item = document.createElement('li');
            var name = document.createElement('strong');
            name.textContent = guest.name + ' — ';
            item.appendChild(name);
            item.appendChild(document.createTextNode(guest.dish));
            successList.appendChild(item);
        });

        form.hidden = true;
        successPanel.hidden = false;
        successPanel.focus({ preventScroll: true });
        successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function setSending(isSending) {
        submitButton.disabled = isSending;
        addGuestButton.disabled = isSending;
        submitButton.textContent = isSending ? 'Отправляем…' : 'Отправить выбор';
    }

    function sendByJsonp(guests) {
        return new Promise(function (resolve, reject) {
            var callbackName = 'menu_jsonp_' + Date.now();
            var script = document.createElement('script');
            var timeoutId;
            var params = new URLSearchParams({
                type: 'menu',
                guests: JSON.stringify(guests),
                callback: callbackName
            });

            function cleanup() {
                clearTimeout(timeoutId);
                delete window[callbackName];
                if (script.parentNode) script.parentNode.removeChild(script);
            }

            window[callbackName] = function (data) {
                cleanup();
                if (data && data.success) resolve(data);
                else reject(new Error(data && data.error ? data.error : 'Request failed'));
            };

            script.onerror = function () {
                cleanup();
                reject(new Error('Network error'));
            };

            timeoutId = setTimeout(function () {
                cleanup();
                reject(new Error('Request timeout'));
            }, 15000);

            script.src = TELEGRAM_FUNCTION_URL + '?' + params.toString();
            document.body.appendChild(script);
        });
    }

    addGuestButton.addEventListener('click', function () {
        addGuest(true);
        feedback.textContent = '';
    });

    guestList.addEventListener('click', function (event) {
        var removeButton = event.target.closest('.guest-card__remove');
        if (!removeButton) return;
        removeButton.closest('.guest-card').remove();
        updateGuestCards();
    });

    guestList.addEventListener('input', function (event) {
        if (event.target.matches('input, select')) validateField(event.target);
        feedback.textContent = '';
    });

    guestList.addEventListener('change', function (event) {
        if (event.target.matches('select')) validateField(event.target);
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        feedback.textContent = '';

        if (!validateForm()) {
            feedback.textContent = 'Пожалуйста, заполните имя и выбор для каждого гостя.';
            return;
        }

        var guests = collectGuests();
        setSending(true);

        var request = IS_LOCAL_PREVIEW
            ? new Promise(function (resolve) { setTimeout(function () { resolve({ success: true }); }, 500); })
            : sendByJsonp(guests);

        request.then(function () {
            showSuccess(guests);
        }).catch(function () {
            feedback.textContent = 'Не удалось отправить выбор. Пожалуйста, попробуйте ещё раз.';
        }).finally(function () {
            setSending(false);
        });
    });

    editChoiceButton.addEventListener('click', function () {
        successPanel.hidden = true;
        form.hidden = false;
        feedback.textContent = '';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    initPetals();
    addGuest(false);
}());
