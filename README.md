# Quantumberg Accounting Dashboard

Quantumberg Accounting Dashboard is a Frappe Desk page that presents accounting and inventory information from ERPNext in one place. It uses standard ERPNext DocTypes and reports; it does not add custom accounting reports or a separate backend API.

Open the page at **Accounting Dashboard** (route: `/app/accounting-dashboard`) after installing the app on an ERPNext site.

## Features

- Filter the dashboard by company and posting-date range, and refresh the displayed data.
- View summary cards for receivables, payables, cash and bank, inventory value, income, expenses, net profit, and assets.
- Review profit-and-loss and cash-flow charts, monthly sales-versus-purchases trends, and receivable/payable ageing.
- See the largest outstanding customer and supplier invoices, recent sales and purchase invoices, payments, and journal entries.
- Review bank reconciliation figures for the company's default bank account, including the general-ledger balance and uncleared entries.
- Open linked vouchers, lists, and standard ERPNext reports from the dashboard.
- Browse 18 existing ERPNext reports, grouped into:
  - **Financial statements:** General Ledger, Trial Balance, Profit and Loss Statement, Balance Sheet, and Cash Flow.
  - **Receivables and payables:** Accounts Receivable, Accounts Payable, Accounts Receivable Summary, Accounts Payable Summary, Payment Ledger, Customer Ledger Summary, and Supplier Ledger Summary.
  - **Banking and assets:** Bank Reconciliation Statement and Asset Depreciation Ledger.
  - **Sales and purchases:** Sales Register and Purchase Register.
  - **Inventory:** Stock Balance and Stock Ledger.

The Desk page is configured for the **System Manager**, **Accounts Manager**, and **Accounts User** roles. Users also need the relevant ERPNext company, DocType, and report permissions for the information they access.

## Requirements

- A working Frappe Bench and site running **Frappe Framework v16**.
- **ERPNext v16** installed on the site. The dashboard reads ERPNext accounting, banking, fixed-asset, and stock data and runs its standard reports.
- Python **3.14 or newer**, as specified in `pyproject.toml`.
- Node.js **20.19+** or **22.12+** and npm to install and build the frontend (Vite 8 requirement).
- A supported database and other Bench services configured for the site.

## Required Frappe apps

Install these apps on the site before using the dashboard:

| App              | App name  | Version | Purpose                                                                           |
| ---------------- | --------- | ------- | --------------------------------------------------------------------------------- |
| Frappe Framework | `frappe`  | v16     | Desk page, authentication, and Frappe client APIs.                                |
| ERPNext          | `erpnext` | v16     | Accounting and inventory DocTypes and the standard reports used by the dashboard. |

ERPNext must be installed before this app. Frappe Framework is managed by Bench and is not installed from this app's Python dependency list.

The frontend has separate npm dependencies: Vue 3, ApexCharts, Vue3-ApexCharts, Lucide Vue, Tailwind CSS, Vite, and its Vue/Tailwind plugins. They are declared in `frontend/package-lock.json` and installed from the `frontend/` directory.

## Installation

From an existing Bench directory, make sure the site has ERPNext v16. If ERPNext is not already available in the Bench, fetch and install it first:

```bash
bench get-app https://github.com/frappe/erpnext --branch version-16
bench --site your-site.example install-app erpnext
```

Fetch and install this app:

```bash
bench get-app https://github.com/erp-quantumberg/erpnext-quantumberg_accounting_dashboard.git --branch version-16
bench --site your-site.example install-app quantumberg_accounting_dashboard
```

Replace `your-site.example` with the name of the site in your Bench. If the app is already present in the Bench, skip `bench get-app`.

## Setup and build

Install the frontend dependencies and generate the dashboard assets:

```bash
cd apps/quantumberg_accounting_dashboard/frontend
npm ci
npm run build
cd ../../../
bench build --app quantumberg_accounting_dashboard
```

Then start or restart the Bench and open `/app/accounting-dashboard` in Desk:

```bash
bench start
```

For an existing installation after updating app code, run the site migration and rebuild the assets:

```bash
bench --site your-site.example migrate
cd apps/quantumberg_accounting_dashboard/frontend
npm ci
npm run build
cd ../../../
bench build --app quantumberg_accounting_dashboard
```

The Vite development server can be started from `frontend/` with `npm run dev`. It is useful for frontend iteration; the dashboard's data calls require the Frappe Desk `frappe` client, so verify ERPNext data from the installed Desk page.

## Configuration notes

- On load, the dashboard selects the user's default Company when available, otherwise the first company returned to that user.
- The default date range starts at the current fiscal year's start date and ends today. If no current fiscal year is found, it falls back to January 1 of the current year.
- Amounts use the selected company's default currency. The bank reconciliation card uses the company's default bank account; when none is set, the dashboard tries to find a bank or cash account.
- Financial cards and charts use standard ERPNext report results; recent transaction tables use standard DocType list calls. Missing reports, insufficient permissions, or missing company data can result in partial or empty dashboard sections.
- The Desk page is defined in `quantumberg_accounting_dashboard/quantumberg_accounting_dashboard/page/accounting_dashboard/`. Frontend source is in `frontend/src/`; `npm run build` writes generated assets to `quantumberg_accounting_dashboard/public/dashboard/`. Do not edit the generated bundle directly.

## Troubleshooting

| Symptom                                                     | What to check                                                                                                                                                                                      |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accounting Dashboard is not found in Desk                   | Confirm the app is installed on the site, run `bench --site your-site.example migrate`, and check that the user has one of the configured page roles.                                              |
| Dashboard shows permission or report errors                 | Confirm ERPNext v16 is installed and the user has access to the selected company, relevant DocTypes, and the standard reports used by the dashboard.                                               |
| Some cards or charts are empty                              | Confirm the selected company and date range contain submitted transactions. Check the on-page errors for individual report failures; the dashboard can load other sections when one request fails. |
| Bank reconciliation is unavailable                          | Set the company's default bank account or ensure it has an eligible bank/cash account, then verify access to the Bank Reconciliation Statement.                                                    |
| Dashboard assets are missing or stale                       | Run `npm ci` and `npm run build` in `frontend/`, then `bench build --app quantumberg_accounting_dashboard`; refresh Desk after the build.                                                          |
| Frontend build fails because Bench configuration is missing | Run the build from the app's `frontend/` directory inside a Bench checkout. Vite reads `sites/common_site_config.json` to configure the development API proxy.                                     |
| Vite reports an unsupported Node.js version                 | Use Node.js 20.19+ or 22.12+ and rerun `npm ci` from `frontend/`.                                                                                                                                  |

## Contributing

1. Make changes in the relevant source directory (`frontend/src/` for the Vue UI or `quantumberg_accounting_dashboard/` for the Frappe page).
2. For frontend changes, run `npm ci` and `npm run build` from `frontend/`.
3. This repository uses pre-commit hooks for Ruff, ESLint, Prettier, and common file checks. Install pre-commit and enable the hooks from the app root:

   ```bash
   python -m pip install pre-commit
   pre-commit install
   ```

4. Submit focused changes with a description of the behavior changed and the checks run.

## License

This project is released under the MIT License. See [license.txt](license.txt).
