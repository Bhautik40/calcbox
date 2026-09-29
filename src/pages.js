/* Search-targeted answer pages ("30 lakh home loan EMI", "income tax on 15 lakh salary", …).
   Each page = a tool with preset values + an instant answer + comparison tables. Built by build.js. */
module.exports = function (C) {
  const run = (id, vals) => { const t = C.byId[id]; const raw = Object.assign(C.defaults(t), vals); if (t.fix) t.fix(raw); return t.calc(C.parse(t, raw)); };
  const row = (r, label) => { const x = (r.rows || []).find(q => q[0] === label); return x ? x[1] : '—'; };
  const lakh = n => (n >= 1e7 ? (n / 1e7) + ' Crore' : (n / 1e5) + ' Lakh');
  const lakhSlug = n => (n >= 1e7 ? (n / 1e7) + '-crore' : String(n / 1e5).replace('.', '-') + '-lakh');
  const inr = n => '₹' + n.toLocaleString('en-IN');
  const fmt = (x, d) => Number(x.toFixed(d)).toLocaleString('en-IN', { maximumFractionDigits: d });
  const P = [];

  /* ---------- EMI ---------- */
  const emi = (p, r, n, kind, tenures, rates, slugKind) => {
    const vals = { p: String(p), r: String(r), n: String(n), u: 'y' };
    const base = run('emi', vals), amt = '₹' + lakh(p);
    P.push({
      tool: 'emi', slug: lakhSlug(p) + '-' + slugKind, vals, group: kind + ' EMI',
      h1: amt + ' ' + kind + ' EMI', desc: 'At ' + r + '% for ' + n + ' years',
      title: amt + ' ' + kind + ' EMI for ' + n + ' Years (' + r + '%) | CalcBox',
      meta: 'EMI on a ' + amt + ' ' + kind.toLowerCase() + ' at ' + r + '% for ' + n + ' years is ' + base.big + ' per month. See EMI for other tenures and interest rates, and try your own numbers.',
      big: base.big, unit: '/month',
      answer: 'At ' + r + '% interest for ' + n + ' years, the EMI on a ' + amt + ' ' + kind.toLowerCase() + ' is ' + base.big + ' per month. You pay ' + row(base, 'Total interest') + ' as interest and ' + row(base, 'Total payment') + ' in total.',
      tables: [
        { h: 'EMI by tenure (at ' + r + '%)', head: ['Tenure', 'Monthly EMI', 'Total interest'], rows: tenures.map(y => { const x = run('emi', Object.assign({}, vals, { n: String(y) })); return [y + (y === 1 ? ' year' : ' years'), x.big, row(x, 'Total interest')]; }), hi: tenures.indexOf(n) },
        { h: 'EMI by interest rate (' + n + ' years)', head: ['Rate', 'Monthly EMI', 'Total interest'], rows: rates.map(k => { const x = run('emi', Object.assign({}, vals, { r: String(k) })); return [k + '%', x.big, row(x, 'Total interest')]; }), hi: rates.indexOf(r) }
      ]
    });
  };
  [10e5, 15e5, 20e5, 25e5, 30e5, 35e5, 40e5, 50e5, 60e5, 75e5, 1e7].forEach(p => emi(p, 8.5, 20, 'Home Loan', [10, 15, 20, 25, 30], [7.5, 8, 8.5, 9, 9.5], 'home-loan'));
  [5e5, 8e5, 10e5].forEach(p => emi(p, 9, 5, 'Car Loan', [3, 4, 5, 6, 7], [8, 8.5, 9, 9.5, 10], 'car-loan'));
  [2e5, 3e5, 5e5, 10e5].forEach(p => emi(p, 12, 3, 'Personal Loan', [1, 2, 3, 4, 5], [10.5, 11, 12, 13, 14], 'personal-loan'));

  /* ---------- Income tax ---------- */
  const incomes = [7e5, 10e5, 12e5, 12.75e5, 15e5, 18e5, 20e5, 25e5, 30e5, 50e5];
  [7e5, 8e5, 9e5, 10e5, 11e5, 12e5, 13e5, 14e5, 15e5, 16e5, 18e5, 20e5, 25e5, 30e5, 40e5, 50e5].forEach(inc => {
    const vals = { i: String(inc), s: true, d: '150000', a: 'n' };
    const base = run('tax', vals);
    const nw = row(base, 'New regime tax'), od = row(base, 'Old regime tax'), amt = '₹' + lakh(inc);
    const list = incomes.indexOf(inc) > -1 ? incomes : incomes.concat([inc]).sort((a, b) => a - b);
    P.push({
      tool: 'tax', slug: lakhSlug(inc) + '-salary', vals, group: 'Income Tax by Salary',
      h1: 'Income Tax on ' + amt + ' Salary', desc: 'FY 2026-27 · New vs old regime',
      title: 'Income Tax on ' + amt + ' Salary FY 2026-27 – New vs Old Regime | CalcBox',
      meta: 'Income tax on a ' + amt + ' salary for FY 2026-27 is ' + nw + ' under the new regime and ' + od + ' under the old regime (with ₹1.5 lakh deductions). Compare both instantly.',
      big: nw, unit: ' tax (new regime)',
      answer: 'For a salaried person earning ' + amt + ' a year in FY 2026-27, income tax is ' + nw + ' under the new regime and ' + od + ' under the old regime (assuming ₹1.5 lakh of deductions like 80C). ' + (base.sub || '') + '. In-hand pay is about ' + row(base, 'In-hand per month (approx.)') + ' a month before PF and other deductions.',
      tables: [
        { h: 'Tax at other salaries (FY 2026-27)', head: ['Salary', 'New regime', 'Old regime*'], rows: list.map(x => { const q = run('tax', Object.assign({}, vals, { i: String(x) })); return ['₹' + lakh(x), row(q, 'New regime tax'), row(q, 'Old regime tax')]; }), hi: list.indexOf(inc), note: '*Old regime assumes ₹1.5 lakh deductions. Includes standard deduction and 4% cess.' }
      ]
    });
  });

  /* ---------- SIP ---------- */
  [500, 1000, 2000, 3000, 5000, 10000, 15000, 20000, 25000, 50000].forEach(a => {
    const vals = { a: String(a), r: '12', n: '15', s: '0' };
    const base = run('sip', vals), yrs = [5, 10, 15, 20, 25, 30], amt = inr(a);
    P.push({
      tool: 'sip', slug: a + '-per-month', vals, group: 'SIP per Month',
      h1: amt + ' SIP per Month', desc: 'How much it grows at 12%',
      title: amt + ' SIP per Month for 10, 15, 20 Years – Returns | CalcBox',
      meta: 'A ' + amt + ' monthly SIP at 12% can grow to ' + base.big + ' in 15 years. See the value after 5 to 30 years and try your own amount.',
      big: base.big, unit: ' in 15 years',
      answer: 'Investing ' + amt + ' every month at an expected 12% a year grows to about ' + base.big + ' in 15 years. You invest ' + row(base, 'Invested') + ' and earn about ' + row(base, 'Est. returns') + ' in returns.',
      tables: [
        { h: amt + ' SIP by years (at 12%)', head: ['Years', 'Invested', 'Estimated value'], rows: yrs.map(y => { const q = run('sip', Object.assign({}, vals, { n: String(y) })); return [y + ' years', row(q, 'Invested'), q.big]; }), hi: yrs.indexOf(15), note: 'Returns are not guaranteed. 12% is a common long-term estimate for equity funds.' },
        { h: amt + ' SIP for 15 years at other returns', head: ['Return', 'Estimated value', 'Gain'], rows: [8, 10, 12, 14, 15].map(k => { const q = run('sip', Object.assign({}, vals, { r: String(k) })); return [k + '%', q.big, row(q, 'Est. returns')]; }), hi: 2 }
      ]
    });
  });

  /* ---------- Lumpsum ---------- */
  [1e5, 5e5, 10e5].forEach(p => {
    const vals = { p: String(p), r: '12', n: '10' };
    const base = run('lumpsum', vals), amt = '₹' + lakh(p), yrs = [5, 10, 15, 20, 25];
    P.push({
      tool: 'lumpsum', slug: lakhSlug(p) + '-for-10-years', vals, group: 'Lumpsum Investment',
      h1: amt + ' Lumpsum for 10 Years', desc: 'One-time investment at 12%',
      title: amt + ' Lumpsum Investment for 10 Years – Returns | CalcBox',
      meta: 'A one-time ' + amt + ' investment at 12% grows to ' + base.big + ' in 10 years. See the value after 5 to 25 years.',
      big: base.big, unit: ' in 10 years',
      answer: 'A one-time investment of ' + amt + ' growing at 12% a year becomes about ' + base.big + ' in 10 years. That is ' + row(base, 'Growth') + ' the amount you put in.',
      tables: [{ h: amt + ' by years (at 12%)', head: ['Years', 'Value', 'Gain'], rows: yrs.map(y => { const q = run('lumpsum', Object.assign({}, vals, { n: String(y) })); return [y + ' years', q.big, row(q, 'Est. returns')]; }), hi: 1, note: 'Market returns are not guaranteed.' }]
    });
  });

  /* ---------- FD ---------- */
  [1e5, 2e5, 5e5, 10e5].forEach(p => {
    const vals = { p: String(p), r: '7', n: '5', c: '4' };
    const base = run('fd', vals), rates = [6, 6.5, 7, 7.5, 8], amt = '₹' + lakh(p);
    P.push({
      tool: 'fd', slug: lakhSlug(p) + '-for-5-years', vals, group: 'Fixed Deposit',
      h1: amt + ' FD for 5 Years', desc: 'Maturity amount and interest',
      title: amt + ' FD for 5 Years – Maturity Amount & Interest | CalcBox',
      meta: 'A ' + amt + ' fixed deposit at 7% for 5 years matures to ' + base.big + ' with quarterly compounding. See maturity at other rates and tenures.',
      big: base.big, unit: ' at maturity',
      answer: 'A ' + amt + ' FD at 7% for 5 years, compounded quarterly like most Indian banks, matures to ' + base.big + '. That is ' + row(base, 'Interest earned') + ' of interest.',
      tables: [
        { h: 'Maturity by interest rate (5 years)', head: ['Rate', 'Maturity', 'Interest'], rows: rates.map(k => { const q = run('fd', Object.assign({}, vals, { r: String(k) })); return [k + '%', q.big, row(q, 'Interest earned')]; }), hi: rates.indexOf(7) },
        { h: 'Maturity by tenure (at 7%)', head: ['Tenure', 'Maturity', 'Interest'], rows: [1, 2, 3, 5, 10].map(y => { const q = run('fd', Object.assign({}, vals, { n: String(y) })); return [y + (y === 1 ? ' year' : ' years'), q.big, row(q, 'Interest earned')]; }), hi: 3 }
      ]
    });
  });

  /* ---------- PPF ---------- */
  [[150000, '1-5-lakh-per-year', '₹1.5 Lakh'], [100000, '1-lakh-per-year', '₹1 Lakh'], [50000, '50000-per-year', '₹50,000']].forEach(([a, slug, amt]) => {
    const vals = { a: String(a), r: '7.1', n: '15' };
    const base = run('ppf', vals), yrs = [15, 20, 25, 30];
    P.push({
      tool: 'ppf', slug, vals, group: 'PPF',
      h1: amt + ' a Year in PPF', desc: 'Maturity after 15 years',
      title: amt + ' per Year in PPF for 15 Years – Maturity Value | CalcBox',
      meta: 'Investing ' + amt + ' a year in PPF at 7.1% grows to ' + base.big + ' in 15 years, fully tax-free. See the value after 20, 25 and 30 years.',
      big: base.big, unit: ' after 15 years',
      answer: 'Putting ' + amt + ' into PPF every year at 7.1% grows to about ' + base.big + ' after 15 years. You invest ' + row(base, 'Invested') + ' and the interest of ' + row(base, 'Interest earned') + ' is tax-free.',
      tables: [{ h: 'PPF value by years (at 7.1%)', head: ['Years', 'Invested', 'Maturity value'], rows: yrs.map(y => { const q = run('ppf', Object.assign({}, vals, { n: String(y) })); return [y + ' years', row(q, 'Invested'), q.big]; }), hi: 0, note: 'After 15 years, PPF can be extended in blocks of 5 years. Rates are set by the government each quarter.' }]
    });
  });

  /* ---------- Home loan eligibility by salary ---------- */
  [30000, 40000, 50000, 60000, 75000, 100000].forEach(inc => {
    const vals = { inc: String(inc), ex: '0', r: '8.5', n: '20', f: '50' };
    const base = run('eligibility', vals), amt = inr(inc);
    P.push({
      tool: 'eligibility', slug: inc + '-salary', vals, group: 'Home Loan Eligibility by Salary',
      h1: 'Home Loan on ' + amt + ' Salary', desc: 'How much you can borrow',
      title: 'How Much Home Loan Can I Get on ' + amt + ' Salary? | CalcBox',
      meta: 'With a ' + amt + ' monthly salary you can get a home loan of about ' + base.big + ' at 8.5% for 20 years, with no other EMIs. See other tenures and rates.',
      big: base.big, unit: ' loan',
      answer: 'With a net monthly salary of ' + amt + ' and no other EMIs, banks usually allow an EMI of up to ' + row(base, 'Max EMI you can pay') + '. At 8.5% for 20 years, that means a home loan of about ' + base.big + ', enough for a property of around ' + row(base, 'Property you can buy (20% down)') + ' with a 20% down payment.',
      tables: [
        { h: 'Eligible loan by tenure (8.5%)', head: ['Tenure', 'Eligible loan', 'EMI'], rows: [10, 15, 20, 25, 30].map(y => { const q = run('eligibility', Object.assign({}, vals, { n: String(y) })); return [y + ' years', q.big, row(q, 'Max EMI you can pay')]; }), hi: 2 },
        { h: 'Eligible loan by interest rate (20 years)', head: ['Rate', 'Eligible loan', 'Property value'], rows: [7.5, 8, 8.5, 9, 9.5].map(k => { const q = run('eligibility', Object.assign({}, vals, { r: String(k) })); return [k + '%', q.big, row(q, 'Property you can buy (20% down)')]; }), hi: 2, note: 'Assumes up to 50% of net income can go to EMIs. Banks also check credit score, age and job stability.' }
      ]
    });
  });

  /* ---------- 8th Pay Commission by pay level ---------- */
  [[1, 18000], [2, 19900], [4, 25500], [6, 35400], [7, 44900], [8, 47600], [10, 56100]].forEach(([lvl, b]) => {
    const vals = { b: String(b), f: '2.28', da: '60' };
    const base = run('cpc', vals), amt = inr(b);
    P.push({
      tool: 'cpc', slug: 'level-' + lvl + '-' + b + '-basic', vals, group: '8th Pay Commission by Pay Level',
      h1: '8th Pay Commission: Level ' + lvl + ' (' + amt + ')', desc: 'New basic pay at different fitment factors',
      title: '8th Pay Commission Salary for Level ' + lvl + ' – ' + amt + ' Basic Pay | CalcBox',
      meta: 'Level ' + lvl + ' basic pay of ' + amt + ' could become ' + base.big + ' at a 2.28 fitment factor under the 8th Pay Commission. See estimates at 1.92, 2.57 and 2.86.',
      big: base.big, unit: ' at 2.28',
      answer: 'Under the 7th Pay Commission, Level ' + lvl + ' starts at a basic pay of ' + amt + '. If the 8th Pay Commission uses a fitment factor of 2.28, the new basic pay would be about ' + base.big + '. The fitment factor is not decided yet, so the table shows other common estimates. DA (now 60%) usually restarts at 0% when the new pay starts.',
      tables: [{ h: 'Level ' + lvl + ' new basic pay by fitment factor', head: ['Fitment factor', 'New basic', 'vs basic + 60% DA'], rows: ['1.83', '1.92', '2.28', '2.57', '2.86'].map(k => { const q = run('cpc', Object.assign({}, vals, { f: 'c', cf: k })); return [k, q.big, row(q, 'Increase vs basic + DA').replace('/month', '')]; }), hi: 2, note: 'Estimates only. The 8th Pay Commission report is due around May 2027.' }]
    });
  });

  /* ---------- Units ---------- */
  const unit = (o) => P.push(Object.assign({ tool: 'unit', group: 'Unit Conversions' }, o));
  unit({
    slug: 'acre-to-sq-ft', vals: { cat: 'area', v: '1', f: 'acre', to: 'sqft' },
    h1: '1 Acre in Square Feet', desc: 'Acre to sq ft and more',
    title: '1 Acre in Square Feet, Guntha, Cent & Hectare | CalcBox',
    meta: '1 acre = 43,560 square feet = 4,046.86 square metres = 40 guntha = 100 cent. Convert any acre value to sq ft instantly.',
    big: '43,560', unit: ' sq ft',
    answer: '1 acre is exactly 43,560 square feet. It also equals 4,046.86 square metres, 4,840 square yards (gaj), 40 guntha, 100 cent and 0.405 hectare.',
    tables: [{ h: 'Acres to square feet', head: ['Acres', 'Square feet', 'Guntha'], rows: [0.25, 0.5, 1, 2, 5, 10].map(a => [String(a), fmt(a * 43560, 0), String(a * 40)]), hi: 2 }]
  });
  unit({
    slug: 'guntha-to-sq-ft', vals: { cat: 'area', v: '1', f: 'guntha', to: 'sqft' },
    h1: '1 Guntha in Square Feet', desc: 'Guntha to sq ft and acre',
    title: '1 Guntha in Square Feet, Square Metres & Acre | CalcBox',
    meta: '1 guntha = 1,089 square feet = 101.17 square metres. 40 guntha make 1 acre. Convert guntha to sq ft instantly.',
    big: '1,089', unit: ' sq ft',
    answer: '1 guntha is 1,089 square feet, or about 101.17 square metres. 40 guntha make 1 acre. Guntha is widely used for land in Maharashtra, Karnataka, Gujarat and Telangana.',
    tables: [{ h: 'Guntha to square feet', head: ['Guntha', 'Square feet', 'Square metres'], rows: [1, 2, 5, 10, 20, 40].map(g => [String(g), fmt(g * 1089, 0), fmt(g * 101.17141056, 1)]), hi: 0 }]
  });
  unit({
    slug: 'cent-to-sq-ft', vals: { cat: 'area', v: '1', f: 'cent', to: 'sqft' },
    h1: '1 Cent in Square Feet', desc: 'Cent to sq ft and acre',
    title: '1 Cent in Square Feet & Square Metres | CalcBox',
    meta: '1 cent = 435.6 square feet = 40.47 square metres. 100 cents make 1 acre. Convert cents to sq ft instantly.',
    big: '435.6', unit: ' sq ft',
    answer: '1 cent is 435.6 square feet, or about 40.47 square metres. 100 cents make 1 acre. Cent is a common land unit in Kerala, Tamil Nadu and Andhra Pradesh.',
    tables: [{ h: 'Cents to square feet', head: ['Cents', 'Square feet', 'Square metres'], rows: [1, 2, 3, 5, 10, 50, 100].map(c => [String(c), fmt(c * 435.6, 1), fmt(c * 40.468564224, 1)]), hi: 0 }]
  });
  unit({
    slug: 'sq-ft-to-gaj', vals: { cat: 'area', v: '900', f: 'sqft', to: 'sqyd' },
    h1: 'Square Feet to Gaj', desc: 'Sq ft to square yards',
    title: 'Square Feet to Gaj (Square Yards) Converter | CalcBox',
    meta: '1 gaj (square yard) = 9 square feet. 900 sq ft = 100 gaj. Convert square feet to gaj instantly with a quick chart.',
    big: '9 sq ft', unit: ' = 1 gaj',
    answer: '1 gaj, also called a square yard, equals 9 square feet. To convert square feet to gaj, divide by 9. So a 900 sq ft plot is 100 gaj.',
    tables: [{ h: 'Square feet to gaj', head: ['Square feet', 'Gaj (sq yd)', 'Square metres'], rows: [450, 900, 1000, 1200, 1350, 1800, 2400].map(s => [fmt(s, 0), fmt(s / 9, 1), fmt(s * 0.09290304, 1)]), hi: 1 }]
  });
  unit({
    slug: 'hectare-to-acre', vals: { cat: 'area', v: '1', f: 'ha', to: 'acre' },
    h1: '1 Hectare in Acres', desc: 'Hectare to acre and sq ft',
    title: '1 Hectare in Acres & Square Feet | CalcBox',
    meta: '1 hectare = 2.471 acres = 1,07,639 square feet = 10,000 square metres. Convert hectares to acres instantly.',
    big: '2.471', unit: ' acres',
    answer: '1 hectare equals about 2.471 acres, or 10,000 square metres (1,07,639 sq ft). 1 acre is about 0.405 hectare.',
    tables: [{ h: 'Hectares to acres', head: ['Hectares', 'Acres', 'Square feet'], rows: [0.5, 1, 2, 5, 10].map(h => [String(h), fmt(h * 2.4710538, 3), fmt(h * 107639.104, 0)]), hi: 1 }]
  });
  const heightRows = [[4, 10], [5, 0], [5, 2], [5, 4], [5, 6], [5, 8], [5, 10], [6, 0], [6, 2]].map(([f, i]) => [f + ' ft ' + i + ' in', fmt((f * 12 + i) * 2.54, 1) + ' cm', fmt((f * 12 + i) * 0.0254, 2) + ' m']);
  unit({
    slug: 'feet-to-cm', vals: { cat: 'length', v: '5.5', f: 'ft', to: 'cm' },
    h1: 'Feet to CM (Height)', desc: 'Height in feet to cm',
    title: 'Feet and Inches to CM – Height Conversion Chart | CalcBox',
    meta: '5 feet 6 inches = 167.6 cm. Convert height from feet and inches to centimetres with a chart from 4 ft 10 in to 6 ft 2 in.',
    big: '30.48', unit: ' cm = 1 foot',
    answer: '1 foot is 30.48 cm and 1 inch is 2.54 cm. For a height in feet and inches, convert it all to inches (feet × 12 + inches) and multiply by 2.54. So 5 ft 6 in is 66 inches, which is 167.6 cm.',
    tables: [{ h: 'Height chart', head: ['Feet & inches', 'Centimetres', 'Metres'], rows: heightRows, hi: 4 }]
  });
  unit({
    slug: 'cm-to-feet', vals: { cat: 'length', v: '170', f: 'cm', to: 'ft' },
    h1: 'CM to Feet and Inches', desc: 'Height conversion chart',
    title: 'CM to Feet and Inches – Height Conversion Chart | CalcBox',
    meta: '170 cm is 5 ft 7 in. Convert height from cm to feet and inches with a quick chart from 150 to 185 cm, or enter your own value.',
    big: '5 ft 7 in', unit: ' = 170 cm',
    answer: 'To convert cm to feet, divide by 30.48. For feet and inches, divide cm by 2.54 to get inches, then split into feet (12 inches each). 170 cm is 5 feet 7 inches.',
    tables: [{ h: 'Height chart', head: ['Centimetres', 'Feet & inches', 'Feet (decimal)'], rows: [150, 155, 160, 165, 170, 175, 180, 185].map(cm => { const inch = cm / 2.54, ft = Math.floor(inch / 12), i = Math.round(inch - ft * 12); return [cm + ' cm', (i === 12 ? (ft + 1) + ' ft 0 in' : ft + ' ft ' + i + ' in'), (cm / 30.48).toFixed(2) + ' ft']; }), hi: 4 }]
  });
  unit({
    slug: 'inch-to-cm', vals: { cat: 'length', v: '1', f: 'in', to: 'cm' },
    h1: '1 Inch in CM', desc: 'Inches to centimetres',
    title: '1 Inch in CM – Inches to Centimetres Chart | CalcBox',
    meta: '1 inch = 2.54 cm exactly. Convert inches to centimetres instantly with a chart from 1 to 60 inches.',
    big: '2.54', unit: ' cm',
    answer: '1 inch is exactly 2.54 centimetres. To convert inches to cm, multiply by 2.54. To convert cm to inches, divide by 2.54.',
    tables: [{ h: 'Inches to centimetres', head: ['Inches', 'Centimetres', 'Millimetres'], rows: [1, 2, 5, 10, 12, 24, 32, 40, 60].map(n => [String(n), fmt(n * 2.54, 2), fmt(n * 25.4, 1)]), hi: 0 }]
  });
  unit({
    slug: 'kg-to-pounds', vals: { cat: 'weight', v: '1', f: 'kg', to: 'lb' },
    h1: '1 KG in Pounds', desc: 'Kilograms to lbs',
    title: '1 KG in Pounds – KG to LBS Conversion Chart | CalcBox',
    meta: '1 kg = 2.2046 pounds (lbs). Convert kilograms to pounds instantly with a quick chart from 1 to 100 kg.',
    big: '2.2046', unit: ' lbs',
    answer: '1 kilogram equals about 2.2046 pounds. To convert kg to lbs, multiply by 2.2046. To convert pounds to kg, divide by 2.2046 (1 lb is 0.4536 kg).',
    tables: [{ h: 'Kilograms to pounds', head: ['Kilograms', 'Pounds (lbs)'], rows: [1, 5, 10, 20, 50, 60, 70, 80, 100].map(k => [k + ' kg', fmt(k * 2.20462262, 2)]), hi: 0 }]
  });
  unit({
    slug: 'km-to-miles', vals: { cat: 'length', v: '1', f: 'km', to: 'mi' },
    h1: '1 KM in Miles', desc: 'Kilometres to miles',
    title: '1 KM in Miles – Kilometres to Miles Chart | CalcBox',
    meta: '1 km = 0.6214 miles. 1 mile = 1.609 km. Convert kilometres to miles instantly with a quick chart.',
    big: '0.6214', unit: ' miles',
    answer: '1 kilometre equals about 0.6214 miles, and 1 mile is 1.609 km. To convert km to miles, multiply by 0.6214.',
    tables: [{ h: 'Kilometres to miles', head: ['Kilometres', 'Miles'], rows: [1, 5, 10, 21.1, 42.2, 50, 100].map(k => [k + ' km', fmt(k * 0.621371, 2)]), hi: 0, note: '21.1 km is a half marathon and 42.2 km a full marathon.' }]
  });
  unit({
    slug: 'celsius-to-fahrenheit', vals: { cat: 'temp', v: '37', f: 'c', to: 'f' },
    h1: 'Celsius to Fahrenheit', desc: '°C to °F chart',
    title: 'Celsius to Fahrenheit – °C to °F Chart & Formula | CalcBox',
    meta: '37 °C = 98.6 °F. Formula: °F = °C × 9/5 + 32. Convert Celsius to Fahrenheit instantly, including body fever temperatures.',
    big: '98.6 °F', unit: ' = 37 °C',
    answer: 'To convert Celsius to Fahrenheit, multiply by 9, divide by 5 and add 32. Normal body temperature of 37 °C is 98.6 °F, and a fever of 38 °C is 100.4 °F.',
    tables: [{ h: 'Celsius to Fahrenheit', head: ['Celsius', 'Fahrenheit'], rows: [0, 20, 25, 30, 36.5, 37, 37.5, 38, 39, 40, 100].map(c => [c + ' °C', fmt(c * 9 / 5 + 32, 1) + ' °F']), hi: 5 }]
  });
  return P;
};
