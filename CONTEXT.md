# SarnFund Domain Glossary

This document outlines the core domain concepts of SarnFund to ensure consistent vocabulary across documentation and code reviews.

## Domain Concepts

### Fund Registry
A consolidated list of all tracked mutual funds across target AMCs, mapping each fund project (`proj_id`) to its detected tax-saving category and class.

### Daily NAV
The Net Asset Value per unit, Net Assets (AUM), and offering/redemption prices retrieved from the SEC Thailand API for a specific market date.

### Asset Management Company (AMC)
An investment firm licensed in Thailand to manage mutual funds. SarnFund normalizes AMC names from the SEC registry into consistent displays (e.g., Krungsri, SCB, KAsset).

### Tax-saving Categories
* **RMF (Retirement Mutual Fund)**: Long-term retirement investments.
* **SSF (Super Savings Fund)**: Medium-term tax deduction mutual funds.
* **ThaiESG / ESG (Thailand ESG Fund)**: Mutual funds focused on sustainable investments.
* **ThaiESGX / ESGX**: ESG funds with extra characteristics or distinct suffixes.
* **ETF (Exchange Traded Fund)**: Funds traded directly on the stock exchange.
