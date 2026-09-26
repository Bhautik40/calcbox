/* CalcBox browser app: theme, pins, recents, home search/filter, live tool engine. */
(function () {
  'use strict';
  var C = window.CB, d = document, B = d.body;
  var SPA = B.getAttribute('data-spa') === '1';
  var ROOT = SPA ? '' : (B.getAttribute('data-root') || './'), IX = B.getAttribute('data-ix') || '';
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function href(t) { return SPA ? '#' + t.slug : ROOT + t.slug + '/' + IX; }

  /* ---------- storage (safe) ---------- */
  var store = {
    get: function (k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  function valid(ids) { return (Array.isArray(ids) ? ids : []).filter(function (id) { return C.byId[id]; }); }
  function pins() { return valid(store.get('cb_pins', [])); }
  function recents() { return valid(store.get('cb_recent', [])); }
  function isPinned(id) { return pins().indexOf(id) > -1; }
  function togglePin(id) {
    var p = pins(), i = p.indexOf(id);
    if (i > -1) p.splice(i, 1); else p.unshift(id);
    store.set('cb_pins', p.slice(0, 24));
    toast(i > -1 ? 'Unpinned' : 'Pinned');
    return i === -1;
  }

  /* ---------- theme ---------- */
  var tb = $('.theme-btn');
  function theme() { return d.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
  function syncThemeBtn() { if (tb) { var dk = theme() === 'dark'; tb.setAttribute('aria-pressed', dk); tb.setAttribute('aria-label', dk ? 'Switch to light mode' : 'Switch to dark mode'); } }
  if (tb) tb.addEventListener('click', function () {
    var t = theme() === 'dark' ? 'light' : 'dark';
    d.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('cb_theme', t); } catch (e) { }
    syncThemeBtn();
  });
  syncThemeBtn();

  /* ---------- toast & clipboard ---------- */
  var tEl, tTimer;
  function toast(msg) {
    if (!tEl) { tEl = d.createElement('div'); tEl.className = 'toast'; tEl.setAttribute('role', 'status'); B.appendChild(tEl); }
    tEl.textContent = msg; tEl.classList.add('on'); clearTimeout(tTimer);
    tTimer = setTimeout(function () { tEl.classList.remove('on'); }, 1600);
  }
  function copy(text, msg) {
    function fallback() {
      var ta = d.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      B.appendChild(ta); ta.select(); var ok = false; try { ok = d.execCommand('copy'); } catch (e) { } B.removeChild(ta);
      toast(ok ? msg : 'Copy failed');
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast(msg); }, fallback); else fallback();
  }

  function chip(t) { return '<a class="chip" href="' + href(t) + '">' + C.svg(C.icons[t.id]) + '<span>' + C.esc(t.name) + '</span></a>'; }

  d.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase(), q = $('#q');
    if (q && e.key === '/' && tag !== 'input' && tag !== 'textarea' && tag !== 'select' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); q.focus(); q.select(); }
  });

  /* ---------- home ---------- */
  function home() {
    var q = $('#q'), cards = $$('.card'), blocks = $$('.cat-block'), filters = $$('.filters button'), empty = $('#empty'), cat = 'all';

    function strips() {
      [['#pinned', pins()], ['#recent', recents()]].forEach(function (x) {
        var el = $(x[0]); if (!el) return;
        el.hidden = !x[1].length;
        $('.chips', el).innerHTML = x[1].map(function (id) { return chip(C.byId[id]); }).join('');
      });
      cards.forEach(function (c) { var on = isPinned(c.getAttribute('data-id')), b = $('.star', c); b.setAttribute('aria-pressed', on); });
    }

    function apply() {
      var words = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean), any = false;
      var c = words.length ? 'all' : cat;
      filters.forEach(function (f) { var on = f.getAttribute('data-cat') === c; f.classList.toggle('on', on); f.setAttribute('aria-selected', on); });
      cards.forEach(function (card) {
        var s = card.getAttribute('data-s'), ok = (c === 'all' || card.getAttribute('data-cat') === c) && words.every(function (w) { return s.indexOf(w) > -1; });
        card.hidden = !ok; if (ok) any = true;
      });
      blocks.forEach(function (b) { b.hidden = !$$('.card', b).some(function (x) { return !x.hidden; }); });
      empty.hidden = any;
    }

    filters.forEach(function (f) {
      f.addEventListener('click', function () {
        cat = f.getAttribute('data-cat'); q.value = ''; apply();
        try { history.replaceState(null, '', SPA ? '#' + (cat === 'all' ? 'home' : cat) : cat === 'all' ? location.pathname : '#' + cat); } catch (e) { }
      });
    });
    q.addEventListener('input', apply);
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var first = cards.filter(function (c) { return !c.hidden; })[0]; if (first) location.href = $('a', first).href; }
      if (e.key === 'Escape') { q.value = ''; apply(); q.blur(); }
    });
    cards.forEach(function (c) {
      $('.star', c).addEventListener('click', function (e) { e.preventDefault(); togglePin(c.getAttribute('data-id')); strips(); });
    });
    var h = location.hash.slice(1); if (C.cats.some(function (x) { return x[0] === h; })) cat = h;
    strips(); apply();
  }

  /* ---------- tool ---------- */
  function tool(id) {
    var t = C.byId[id]; if (!t) return;
    var form = $('#form'), res = $('#res'), btnCount = {}, last = null;

    // record recent
    var r = recents().filter(function (x) { return x !== id; }); r.unshift(id); store.set('cb_recent', r.slice(0, 8));

    // start values: defaults + URL params
    var v = C.defaults(t), p = new URLSearchParams(location.search), fromUrl = false;
    t.inputs.forEach(function (i) {
      if (i.t !== 'btn' && p.has(i.k)) { v[i.k] = i.t === 'check' ? p.get(i.k) === '1' : p.get(i.k).slice(0, 3000); fromUrl = true; }
    });
    if (t.fix) t.fix(v);
    form.innerHTML = C.renderForm(t, v); // re-render so dynamic defaults (today's date) and URL values apply

    function read() {
      var o = {};
      t.inputs.forEach(function (i) {
        if (i.t === 'btn') { o[i.k] = btnCount[i.k] || 0; return; }
        if (i.t === 'seg') { var c = $('input[name="' + i.k + '"]:checked', form); o[i.k] = c ? c.value : C.resolve(i.val, o); return; }
        var el = form.elements[i.k];
        o[i.k] = i.t === 'check' ? el.checked : el.value;
      });
      return o;
    }

    function sync(o) {
      t.inputs.forEach(function (i) {
        var f = $('.f[data-k="' + i.k + '"]', form); if (!f) return;
        if (i.show) f.hidden = !i.show(o);
        if (typeof i.label === 'function') { var l = $('[data-lbl]', f); if (l) l.textContent = i.label(o); }
        if (typeof i.suf === 'function') { var s = $('[data-suf]', f), sv = i.suf(o); if (s) { s.textContent = sv; s.hidden = !sv; } }
        if (i.t === 'sel' && typeof i.opts === 'function') {
          var sel = form.elements[i.k], opts = i.opts(o), sig = opts.map(function (x) { return x[0]; }).join('|');
          if (sel.getAttribute('data-sig') !== sig) {
            sel.innerHTML = opts.map(function (x) { return '<option value="' + C.esc(x[0]) + '">' + C.esc(x[1]) + '</option>'; }).join('');
            sel.setAttribute('data-sig', sig);
          }
          if (sel.value !== o[i.k]) sel.value = o[i.k];
        }
        if (i.pre === '₹') { var h = $('[data-hint]', f); if (h) h.textContent = C.hintFor(o[i.k]); }
      });
    }

    function update() {
      var o = read(); if (t.fix) t.fix(o); sync(o);
      var out; try { out = t.calc(C.parse(t, o)); } catch (e) { out = { label: 'Result', err: 'Check your inputs' }; }
      last = { o: o, r: out };
      var old = $$('.bar span', res).map(function (s) { return s.style.width; });
      res.innerHTML = C.renderResult(out);
      var nb = $$('.bar span', res);
      if (old.length && old.length === nb.length) {
        var nw = nb.map(function (s) { return s.style.width; });
        nb.forEach(function (s, ix) { s.style.transition = 'none'; s.style.width = old[ix]; });
        void res.offsetWidth;
        nb.forEach(function (s, ix) { s.style.transition = ''; s.style.width = nw[ix]; });
      }
    }

    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.addEventListener('click', function (e) {
      var b = e.target.closest('[data-btn]'); if (!b) return;
      var k = b.getAttribute('data-btn'); btnCount[k] = (btnCount[k] || 0) + 1; update();
      var ic = $('svg', b); if (ic) { ic.classList.remove('spin'); void ic.offsetWidth; ic.classList.add('spin'); }
    });
    // Enter in a text field closes the keyboard on mobile
    form.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); e.target.blur(); } });

    // actions
    var pinBtn = $('[data-act="pin"]');
    function syncPin() { var on = isPinned(id); pinBtn.setAttribute('aria-pressed', on); $('span', pinBtn).textContent = on ? 'Pinned' : 'Pin'; }
    pinBtn.addEventListener('click', function () { togglePin(id); syncPin(); });
    syncPin();

    $('[data-act="copy"]').addEventListener('click', function () {
      if (!last) return; var R = last.r, txt;
      if (R.err) return toast(R.err);
      if (R.copy) txt = R.copy;
      else {
        txt = t.h1 + '\n' + R.label + ': ' + (R.text != null ? R.text : R.big) + (R.sub && !/^≈/.test(R.sub) ? ' (' + R.sub + ')' : '');
        (R.rows || []).forEach(function (x) { txt += '\n' + x[0] + ': ' + x[1]; });
      }
      copy(txt, 'Copied');
    });

    $('[data-act="share"]').addEventListener('click', function () {
      var q = new URLSearchParams();
      if (!t.client) t.inputs.forEach(function (i) {
        if (i.t === 'btn') return;
        var val = last.o[i.k];
        if (i.t === 'check') val = val ? '1' : '0';
        if (String(val).length <= 1500) q.set(i.k, val);
      });
      var url = location.origin + location.pathname + (q.toString() ? '?' + q.toString() : '');
      if (location.protocol === 'file:') url = location.href.split('?')[0] + (q.toString() ? '?' + q : '');
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        navigator.share({ title: t.h1 + ' | CalcBox', url: url }).catch(function (e) { if (!e || e.name !== 'AbortError') copy(url, 'Link copied'); });
      } else copy(url, 'Link copied');
    });

    update();
    if (fromUrl) { var rc = $('.result'); if (rc && innerWidth < 860) setTimeout(function () { rc.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250); }
  }

  if (SPA) {
    var view = $('#view');
    var route = function () {
      var h = location.hash.slice(1) || 'home', isCat = C.cats.some(function (x) { return x[0] === h; });
      var tp = d.getElementById('v-' + (isCat ? 'home' : h)) || d.getElementById('v-home');
      view.innerHTML = tp.innerHTML;
      d.title = tp.getAttribute('data-title');
      var type = tp.getAttribute('data-type');
      B.setAttribute('data-page', type);
      window.scrollTo(0, 0);
      if (type === 'home') home(); else if (type === 'tool') tool(tp.getAttribute('data-tool'));
    };
    window.addEventListener('hashchange', route);
    route();
  } else {
    var page = B.getAttribute('data-page');
    if (page === 'home') home();
    else if (page === 'tool') tool(B.getAttribute('data-tool'));
  }
})();
