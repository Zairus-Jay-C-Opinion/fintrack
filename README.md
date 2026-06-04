FinTrack
A personal finance dashboard for tracking expenses, savings, investments, and long-term wealth — built for the Philippine peso with live USD market data.
Live app: https://fintrack-one-sigma.vercel.app

Pages
Dashboard
Your complete financial picture at a glance. Shows total net worth broken down into cash, savings, and investments (all in PHP). Displays your monthly income, a payday countdown with a recommended allocation action for that day, a monthly spending bar chart, and a portfolio growth curve built from your investment history.
Expenses
Tracks your day-to-day spending against your monthly spending allowance. Your income is split into three separate buckets — investments, savings, and spending — and only the spending bucket is tracked here. Log purchases with a date, item name, and category. A visual budget bar shows how much of your allowance is left; going over turns it red with an overage warning. A category breakdown panel shows where the month's money went.
Savings
Tracks your bank savings balance through deposits and withdrawals — you enter the amount moved and the app calculates the running balance. Shows your monthly savings target (based on your allocation %), your emergency fund amount, and a selected Philippine bank. Includes an interest projection chart (6 months to 5 years) using compound interest with an optional monthly deposit, so you can estimate how your balance will grow over time.
Goals
Create savings goals with a target amount and deadline. Each goal shows a progress bar and how much is still needed. The Fund goals feature distributes money across all goals simultaneously — you choose to pull from your savings balance, your unspent spending budget, or both, with a preview showing exactly how much each goal would receive before you apply it. Progress on individual goals can also be updated manually.
Investments
Tracks your stock and ETF portfolio. Records purchase lots with ticker, shares, total USD paid, asset type, and notes. The holdings table shows average cost, current price, current value (in both USD and PHP), and unrealized gain/loss per symbol. Live prices and ~90-day price history charts are fetched from market data — tap Refresh live to update. A portfolio mix donut chart shows allocation by symbol. A DCA tracker shows your recommended monthly contribution and days until next payday. The PHP/USD exchange rate can be refreshed live or set manually.
Forecasting
Projects long-term investment growth using Dollar-Cost Averaging (DCA) and compound interest. Set a monthly contribution, expected annual return, and time horizon (1, 5, 10, 20, or 30 years) to see a projected portfolio value chart. A goal calculator shows how many years it will take to reach a target amount. A scenario comparison chart plots three contribution levels side by side. A currency impact panel shows how changes in the PHP/USD rate affect your projected end value. A year-by-year breakdown table shows the first 15 years in detail.
Analytics
Tracks financial health trends over time. Shows a financial health score, your target vs. actual savings and investment rates as a 6-month line chart, a net worth progression area chart, and a table comparing your allocation targets against your monthly planned amounts.
Settings
Central configuration for the entire app. Set your monthly income, payday schedule (one or two days per month), and PHP/USD exchange rate. The allocation editor lets you adjust the percentage split between investments, savings, and spending. Notification options include a US market open reminder and a payday reminder, each with configurable times. Auto-refresh for stock prices can be enabled with a custom interval. Data can be exported as a JSON backup or imported to restore — all data is stored locally in your browser.

How data works
All data is stored locally in your browser (no account required). Export a JSON backup from Settings to save your data or move it to another device.
Market data for live prices comes from Finnhub. Price history charts use Yahoo Finance and require no key. The PHP/USD rate can be refreshed live or set manually in Settings or the Investments page.
