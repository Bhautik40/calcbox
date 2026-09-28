/* Search-targeted answer pages ("30 lakh home loan EMI", "income tax on 15 lakh salary", …).
   Each page = a tool with preset values + an instant answer + a comparison table. Built by build.js. */
module.exports = function (C) {
  const run = (id, vals) => { const t = C.byId[id]; const raw = Object.assign(C.defaults(t), vals); if (t.fix) t.fix(raw); return t.calc(C.parse(t, raw)); };
  const row = (r, label) => { const x = (r.rows || []).find(q => q[0] === label); return x ? x[1] : '—'; };
  const lakh = n => (n >= 1e7 ? (n / 1e7) + ' Crore' : (n / 1e5) + ' Lakh');
  const P = [];

  /* ---------- EMI ---------- */
  [
    ['20-lakh-home-loan', 2e6, 8.5, 20, 'Home Loan'],
    ['30-lakh-home-loan', 3e6, 8.5, 20, 'Home Loan'],
    ['50-lakh-home-loan', 5e6, 8.5, 20, 'Home Loan'],
    ['10-lakh-car-loan', 1e6, 9, 5, 'Car Loan'],
    ['5-lakh-personal-loan', 5e5, 12, 3, 'Personal Loan']
  ].forEach(([slug, p, r, n, kind]) => {
    const vals = { p: String(p), r: String(r), n: String(n), u: 'y' };
    const base = run('emi', vals);
    const amt = '₹' + lakh(p);
    const tenures = kind === 'Home Loan' ? [10, 15, 20, 25, 30] : kind === 'Car Loan' ? [3, 4, 5, 6, 7] : [1, 2, 3, 4, 5];
    const rates = kind === 'Home Loan' ? [7.5, 8, 8.5, 9, 9.5] : kind === 'Car Loan' ? [8, 8.5, 9, 9.5, 10] : [10.5, 11, 12, 13, 14];
    P.push({
      tool: 'emi', slug, vals,
      h1: amt + ' ' + kind + ' EMI',
      desc: 'At ' + r + '% for ' + n + ' years',
      title: amt + ' ' + kind + ' EMI for ' + n + ' Years (' + r + '%) | CalcBox',
      meta: 'EMI on a ' + amt + ' ' + kind.toLowerCase() + ' at ' + r + '% for ' + n + ' years is ' + base.big + ' per month. See EMI for other tenures and interest rates, and try your own numbers.',
      big: base.big, unit: '/month',
      answer: 'At ' + r + '% interest for ' + n + ' years, the EMI on a ' + amt + ' ' + kind.toLowerCase() + ' is ' + base.big + ' per month. You pay ' + row(base, 'Total interest') + ' as interest and ' + row(base, 'Total payment') + ' in total.',
      tables: [
        { h: 'EMI by tenure (at ' + r + '%)', head: ['Tenure', 'Monthly EMI', 'Total interest'], rows: tenures.map(y => { const x = run('emi', Object.assign({}, vals, { n: String(y) })); return [y + ' years', x.big, row(x, 'Total interest')]; }), hi: tenures.indexOf(n) },
        { h: 'EMI by interest rate (' + n + ' years)', head: ['Rate', 'Monthly EMI', 'Total interest'], rows: rates.map(k => { const x = run('emi', Object.assign({}, vals, { r: String(k) })); return [k + '%', x.big, row(x, 'Total interest')]; }), hi: rates.indexOf(r) }
      ]
    });
  });

  /* ---------- Income tax ---------- */
  const incomes = [7e5, 10e5, 12e5, 12.75e5, 15e5, 18e5, 20e5, 25e5, 30e5];
  [10e5, 12e5, 15e5, 20e5, 30e5].forEach(inc => {
    const vals = { i: String(inc), s: true, d: '150000', a: 'n' };
    const base = run('tax', vals);
    const nw = row(base, 'New regime tax'), od = row(base, 'Old regime tax');
    const amt = '₹' + lakh(inc);
    P.push({
      tool: 'tax', slug: (inc / 1e5) + '-lakh-salary', vals,
      h1: 'Income Tax on ' + amt + ' Salary',
      desc: 'FY 2026-27 · New vs old regime',
      title: 'Income Tax on ' + amt + ' Salary FY 2026-27 – New vs Old Regime | CalcBox',
      meta: 'Income tax on a ' + amt + ' salary for FY 2026-27 is ' + nw + ' under the new regime and ' + od + ' under the old regime (with ₹1.5 lakh deductions). Compare both instantly.',
      big: nw, unit: ' tax (new regime)',
      answer: 'For a salaried person earning ' + amt + ' a year in FY 2026-27, income tax is ' + nw + ' under the new regime and ' + od + ' under the old regime (assuming ₹1.5 lakh of deductions like 80C). ' + (base.sub || '') + '.',
      tables: [
        { h: 'Tax at other salaries (FY 2026-27)', head: ['Salary', 'New regime', 'Old regime*'], rows: incomes.map(x => { const q = run('tax', Object.assign({}, vals, { i: String(x) })); return ['₹' + lakh(x), row(q, 'New regime tax'), row(q, 'Old regime tax')]; }), hi: incomes.indexOf(inc), note: '*Old regime assumes ₹1.5 lakh deductions. Includes standard deduction and 4% cess.' }
      ]
    });
  });

  /* ---------- SIP ---------- */
  [5000, 10000].forEach(a => {
    const vals = { a: String(a), r: '12', n: '15', s: '0' };
    const base = run('sip', vals);
    const yrs = [5, 10, 15, 20, 25, 30];
    const amt = '₹' + a.toLocaleString('en-IN');
    P.push({
      tool: 'sip', slug: a + '-per-month', vals,
      h1: amt + ' SIP per Month',
      desc: 'How much it grows at 12%',
      title: amt + ' SIP per Month for 10, 15, 20 Years – Returns | CalcBox',
      meta: 'A ' + amt + ' monthly SIP at 12% can grow to ' + base.big + ' in 15 years. See the value after 5 to 30 years and try your own amount.',
      big: base.big, unit: ' in 15 years',
      answer: 'Investing ' + amt + ' every month at an expected 12% a year grows to about ' + base.big + ' in 15 years. You invest ' + row(base, 'Invested') + ' and earn about ' + row(base, 'Est. returns') + ' in returns.',
      tables: [
        { h: amt + ' SIP by years (at 12%)', head: ['Years', 'Invested', 'Estimated value'], rows: yrs.map(y => { const q = run('sip', Object.assign({}, vals, { n: String(y) })); return [y + ' years', row(q, 'Invested'), q.big]; }), hi: yrs.indexOf(15), note: 'Returns are not guaranteed. 12% is a common long-term estimate for equity funds.' }
      ]
    });
  });

  /* ---------- FD ---------- */
  {
    const vals = { p: '100000', r: '7', n: '5', c: '4' };
    const base = run('fd', vals); const rates = [6, 6.5, 7, 7.5, 8];
    P.push({
      tool: 'fd', slug: '1-lakh-for-5-years', vals,
      h1: '₹1 Lakh FD for 5 Years', desc: 'Maturity amount and interest',
      title: '₹1 Lakh FD for 5 Years – Maturity Amount & Interest | CalcBox',
      meta: 'A ₹1 lakh fixed deposit at 7% for 5 years matures to ' + base.big + ' with quarterly compounding. See maturity at other rates and tenures.',
      big: base.big, unit: ' at maturity',
      answer: 'A ₹1 lakh FD at 7% for 5 years, compounded quarterly like most Indian banks, matures to ' + base.big + '. That is ' + row(base, 'Interest earned') + ' of interest.',
      tables: [
        { h: 'Maturity by interest rate (5 years)', head: ['Rate', 'Maturity', 'Interest'], rows: rates.map(k => { const q = run('fd', Object.assign({}, vals, { r: String(k) })); return [k + '%', q.big, row(q, 'Interest earned')]; }), hi: rates.indexOf(7) },
        { h: 'Maturity by tenure (at 7%)', head: ['Tenure', 'Maturity', 'Interest'], rows: [1, 2, 3, 5, 10].map(y => { const q = run('fd', Object.assign({}, vals, { n: String(y) })); return [y + (y === 1 ? ' year' : ' years'), q.big, row(q, 'Interest earned')]; }), hi: 3 }
      ]
    });
  }

  /* ---------- PPF ---------- */
  {
    const vals = { a: '150000', r: '7.1', n: '15' };
    const base = run('ppf', vals); const yrs = [15, 20, 25, 30];
    P.push({
      tool: 'ppf', slug: '1-5-lakh-per-year', vals,
      h1: '₹1.5 Lakh a Year in PPF', desc: 'Maturity after 15 years',
      title: '₹1.5 Lakh per Year in PPF for 15 Years – Maturity Value | CalcBox',
      meta: 'Investing the maximum ₹1.5 lakh a year in PPF at 7.1% grows to ' + base.big + ' in 15 years, fully tax-free. See the value after 20, 25 and 30 years.',
      big: base.big, unit: ' after 15 years',
      answer: 'Putting the maximum ₹1.5 lakh into PPF every year at 7.1% grows to about ' + base.big + ' after 15 years. You invest ' + row(base, 'Invested') + ' and the interest of ' + row(base, 'Interest earned') + ' is tax-free.',
      tables: [
        { h: 'PPF value by years (at 7.1%)', head: ['Years', 'Invested', 'Maturity value'], rows: yrs.map(y => { const q = run('ppf', Object.assign({}, vals, { n: String(y) })); return [y + ' years', row(q, 'Invested'), q.big]; }), hi: 0, note: 'After 15 years, PPF can be extended in blocks of 5 years. Rates are set by the government each quarter.' }
      ]
    });
  }

  /* ---------- Units ---------- */
  {
    const vals = { cat: 'area', v: '1', f: 'acre', to: 'sqft' };
    P.push({
      tool: 'unit', slug: 'acre-to-sq-ft', vals,
      h1: '1 Acre in Square Feet', desc: 'Acre to sq ft and more',
      title: '1 Acre in Square Feet, Guntha, Cent & Hectare | CalcBox',
      meta: '1 acre = 43,560 square feet = 4,046.86 square metres = 40 guntha = 100 cent. Convert any acre value to sq ft instantly.',
      big: '43,560', unit: ' sq ft',
      answer: '1 acre is exactly 43,560 square feet. It also equals 4,046.86 square metres, 4,840 square yards (gaj), 40 guntha, 100 cent and 0.405 hectare.',
      tables: [
        { h: 'Acres to square feet', head: ['Acres', 'Square feet', 'Guntha'], rows: [0.25, 0.5, 1, 2, 5, 10].map(a => [String(a), (a * 43560).toLocaleString('en-IN'), String(a * 40)]), hi: 2 }
      ]
    });
  }
  {
    const vals = { cat: 'length', v: '170', f: 'cm', to: 'ft' };
    const rowsH = [150, 155, 160, 165, 170, 175, 180, 185].map(cm => { const inch = cm / 2.54, ft = Math.floor(inch / 12), i = Math.round(inch - ft * 12); return [cm + ' cm', (i === 12 ? (ft + 1) + ' ft 0 in' : ft + ' ft ' + i + ' in'), (cm / 30.48).toFixed(2) + ' ft']; });
    P.push({
      tool: 'unit', slug: 'cm-to-feet', vals,
      h1: 'CM to Feet and Inches', desc: 'Height conversion chart',
      title: 'CM to Feet and Inches – Height Conversion Chart | CalcBox',
      meta: '170 cm is 5 ft 7 in. Convert height from cm to feet and inches with a quick chart from 150 to 185 cm, or enter your own value.',
      big: '5 ft 7 in', unit: ' = 170 cm',
      answer: 'To convert cm to feet, divide by 30.48. For feet and inches, divide cm by 2.54 to get inches, then split into feet (12 inches each). 170 cm is 5 feet 7 inches.',
      tables: [{ h: 'Height chart', head: ['Centimetres', 'Feet & inches', 'Feet (decimal)'], rows: rowsH, hi: 4 }]
    });
  }
  return P;
};
