/* Short FAQs per tool, rendered as static HTML + FAQPage schema by build.js */
module.exports = {
  gst: [
    ['How do I add GST to a price?', 'Multiply the price by the GST rate. For ₹1,000 at 18%, GST is ₹180 and the total is ₹1,180.'],
    ['How do I remove GST from a total?', 'Divide the total by (1 + rate). For ₹1,180 including 18% GST, the base price is 1,180 ÷ 1.18 = ₹1,000.'],
    ['What are CGST, SGST and IGST?', 'Within the same state, GST is split equally into CGST (central) and SGST (state). For sales to another state, the full amount is charged as IGST.']
  ],
  tax: [
    ['Which is better, the new or old tax regime?', 'The new regime is usually better unless you claim large deductions like 80C, 80D, HRA and home loan interest. This calculator compares both for you.'],
    ['Is income up to ₹12 lakh tax-free?', 'Yes, under the new regime for FY 2026-27, the Section 87A rebate makes taxable income up to ₹12 lakh tax-free. Salaried people also get a ₹75,000 standard deduction, so salary up to ₹12.75 lakh pays no tax.'],
    ['What is the 4% cess?', 'Health and Education Cess is 4% of your income tax (plus surcharge, if any). It is added to every taxpayer’s final tax.']
  ],
  emi: [
    ['How is EMI calculated?', 'EMI = P × r × (1+r)ⁿ ÷ ((1+r)ⁿ − 1), where P is the loan amount, r is the monthly interest rate and n is the number of months.'],
    ['Does a longer tenure reduce EMI?', 'Yes, a longer tenure lowers the monthly EMI, but you pay much more interest in total over the life of the loan.'],
    ['Can I use this for home, car and personal loans?', 'Yes. The EMI formula is the same for all reducing-balance loans. Just enter the right amount, rate and tenure.']
  ],
  sip: [
    ['How is SIP return calculated?', 'Each monthly instalment grows at the expected monthly rate until the end of the period. The total of all grown instalments is your estimated value.'],
    ['What is SIP step-up?', 'A step-up increases your SIP amount by a fixed percentage every year, for example 10%, usually in line with salary hikes. It can grow your corpus a lot faster.'],
    ['Are SIP returns guaranteed?', 'No. Mutual fund returns depend on the market. Use a realistic rate, such as 10–12% for equity funds over the long term.']
  ],
  lumpsum: [
    ['What is a lumpsum investment?', 'Investing a single amount at once, instead of monthly instalments like a SIP.'],
    ['How is lumpsum return calculated?', 'Future value = amount × (1 + annual return)ⁿ, where n is the number of years.'],
    ['Lumpsum or SIP, which is better?', 'Lumpsum can earn more if markets rise steadily. SIP spreads your risk over time and suits monthly income.']
  ],
  fd: [
    ['How is FD interest calculated?', 'Most banks compound FD interest quarterly: maturity = P × (1 + r/4)^(4 × years).'],
    ['Is FD interest taxable?', 'Yes. FD interest is added to your income and taxed at your slab rate. Banks may deduct TDS if interest crosses the yearly limit.'],
    ['What is effective yield?', 'It is the actual yearly return after compounding, which is slightly higher than the stated rate.']
  ],
  rd: [
    ['How is RD maturity calculated?', 'Each monthly deposit earns interest, compounded quarterly, for the time it stays in the account. All of them added together give the maturity amount.'],
    ['What happens if I miss an RD instalment?', 'Most banks charge a small penalty for a missed instalment. Several missed instalments can lead to the RD being closed early.'],
    ['RD or SIP, which is better?', 'RD gives guaranteed, lower returns. SIP in mutual funds can earn more over the long term but is not guaranteed.']
  ],
  ppf: [
    ['What is the PPF lock-in period?', 'PPF matures after 15 years. After that you can extend it in blocks of 5 years, with or without new deposits.'],
    ['How much can I invest in PPF?', 'Minimum ₹500 and maximum ₹1.5 lakh per financial year.'],
    ['Is PPF tax-free?', 'Yes. Deposits qualify for Section 80C (old regime), and the interest and maturity amount are fully tax-free.']
  ],
  si: [
    ['What is the simple interest formula?', 'Simple Interest = P × R × T ÷ 100, where P is principal, R is the yearly rate and T is time in years.'],
    ['How is simple interest different from compound interest?', 'Simple interest is calculated only on the original principal. Compound interest is also calculated on interest already earned.'],
    ['How do I calculate interest for months?', 'Choose Months in the calculator. It converts months to years (months ÷ 12) automatically.']
  ],
  ci: [
    ['What is the compound interest formula?', 'Amount = P × (1 + r/k)^(k × t), where k is how many times interest is added per year.'],
    ['Does more frequent compounding give more interest?', 'Yes. Monthly compounding gives slightly more than quarterly, which gives more than yearly, at the same rate.'],
    ['What is the Rule of 72?', 'Divide 72 by the yearly interest rate to estimate how many years it takes to double your money. At 8%, it takes about 9 years.']
  ],
  cagr: [
    ['What is CAGR?', 'Compound Annual Growth Rate is the steady yearly growth rate that takes an investment from its start value to its end value.'],
    ['How is CAGR calculated?', 'CAGR = (End value ÷ Start value)^(1 ÷ years) − 1.'],
    ['What is a good CAGR?', 'For Indian equity over the long term, 10–15% is considered good. For FDs, CAGR is simply the interest rate.']
  ],
  discount: [
    ['How do I calculate a discount?', 'Discount = price × discount % ÷ 100. The final price is the original price minus the discount.'],
    ['Is 20% + 10% the same as 30% off?', 'No. A 10% extra discount applies on the already reduced price, so 20% + 10% is 28% off in total.'],
    ['How do I find the discount percentage?', 'Discount % = (original price − sale price) ÷ original price × 100.']
  ],
  split: [
    ['How do I split a bill with a tip?', 'Add the tip to the bill, then divide the total by the number of people.'],
    ['How much tip should I give in India?', 'Tipping is optional in India. 5–10% is common in restaurants if service charge is not already included.'],
    ['Why round up the amount?', 'Rounding up to the next rupee makes paying by cash or UPI simpler and covers small differences.']
  ],
  hike: [
    ['How do I calculate a salary hike?', 'New salary = current salary × (1 + hike % ÷ 100). For ₹8 lakh with a 10% hike, the new salary is ₹8.8 lakh.'],
    ['How do I find my hike percentage?', 'Hike % = (new salary − old salary) ÷ old salary × 100. Choose "Hike %" in the calculator.'],
    ['What is a good salary hike in India?', 'Average appraisal hikes are around 8–10%. Job switches often bring 20–40%.']
  ],
  profit: [
    ['What is the difference between margin and markup?', 'Margin is profit as a % of selling price. Markup is profit as a % of cost price. The same profit gives a lower margin than markup.'],
    ['How do I calculate profit margin?', 'Margin % = (selling price − cost price) ÷ selling price × 100.'],
    ['How do I set a price for a 25% margin?', 'Selling price = cost ÷ (1 − 0.25). For a cost of ₹750, the price is ₹1,000.']
  ],
  gratuity: [
    ['How is gratuity calculated?', 'Under the Payment of Gratuity Act: 15 × last drawn (basic + DA) × years of service ÷ 26.'],
    ['Who is eligible for gratuity?', 'Usually employees with 5 or more years of continuous service. Rules can differ for fixed-term employees, so check with your employer.'],
    ['How are months of service counted?', 'For employers covered by the Act, 6 months or more in the last year counts as a full year.']
  ],
  inflation: [
    ['How does inflation reduce the value of money?', 'As prices rise, the same amount buys less. At 6% inflation, ₹1 lakh today will buy only about ₹56,000 worth of goods in 10 years.'],
    ['What inflation rate should I use?', 'India’s long-term average retail inflation is around 5–6%. Education and medical costs often rise faster.'],
    ['How do I beat inflation?', 'Invest in options that grow faster than inflation over time, such as equity mutual funds, instead of keeping money idle.']
  ],
  fuel: [
    ['How is trip fuel cost calculated?', 'Fuel needed = distance ÷ mileage. Cost = fuel needed × fuel price per litre.'],
    ['Where do I find my vehicle’s mileage?', 'Use your real-world mileage, not the company claim. Fill the tank fully, drive, then divide km driven by litres refilled.'],
    ['Does it include tolls?', 'No, only fuel. Add tolls and parking separately.']
  ],
  percentage: [
    ['How do I calculate a percentage of a number?', 'Multiply the number by the percentage and divide by 100. 20% of 500 = 500 × 20 ÷ 100 = 100.'],
    ['How do I calculate percentage change?', 'Change % = (new value − old value) ÷ old value × 100.'],
    ['How do I find what percent one number is of another?', 'Divide the first number by the second and multiply by 100. 50 is 25% of 200.']
  ],
  age: [
    ['How is exact age calculated?', 'It counts full years, then full months, then the remaining days between your birth date and the chosen date.'],
    ['Can I find my age on a past or future date?', 'Yes. Change the “Age on” date to any date, for example an exam or job application cut-off date.'],
    ['What if I was born on 29 February?', 'In non-leap years, the calculator treats your birthday as 1 March.']
  ],
  days: [
    ['How do I count days between two dates?', 'Pick a start and end date. Turn on “Include end date” if both days should be counted.'],
    ['What counts as a working day?', 'Monday to Friday. Saturdays and Sundays are counted as weekend days. Public holidays are not removed.'],
    ['Can I count days for notice periods?', 'Yes. Enter your resignation date and last working day to see calendar and working days.']
  ],
  adddays: [
    ['How do I find a date 90 days from today?', 'Keep today as the start date, choose Add, enter 90 and pick Days.'],
    ['What does “Working days” do?', 'It skips Saturdays and Sundays while counting, which is useful for business deadlines.'],
    ['What happens when adding months to the 31st?', 'If the target month is shorter, the date moves to that month’s last day, for example 31 Jan + 1 month = 28 or 29 Feb.']
  ],
  unit: [
    ['How many square feet are in an acre?', 'One acre is 43,560 sq ft, which is about 4,047 square metres.'],
    ['How many square feet are in a cent and a guntha?', 'One cent is about 435.6 sq ft. One guntha is about 1,089 sq ft (40 guntha = 1 acre).'],
    ['How do I convert Celsius to Fahrenheit?', '°F = °C × 9 ÷ 5 + 32. So 37 °C is 98.6 °F.']
  ],
  average: [
    ['How is the average calculated?', 'Add all the numbers and divide by how many numbers there are.'],
    ['What is the median?', 'The middle value after sorting. With an even count, it is the average of the two middle values.'],
    ['What is the mode?', 'The number that appears most often. If no number repeats, there is no mode.']
  ],
  cgpa: [
    ['How do I convert CGPA to percentage for CBSE?', 'Multiply your CGPA by 9.5. A CGPA of 8.4 equals 79.8%.'],
    ['Do all universities use × 9.5?', 'No. Many universities use their own formula, such as CGPA × 10 or (CGPA − 0.75) × 10. Check your marksheet or university rules.'],
    ['What CGPA is first class?', 'Usually 60% and above is first class and 75% and above is distinction, but rules vary by university.']
  ],
  words: [
    ['How do I write an amount in words on a cheque?', 'Write “Rupees”, then the amount in words, and end with “Only”, for example “Rupees Twelve Lakh Fifty Thousand Only”.'],
    ['What is the Indian numbering system?', 'After thousand, it uses lakh (1,00,000) and crore (1,00,00,000), instead of million and billion.'],
    ['How are paise written?', 'Add “and … Paise” before “Only”, for example “Rupees One Hundred and Fifty Paise Only”.']
  ],
  bmi: [
    ['What is a healthy BMI?', 'For adults, WHO considers 18.5–24.9 healthy. Some Indian health guidelines use lower cut-offs, such as 23 for overweight.'],
    ['How is BMI calculated?', 'BMI = weight in kg ÷ (height in metres)².'],
    ['Is BMI accurate for everyone?', 'No. BMI does not separate muscle from fat, so athletes, older adults and pregnant women should use other measures too.']
  ],
  calorie: [
    ['How many calories do I need a day?', 'It depends on age, sex, height, weight and activity. This calculator estimates it using the Mifflin-St Jeor formula.'],
    ['What is BMR?', 'Basal Metabolic Rate is the calories your body burns at complete rest to keep you alive.'],
    ['How many calories should I cut to lose weight?', 'A gentle deficit of 250–500 calories a day is commonly suggested. Speak to a doctor or dietitian before a big change.']
  ],
  due: [
    ['How is the due date calculated?', 'By Naegele’s rule: the first day of your last period plus 280 days (40 weeks), adjusted for cycle length.'],
    ['How accurate is the due date?', 'Only about 1 in 20 babies arrive on the exact due date. Most are born within 2 weeks either side.'],
    ['Can an ultrasound change my due date?', 'Yes. An early ultrasound is often more accurate, and your doctor may update your due date based on it.']
  ],
  wc: [
    ['How is reading time calculated?', 'Reading time assumes about 238 words per minute, the average adult reading speed.'],
    ['Does it count spaces as characters?', 'It shows both: characters with spaces and characters without spaces.'],
    ['Is my text saved or uploaded?', 'No. Counting happens in your browser. Your text is never sent anywhere.']
  ],
  'case': [
    ['What is title case?', 'Title Case capitalises the first letter of every word, like “The Quick Brown Fox”.'],
    ['What are camelCase, snake_case and kebab-case?', 'Programming styles: camelCase joins words with capitals, snake_case uses underscores and kebab-case uses hyphens.'],
    ['Is my text stored?', 'No. Conversion happens in your browser and nothing is uploaded.']
  ],
  pw: [
    ['What makes a password strong?', 'Length matters most. Use at least 14–16 characters mixing upper and lower case, numbers and symbols.'],
    ['Is it safe to generate a password here?', 'Yes. It is created in your browser with a secure random generator and is never sent or stored.'],
    ['How do I remember strong passwords?', 'Use a password manager. It stores all your passwords safely, so you only remember one.']
  ]
};
