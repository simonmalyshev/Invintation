        (function() {
            'use strict';

            /* --------------------------------------------------
               1. INTERSECTION OBSERVER — Scroll Animations
               -------------------------------------------------- */
            function initAnimations() {
                var elements = document.querySelectorAll('.anim-paused');

                if ('IntersectionObserver' in window) {
                    var observer = new IntersectionObserver(function(entries) {
                        entries.forEach(function(entry) {
                            if (entry.isIntersecting) {
                                // Анимация запускается — убираем paused
                                entry.target.classList.remove('anim-paused');
                                observer.unobserve(entry.target);
                            }
                        });
                    }, {
                        threshold: 0.1,
                        rootMargin: '0px 0px -50px 0px'
                    });

                    elements.forEach(function(el) {
                        observer.observe(el);
                    });
                } else {
                    // Fallback: show all immediately
                    elements.forEach(function(el) {
                        el.classList.remove('anim-paused');
                    });
                }
            }

            /* --------------------------------------------------
               2. CALENDAR WIDGET — August 2026
               -------------------------------------------------- */
            function initCalendar() {
                var calGrid = document.getElementById('calGrid');
                var calTitle = document.getElementById('calTitle');
                var calPrev = document.getElementById('calPrev');
                var calNext = document.getElementById('calNext');

                // Wedding date: August 13, 2026
                var weddingMonth = 7; // 0-indexed: August = 7
                var weddingYear = 2026;
                var weddingDay = 6;

                var currentMonth = weddingMonth;
                var currentYear = weddingYear;

                var monthNames = [
                    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
                ];

                function renderCalendar(month, year) {
                    // Clear existing (keep header row)
                    var dayNames = calGrid.querySelectorAll('.calendar-month__day-name');
                    calGrid.innerHTML = '';
                    dayNames.forEach(function(dn) { calGrid.appendChild(dn); });

                    // Set title
                    calTitle.textContent = monthNames[month] + ' ' + year;

                    // First day of month (0=Sun, 1=Mon, ... 6=Sat)
                    var firstDay = new Date(year, month, 1).getDay();
                    // Convert to Mon=0 ... Sun=6
                    var startOffset = (firstDay === 0) ? 6 : firstDay - 1;

                    // Days in month
                    var daysInMonth = new Date(year, month + 1, 0).getDate();
                    // Days in previous month (for leading cells)
                    var daysInPrev = new Date(year, month, 0).getDate();

                    // Leading cells from previous month
                    for (var i = startOffset - 1; i >= 0; i--) {
                        var prevDay = daysInPrev - i;
                        var span = document.createElement('span');
                        span.className = 'calendar-month__day calendar-month__day--other';
                        span.textContent = prevDay;
                        calGrid.appendChild(span);
                    }

                    // Current month days
                    for (var d = 1; d <= daysInMonth; d++) {
                        var span = document.createElement('span');
                        span.className = 'calendar-month__day';
                        span.textContent = d;

                        if (d === weddingDay && month === weddingMonth && year === weddingYear) {
                            span.className += ' calendar-month__day--highlight';
                        }

                        calGrid.appendChild(span);
                    }

                    // Trailing cells for next month
                    var totalCells = startOffset + daysInMonth;
                    var remainder = totalCells % 7;
                    if (remainder > 0) {
                        var trailing = 7 - remainder;
                        for (var t = 1; t <= trailing; t++) {
                            var span = document.createElement('span');
                            span.className = 'calendar-month__day calendar-month__day--other';
                            span.textContent = t;
                            calGrid.appendChild(span);
                        }
                    }
                }

                calPrev.addEventListener('click', function() {
                    currentMonth--;
                    if (currentMonth < 0) {
                        currentMonth = 11;
                        currentYear--;
                    }
                    renderCalendar(currentMonth, currentYear);
                });

                calNext.addEventListener('click', function() {
                    currentMonth++;
                    if (currentMonth > 11) {
                        currentMonth = 0;
                        currentYear++;
                    }
                    renderCalendar(currentMonth, currentYear);
                });

                // Initial render
                renderCalendar(currentMonth, currentYear);
            }

            /* --------------------------------------------------
               3. FORM HANDLING — отправка в Telegram
               -------------------------------------------------- */

            // ⚠️ ВСТАВЬТЕ СЮДА URL вашей Yandex Cloud Function.
            // Инструкция: YANDEX_CLOUD_SETUP.md (Шаг 2)
            // Функция проксирует JSONP-запрос → Telegram Bot API.
            // Cloudflare Worker больше НЕ ИСПОЛЬЗУЕТСЯ — Cloudflare блокируется в РФ.
            // Токен бота хранится в переменных окружения функции, не в коде.
            var TELEGRAM_WORKER_URL = 'https://functions.yandexcloud.net/d4eeasrjvr6vjid7tkt0';

            function initForm() {
                var form = document.getElementById('rsvpForm');
                var feedback = document.getElementById('formFeedback');

                if (!form) return;

                form.addEventListener('submit', function(e) {
                    e.preventDefault();

                    // Collect data
                    var name = document.getElementById('guestName').value.trim();
                    var statusEl = form.querySelector('input[name="status"]:checked');
                    var comment = document.getElementById('guestComment').value.trim();

                    if (!name) {
                        feedback.textContent = 'Пожалуйста, введите ваше имя.';
                        feedback.style.display = 'block';
                        feedback.style.color = '#c00';
                        return;
                    }

                    // Проверка, вставил ли пользователь реальный URL
                    if (TELEGRAM_WORKER_URL.indexOf('ВАШ_ИДЕНТИФИКАТОР') !== -1) {
                        feedback.textContent = 'Ошибка: не настроен URL Yandex Cloud Function. См. YANDEX_CLOUD_SETUP.md';
                        feedback.style.display = 'block';
                        feedback.style.color = '#c00';
                        return;
                    }

                    var statusValue = statusEl ? statusEl.value : '';
                    var statusText = statusEl ? (statusEl.value === 'yes' ? 'буду' : 'не смогу') : 'не указано';

                    // Показываем "отправка..."
                    feedback.textContent = 'Отправка...';
                    feedback.style.color = '#555';
                    feedback.style.display = 'block';

                    // JSONP — единственный надёжный способ обойти CORS у Google Apps Script.
                    // Создаём динамический <script> с callback, скрипт вызывает функцию когда ответ придёт.
                    var callbackName = 'jsonp_cb_' + Date.now();
                    var params = new URLSearchParams();
                    params.append('name', name);
                    params.append('status', statusValue);
                    params.append('comment', comment);
                    params.append('callback', callbackName);

                    // Создаём временную глобальную callback-функцию
                    window[callbackName] = function(data) {
                        // Убираем за собой
                        delete window[callbackName];
                        var scriptEl = document.getElementById(callbackName);
                        if (scriptEl) scriptEl.parentNode.removeChild(scriptEl);

                        if (data.success) {
                            feedback.style.color = '#2a7d2a';
                            feedback.textContent = name + ', спасибо за ответ!';
                            if (comment) {
                                feedback.textContent += ' Комментарий получен.';
                            }
                        } else {
                            feedback.style.color = '#c00';
                            feedback.textContent = 'Ошибка при отправке. Попробуйте ещё раз.';
                        }
                        feedback.style.display = 'block';

                        // Reset form after delay
                        setTimeout(function() {
                            form.reset();
                            setTimeout(function() {
                                feedback.style.display = 'none';
                            }, 3000);
                        }, 2000);
                    };

                    // Создаём <script> элемент — это и есть JSONP-запрос
                    var script = document.createElement('script');
                    script.id = callbackName;
                    script.src = TELEGRAM_WORKER_URL + '?' + params.toString();
                    document.body.appendChild(script);
                });
            }

            /* --------------------------------------------------
               SCROLL INDICATOR — скрыть стрелку при скролле
               -------------------------------------------------- */
            function initScrollIndicator() {
                var indicator = document.getElementById('scrollIndicator');
                if (!indicator) return;

                var hidden = false;

                function hideIndicator() {
                    if (hidden) return;
                    indicator.style.opacity = '0';
                    hidden = true;
                    window.removeEventListener('scroll', onScroll);
                }

                function onScroll() {
                    if (window.scrollY > 10) {
                        hideIndicator();
                    }
                }

                // Показываем через 2 секунды после загрузки
                setTimeout(function() {
                    if (!hidden) {
                        indicator.style.opacity = '1';
                    }
                    // Если пользователь уже проскроллил за эти 2 секунды — скрываем
                    if (window.scrollY > 10) {
                        hideIndicator();
                    }
                }, 2000);

                window.addEventListener('scroll', onScroll, { passive: true });
            }

            /* --------------------------------------------------
               INIT
               -------------------------------------------------- */
            document.addEventListener('DOMContentLoaded', function() {
                // Hero элементы анимируются автоматически (класс anim-fadein без anim-paused)
                initAnimations();
                initCalendar();
                initForm();
                initScrollIndicator();
                initPetals();
            });


            /* --------------------------------------------------
               5. PETALS BACKGROUND вЂ” teardrop spawner
               -------------------------------------------------- */
            function initPetals() {
                function spawnPetals(containerId, count, cfg) {
                    var c = document.getElementById(containerId);
                    for (var i = 0; i < count; i++) {
                        var el = document.createElement('div'); el.className = 'petal';
                        var size = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin);
                        var w = size * 0.72; var h = size;
                        el.style.width = w + 'px'; el.style.height = h + 'px';
                        el.style.left = (Math.random() * 98) + '%';
                        var dark = cfg.darkMin + Math.random() * (cfg.darkMax - cfg.darkMin);
                        var inner = document.createElement('span'); inner.className = 'p-inner';
                        inner.style.cssText = 'width:100%;height:100%;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,'+(dark*0.4)+') 0%,rgba(0,0,0,'+(dark*0.6)+') 40%,rgba(0,0,0,'+dark+') 100%)';
                        el.appendChild(inner);
                        var dx1=(Math.random()-0.5)*100; var dx2=(Math.random()-0.5)*130; var dx3=(Math.random()-0.5)*120; var dx4=(Math.random()-0.5)*110; var dx5=(Math.random()-0.5)*80;
                        el.style.setProperty('--dx1',dx1+'px'); el.style.setProperty('--dx2',dx2+'px'); el.style.setProperty('--dx3',dx3+'px'); el.style.setProperty('--dx4',dx4+'px'); el.style.setProperty('--dx5',dx5+'px');
                        var r1=(Math.random()-0.5)*360; var r2=(Math.random()-0.5)*720; var r3=(Math.random()-0.5)*1080; var r4=(Math.random()-0.5)*1440; var r5=(Math.random()-0.5)*1800;
                        el.style.setProperty('--r1',r1+'deg'); el.style.setProperty('--r2',r2+'deg'); el.style.setProperty('--r3',r3+'deg'); el.style.setProperty('--r4',r4+'deg'); el.style.setProperty('--r5',r5+'deg');
                        var dur=cfg.durMin+Math.random()*(cfg.durMax-cfg.durMin); var delay=Math.random()*cfg.durMax*2;
                        el.style.setProperty('--dur',dur+'s'); el.style.setProperty('--delay',-delay+'s');
                        c.appendChild(el);
                    }
                }
                spawnPetals('petals0',150,{sizeMin:18,sizeMax:28,durMin:270,durMax:440,darkMin:0.15,darkMax:0.35});
                spawnPetals('petals1',120,{sizeMin:11,sizeMax:17,durMin:375,durMax:610,darkMin:0.08,darkMax:0.2});
                spawnPetals('petals2',105,{sizeMin:6,sizeMax:10,durMin:545,durMax:950,darkMin:0.04,darkMax:0.2});

                // smooth scroll-driven parallax via lerp on container
                var pc = document.querySelector('.parallax-container');
                if (pc) {
                    var currentY = 0;
                    var targetY = 0;
                    var factor = 0.12;

                    window.addEventListener('scroll', function() {
                        targetY = window.scrollY * factor;
                    }, { passive: true });

                    (function pxLoop() {
                        // lerp toward target — smooth, no jitter
                        currentY += (targetY - currentY) * 0.06;
                        if (Math.abs(currentY) > 0.5) {
                            pc.style.transform = 'translate3d(0, ' + (-currentY) + 'px, 0)';
                        } else {
                            pc.style.transform = 'translate3d(0, 0, 0)';
                        }
                        requestAnimationFrame(pxLoop);
                    })();
                }
            }
        })();
