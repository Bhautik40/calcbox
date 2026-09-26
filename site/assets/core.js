/* CalcBox core: tool definitions, calculators and shared renderers.
   Loaded in the browser (window.CB) and by build.js (module.exports). */
(function (root) {
  'use strict';
  var L = 'en-IN';

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pn(s) { if (typeof s === 'number') return s; s = String(s == null ? '' : s).replace(/[,₹\s]/g, ''); if (s === '' || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN; return parseFloat(s); }
  function num(x, d) { if (!isFinite(x)) return '—'; d = d == null ? 2 : d; var v = Math.abs(x) < 1e-12 ? 0 : x; return v.toLocaleString(L, { maximumFractionDigits: d }); }
  function inr(x, d) {
    if (!isFinite(x)) return '—';
    if (d == null) d = Math.abs(x) >= 1e5 || Math.abs(Math.round(x) - x) < 0.005 ? 0 : 2;
    var s = Math.abs(x).toLocaleString(L, { minimumFractionDigits: d, maximumFractionDigits: d });
    return (x < -0.004 ? '−' : '') + '₹' + s;
  }
  function inr2(x) { return inr(x, Math.abs(Math.round(x) - x) < 0.005 ? 0 : 2); }
  function pct(x, d) { return isFinite(x) ? num(x, d == null ? 2 : d) + '%' : '—'; }
  function compact(x) {
    var a = Math.abs(x);
    if (!isFinite(x) || a < 1e3) return '';
    if (a >= 1e7) return num(x / 1e7, 2) + ' Crore';
    if (a >= 1e5) return num(x / 1e5, 2) + ' Lakh';
    return num(x / 1e3, 2) + ' Thousand';
  }
  function sub(x) { var c = compact(x); return Math.abs(x) >= 1e5 && c ? '≈ ₹' + c : ''; }
  function sig(x) { if (!isFinite(x)) return '—'; var a = Math.abs(x); if (a !== 0 && (a < 1e-6 || a >= 1e15)) return x.toExponential(4); return x.toLocaleString(L, { maximumFractionDigits: a >= 1000 ? 2 : a >= 1 ? 4 : 8, maximumSignificantDigits: a >= 1000 ? undefined : 7 }); }
  function plural(n, w) { return num(n, 0) + ' ' + w + (Math.abs(n) === 1 ? '' : 's'); }

  /* dates (local, no time) */
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function pd(s) { if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null; var p = s.split('-').map(Number); var d = new Date(p[0], p[1] - 1, p[2]); return d.getMonth() === p[1] - 1 ? d : null; }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function dayN(d) { return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
  function addD(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function addM(d, n) { var day = d.getDate(); var x = new Date(d.getFullYear(), d.getMonth() + n, 1); var last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate(); x.setDate(Math.min(day, last)); return x; }
  function fdate(d) { return d.toLocaleDateString(L, { day: 'numeric', month: 'short', year: 'numeric' }); }
  function wday(d) { return d.toLocaleDateString(L, { weekday: 'long' }); }
  function ymd(a, b) {
    var y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
    if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { y: y, m: m, d: d };
  }
  function ymdText(o) { var p = []; if (o.y) p.push(plural(o.y, 'year')); if (o.m) p.push(plural(o.m, 'month')); if (o.d || !p.length) p.push(plural(o.d, 'day')); return p.join(', '); }
  function isWork(d) { var w = d.getDay(); return w !== 0 && w !== 6; }

  /* number to words */
  var ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  var TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function w99(n) { return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : ''); }
  function w999(n) { var h = Math.floor(n / 100), r = n % 100; return [h ? ONES[h] + ' Hundred' : '', r ? w99(r) : ''].filter(Boolean).join(' '); }
  function wIN(n) {
    if (n === 0) return 'Zero';
    var p = [], cr = Math.floor(n / 1e7); n = n % 1e7;
    if (cr) p.push(wIN(cr) + ' Crore');
    var l = Math.floor(n / 1e5); n = n % 1e5; if (l) p.push(w99(l) + ' Lakh');
    var t = Math.floor(n / 1e3); n = n % 1e3; if (t) p.push(w99(t) + ' Thousand');
    if (n) p.push(w999(n));
    return p.join(' ');
  }
  function wINTL(n) {
    if (n === 0) return 'Zero';
    var sc = ['', 'Thousand', 'Million', 'Billion', 'Trillion'], p = [], i = 0;
    while (n > 0) { var c = n % 1000; if (c) p.unshift(w999(c) + (sc[i] ? ' ' + sc[i] : '')); n = Math.floor(n / 1000); i++; }
    return p.join(' ');
  }

  function need(cond, label, msg) { return cond ? null : { label: label, err: msg }; }
  function growthBars(a, b, la, lb) { return [{ l: la || 'Invested', v: a }, { l: lb || 'Returns', v: b }]; }

  /* ---------- units ---------- */
  var UNITS = {
    length: { d: ['km', 'mi'], u: [['mm', 'Millimetre', 0.001], ['cm', 'Centimetre', 0.01], ['m', 'Metre', 1], ['km', 'Kilometre', 1000], ['in', 'Inch', 0.0254], ['ft', 'Foot', 0.3048], ['yd', 'Yard', 0.9144], ['mi', 'Mile', 1609.344]] },
    weight: { d: ['kg', 'lb'], u: [['mg', 'Milligram', 1e-6], ['g', 'Gram', 0.001], ['kg', 'Kilogram', 1], ['q', 'Quintal', 100], ['t', 'Tonne', 1000], ['oz', 'Ounce', 0.028349523125], ['lb', 'Pound', 0.45359237]] },
    temp: { d: ['c', 'f'], u: [['c', 'Celsius', 0], ['f', 'Fahrenheit', 0], ['k', 'Kelvin', 0]] },
    area: { d: ['sqft', 'sqm'], u: [['sqft', 'Square foot', 0.09290304], ['sqm', 'Square metre', 1], ['sqyd', 'Square yard (gaj)', 0.83612736], ['sqin', 'Square inch', 0.00064516], ['cent', 'Cent', 40.468564224], ['guntha', 'Guntha', 101.17141056], ['acre', 'Acre', 4046.8564224], ['ha', 'Hectare', 10000], ['sqkm', 'Square km', 1e6]] }
  };
  var USYM = { c: '°C', f: '°F', k: 'K', sqft: 'sq ft', sqm: 'm²', sqyd: 'sq yd', sqin: 'sq in', sqkm: 'km²', ha: 'ha', acre: 'acre', cent: 'cent', guntha: 'guntha', q: 'quintal', t: 't' };
  function usym(u) { return USYM[u] || u; }
  function toC(v, u) { return u === 'c' ? v : u === 'f' ? (v - 32) * 5 / 9 : v - 273.15; }
  function fromC(v, u) { return u === 'c' ? v : u === 'f' ? v * 9 / 5 + 32 : v + 273.15; }
  function conv(cat, v, a, b) {
    if (cat === 'temp') return fromC(toC(v, a), b);
    var U = UNITS[cat].u, fa = 0, fb = 0;
    U.forEach(function (x) { if (x[0] === a) fa = x[2]; if (x[0] === b) fb = x[2]; });
    return v * fa / fb;
  }
  function unitOpts(v) { return (UNITS[v.cat] || UNITS.length).u.map(function (x) { return [x[0], x[1] + ' (' + usym(x[0]) + ')']; }); }

  /* ---------- icons (24px line) ---------- */
  var I = {
    tax: '<rect x="4.5" y="3" width="15" height="18" rx="2"/><path d="M8.5 7.5h7M8.5 7.5h2a2.5 2.5 0 010 5h-2l4 4M8.5 10h7"/>',
    gst: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9.5 14l5-5"/><circle cx="9.7" cy="9.3" r=".9"/><circle cx="14.3" cy="13.7" r=".9"/>',
    emi: '<path d="M3 11l9-7 9 7"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/>',
    sip: '<path d="M12 21v-8"/><path d="M12 13c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5z"/><path d="M12 15.5c0-3.2-2.2-5.5-6-5.5 0 3.2 2.2 5.5 6 5.5z"/>',
    lumpsum: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    fd: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/><path d="M12 14v3"/>',
    rd: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M7.5 14h.01M12 14h.01M16.5 14h.01M7.5 17.5h.01M12 17.5h.01M16.5 17.5h.01"/>',
    ppf: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    si: '<circle cx="12" cy="12" r="9"/><path d="M9 15l6-6"/><circle cx="9.3" cy="9.3" r=".9"/><circle cx="14.7" cy="14.7" r=".9"/>',
    ci: '<path d="M3 20h18"/><path d="M4 17c6 0 10-3 15-12"/><path d="M15 5h4v4"/>',
    cagr: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    discount: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    split: '<circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="8" r="3"/><path d="M2.5 20c.5-3.5 2.8-5.5 5.5-5.5s5 2 5.5 5.5"/><path d="M14 14.8c.8-.2 1.6-.3 2.5-.3 2.7 0 4.8 2 5.2 5.5"/>',
    hike: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2"/><path d="M12 17v-6M9.5 13.5L12 11l2.5 2.5"/>',
    profit: '<path d="M11 3.1A9 9 0 1020.9 13H11z"/><path d="M14 3.3A9 9 0 0120.7 10H14z"/>',
    gratuity: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.3L7 21l5-2.8 5 2.8-1.5-7.7"/>',
    inflation: '<path d="M3 4h2.2l2.3 11h10.2L20 7.5H7"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/><path d="M13 13V9.5M11.4 11l1.6-1.5 1.6 1.5"/>',
    fuel: '<path d="M4 21V5a2 2 0 012-2h6a2 2 0 012 2v16"/><path d="M2.5 21h13"/><path d="M6.5 8h5"/><path d="M14 11h2a2 2 0 012 2v4a1.5 1.5 0 003 0V8.5L18 5.5"/>',
    percentage: '<path d="M5 19L19 5"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    age: '<path d="M4 21h16v-6.5a2 2 0 00-2-2H6a2 2 0 00-2 2z"/><path d="M4 16.5c2 1.3 4 1.3 6 0s4-1.3 6 0 3 1 4 .5"/><path d="M12 12.5V9"/><path d="M12 6.5c.9-.9.9-1.9 0-3-.9 1.1-.9 2.1 0 3z"/>',
    days: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M7 15.5h9.5M14.5 13.5l2 2-2 2"/>',
    adddays: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M12 13v5M9.5 15.5h5"/>',
    unit: '<path d="M4 8h15l-3.5-3.5"/><path d="M20 16H5l3.5 3.5"/>',
    average: '<path d="M3 21h18"/><rect x="5" y="12" width="3" height="6" rx=".5"/><rect x="10.5" y="6" width="3" height="12" rx=".5"/><rect x="16" y="9" width="3" height="9" rx=".5"/><path d="M3 10h1.5M20 10h1"/>',
    cgpa: '<path d="M2 9.5L12 4.5l10 5-10 5z"/><path d="M6 11.5V16c3 2 9 2 12 0v-4.5"/><path d="M22 9.5V14"/>',
    words: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10.5h6M6 14h8.5M17 14h1.5"/>',
    bmi: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 10a5 5 0 018 0"/><path d="M12 10l1.5-2.2"/>',
    calorie: '<path d="M12 21c-3.9 0-7-2.7-7-6.5C5 11 8 9 8 5.5c2.5 1.5 4 3.5 4 6 1-1 1.5-2.2 1.5-3.5 2.5 2 4.5 4.5 4.5 7.2 0 3.3-2.6 5.8-6 5.8z"/>',
    due: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0112 7.3a4.2 4.2 0 017.5 2.5C19.5 15.4 12 20 12 20z"/>',
    wc: '<path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5M9 12.5h7M9 16h7"/>',
    'case': '<path d="M3 18l4.5-12L12 18M4.7 14h5.6"/><circle cx="17.5" cy="15" r="3"/><path d="M20.5 12v6"/>',
    pw: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14.5 8.5l2 2"/>'
  };
  var UI = {
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>',
    share: '<path d="M12 15V3.5M8 7.5l4-4 4 4"/><path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.8-3.8"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>',
    refresh: '<path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 4v7h-7"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  function svg(p, cls) { return '<svg class="' + (cls || 'i') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
  var LOGO = '<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#E4570B"/><path d="M9.5 12.5h5M12 10v5M18 12.5h4.5M9.8 19.8l4 4M13.8 19.8l-4 4M18 20.5h4.5M18 23.5h4.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';

  /* ---------- tool definitions ---------- */
  var CATS = [['money', 'Money'], ['everyday', 'Everyday'], ['health', 'Health'], ['text', 'Text']];
  var FIN = 'Estimates only. Actual figures may vary with your bank, fund or policy.';
  var HEALTH = 'For general information only. Not medical advice.';
  var COMP = [['12', 'Monthly'], ['4', 'Quarterly'], ['2', 'Half-yearly'], ['1', 'Yearly']];
  var COMPN = { '12': 'monthly', '4': 'quarterly', '2': 'half-yearly', '1': 'yearly' };

  var T = [
    /* ===== MONEY ===== */
    {
      id: 'gst', slug: 'gst-calculator', cat: 'money', name: 'GST', h1: 'GST Calculator', desc: 'Add or remove GST',
      title: 'GST Calculator – Add or Remove GST (5%, 18%, 40%) | CalcBox',
      meta: 'Free GST calculator for India. Add or remove GST at 5%, 18%, 40% or 3% and see the CGST and SGST split instantly.',
      kw: 'tax gst goods services cgst sgst igst invoice inclusive exclusive', disc: FIN,
      how: 'Add: GST = amount × rate. Remove: base = amount ÷ (1 + rate). CGST and SGST are half each.',
      related: ['tax', 'discount', 'profit', 'words'],
      inputs: [
        { k: 'a', t: 'num', label: 'Amount', pre: '₹', val: '10000' },
        { k: 'r', t: 'seg', label: 'GST rate', val: '18', opts: [['5', '5%'], ['18', '18%'], ['40', '40%'], ['3', '3%'], ['c', 'Other']] },
        { k: 'cr', t: 'num', label: 'Custom rate', suf: '%', val: '12', show: function (v) { return v.r === 'c'; } },
        { k: 'm', t: 'seg', label: 'Amount is', val: 'add', opts: [['add', 'Before GST'], ['rem', 'Incl. GST']] }
      ],
      calc: function (v) {
        var rate = v.r === 'c' ? v.cr : parseFloat(v.r), add = v.m === 'add';
        var lab = add ? 'Total incl. GST' : 'Amount before GST';
        var e = need(v.a >= 0, lab, 'Enter an amount') || need(rate >= 0 && rate <= 100, lab, 'Enter a GST rate'); if (e) return e;
        var base = add ? v.a : v.a / (1 + rate / 100), gst = add ? v.a * rate / 100 : v.a - base, total = base + gst;
        return {
          label: lab, big: inr2(add ? total : base), sub: sub(add ? total : base),
          rows: [['Amount before GST', inr2(base)], ['GST (' + num(rate) + '%)', inr2(gst)], ['CGST (' + num(rate / 2) + '%)', inr2(gst / 2)], ['SGST (' + num(rate / 2) + '%)', inr2(gst / 2)], ['IGST (inter-state)', inr2(gst)], ['Total incl. GST', inr2(total)]],
          bars: [{ l: 'Base', v: base }, { l: 'GST', v: gst }]
        };
      }
    },
    {
      id: 'tax', slug: 'income-tax-calculator', cat: 'money', name: 'Income Tax', h1: 'Income Tax Calculator', desc: 'New vs old regime',
      title: 'Income Tax Calculator FY 2026-27 – New vs Old Regime | CalcBox',
      meta: 'Calculate income tax for FY 2026-27 (AY 2027-28) under the new and old regime. See which regime saves more, with 87A rebate, cess and surcharge.',
      kw: 'income tax itr new regime old regime salary tax slab 87a rebate fy 2026-27 ay 2027-28 standard deduction 80c', disc: 'Estimate for resident individuals, FY 2026-27. Check with a CA before filing.',
      how: 'New regime: ₹75,000 standard deduction, slabs from 5% to 30%, no tax up to ₹12 lakh taxable (87A). Old regime: ₹50,000 standard deduction plus your deductions. 4% cess on both.',
      related: ['hike', 'gratuity', 'ppf', 'gst'],
      inputs: [
        { k: 'i', t: 'num', label: 'Annual income (CTC / gross)', pre: '₹', val: '1500000' },
        { k: 's', t: 'check', label: 'Salaried or pensioner', val: true },
        { k: 'd', t: 'num', label: 'Deductions for old regime (80C, HRA…)', pre: '₹', val: '150000' },
        { k: 'a', t: 'seg', label: 'Age', val: 'n', opts: [['n', 'Below 60'], ['s', '60–79'], ['ss', '80+']] }
      ],
      calc: function (v) {
        var e = need(v.i >= 0, 'Income tax', 'Enter your annual income'); if (e) return e;
        var ded = isFinite(v.d) && v.d > 0 ? v.d : 0;
        function slab(x, sl) { var t = 0, prev = 0; for (var k = 0; k < sl.length; k++) { var lim = sl[k][0], r = sl[k][1]; if (x > prev) t += (Math.min(x, lim) - prev) * r; prev = lim; } return t; }
        var NEW = [[4e5, 0], [8e5, .05], [12e5, .10], [16e5, .15], [20e5, .20], [24e5, .25], [Infinity, .30]];
        var OLDB = v.a === 'ss' ? 5e5 : v.a === 's' ? 3e5 : 2.5e5;
        var OLD = [[OLDB, 0], [5e5, .05], [10e5, .20], [Infinity, .30]];
        function sur(x, base, sl, cap) {
          var th = [[5e7, cap ? .25 : .37], [2e7, .25], [1e7, .15], [5e6, .10]];
          for (var k = 0; k < th.length; k++) {
            if (x > th[k][0]) {
              var r = th[k][1], prevR = k + 1 < th.length ? th[k + 1][1] : 0;
              if (cap && th[k][0] === 5e7) prevR = .25;
              var full = base * (1 + r), lim = slab(th[k][0], sl) * (1 + prevR) + (x - th[k][0]);
              return Math.max(0, Math.min(full, lim) - base);
            }
          }
          return 0;
        }
        var tn = Math.max(0, v.i - (v.s ? 75000 : 0)), xn = slab(tn, NEW);
        if (tn <= 12e5) xn = 0; else xn = Math.min(xn, tn - 12e5);
        xn += sur(tn, xn, NEW, true); var newTax = xn * 1.04;
        var to = Math.max(0, v.i - (v.s ? 50000 : 0) - ded), xo = slab(to, OLD);
        if (to <= 5e5) xo = Math.max(0, xo - 12500);
        xo += sur(to, xo, OLD, false); var oldTax = xo * 1.04;
        var best = newTax <= oldTax ? 'New' : 'Old', lo = Math.min(newTax, oldTax);
        return {
          label: 'Tax payable · ' + best + ' regime is better', big: inr(Math.round(lo)), sub: Math.abs(newTax - oldTax) >= 1 ? 'You save ' + inr(Math.round(Math.abs(newTax - oldTax))) + ' with the ' + best.toLowerCase() + ' regime' : 'Same tax in both regimes',
          rows: [['New regime tax', inr(Math.round(newTax))], ['Old regime tax', inr(Math.round(oldTax))], ['Taxable income (new)', inr(tn)], ['Taxable income (old)', inr(to)], ['Monthly tax (' + best.toLowerCase() + ')', inr(Math.round(lo / 12))], ['Effective tax rate', pct(v.i ? lo / v.i * 100 : 0)], ['In-hand per month (approx.)', inr(Math.round((v.i - lo) / 12))]],
          bars: [{ l: 'In hand', v: v.i - lo }, { l: 'Tax', v: lo }]
        };
      }
    },
    {
      id: 'emi', slug: 'emi-calculator', cat: 'money', name: 'EMI', h1: 'EMI Calculator', desc: 'Monthly loan payment',
      title: 'EMI Calculator – Home, Car & Personal Loan EMI | CalcBox',
      meta: 'Calculate your monthly loan EMI, total interest and total payment instantly. Works for home, car and personal loans.',
      kw: 'loan home car personal mortgage emi interest bank', disc: FIN,
      how: 'EMI = P × r × (1+r)ⁿ ÷ ((1+r)ⁿ − 1), where r is the monthly rate and n the number of months.',
      related: ['si', 'ci', 'fd', 'inflation'],
      inputs: [
        { k: 'p', t: 'num', label: 'Loan amount', pre: '₹', val: '2500000' },
        { k: 'r', t: 'num', label: 'Interest rate', suf: '% p.a.', val: '8.5' },
        { k: 'n', t: 'num', label: 'Tenure', suf: function (v) { return v.u === 'm' ? 'months' : 'years'; }, val: '20', half: true },
        { k: 'u', t: 'seg', label: 'In', val: 'y', opts: [['y', 'Years'], ['m', 'Months']], half: true }
      ],
      calc: function (v) {
        var e = need(v.p > 0, 'Monthly EMI', 'Enter a loan amount') || need(v.r >= 0 && v.r <= 60, 'Monthly EMI', 'Enter an interest rate') || need(v.n > 0, 'Monthly EMI', 'Enter the tenure'); if (e) return e;
        var N = Math.round(v.u === 'm' ? v.n : v.n * 12); if (N < 1) N = 1;
        var i = v.r / 1200, emi = i === 0 ? v.p / N : v.p * i * Math.pow(1 + i, N) / (Math.pow(1 + i, N) - 1);
        var tot = emi * N;
        return {
          label: 'Monthly EMI', big: inr(emi, 0), rows: [['Loan amount', inr(v.p)], ['Total interest', inr(tot - v.p)], ['Total payment', inr(tot)], ['Tenure', plural(N, 'month')]],
          bars: [{ l: 'Principal', v: v.p }, { l: 'Interest', v: tot - v.p }]
        };
      }
    },
    {
      id: 'sip', slug: 'sip-calculator', cat: 'money', name: 'SIP', h1: 'SIP Calculator', desc: 'Monthly investment growth',
      title: 'SIP Calculator – Mutual Fund SIP Returns | CalcBox',
      meta: 'Estimate the future value of your monthly SIP with optional annual step-up. See invested amount vs estimated returns.',
      kw: 'sip mutual fund monthly investment returns step up equity', disc: FIN,
      how: 'Each monthly instalment grows at the monthly rate (annual ÷ 12) until the end. Step-up raises the instalment every year.',
      related: ['lumpsum', 'ppf', 'cagr', 'inflation'],
      inputs: [
        { k: 'a', t: 'num', label: 'Monthly investment', pre: '₹', val: '10000' },
        { k: 'r', t: 'num', label: 'Expected return', suf: '% p.a.', val: '12', half: true },
        { k: 'n', t: 'num', label: 'Time period', suf: 'years', val: '15', half: true },
        { k: 's', t: 'num', label: 'Annual step-up', suf: '%', val: '0' }
      ],
      calc: function (v) {
        var L_ = 'Estimated value';
        var e = need(v.a > 0, L_, 'Enter a monthly amount') || need(v.r >= 0 && v.r <= 100, L_, 'Enter expected return') || need(v.n > 0 && v.n <= 60, L_, 'Enter years (up to 60)'); if (e) return e;
        var i = v.r / 1200, N = Math.round(v.n * 12), val = 0, inv = 0, amt = v.a, st = isFinite(v.s) ? v.s : 0;
        for (var m = 0; m < N; m++) { if (m && m % 12 === 0) amt *= 1 + st / 100; inv += amt; val = (val + amt) * (1 + i); }
        return { label: L_, big: inr(val), sub: sub(val), rows: [['Invested', inr(inv)], ['Est. returns', inr(val - inv)], ['Total value', inr(val)]], bars: growthBars(inv, val - inv) };
      }
    },
    {
      id: 'lumpsum', slug: 'lumpsum-calculator', cat: 'money', name: 'Lumpsum', h1: 'Lumpsum Calculator', desc: 'One-time investment growth',
      title: 'Lumpsum Calculator – One-Time Investment Returns | CalcBox',
      meta: 'See how a one-time investment grows at your expected annual return. Get the future value and total gains instantly.',
      kw: 'lumpsum one time investment mutual fund returns', disc: FIN,
      how: 'Future value = P × (1 + r)ⁿ, compounded yearly.',
      related: ['sip', 'fd', 'cagr', 'ci'],
      inputs: [
        { k: 'p', t: 'num', label: 'Investment', pre: '₹', val: '100000' },
        { k: 'r', t: 'num', label: 'Expected return', suf: '% p.a.', val: '12', half: true },
        { k: 'n', t: 'num', label: 'Time period', suf: 'years', val: '10', half: true }
      ],
      calc: function (v) {
        var e = need(v.p > 0, 'Estimated value', 'Enter an amount') || need(v.r >= 0 && v.r <= 100, 'Estimated value', 'Enter expected return') || need(v.n > 0 && v.n <= 100, 'Estimated value', 'Enter years'); if (e) return e;
        var f = v.p * Math.pow(1 + v.r / 100, v.n);
        return { label: 'Estimated value', big: inr(f), sub: sub(f), rows: [['Invested', inr(v.p)], ['Est. returns', inr(f - v.p)], ['Growth', num(f / v.p, 2) + '×']], bars: growthBars(v.p, f - v.p) };
      }
    },
    {
      id: 'fd', slug: 'fd-calculator', cat: 'money', name: 'FD', h1: 'FD Calculator', desc: 'Fixed deposit maturity',
      title: 'FD Calculator – Fixed Deposit Maturity & Interest | CalcBox',
      meta: 'Find your fixed deposit maturity amount and interest earned with monthly, quarterly, half-yearly or yearly compounding.',
      kw: 'fd fixed deposit bank maturity interest term deposit', disc: FIN,
      how: 'Maturity = P × (1 + r/k)^(k × t), where k is compounding periods per year.',
      related: ['rd', 'ppf', 'ci', 'lumpsum'],
      inputs: [
        { k: 'p', t: 'num', label: 'Deposit amount', pre: '₹', val: '100000' },
        { k: 'r', t: 'num', label: 'Interest rate', suf: '% p.a.', val: '7', half: true },
        { k: 'n', t: 'num', label: 'Tenure', suf: 'years', val: '5', half: true },
        { k: 'c', t: 'seg', label: 'Compounding', val: '4', opts: COMP }
      ],
      calc: function (v) {
        var e = need(v.p > 0, 'Maturity amount', 'Enter a deposit amount') || need(v.r >= 0 && v.r <= 50, 'Maturity amount', 'Enter an interest rate') || need(v.n > 0 && v.n <= 50, 'Maturity amount', 'Enter tenure'); if (e) return e;
        var k = +v.c, m = v.p * Math.pow(1 + v.r / 100 / k, k * v.n);
        return { label: 'Maturity amount', big: inr(m), sub: sub(m), rows: [['Deposit', inr(v.p)], ['Interest earned', inr(m - v.p)], ['Effective yield', pct((Math.pow(1 + v.r / 100 / k, k) - 1) * 100) + ' p.a.']], bars: growthBars(v.p, m - v.p, 'Deposit', 'Interest') };
      }
    },
    {
      id: 'rd', slug: 'rd-calculator', cat: 'money', name: 'RD', h1: 'RD Calculator', desc: 'Recurring deposit maturity',
      title: 'RD Calculator – Recurring Deposit Maturity | CalcBox',
      meta: 'Calculate recurring deposit maturity value and interest with quarterly compounding, as used by most Indian banks.',
      kw: 'rd recurring deposit monthly bank post office maturity', disc: FIN,
      how: 'Each monthly deposit earns interest compounded quarterly for the months it stays invested.',
      related: ['fd', 'sip', 'ppf', 'si'],
      inputs: [
        { k: 'a', t: 'num', label: 'Monthly deposit', pre: '₹', val: '5000' },
        { k: 'r', t: 'num', label: 'Interest rate', suf: '% p.a.', val: '7', half: true },
        { k: 'n', t: 'num', label: 'Tenure', suf: 'years', val: '5', half: true }
      ],
      calc: function (v) {
        var e = need(v.a > 0, 'Maturity amount', 'Enter a monthly amount') || need(v.r >= 0 && v.r <= 50, 'Maturity amount', 'Enter an interest rate') || need(v.n > 0 && v.n <= 30, 'Maturity amount', 'Enter tenure'); if (e) return e;
        var N = Math.max(1, Math.round(v.n * 12)), m = 0;
        for (var k = 1; k <= N; k++) m += v.a * Math.pow(1 + v.r / 400, 4 * k / 12);
        var inv = v.a * N;
        return { label: 'Maturity amount', big: inr(m), sub: sub(m), rows: [['Total deposited', inr(inv)], ['Interest earned', inr(m - inv)], ['Instalments', num(N, 0)]], bars: growthBars(inv, m - inv, 'Deposited', 'Interest') };
      }
    },
    {
      id: 'ppf', slug: 'ppf-calculator', cat: 'money', name: 'PPF', h1: 'PPF Calculator', desc: 'Public Provident Fund growth',
      title: 'PPF Calculator – Public Provident Fund Maturity | CalcBox',
      meta: 'Estimate your PPF maturity amount and total interest for 15 years or more with yearly deposits. Rate is editable.',
      kw: 'ppf public provident fund tax saving 80c post office', disc: 'Estimates only. PPF rates are set by the government each quarter.',
      how: 'Yearly deposits (made at the start of each year) compound annually. Maximum deposit is ₹1.5 lakh a year.',
      related: ['sip', 'fd', 'rd', 'inflation'],
      inputs: [
        { k: 'a', t: 'num', label: 'Yearly investment', pre: '₹', val: '150000' },
        { k: 'r', t: 'num', label: 'Interest rate', suf: '% p.a.', val: '7.1', half: true },
        { k: 'n', t: 'num', label: 'Time period', suf: 'years', val: '15', half: true }
      ],
      calc: function (v) {
        var e = need(v.a >= 500, 'Maturity value', 'Enter at least ₹500 a year') || need(v.r >= 0 && v.r <= 20, 'Maturity value', 'Enter an interest rate') || need(v.n >= 15 && v.n <= 50, 'Maturity value', 'PPF runs 15 years or more'); if (e) return e;
        var n = Math.round(v.n), m = 0, r = v.r / 100;
        for (var k = 1; k <= n; k++) m += v.a * Math.pow(1 + r, k);
        var inv = v.a * n, rows = [['Invested', inr(inv)], ['Interest earned', inr(m - inv)], ['Maturity value', inr(m)]];
        if (v.a > 150000) rows.push(['Note', 'Limit is ₹1.5 lakh/yr']);
        return { label: 'Maturity value', big: inr(m), sub: sub(m), rows: rows, bars: growthBars(inv, m - inv, 'Invested', 'Interest') };
      }
    },
    {
      id: 'si', slug: 'simple-interest-calculator', cat: 'money', name: 'Simple Interest', h1: 'Simple Interest Calculator', desc: 'Interest on principal only',
      title: 'Simple Interest Calculator | CalcBox',
      meta: 'Calculate simple interest and total amount from principal, rate and time instantly. Supports years and months.',
      kw: 'simple interest si principal rate time', disc: null,
      how: 'Simple interest = P × R × T ÷ 100.',
      related: ['ci', 'emi', 'fd', 'percentage'],
      inputs: [
        { k: 'p', t: 'num', label: 'Principal', pre: '₹', val: '100000' },
        { k: 'r', t: 'num', label: 'Rate', suf: '% p.a.', val: '8' },
        { k: 't', t: 'num', label: 'Time', suf: function (v) { return v.u === 'm' ? 'months' : 'years'; }, val: '3', half: true },
        { k: 'u', t: 'seg', label: 'In', val: 'y', opts: [['y', 'Years'], ['m', 'Months']], half: true }
      ],
      calc: function (v) {
        var e = need(v.p > 0, 'Interest', 'Enter the principal') || need(v.r >= 0, 'Interest', 'Enter a rate') || need(v.t > 0, 'Interest', 'Enter the time'); if (e) return e;
        var yrs = v.u === 'm' ? v.t / 12 : v.t, si = v.p * v.r * yrs / 100;
        return { label: 'Interest', big: inr(si), sub: sub(si), rows: [['Principal', inr(v.p)], ['Interest', inr(si)], ['Total amount', inr(v.p + si)], ['Per year', inr(v.p * v.r / 100)]], bars: [{ l: 'Principal', v: v.p }, { l: 'Interest', v: si }] };
      }
    },
    {
      id: 'ci', slug: 'compound-interest-calculator', cat: 'money', name: 'Compound Interest', h1: 'Compound Interest Calculator', desc: 'Interest on interest',
      title: 'Compound Interest Calculator | CalcBox',
      meta: 'Calculate compound interest with yearly, half-yearly, quarterly or monthly compounding, and compare with simple interest.',
      kw: 'compound interest ci compounding growth', disc: null,
      how: 'Amount = P × (1 + r/k)^(k × t), where k is compounding periods per year.',
      related: ['si', 'lumpsum', 'fd', 'cagr'],
      inputs: [
        { k: 'p', t: 'num', label: 'Principal', pre: '₹', val: '100000' },
        { k: 'r', t: 'num', label: 'Rate', suf: '% p.a.', val: '8', half: true },
        { k: 't', t: 'num', label: 'Time', suf: 'years', val: '5', half: true },
        { k: 'c', t: 'seg', label: 'Compounding', val: '1', opts: COMP }
      ],
      calc: function (v) {
        var e = need(v.p > 0, 'Total amount', 'Enter the principal') || need(v.r >= 0 && v.r <= 100, 'Total amount', 'Enter a rate') || need(v.t > 0 && v.t <= 100, 'Total amount', 'Enter the time'); if (e) return e;
        var k = +v.c, a = v.p * Math.pow(1 + v.r / 100 / k, k * v.t), ci = a - v.p, si = v.p * v.r * v.t / 100;
        return { label: 'Total amount', big: inr(a), sub: sub(a), rows: [['Principal', inr(v.p)], ['Compound interest', inr(ci)], ['Extra vs simple interest', inr(ci - si)], ['Compounding', COMPN[v.c]]], bars: [{ l: 'Principal', v: v.p }, { l: 'Interest', v: ci }] };
      }
    },
    {
      id: 'cagr', slug: 'cagr-calculator', cat: 'money', name: 'CAGR', h1: 'CAGR Calculator', desc: 'Yearly growth rate',
      title: 'CAGR Calculator – Compound Annual Growth Rate | CalcBox',
      meta: 'Find the compound annual growth rate of any investment from its start value, end value and number of years.',
      kw: 'cagr compound annual growth rate returns stock investment', disc: FIN,
      how: 'CAGR = (End ÷ Start)^(1 ÷ years) − 1.',
      related: ['lumpsum', 'sip', 'percentage', 'inflation'],
      inputs: [
        { k: 's', t: 'num', label: 'Start value', pre: '₹', val: '100000' },
        { k: 'e', t: 'num', label: 'End value', pre: '₹', val: '250000' },
        { k: 'n', t: 'num', label: 'Duration', suf: 'years', val: '5' }
      ],
      calc: function (v) {
        var e = need(v.s > 0, 'CAGR', 'Enter a start value') || need(v.e >= 0, 'CAGR', 'Enter an end value') || need(v.n > 0, 'CAGR', 'Enter the duration'); if (e) return e;
        var c = (Math.pow(v.e / v.s, 1 / v.n) - 1) * 100;
        return { label: 'CAGR', big: pct(c), rows: [['Total gain', inr(v.e - v.s)], ['Absolute return', pct((v.e / v.s - 1) * 100)], ['Growth', num(v.e / v.s, 2) + '×']] };
      }
    },
    {
      id: 'discount', slug: 'discount-calculator', cat: 'money', name: 'Discount', h1: 'Discount Calculator', desc: 'Sale price and savings',
      title: 'Discount Calculator – Sale Price & Savings | CalcBox',
      meta: 'Find the final price after a discount and how much you save, including an extra discount stacked on top.',
      kw: 'discount sale offer price off savings shopping coupon', disc: null,
      how: 'Final price = price × (1 − discount) × (1 − extra discount).',
      related: ['gst', 'percentage', 'profit', 'split'],
      inputs: [
        { k: 'p', t: 'num', label: 'Original price', pre: '₹', val: '2499' },
        { k: 'd', t: 'num', label: 'Discount', suf: '%', val: '20', half: true },
        { k: 'x', t: 'num', label: 'Extra discount', suf: '%', val: '0', half: true }
      ],
      calc: function (v) {
        var e = need(v.p >= 0, 'Final price', 'Enter a price') || need(v.d >= 0 && v.d <= 100, 'Final price', 'Discount must be 0–100%'); if (e) return e;
        var x = isFinite(v.x) ? Math.min(Math.max(v.x, 0), 100) : 0, f = v.p * (1 - v.d / 100) * (1 - x / 100);
        return { label: 'Final price', big: inr(f), rows: [['You save', inr(v.p - f)], ['Effective discount', pct(v.p ? (1 - f / v.p) * 100 : 0)], ['Original price', inr(v.p)]] };
      }
    },
    {
      id: 'split', slug: 'split-bill-calculator', cat: 'money', name: 'Split Bill', h1: 'Split Bill Calculator', desc: 'Share a bill fairly',
      title: 'Split Bill Calculator – Share the Bill with Tip | CalcBox',
      meta: 'Split a restaurant or trip bill between friends, with tip included. See the exact amount each person pays.',
      kw: 'split bill tip restaurant friends share divide', disc: null,
      how: 'Per person = bill × (1 + tip %) ÷ people.',
      related: ['fuel', 'discount', 'percentage', 'gst'],
      inputs: [
        { k: 'b', t: 'num', label: 'Bill amount', pre: '₹', val: '2400' },
        { k: 't', t: 'num', label: 'Tip', suf: '%', val: '10', half: true },
        { k: 'n', t: 'num', label: 'People', val: '4', half: true }
      ],
      calc: function (v) {
        var e = need(v.b >= 0, 'Each person pays', 'Enter the bill') || need(v.n >= 1, 'Each person pays', 'Enter number of people'); if (e) return e;
        var n = Math.floor(v.n), tip = v.b * (isFinite(v.t) ? v.t : 0) / 100, tot = v.b + tip, per = tot / n;
        return { label: 'Each person pays', big: inr2(per), rows: [['Tip', inr2(tip)], ['Total bill', inr2(tot)], ['Rounded up', inr(Math.ceil(per), 0)], ['People', num(n, 0)]] };
      }
    },
    {
      id: 'hike', slug: 'salary-hike-calculator', cat: 'money', name: 'Salary Hike', h1: 'Salary Hike Calculator', desc: 'New salary after hike',
      title: 'Salary Hike Calculator – New Salary & Hike % | CalcBox',
      meta: 'Calculate your new salary after an appraisal hike, or find the hike percentage from your old and new salary.',
      kw: 'salary hike increment appraisal ctc raise pay', disc: null,
      how: 'New salary = current × (1 + hike %). Hike % = (new − current) ÷ current × 100.',
      related: ['tax', 'percentage', 'inflation', 'gratuity'],
      inputs: [
        { k: 'c', t: 'num', label: 'Current salary (yearly)', pre: '₹', val: '800000' },
        { k: 'm', t: 'seg', label: 'Find', val: 'p', opts: [['p', 'New salary'], ['n', 'Hike %']] },
        { k: 'h', t: 'num', label: 'Hike', suf: '%', val: '10', show: function (v) { return v.m !== 'n'; } },
        { k: 'ns', t: 'num', label: 'New salary (yearly)', pre: '₹', val: '920000', show: function (v) { return v.m === 'n'; } }
      ],
      calc: function (v) {
        if (v.m === 'n') {
          var e1 = need(v.c > 0, 'Hike', 'Enter current salary') || need(v.ns > 0, 'Hike', 'Enter new salary'); if (e1) return e1;
          return { label: 'Hike', big: pct((v.ns / v.c - 1) * 100), rows: [['Increase per year', inr(v.ns - v.c)], ['Increase per month', inr((v.ns - v.c) / 12)], ['New monthly', inr(v.ns / 12)]] };
        }
        var e = need(v.c > 0, 'New salary', 'Enter current salary') || need(isFinite(v.h), 'New salary', 'Enter hike %'); if (e) return e;
        var n = v.c * (1 + v.h / 100);
        return { label: 'New salary (yearly)', big: inr(n), sub: sub(n), rows: [['Increase per year', inr(n - v.c)], ['New monthly', inr(n / 12)], ['Increase per month', inr((n - v.c) / 12)]] };
      }
    },
    {
      id: 'profit', slug: 'profit-margin-calculator', cat: 'money', name: 'Profit & Margin', h1: 'Profit & Margin Calculator', desc: 'Profit, margin and markup',
      title: 'Profit Margin Calculator – Profit, Margin & Markup | CalcBox',
      meta: 'Enter cost price and selling price to get profit or loss, margin % and markup % instantly.',
      kw: 'profit margin markup loss cost price selling price business', disc: null,
      how: 'Margin = profit ÷ selling price. Markup = profit ÷ cost price.',
      related: ['discount', 'gst', 'percentage', 'cagr'],
      inputs: [
        { k: 'c', t: 'num', label: 'Cost price', pre: '₹', val: '800' },
        { k: 's', t: 'num', label: 'Selling price', pre: '₹', val: '1000' }
      ],
      calc: function (v) {
        var e = need(v.c > 0, 'Profit', 'Enter cost price') || need(v.s > 0, 'Profit', 'Enter selling price'); if (e) return e;
        var p = v.s - v.c;
        return { label: p < 0 ? 'Loss' : 'Profit', big: inr(Math.abs(p)), rows: [['Margin', pct(p / v.s * 100)], ['Markup', pct(p / v.c * 100)], ['Cost price', inr(v.c)], ['Selling price', inr(v.s)]] };
      }
    },
    {
      id: 'gratuity', slug: 'gratuity-calculator', cat: 'money', name: 'Gratuity', h1: 'Gratuity Calculator', desc: 'Gratuity on leaving a job',
      title: 'Gratuity Calculator India | CalcBox',
      meta: 'Estimate your gratuity from last drawn basic salary plus DA and years of service, as per the Payment of Gratuity Act formula.',
      kw: 'gratuity job resignation retirement basic salary da service', disc: FIN,
      how: 'Covered: 15 × salary × years ÷ 26 (6+ months rounds up). Not covered: 15 × salary × completed years ÷ 30.',
      related: ['tax', 'hike', 'ppf', 'inflation'],
      inputs: [
        { k: 's', t: 'num', label: 'Monthly basic + DA', pre: '₹', val: '50000' },
        { k: 'y', t: 'num', label: 'Service', suf: 'years', val: '10', half: true },
        { k: 'mo', t: 'num', label: 'and', suf: 'months', val: '0', half: true },
        { k: 'c', t: 'seg', label: 'Employer', val: 'y', opts: [['y', 'Covered by Act'], ['n', 'Not covered']] }
      ],
      calc: function (v) {
        var e = need(v.s > 0, 'Gratuity', 'Enter your salary') || need(v.y >= 0, 'Gratuity', 'Enter years of service'); if (e) return e;
        var mo = isFinite(v.mo) ? v.mo : 0, yrs = Math.floor(v.y) + Math.floor(mo / 12), rem = mo % 12;
        var counted = v.c === 'y' ? yrs + (rem >= 6 ? 1 : 0) : yrs, g = 15 * v.s * counted / (v.c === 'y' ? 26 : 30);
        var rows = [['Years counted', num(counted, 0)], ['Salary used', inr(v.s)], ['Formula', v.c === 'y' ? '15 × salary × years ÷ 26' : '15 × salary × years ÷ 30']];
        if (yrs + rem / 12 < 5) rows.push(['Note', 'Usually needs 5+ years']);
        return { label: 'Gratuity', big: inr(g), sub: sub(g), rows: rows };
      }
    },
    {
      id: 'inflation', slug: 'inflation-calculator', cat: 'money', name: 'Inflation', h1: 'Inflation Calculator', desc: 'Future cost of money',
      title: 'Inflation Calculator – Future Cost & Value of Money | CalcBox',
      meta: 'See what something will cost in the future, and how inflation reduces the value of your money over time.',
      kw: 'inflation future value purchasing power cost price rise', disc: FIN,
      how: 'Future cost = amount × (1 + inflation)ⁿ. Future value of money = amount ÷ (1 + inflation)ⁿ.',
      related: ['sip', 'cagr', 'lumpsum', 'hike'],
      inputs: [
        { k: 'a', t: 'num', label: 'Amount today', pre: '₹', val: '100000' },
        { k: 'r', t: 'num', label: 'Inflation', suf: '% p.a.', val: '6', half: true },
        { k: 'n', t: 'num', label: 'Years', suf: 'years', val: '10', half: true }
      ],
      calc: function (v) {
        var e = need(v.a > 0, 'Future cost', 'Enter an amount') || need(v.r >= 0 && v.r <= 100, 'Future cost', 'Enter inflation rate') || need(v.n >= 0 && v.n <= 100, 'Future cost', 'Enter years'); if (e) return e;
        var f = Math.pow(1 + v.r / 100, v.n);
        return { label: 'Cost after ' + plural(v.n, 'year'), big: inr(v.a * f), sub: sub(v.a * f), rows: [['Cost today', inr(v.a)], ['Price rise', pct((f - 1) * 100)], [inr(v.a) + ' will be worth', inr(v.a / f)]] };
      }
    },
    {
      id: 'fuel', slug: 'fuel-cost-calculator', cat: 'money', name: 'Trip Fuel Cost', h1: 'Trip Fuel Cost Calculator', desc: 'Fuel cost for a trip',
      title: 'Trip Fuel Cost Calculator – Petrol & Diesel | CalcBox',
      meta: 'Estimate fuel needed and total fuel cost for a road trip, with round trip and a per-person split.',
      kw: 'fuel petrol diesel trip travel mileage road car bike cost', disc: null,
      how: 'Fuel = distance ÷ mileage. Cost = fuel × price per litre.',
      related: ['split', 'unit', 'discount', 'inflation'],
      inputs: [
        { k: 'd', t: 'num', label: 'Distance', suf: 'km', val: '350' },
        { k: 'm', t: 'num', label: 'Mileage', suf: 'km/L', val: '15', half: true },
        { k: 'p', t: 'num', label: 'Fuel price', pre: '₹', suf: '/L', val: '103', half: true },
        { k: 'rt', t: 'check', label: 'Round trip', val: false },
        { k: 'n', t: 'num', label: 'Split between', suf: 'people', val: '1' }
      ],
      calc: function (v) {
        var e = need(v.d > 0, 'Fuel cost', 'Enter distance') || need(v.m > 0, 'Fuel cost', 'Enter mileage') || need(v.p > 0, 'Fuel cost', 'Enter fuel price'); if (e) return e;
        var dist = v.d * (v.rt ? 2 : 1), l = dist / v.m, c = l * v.p, n = v.n >= 1 ? Math.floor(v.n) : 1;
        var rows = [['Total distance', num(dist) + ' km'], ['Fuel needed', num(l) + ' L'], ['Cost per km', inr(v.p / v.m, 2)]];
        if (n > 1) rows.push(['Per person', inr(c / n)]);
        return { label: 'Fuel cost', big: inr(c, 0), rows: rows };
      }
    },

    /* ===== EVERYDAY ===== */
    {
      id: 'percentage', slug: 'percentage-calculator', cat: 'everyday', name: 'Percentage', h1: 'Percentage Calculator', desc: 'Percent of, change, ratio',
      title: 'Percentage Calculator – % of, % change | CalcBox',
      meta: 'Find X% of a number, what percent one number is of another, or the percentage increase or decrease.',
      kw: 'percent percentage change increase decrease ratio marks', disc: null,
      how: 'X% of Y = X × Y ÷ 100. Change % = (new − old) ÷ old × 100.',
      related: ['discount', 'average', 'cgpa', 'hike'],
      inputs: [
        { k: 'm', t: 'seg', label: 'Find', val: 'of', opts: [['of', 'X% of Y'], ['is', 'X is ?% of Y'], ['ch', '% change']] },
        { k: 'a', t: 'num', label: function (v) { return v.m === 'of' ? 'Percent (X)' : v.m === 'is' ? 'Value (X)' : 'From'; }, suf: function (v) { return v.m === 'of' ? '%' : ''; }, val: '20', half: true },
        { k: 'b', t: 'num', label: function (v) { return v.m === 'ch' ? 'To' : 'Total (Y)'; }, val: '500', half: true }
      ],
      calc: function (v) {
        var e = need(isFinite(v.a) && isFinite(v.b), 'Result', 'Enter both numbers'); if (e) return e;
        if (v.m === 'of') { var r = v.a * v.b / 100; return { label: num(v.a) + '% of ' + num(v.b), big: num(r, 4), rows: [[num(v.b) + ' + ' + num(v.a) + '%', num(v.b + r, 4)], [num(v.b) + ' − ' + num(v.a) + '%', num(v.b - r, 4)]] }; }
        if (v.m === 'is') { if (!v.b) return { label: 'Result', err: 'Total can’t be zero' }; var p = v.a / v.b * 100; return { label: num(v.a) + ' is this % of ' + num(v.b), big: pct(p, 4), rows: [['Remaining', pct(100 - p, 4)], ['Ratio', num(v.a / v.b, 4)]] }; }
        if (!v.a) return { label: 'Change', err: 'Starting value can’t be zero' };
        var c = (v.b - v.a) / Math.abs(v.a) * 100;
        return { label: c >= 0 ? 'Increase' : 'Decrease', big: pct(Math.abs(c), 4), rows: [['Difference', num(v.b - v.a, 4)], ['Change', (c >= 0 ? '+' : '−') + pct(Math.abs(c), 4)]] };
      }
    },
    {
      id: 'age', slug: 'age-calculator', cat: 'everyday', name: 'Age', h1: 'Age Calculator', desc: 'Exact age, next birthday',
      title: 'Age Calculator – Exact Age & Next Birthday | CalcBox',
      meta: 'Calculate exact age in years, months and days, plus total days lived and a countdown to your next birthday.',
      kw: 'age birthday date of birth dob years old', disc: null,
      how: 'Counts full years, then months, then days between the two dates.',
      related: ['days', 'adddays', 'due', 'percentage'],
      inputs: [
        { k: 'b', t: 'date', label: 'Date of birth', val: '1995-08-15' },
        { k: 'o', t: 'date', label: 'Age on', val: function () { return iso(today()); } }
      ],
      calc: function (v) {
        var b = pd(v.b), o = pd(v.o);
        var e = need(b, 'Age', 'Pick a date of birth') || need(o, 'Age', 'Pick a date') || need(b <= o, 'Age', 'Birth date is after the “age on” date'); if (e) return e;
        var a = ymd(b, o), days = dayN(o) - dayN(b);
        var nb = new Date(o.getFullYear(), b.getMonth(), b.getDate()); if (nb < o) nb = new Date(o.getFullYear() + 1, b.getMonth(), b.getDate());
        var dn = dayN(nb) - dayN(o);
        return {
          label: 'Age', big: plural(a.y, 'year'), sub: plural(a.m, 'month') + ', ' + plural(a.d, 'day'),
          rows: [['Next birthday', dn === 0 ? 'Today!' : 'in ' + plural(dn, 'day')], ['On', fdate(nb) + ', ' + wday(nb).slice(0, 3)], ['Total months', num(a.y * 12 + a.m, 0)], ['Total weeks', num(Math.floor(days / 7), 0)], ['Total days', num(days, 0)], ['Born on a', wday(b)]]
        };
      }
    },
    {
      id: 'days', slug: 'days-between-dates', cat: 'everyday', name: 'Days Between Dates', h1: 'Days Between Dates', desc: 'Days and working days',
      title: 'Days Between Dates Calculator – With Working Days | CalcBox',
      meta: 'Count the days, weeks and working days (Monday to Friday) between two dates instantly.',
      kw: 'days between dates count duration working business weekdays calendar', disc: null,
      how: 'Days are counted from the start date up to the end date. Working days are Monday to Friday.',
      related: ['adddays', 'age', 'due', 'average'],
      inputs: [
        { k: 's', t: 'date', label: 'Start date', val: function () { return iso(today()); }, half: true },
        { k: 'e', t: 'date', label: 'End date', val: function () { var t = today(); return iso(new Date(t.getFullYear(), 11, 31)); }, half: true },
        { k: 'i', t: 'check', label: 'Include end date', val: false }
      ],
      calc: function (v) {
        var s = pd(v.s), e = pd(v.e);
        var er = need(s && e, 'Days', 'Pick both dates'); if (er) return er;
        var sw = false; if (e < s) { var t = s; s = e; e = t; sw = true; }
        var n = dayN(e) - dayN(s) + (v.i ? 1 : 0), w = 0, cap = Math.min(n, 400000);
        for (var k = 0; k < cap; k++) if (isWork(addD(s, k))) w++;
        var rows = [['Weeks', plural(Math.floor(n / 7), 'week') + (n % 7 ? ', ' + plural(n % 7, 'day') : '')], ['Months', ymdText(ymd(s, v.i ? addD(e, 1) : e))], ['Working days', num(w, 0)], ['Weekend days', num(n - w, 0)]];
        if (sw) rows.push(['Note', 'Dates were swapped']);
        return { label: 'Days', big: num(n, 0), sub: n === 1 ? 'day' : 'days', rows: rows };
      }
    },
    {
      id: 'adddays', slug: 'add-subtract-days', cat: 'everyday', name: 'Add/Subtract Days', h1: 'Add or Subtract Days', desc: 'Date after N days',
      title: 'Add or Subtract Days from a Date | CalcBox',
      meta: 'Add or subtract days, weeks, months, years or working days from any date and get the exact result date.',
      kw: 'add subtract days date calculator deadline future past working business', disc: null,
      how: 'Moves the date forward or back. Working days skip Saturdays and Sundays.',
      related: ['days', 'age', 'due', 'percentage'],
      inputs: [
        { k: 'd', t: 'date', label: 'Start date', val: function () { return iso(today()); } },
        { k: 'o', t: 'seg', label: 'Operation', val: 'add', opts: [['add', 'Add'], ['sub', 'Subtract']] },
        { k: 'n', t: 'num', label: 'Amount', val: '30', half: true },
        { k: 'u', t: 'sel', label: 'Unit', val: 'd', half: true, opts: [['d', 'Days'], ['w', 'Working days'], ['wk', 'Weeks'], ['m', 'Months'], ['y', 'Years']] }
      ],
      calc: function (v) {
        var d = pd(v.d);
        var e = need(d, 'Result date', 'Pick a start date') || need(isFinite(v.n) && v.n >= 0 && v.n <= 100000, 'Result date', 'Enter an amount'); if (e) return e;
        var n = Math.floor(v.n), sg = v.o === 'sub' ? -1 : 1, r;
        if (v.u === 'd') r = addD(d, sg * n);
        else if (v.u === 'wk') r = addD(d, sg * n * 7);
        else if (v.u === 'm') r = addM(d, sg * n);
        else if (v.u === 'y') r = addM(d, sg * n * 12);
        else { r = d; var c = 0; while (c < n) { r = addD(r, sg); if (isWork(r)) c++; } }
        var diff = dayN(r) - dayN(d);
        return { label: 'Result date', big: fdate(r), sub: wday(r), rows: [['Calendar days', (diff > 0 ? '+' : '') + num(diff, 0)], ['Date', iso(r)]] };
      }
    },
    {
      id: 'unit', slug: 'unit-converter', cat: 'everyday', name: 'Unit Converter', h1: 'Unit Converter', desc: 'Length, weight, temp, area',
      title: 'Unit Converter – Length, Weight, Temperature, Area | CalcBox',
      meta: 'Convert length, weight, temperature and area units, including sq ft, square metre, acre, cent, guntha and hectare.',
      kw: 'unit convert conversion length weight temperature area sq ft acre km miles kg pound celsius fahrenheit cm inch feet hectare', disc: null,
      how: 'Converts through a base unit (metre, kilogram, square metre or Celsius).',
      related: ['fuel', 'bmi', 'percentage', 'average'],
      inputs: [
        { k: 'cat', t: 'seg', label: 'Type', val: 'length', opts: [['length', 'Length'], ['weight', 'Weight'], ['temp', 'Temp'], ['area', 'Area']] },
        { k: 'v', t: 'num', label: 'Value', val: '5' },
        { k: 'f', t: 'sel', label: 'From', val: 'km', half: true, opts: unitOpts },
        { k: 'to', t: 'sel', label: 'To', val: 'mi', half: true, opts: unitOpts }
      ],
      fix: function (v) {
        var U = UNITS[v.cat] || UNITS.length, ok = function (u) { return U.u.some(function (x) { return x[0] === u; }); };
        if (!UNITS[v.cat]) v.cat = 'length';
        if (!ok(v.f)) v.f = U.d[0];
        if (!ok(v.to)) v.to = U.d[1];
      },
      calc: function (v) {
        var e = need(isFinite(v.v), 'Result', 'Enter a value'); if (e) return e;
        var r = conv(v.cat, v.v, v.f, v.to);
        var rows = UNITS[v.cat].u.filter(function (x) { return x[0] !== v.f && x[0] !== v.to; }).map(function (x) { return [x[1], sig(conv(v.cat, v.v, v.f, x[0])) + ' ' + usym(x[0])]; });
        return { label: sig(v.v) + ' ' + usym(v.f) + ' =', big: sig(r) + ' ' + usym(v.to), rows: rows };
      }
    },
    {
      id: 'average', slug: 'average-calculator', cat: 'everyday', name: 'Average', h1: 'Average Calculator', desc: 'Mean, median and mode',
      title: 'Average Calculator – Mean, Median, Mode | CalcBox',
      meta: 'Paste or type a list of numbers to get the average, median, mode, sum, minimum, maximum and range.',
      kw: 'average mean median mode sum statistics marks numbers', disc: null,
      how: 'Average = sum ÷ count. Median is the middle value when sorted.',
      related: ['percentage', 'cgpa', 'wc', 'unit'],
      inputs: [{ k: 'x', t: 'area', label: 'Numbers (comma, space or new line)', val: '72, 85, 90, 66, 85, 78', rows: 4 }],
      calc: function (v) {
        var a = String(v.x || '').split(/[\s,;]+/).map(pn).filter(isFinite);
        if (!a.length) return { label: 'Average', err: 'Enter some numbers' };
        var s = a.reduce(function (p, c) { return p + c; }, 0), so = a.slice().sort(function (p, q) { return p - q; }), n = a.length;
        var med = n % 2 ? so[(n - 1) / 2] : (so[n / 2 - 1] + so[n / 2]) / 2, f = {}, mx = 0;
        a.forEach(function (x) { f[x] = (f[x] || 0) + 1; if (f[x] > mx) mx = f[x]; });
        var modes = mx > 1 ? Object.keys(f).filter(function (k) { return f[k] === mx; }).map(Number).sort(function (p, q) { return p - q; }) : [];
        return { label: 'Average', big: num(s / n, 4), rows: [['Count', num(n, 0)], ['Sum', num(s, 4)], ['Median', num(med, 4)], ['Mode', modes.length ? modes.slice(0, 5).map(function (m) { return num(m, 4); }).join(', ') : 'None'], ['Min / Max', num(so[0], 4) + ' / ' + num(so[n - 1], 4)], ['Range', num(so[n - 1] - so[0], 4)]] };
      }
    },
    {
      id: 'cgpa', slug: 'cgpa-to-percentage', cat: 'everyday', name: 'CGPA to Percentage', h1: 'CGPA to Percentage', desc: 'Convert CGPA to %',
      title: 'CGPA to Percentage Calculator | CalcBox',
      meta: 'Convert CGPA to percentage using the ×9.5 CBSE method or other common university formulas.',
      kw: 'cgpa sgpa gpa percentage marks cbse university grade convert', disc: 'Formulas differ by board and university. Check yours.',
      how: 'CBSE: percentage = CGPA × 9.5. Some universities use CGPA × 10 or (CGPA − 0.75) × 10.',
      related: ['percentage', 'average', 'age', 'wc'],
      inputs: [
        { k: 'g', t: 'num', label: 'CGPA (out of 10)', val: '8.4' },
        { k: 'f', t: 'sel', label: 'Formula', val: '95', opts: [['95', 'CGPA × 9.5 (CBSE)'], ['10', 'CGPA × 10'], ['075', '(CGPA − 0.75) × 10'], ['05', '(CGPA − 0.5) × 10']] }
      ],
      calc: function (v) {
        var e = need(v.g >= 0 && v.g <= 10, 'Percentage', 'Enter a CGPA from 0 to 10'); if (e) return e;
        var p = v.f === '10' ? v.g * 10 : v.f === '075' ? (v.g - 0.75) * 10 : v.f === '05' ? (v.g - 0.5) * 10 : v.g * 9.5;
        p = Math.max(0, Math.min(100, p));
        var div = p >= 75 ? 'First with Distinction' : p >= 60 ? 'First' : p >= 50 ? 'Second' : p >= 40 ? 'Pass' : '—';
        return { label: 'Percentage', big: pct(p), rows: [['Division (typical)', div], ['Out of 4.0 scale', num(v.g * 0.4, 2)]] };
      }
    },
    {
      id: 'words', slug: 'number-to-words', cat: 'everyday', name: 'Number to Words', h1: 'Number to Words', desc: 'Rupees in words for cheques',
      title: 'Number to Words Converter – Rupees for Cheques | CalcBox',
      meta: 'Convert numbers to words in the Indian lakh and crore system, ready to write on cheques. Includes paise and international format.',
      kw: 'number words rupees cheque check amount lakh crore spell convert', disc: null,
      how: 'Uses the Indian system: thousand, lakh (1,00,000) and crore (1,00,00,000).',
      related: ['gst', 'percentage', 'unit', 'emi'],
      inputs: [{ k: 'n', t: 'text', label: 'Amount', pre: '₹', val: '1234567.50', mode: 'decimal' }],
      calc: function (v) {
        var s = String(v.n || '').replace(/[,₹\s]/g, '');
        if (!/^\d+(\.\d*)?$/.test(s)) return { label: 'In words', err: 'Enter a number' };
        var parts = s.split('.'), ip = parts[0].replace(/^0+(?=\d)/, ''), fp = ((parts[1] || '') + '000');
        if (ip.length > 15) return { label: 'In words', err: 'Up to 15 digits' };
        var r = parseInt(ip, 10), p = parseInt(fp.slice(0, 2), 10) + (+fp[2] >= 5 ? 1 : 0);
        if (p === 100) { r += 1; p = 0; }
        var w = wIN(r) + (r === 1 ? ' Rupee' : ' Rupees') + (p ? ' and ' + w99(p) + ' Paise' : '');
        var chq = 'Rupees ' + wIN(r) + (p ? ' and ' + w99(p) + ' Paise' : '') + ' Only';
        return { label: 'In words', big: w, long: true, copy: chq, rows: [['In figures', '₹' + r.toLocaleString(L) + (p ? '.' + String(p).padStart(2, '0') : '')], ['For cheque', chq], ['International', wINTL(r) + (p ? ' and ' + w99(p) + ' Paise' : '')]] };
      }
    },

    /* ===== HEALTH ===== */
    {
      id: 'bmi', slug: 'bmi-calculator', cat: 'health', name: 'BMI', h1: 'BMI Calculator', desc: 'Body mass index',
      title: 'BMI Calculator – Body Mass Index | CalcBox',
      meta: 'Calculate your BMI using cm or feet and inches, with your weight category and healthy weight range.',
      kw: 'bmi body mass index weight height obesity health', disc: HEALTH,
      how: 'BMI = weight (kg) ÷ height (m)². WHO ranges: under 18.5, 18.5–24.9, 25–29.9, 30+.',
      related: ['calorie', 'due', 'unit', 'age'],
      inputs: [
        { k: 'u', t: 'seg', label: 'Height in', val: 'cm', opts: [['cm', 'cm'], ['ft', 'ft + in']] },
        { k: 'h', t: 'num', label: 'Height', suf: 'cm', val: '170', show: function (v) { return v.u !== 'ft'; } },
        { k: 'ft', t: 'num', label: 'Feet', suf: 'ft', val: '5', half: true, show: function (v) { return v.u === 'ft'; } },
        { k: 'in', t: 'num', label: 'Inches', suf: 'in', val: '7', half: true, show: function (v) { return v.u === 'ft'; } },
        { k: 'w', t: 'num', label: 'Weight', suf: 'kg', val: '65' }
      ],
      calc: function (v) {
        var hm = v.u === 'ft' ? ((v.ft || 0) * 12 + (isFinite(v['in']) ? v['in'] : 0)) * 0.0254 : v.h / 100;
        var e = need(hm > 0.5 && hm < 2.8, 'BMI', 'Enter your height') || need(v.w > 2 && v.w < 500, 'BMI', 'Enter your weight'); if (e) return e;
        var b = v.w / (hm * hm), cat = b < 18.5 ? 'Underweight' : b < 25 ? 'Healthy' : b < 30 ? 'Overweight' : 'Obese';
        return {
          label: 'Your BMI', big: num(b, 1), sub: cat,
          scale: { min: 12, max: 40, v: b, seg: [[18.5, 'Under'], [25, 'Healthy'], [30, 'Over'], [40, 'Obese']] },
          rows: [['Category', cat], ['Healthy weight', num(18.5 * hm * hm, 1) + '–' + num(24.9 * hm * hm, 1) + ' kg'], ['Height', num(hm * 100, 1) + ' cm']]
        };
      }
    },
    {
      id: 'calorie', slug: 'calorie-calculator', cat: 'health', name: 'Daily Calories', h1: 'Daily Calorie Calculator', desc: 'Calories you need daily',
      title: 'Calorie Calculator – Daily Calorie Needs | CalcBox',
      meta: 'Estimate the calories you need each day to maintain, lose or gain weight, using the Mifflin-St Jeor formula.',
      kw: 'calorie calories tdee bmr diet weight loss gain maintenance', disc: HEALTH,
      how: 'BMR (Mifflin-St Jeor) × activity factor = daily calories to maintain weight.',
      related: ['bmi', 'due', 'age', 'unit'],
      inputs: [
        { k: 's', t: 'seg', label: 'Sex', val: 'm', opts: [['m', 'Male'], ['f', 'Female']] },
        { k: 'a', t: 'num', label: 'Age', suf: 'years', val: '30' },
        { k: 'h', t: 'num', label: 'Height', suf: 'cm', val: '170', half: true },
        { k: 'w', t: 'num', label: 'Weight', suf: 'kg', val: '70', half: true },
        { k: 'act', t: 'sel', label: 'Activity', val: '1.375', opts: [['1.2', 'Little or no exercise'], ['1.375', 'Light: 1–3 days/week'], ['1.55', 'Moderate: 3–5 days/week'], ['1.725', 'Active: 6–7 days/week'], ['1.9', 'Very active / physical job']] }
      ],
      calc: function (v) {
        var e = need(v.a >= 15 && v.a <= 100, 'Calories / day', 'Enter age (15–100)') || need(v.h > 100 && v.h < 250, 'Calories / day', 'Enter height in cm') || need(v.w > 25 && v.w < 300, 'Calories / day', 'Enter weight in kg'); if (e) return e;
        var bmr = 10 * v.w + 6.25 * v.h - 5 * v.a + (v.s === 'f' ? -161 : 5), t = bmr * parseFloat(v.act);
        var k = function (x) { return num(Math.round(x / 10) * 10, 0) + ' kcal'; };
        return { label: 'Calories / day to maintain', big: num(Math.round(t / 10) * 10, 0), sub: 'kcal', rows: [['Mild loss (~0.25 kg/wk)', k(t - 250)], ['Loss (~0.5 kg/wk)', k(t - 500)], ['Gain (~0.5 kg/wk)', k(t + 500)], ['BMR (at rest)', k(bmr)]] };
      }
    },
    {
      id: 'due', slug: 'pregnancy-due-date-calculator', cat: 'health', name: 'Pregnancy Due Date', h1: 'Pregnancy Due Date Calculator', desc: 'Due date and week',
      title: 'Pregnancy Due Date Calculator | CalcBox',
      meta: 'Estimate your baby’s due date, current pregnancy week and trimester from the first day of your last period.',
      kw: 'pregnancy due date edd lmp week trimester baby conception', disc: HEALTH,
      how: 'Due date = first day of last period + 280 days, adjusted for cycle length (Naegele’s rule).',
      related: ['days', 'adddays', 'age', 'bmi'],
      inputs: [
        { k: 'l', t: 'date', label: 'First day of last period', val: function () { return iso(addD(today(), -70)); } },
        { k: 'c', t: 'num', label: 'Cycle length', suf: 'days', val: '28' }
      ],
      calc: function (v) {
        var l = pd(v.l), c = isFinite(v.c) && v.c >= 20 && v.c <= 45 ? Math.round(v.c) : 28, t = today();
        var e = need(l, 'Estimated due date', 'Pick a date') || need(l <= t, 'Estimated due date', 'Date can’t be in the future'); if (e) return e;
        var edd = addD(l, 280 + c - 28), ga = dayN(t) - dayN(l) - (c - 28), left = dayN(edd) - dayN(t);
        var rows = [];
        if (ga >= 0 && left >= -14) {
          var wk = Math.floor(ga / 7);
          rows.push(['Pregnancy week', plural(wk, 'week') + ', ' + plural(ga % 7, 'day')]);
          rows.push(['Trimester', wk < 13 ? 'First' : wk < 27 ? 'Second' : 'Third']);
          rows.push(['Days to go', left >= 0 ? num(left, 0) : 'Past due date']);
        }
        rows.push(['Likely conception', fdate(addD(l, 14 + c - 28))]);
        return { label: 'Estimated due date', big: fdate(edd), sub: wday(edd), rows: rows };
      }
    },

    /* ===== TEXT ===== */
    {
      id: 'wc', slug: 'word-counter', cat: 'text', name: 'Word Counter', h1: 'Word Counter', desc: 'Words, characters, time',
      title: 'Word Counter – Words, Characters, Reading Time | CalcBox',
      meta: 'Count words, characters, sentences and paragraphs as you type, with reading and speaking time.',
      kw: 'word count counter characters letters sentences essay text reading time', disc: null,
      how: 'Reading time at 238 words per minute, speaking at 130.',
      related: ['case', 'pw', 'average', 'words'],
      inputs: [{ k: 't', t: 'area', label: 'Your text', rows: 7, val: 'Paste or type your text here. CalcBox counts words, characters and sentences instantly.' }],
      calc: function (v) {
        var s = String(v.t || ''), w = (s.match(/[^\s]+/g) || []).length;
        var sen = (s.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).filter(function (x) { return /\w/.test(x); }).length;
        var par = s.split(/\n\s*\n/).filter(function (x) { return x.trim(); }).length;
        var mt = function (m) { return m < 1 ? Math.max(0, Math.ceil(m * 60)) + ' sec' : num(Math.floor(m), 0) + ' min ' + Math.round((m % 1) * 60) + ' sec'; };
        return { label: 'Words', big: num(w, 0), rows: [['Characters', num(s.length, 0)], ['Without spaces', num(s.replace(/\s/g, '').length, 0)], ['Sentences', num(sen, 0)], ['Paragraphs', num(par, 0)], ['Reading time', mt(w / 238)], ['Speaking time', mt(w / 130)]] };
      }
    },
    {
      id: 'case', slug: 'case-converter', cat: 'text', name: 'Case Converter', h1: 'Case Converter', desc: 'UPPER, lower, Title case',
      title: 'Case Converter – UPPER, lower, Title Case & more | CalcBox',
      meta: 'Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case or kebab-case instantly.',
      kw: 'case converter uppercase lowercase title sentence camel snake kebab capital text', disc: null,
      how: 'Converts your text as you type. Copy the result in one tap.',
      related: ['wc', 'pw', 'words', 'average'],
      inputs: [
        { k: 't', t: 'area', label: 'Your text', rows: 5, val: 'the quick brown fox jumps over the lazy dog' },
        { k: 'm', t: 'seg', label: 'Convert to', val: 'title', opts: [['upper', 'UPPER'], ['lower', 'lower'], ['title', 'Title Case'], ['sentence', 'Sentence'], ['camel', 'camelCase'], ['snake', 'snake_case'], ['kebab', 'kebab-case']] }
      ],
      calc: function (v) {
        var s = String(v.t || ''), o, words = function () { return s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-z0-9À-￿]+/i).filter(Boolean); };
        switch (v.m) {
          case 'upper': o = s.toUpperCase(); break;
          case 'lower': o = s.toLowerCase(); break;
          case 'sentence': o = s.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-zà-ÿ])/g, function (m, a, b) { return a + b.toUpperCase(); }); break;
          case 'camel': o = words().map(function (w, i) { return i ? w[0].toUpperCase() + w.slice(1) : w; }).join(''); break;
          case 'snake': o = words().join('_'); break;
          case 'kebab': o = words().join('-'); break;
          default: o = s.toLowerCase().replace(/(^|[\s\-(“"'])(\p{L})/gu, function (m, a, b) { return a + b.toUpperCase(); });
        }
        return { label: 'Result', text: o, copy: o, rows: [['Characters', num(o.length, 0)]] };
      }
    },
    {
      id: 'pw', slug: 'password-generator', cat: 'text', name: 'Password Generator', h1: 'Password Generator', desc: 'Strong random passwords',
      title: 'Password Generator – Strong Random Passwords | CalcBox',
      meta: 'Generate strong, random passwords right in your browser. Choose length, numbers and symbols. Nothing is sent or stored.',
      kw: 'password generator random strong secure passphrase', disc: 'Generated on your device. Never sent or stored.',
      how: 'Uses your browser’s secure random generator (crypto.getRandomValues).', client: true,
      related: ['case', 'wc', 'words', 'unit'],
      inputs: [
        { k: 'n', t: 'num', label: 'Length', suf: 'characters', val: '16' },
        { k: 'U', t: 'check', label: 'Uppercase', val: true, half: true },
        { k: 'l', t: 'check', label: 'Lowercase', val: true, half: true },
        { k: 'd', t: 'check', label: 'Numbers', val: true, half: true },
        { k: 's', t: 'check', label: 'Symbols', val: true, half: true },
        { k: 'x', t: 'check', label: 'Avoid look-alikes (O 0 l 1)', val: false },
        { k: 'g', t: 'btn', label: 'New password' }
      ],
      calc: function (v) {
        var n = Math.round(v.n);
        var e = need(n >= 4 && n <= 128, 'Password', 'Length 4–128'); if (e) return e;
        var sets = [], amb = /[O0Il1|]/g;
        if (v.U) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'); if (v.l) sets.push('abcdefghijklmnopqrstuvwxyz');
        if (v.d) sets.push('0123456789'); if (v.s) sets.push('!@#$%^&*()-_=+[]{};:,.?/');
        if (v.x) sets = sets.map(function (x) { return x.replace(amb, ''); });
        if (!sets.length) return { label: 'Password', err: 'Pick at least one character type' };
        var cr = root.crypto; if (!cr || !cr.getRandomValues) return { label: 'Password', err: 'Secure random not available' };
        var rnd = function (m) { var lim = Math.floor(4294967296 / m) * m, b = new Uint32Array(1); do { cr.getRandomValues(b); } while (b[0] >= lim); return b[0] % m; };
        var pool = sets.join(''), ch = sets.map(function (x) { return x[rnd(x.length)]; });
        while (ch.length < n) ch.push(pool[rnd(pool.length)]);
        for (var i = ch.length - 1; i > 0; i--) { var j = rnd(i + 1), t = ch[i]; ch[i] = ch[j]; ch[j] = t; }
        var pw = ch.slice(0, n).join(''), bits = n * Math.log2(pool.length);
        var st = bits < 40 ? 'Weak' : bits < 60 ? 'Fair' : bits < 80 ? 'Strong' : 'Very strong';
        return { label: 'Password', big: pw, mono: true, long: n > 20, copy: pw, sub: st, scale: { min: 0, max: 128, v: Math.min(bits, 128), seg: [[40, 'Weak'], [60, 'Fair'], [80, 'Strong'], [128, 'Very strong']] }, rows: [['Strength', st + ' · ' + num(bits, 0) + ' bits']] };
      }
    }
  ];

  var byId = {}; T.forEach(function (t) { byId[t.id] = t; });

  /* ---------- shared renderers ---------- */
  function val(i, v) { var f = i.val; return typeof f === 'function' ? f(v) : f; }
  function resolve(x, v) { return typeof x === 'function' ? x(v) : x; }
  function defaults(t) { var v = {}; t.inputs.forEach(function (i) { v[i.k] = i.t === 'btn' ? 0 : val(i, v); }); return v; }
  function parse(t, raw) { var v = {}; t.inputs.forEach(function (i) { v[i.k] = i.t === 'num' ? pn(raw[i.k]) : raw[i.k]; }); return v; }

  function renderField(i, v) {
    var id = 'i-' + i.k, lab = esc(resolve(i.label, v)), hid = i.show && !i.show(v) ? ' hidden' : '';
    var cls = 'f f-' + i.t + (i.half ? ' half' : '');
    if (i.t === 'check') return '<div class="' + cls + '" data-k="' + i.k + '"' + hid + '><label class="chk"><input type="checkbox" name="' + i.k + '"' + (v[i.k] ? ' checked' : '') + '><span class="sw" aria-hidden="true"></span><span data-lbl>' + lab + '</span></label></div>';
    if (i.t === 'btn') return '<div class="' + cls + '" data-k="' + i.k + '"' + hid + '><button type="button" class="btn" data-btn="' + i.k + '">' + svg(UI.refresh) + '<span>' + lab + '</span></button></div>';
    var h = '<div class="' + cls + '" data-k="' + i.k + '"' + hid + '>';
    if (i.t === 'seg') {
      h += '<span class="lbl" id="l-' + i.k + '" data-lbl>' + lab + '</span><div class="seg" role="radiogroup" aria-labelledby="l-' + i.k + '">';
      i.opts.forEach(function (o) { h += '<label><input type="radio" name="' + i.k + '" value="' + esc(o[0]) + '"' + (String(v[i.k]) === o[0] ? ' checked' : '') + '><span>' + esc(o[1]) + '</span></label>'; });
      return h + '</div></div>';
    }
    h += '<label class="lbl" for="' + id + '" data-lbl>' + lab + '</label>';
    if (i.t === 'area') return h + '<textarea id="' + id + '" name="' + i.k + '" rows="' + (i.rows || 4) + '" spellcheck="false">' + esc(v[i.k]) + '</textarea></div>';
    h += '<div class="inp">' + (i.pre ? '<span class="pre">' + esc(i.pre) + '</span>' : '');
    if (i.t === 'sel') {
      h += '<select id="' + id + '" name="' + i.k + '">' + resolve(i.opts, v).map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(v[i.k]) === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select><svg class="caret" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 10l5 5 5-5"/></svg>';
    } else if (i.t === 'date') {
      h += '<input id="' + id + '" name="' + i.k + '" type="date" value="' + esc(v[i.k]) + '">';
    } else {
      h += '<input id="' + id + '" name="' + i.k + '" type="text" inputmode="' + (i.mode || 'decimal') + '" autocomplete="off" enterkeyhint="done" value="' + esc(v[i.k]) + '">';
    }
    var suf = resolve(i.suf, v);
    h += '<span class="suf" data-suf' + (suf ? '' : ' hidden') + '>' + esc(suf || '') + '</span></div>';
    if (i.pre === '₹') h += '<div class="hint" data-hint>' + esc(hintFor(v[i.k])) + '</div>';
    return h + '</div>';
  }
  function hintFor(s) { var x = pn(s); return isFinite(x) && Math.abs(x) >= 1000 ? '₹' + compact(x) : ''; }
  function renderForm(t, v) { return t.inputs.map(function (i) { return renderField(i, v); }).join(''); }

  function renderResult(r) {
    var h = '';
    if (r.err) return '<div class="res-main"><div class="res-label">' + esc(r.label || 'Result') + '</div><div class="res-big is-empty">—</div><div class="res-err">' + esc(r.err) + '</div></div>';
    if (r.text != null) {
      h += '<div class="res-main"><div class="res-label">' + esc(r.label) + '</div><div class="res-text">' + (r.text ? esc(r.text) : '<span class="muted">Type some text</span>') + '</div></div>';
    } else {
      h += '<div class="res-main"><div class="res-label">' + esc(r.label) + '</div><div class="res-big' + (r.long ? ' is-long' : '') + (r.mono ? ' is-mono' : '') + '">' + esc(r.big) + '</div>' + (r.sub ? '<div class="res-sub">' + esc(r.sub) + '</div>' : '') + '</div>';
    }
    if (r.scale) {
      var s = r.scale, pos = Math.max(0, Math.min(100, (s.v - s.min) / (s.max - s.min) * 100)), prev = s.min;
      h += '<div class="scale" aria-hidden="true"><div class="scale-bar">';
      s.seg.forEach(function (g, ix) { h += '<span class="sg sg' + ix + '" style="width:' + ((g[0] - prev) / (s.max - s.min) * 100).toFixed(2) + '%"></span>'; prev = g[0]; });
      h += '<i class="scale-dot" style="left:' + pos.toFixed(2) + '%"></i></div><div class="scale-lbl">';
      prev = s.min;
      s.seg.forEach(function (g) { h += '<span style="width:' + ((g[0] - prev) / (s.max - s.min) * 100).toFixed(2) + '%">' + esc(g[1]) + '</span>'; prev = g[0]; });
      h += '</div></div>';
    }
    if (r.bars) {
      var tot = r.bars.reduce(function (p, b) { return p + Math.max(0, b.v); }, 0) || 1;
      h += '<div class="bars"><div class="bar" role="img" aria-label="' + esc(r.bars.map(function (b) { return b.l + ' ' + Math.round(b.v / tot * 100) + '%'; }).join(', ')) + '">';
      r.bars.forEach(function (b, ix) { h += '<span class="b' + ix + '" style="width:' + (Math.max(0, b.v) / tot * 100).toFixed(2) + '%"></span>'; });
      h += '</div><div class="legend">';
      r.bars.forEach(function (b, ix) { h += '<div><i class="b' + ix + '"></i><span>' + esc(b.l) + '</span><b>' + Math.round(Math.max(0, b.v) / tot * 100) + '%</b></div>'; });
      h += '</div></div>';
    }
    if (r.rows && r.rows.length) {
      h += '<dl class="rows">' + r.rows.map(function (x) { return '<div><dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl>';
    }
    return h;
  }

  var api = {
    tools: T, byId: byId, cats: CATS, icons: I, ui: UI, svg: svg, logo: LOGO, esc: esc,
    defaults: defaults, parse: parse, resolve: resolve, renderForm: renderForm, renderField: renderField, renderResult: renderResult, hintFor: hintFor, pn: pn
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CB = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
