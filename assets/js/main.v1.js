/* ДОМАШНИЙ УХОД: меню, аккордеон, конструктор визита, образец отчёта по покупкам, заявка */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  /* меню */
  var drawer = $('drawer'), burger = $('burger'), closeBtn = $('drawerClose'), lastFocus = null;
  function openD() {
    lastFocus = document.activeElement;
    drawer.setAttribute('data-open', 'true');
    document.body.classList.add('is-locked');
    burger.setAttribute('aria-expanded', 'true');
    var f = drawer.querySelector('a,button'); if (f) f.focus();
  }
  function closeD() {
    if (!drawer) return;
    drawer.setAttribute('data-open', 'false');
    document.body.classList.remove('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (burger) burger.addEventListener('click', openD);
  if (closeBtn) closeBtn.addEventListener('click', closeD);
  if (drawer) {
    drawer.addEventListener('click', function (e) { if (e.target === drawer) closeD(); });
    document.addEventListener('keydown', function (e) {
      if (drawer.getAttribute('data-open') !== 'true') return;
      if (e.key === 'Escape') { closeD(); return; }
      if (e.key === 'Tab') {
        var f = drawer.querySelectorAll('a,button');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1099 && drawer.getAttribute('data-open') === 'true') closeD();
    });
  }

  /* аккордеон */
  document.querySelectorAll('.faq__q').forEach(function (b) {
    b.addEventListener('click', function () {
      var it = b.parentElement, open = it.getAttribute('data-open') === 'true';
      document.querySelectorAll('.faq__i').forEach(function (x) { x.setAttribute('data-open', 'false'); });
      it.setAttribute('data-open', open ? 'false' : 'true');
    });
  });

  /* конструктор визита */
  var build = $('build');
  if (build && $('buildOut')) {
    var out = $('buildOut');
    function plan() {
      var tasks = [].map.call(build.querySelectorAll('.chips button[aria-pressed="true"]'), function (b) { return b.getAttribute('data-t'); });
      var freq = $('bFreq').value, who = $('bWho').value, access = $('bAccess').value;
      var order = [], prep = [];
      order.push('Приходим в согласованное время, проверяем, что нужно сделать в этот визит');
      if (tasks.indexOf('products') > -1) {
        if (who === 'me') { order.push('Закупка по вашему списку: берём список, покупаем, приносим чеки'); prep.push('Список покупок и бюджет'); }
        else { order.push('Закупка продуктов с вашего согласования: присылаем список и сумму до покупки'); prep.push('Согласование списка в мессенджере'); }
      }
      if (tasks.indexOf('laundry') > -1) order.push('Стирка: сортируем бельё, загружаем, контролируем программу');
      if (tasks.indexOf('cook') > -1) order.push('Приготовление пищи по вашему меню или договорённости');
      if (tasks.indexOf('dishes') > -1) order.push('Мытьё посуды и приведение кухни в порядок');
      if (tasks.indexOf('iron') > -1) order.push('Глаженье и складывание белья');
      if (tasks.indexOf('bills') > -1) { order.push('Оплата жилья и ЖКУ из ваших средств, с чеками и подтверждением'); prep.push('Реквизиты и сумма к оплате'); }
      order.push('Убираем за собой, оставляем отчёт: что сделано, сколько потрачено по чекам');
      if (tasks.indexOf('laundry') > -1) prep.push('Доступ к стиральной машине и порошку');
      if (tasks.indexOf('iron') > -1) prep.push('Утюг и место для глажки');
      if (tasks.indexOf('cook') > -1) prep.push('Продукты, посуда, меню или пожелания');
      if (access === 'keys') prep.push('Ключи или код домофона, как договоримся');
      var names = { laundry: 'стирка', iron: 'глажка', products: 'закупка продуктов', dishes: 'мытьё посуды', cook: 'приготовление пищи', bills: 'оплата ЖКУ' };
      var tl = tasks.map(function (t) { return names[t]; });
      out.innerHTML = '<span class="mono">Ваш визит</span><h3>' + (tl.length ? tl.join(', ') : 'Пока ничего не выбрано') + '</h3>' +
        '<p style="color:#443B33;font-size:15px">' + freq + '. ' + (access === 'keys' ? 'Доступ по ключам, как договоримся.' : 'Встречаемся лично на время визита.') + '</p>' +
        '<span class="mono">Порядок работы</span><ol class="ol">' + order.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>' +
        (prep.length ? '<span class="mono">Что нужно от вас</span><ul class="list">' + prep.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '') +
        '<a class="btn" href="https://wa.me/375292515717?text=' + encodeURIComponent('Здравствуйте! Нужна помощь по дому: ' + tl.join(', ') + '. ' + freq + '.') + '" target="_blank" rel="noopener">Обсудить этот визит</a>';
    }
    build.querySelectorAll('.chips button').forEach(function (b) {
      b.addEventListener('click', function () {
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        plan();
      });
    });
    ['bFreq', 'bWho', 'bAccess'].forEach(function (id) { $(id).addEventListener('change', plan); });
    plan();
  }

  /* образец отчёта по покупкам */
  var shop = $('shop'), rec = $('receipt');
  if (shop && rec) {
    var items = [{ n: 'Молоко 1 л', q: '2' }, { n: 'Хлеб', q: '1' }, { n: 'Курица, филе', q: '1 кг' }];
    function render() {
      var rows = items.map(function (it, i) {
        return '<div class="shop__row"><input data-i="' + i + '" data-f="n" value="' + it.n.replace(/"/g, '&quot;') + '" aria-label="Позиция ' + (i + 1) + '">' +
          '<input data-i="' + i + '" data-f="q" value="' + it.q.replace(/"/g, '&quot;') + '" aria-label="Количество ' + (i + 1) + '">' +
          '<button type="button" data-del="' + i + '" aria-label="Удалить позицию">×</button></div>';
      }).join('');
      shop.innerHTML = rows + '<button class="shop__add" type="button" id="shopAdd">+ Добавить позицию</button>';
      rec.innerHTML = '<h4>Отчёт по закупке</h4>' +
        (items.length ? items.map(function (it) {
          return '<div class="receipt__row"><span>' + (it.n || 'позиция') + '</span><b>' + (it.q || '—') + '</b></div>';
        }).join('') : '<div class="receipt__row"><span>Позиции не добавлены</span><b>—</b></div>') +
        '<div class="receipt__total"><span>Итого по чекам</span><b>сумма из чеков</b></div>' +
        '<div class="receipt__note">Так выглядит отчёт после закупки: позиции, количество, сумма по чекам и фото чеков. Деньги на продукты вы передаёте отдельно, оплата услуг считается по договорённости.</div>';
      shop.querySelectorAll('input').forEach(function (inp) {
        inp.addEventListener('input', function () {
          var i = +inp.getAttribute('data-i'), f = inp.getAttribute('data-f');
          items[i][f] = inp.value; renderReceipt();
        });
      });
      shop.querySelectorAll('[data-del]').forEach(function (b) {
        b.addEventListener('click', function () { items.splice(+b.getAttribute('data-del'), 1); render(); });
      });
      var add = $('shopAdd');
      if (add) add.addEventListener('click', function () { items.push({ n: '', q: '' }); render(); });
    }
    function renderReceipt() {
      rec.innerHTML = '<h4>Отчёт по закупке</h4>' +
        (items.length ? items.map(function (it) {
          return '<div class="receipt__row"><span>' + (it.n || 'позиция') + '</span><b>' + (it.q || '—') + '</b></div>';
        }).join('') : '<div class="receipt__row"><span>Позиции не добавлены</span><b>—</b></div>') +
        '<div class="receipt__total"><span>Итого по чекам</span><b>сумма из чеков</b></div>' +
        '<div class="receipt__note">Так выглядит отчёт после закупки: позиции, количество, сумма по чекам и фото чеков. Деньги на продукты вы передаёте отдельно, оплата услуг считается по договорённости.</div>';
    }
    render();
  }

  /* форма */
  var form = $('reqForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (id) { var el = $(id); return el && el.value ? el.value.trim() : ''; };
      if (!g('fName')) { $('fName').focus(); return; }
      if (!g('fTel')) { $('fTel').focus(); return; }
      var text = 'Заявка с сайта ДОМАШНИЙ УХОД\nИмя: ' + g('fName') + '\nТелефон: ' + g('fTel') +
        '\nНужно: ' + g('fWhat') + (g('fMsg') ? '\nДетали: ' + g('fMsg') : '');
      window.open('https://wa.me/375292515717?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }
})();
