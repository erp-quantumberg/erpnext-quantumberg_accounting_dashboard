import { toNumber } from "../utils/formatters.js";

export const REPORT_NAMES = {
  generalLedger: "General Ledger",
  trialBalance: "Trial Balance",
  profitAndLoss: "Profit and Loss Statement",
  balanceSheet: "Balance Sheet",
  cashFlow: "Cash Flow",
  accountsReceivable: "Accounts Receivable",
  accountsPayable: "Accounts Payable",
  accountsReceivableSummary: "Accounts Receivable Summary",
  accountsPayableSummary: "Accounts Payable Summary",
  bankReconciliation: "Bank Reconciliation Statement",
  assetDepreciationLedger: "Asset Depreciation Ledger",
  salesRegister: "Sales Register",
  purchaseRegister: "Purchase Register",
  paymentLedger: "Payment Ledger",
  stockBalance: "Stock Balance",
  stockLedger: "Stock Ledger",
  customerLedgerSummary: "Customer Ledger Summary",
  supplierLedgerSummary: "Supplier Ledger Summary",
};

export const REPORT_LIBRARY = [
  {
    name: REPORT_NAMES.generalLedger,
    short: "GL",
    category: "Financial Statements",
    description: "Account-wise ledger with opening and closing balances.",
  },
  {
    name: REPORT_NAMES.trialBalance,
    short: "TB",
    category: "Financial Statements",
    description: "Debit and credit balances for every ledger account.",
  },
  {
    name: REPORT_NAMES.profitAndLoss,
    short: "P&L",
    category: "Financial Statements",
    description: "Income, expenses and profitability for the selected period.",
  },
  {
    name: REPORT_NAMES.balanceSheet,
    short: "BS",
    category: "Financial Statements",
    description: "Assets, liabilities and equity at a point in time.",
  },
  {
    name: REPORT_NAMES.cashFlow,
    short: "CF",
    category: "Financial Statements",
    description: "Cash movements across operating, investing and financing.",
  },
  {
    name: REPORT_NAMES.accountsReceivable,
    short: "AR",
    category: "Receivables & Payables",
    description: "Outstanding customer invoices with ageing buckets.",
  },
  {
    name: REPORT_NAMES.accountsPayable,
    short: "AP",
    category: "Receivables & Payables",
    description: "Outstanding supplier bills with ageing buckets.",
  },
  {
    name: REPORT_NAMES.accountsReceivableSummary,
    short: "ARS",
    category: "Receivables & Payables",
    description: "Customer-wise receivable totals and ageing summary.",
  },
  {
    name: REPORT_NAMES.accountsPayableSummary,
    short: "APS",
    category: "Receivables & Payables",
    description: "Supplier-wise payable totals and ageing summary.",
  },
  {
    name: REPORT_NAMES.paymentLedger,
    short: "PL",
    category: "Receivables & Payables",
    description: "Payment allocation history against invoices and bills.",
  },
  {
    name: REPORT_NAMES.customerLedgerSummary,
    short: "CL",
    category: "Receivables & Payables",
    description: "Customer opening, invoiced, paid and closing balances.",
  },
  {
    name: REPORT_NAMES.supplierLedgerSummary,
    short: "SL",
    category: "Receivables & Payables",
    description: "Supplier opening, billed, paid and closing balances.",
  },
  {
    name: REPORT_NAMES.bankReconciliation,
    short: "BR",
    category: "Banking & Assets",
    description: "Bank ledger balance versus calculated statement balance.",
  },
  {
    name: REPORT_NAMES.assetDepreciationLedger,
    short: "FA",
    category: "Banking & Assets",
    description: "Depreciation posted against fixed assets in the period.",
  },
  {
    name: REPORT_NAMES.salesRegister,
    short: "SR",
    category: "Sales & Purchases",
    description: "Sales invoices, taxes and totals for the selected period.",
  },
  {
    name: REPORT_NAMES.purchaseRegister,
    short: "PR",
    category: "Sales & Purchases",
    description: "Purchase invoices, taxes and totals for the selected period.",
  },
  {
    name: REPORT_NAMES.stockBalance,
    short: "SB",
    category: "Inventory",
    description: "Closing quantity and value by warehouse and item.",
  },
  {
    name: REPORT_NAMES.stockLedger,
    short: "STL",
    category: "Inventory",
    description: "Stock movements with inward, outward and balance quantity.",
  },
];

function compactFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== null && value !== undefined && value !== ""
    )
  );
}

export function buildReportFilters(reportName, context = {}) {
  const {
    company = "",
    fromDate = "",
    toDate = "",
    fiscalYear = "",
    bankAccount = "",
  } = context;

  const dateRange = {
    company,
    from_date: fromDate,
    to_date: toDate,
  };

  const financialStatementFilters = {
    company,
    filter_based_on: "Date Range",
    period_start_date: fromDate,
    period_end_date: toDate,
    periodicity: "Monthly",
    accumulated_values: 0,
    selected_view: "Report",
  };

  switch (reportName) {
    case REPORT_NAMES.generalLedger:
      return compactFilters(dateRange);

    case REPORT_NAMES.trialBalance:
      return compactFilters({
        company,
        fiscal_year: fiscalYear,
        from_date: fromDate,
        to_date: toDate,
        show_net_values: 1,
        show_group_accounts: 1,
      });

    case REPORT_NAMES.profitAndLoss:
      return compactFilters(financialStatementFilters);

    case REPORT_NAMES.balanceSheet:
      return compactFilters({
        ...financialStatementFilters,
        periodicity: "Yearly",
        accumulated_values: 1,
      });

    case REPORT_NAMES.cashFlow:
      return compactFilters(financialStatementFilters);

    case REPORT_NAMES.accountsReceivable:
    case REPORT_NAMES.accountsPayable:
    case REPORT_NAMES.accountsReceivableSummary:
    case REPORT_NAMES.accountsPayableSummary:
      return compactFilters({
        company,
        report_date: toDate,
        ageing_based_on: "Due Date",
        age_as_on: "Report Date",
        range: "30, 60, 90, 120",
      });

    case REPORT_NAMES.bankReconciliation:
      return compactFilters({
        company,
        account: bankAccount,
        report_date: toDate,
      });

    case REPORT_NAMES.assetDepreciationLedger:
    case REPORT_NAMES.stockBalance:
    case REPORT_NAMES.stockLedger:
    case REPORT_NAMES.salesRegister:
    case REPORT_NAMES.purchaseRegister:
    case REPORT_NAMES.customerLedgerSummary:
    case REPORT_NAMES.supplierLedgerSummary:
      return compactFilters(dateRange);

    case REPORT_NAMES.paymentLedger:
      return compactFilters({
        company,
        period_start_date: fromDate,
        period_end_date: toDate,
      });

    default:
      return compactFilters({ company, from_date: fromDate, to_date: toDate });
  }
}

export function getSummaryValue(report, label) {
  const entry = (report?.report_summary || []).find(
    (item) => String(item?.label || "").trim().toLowerCase() === label.toLowerCase()
  );

  return toNumber(entry?.value);
}
