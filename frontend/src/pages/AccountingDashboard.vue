<script setup>
import { computed, onMounted, ref } from "vue";
import DashboardHeader from "../components/header/DashboardHeader.vue";
import SummaryCards from "../components/cards/SummaryCards.vue";
import DashboardChart from "../components/charts/DashboardChart.vue";
import PartyOutstandingTable from "../components/reports/PartyOutstandingTable.vue";
import RecentTransactions from "../components/reports/RecentTransactions.vue";
import BankReconciliationCard from "../components/reports/BankReconciliationCard.vue";
import ReportLibrary from "../components/reports/ReportLibrary.vue";
import {
  getList,
  getToday,
  getUserDefault,
  openDocument,
  openList,
  openReport,
  runReport,
} from "../services/api.js";
import {
  REPORT_NAMES,
  buildReportFilters,
  getSummaryValue,
} from "../services/reports.js";
import {
  buildMonthRange,
  formatCompactNumber,
  formatCurrency,
  getAgeingBuckets,
  getChartSeries,
  isReportDataRow,
  monthKey,
  sumRows,
  toNumber,
} from "../utils/formatters.js";

const companies = ref([]);
const company = ref("");
const currency = ref("INR");
const fiscalYear = ref("");
const fromDate = ref("");
const toDate = ref(getToday());
const bankAccount = ref("");
const loading = ref(true);
const lastUpdated = ref("");
const errors = ref([]);

const profitAndLossReport = ref(null);
const balanceSheetReport = ref(null);
const cashFlowReport = ref(null);
const receivableReport = ref(null);
const payableReport = ref(null);
const salesRegisterReport = ref(null);
const purchaseRegisterReport = ref(null);
const stockBalanceReport = ref(null);
const assetDepreciationReport = ref(null);
const bankReconciliationReport = ref(null);
const recentTransactions = ref([]);

const reportContext = computed(() => ({
  company: company.value,
  fromDate: fromDate.value,
  toDate: toDate.value,
  fiscalYear: fiscalYear.value,
  bankAccount: bankAccount.value,
}));

const periodLabel = computed(() => {
  if (!fromDate.value || !toDate.value) {
    return "";
  }

  return `${formatShortDate(fromDate.value)} – ${formatShortDate(toDate.value)}`;
});

const visibleErrors = computed(() => errors.value.slice(0, 4));

function formatShortDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getReportRows(report) {
  return (report?.result || []).filter(isReportDataRow);
}

function sumOutstanding(report) {
  return getReportRows(report).reduce(
    (total, row) => total + toNumber(row.outstanding),
    0
  );
}

function sumBalanceSheetByType(report, accountTypes) {
  return (report?.result || [])
    .filter(
      (row) =>
        !row?.is_group &&
        row?.account_type &&
        accountTypes.includes(row.account_type)
    )
    .reduce((total, row) => total + toNumber(row.total), 0);
}

function getInventoryValue() {
  const stockBalanceValue = sumRows(
    (stockBalanceReport.value?.result || []).filter(isReportDataRow),
    "bal_val"
  );

  if (Math.abs(stockBalanceValue) > 0) {
    return stockBalanceValue;
  }

  return sumBalanceSheetByType(balanceSheetReport.value, ["Stock"]);
}

function getTopOutstanding(report) {
  return getReportRows(report)
    .filter((row) => toNumber(row.outstanding) !== 0)
    .sort((left, right) => toNumber(right.outstanding) - toNumber(left.outstanding))
    .slice(0, 6);
}

const metrics = computed(() => {
  const totalReceivables = sumOutstanding(receivableReport.value);
  const totalPayables = sumOutstanding(payableReport.value);
  const cashAndBank = sumBalanceSheetByType(balanceSheetReport.value, [
    "Bank",
    "Cash",
  ]);
  const inventoryValue = getInventoryValue();
  const totalIncome = getSummaryValue(profitAndLossReport.value, "Total Income");
  const totalExpenses = getSummaryValue(
    profitAndLossReport.value,
    "Total Expense"
  );
  const netProfit = getSummaryValue(profitAndLossReport.value, "Net Profit");
  const totalAssets = getSummaryValue(balanceSheetReport.value, "Total Asset");

  const dateRangeFilters =
    fromDate.value && toDate.value
      ? { posting_date: ["between", [fromDate.value, toDate.value]] }
      : {};

  return [
    {
      title: "Total Receivables",
      value: formatCompactNumber(totalReceivables, currency.value),
      subtitle: "Outstanding customer invoices",
      icon: "receivable",
      tone: "blue",
      footer: periodLabel.value || "Selected period",
      list: {
        doctype: "Sales Invoice",
        filters: {
          company: company.value,
          docstatus: 1,
          outstanding_amount: [">", 0],
        },
      },
    },
    {
      title: "Total Payables",
      value: formatCompactNumber(totalPayables, currency.value),
      subtitle: "Outstanding supplier bills",
      icon: "payable",
      tone: "orange",
      footer: periodLabel.value || "Selected period",
      list: {
        doctype: "Purchase Invoice",
        filters: {
          company: company.value,
          docstatus: 1,
          outstanding_amount: [">", 0],
        },
      },
    },
    {
      title: "Cash & Bank",
      value: formatCompactNumber(cashAndBank, currency.value),
      subtitle: "Ledger balance at period end",
      icon: "cash",
      tone: "teal",
      footer: "From Balance Sheet",
      list: {
        doctype: "Account",
        filters: {
          company: company.value,
          account_type: ["in", ["Bank", "Cash"]],
          is_group: 0,
        },
      },
    },
    {
      title: "Inventory Value",
      value: formatCompactNumber(inventoryValue, currency.value),
      subtitle: "Closing stock value",
      icon: "inventory",
      tone: "purple",
      footer: "Stock Balance / Balance Sheet",
      list: {
        doctype: "Item",
        filters: {
          is_stock_item: 1,
          disabled: 0,
        },
      },
    },
    {
      title: "Total Income",
      value: formatCompactNumber(totalIncome, currency.value),
      subtitle: "Income for the selected period",
      icon: "income",
      tone: "green",
      footer: "From Profit and Loss",
      list: {
        doctype: "Sales Invoice",
        filters: {
          company: company.value,
          docstatus: 1,
          ...dateRangeFilters,
        },
      },
    },
    {
      title: "Total Expenses",
      value: formatCompactNumber(totalExpenses, currency.value),
      subtitle: "Expenses for the selected period",
      icon: "expense",
      tone: "red",
      footer: "From Profit and Loss",
      list: {
        doctype: "Purchase Invoice",
        filters: {
          company: company.value,
          docstatus: 1,
          ...dateRangeFilters,
        },
      },
    },
    {
      title: "Net Profit",
      value: formatCompactNumber(netProfit, currency.value),
      subtitle: "Income less expenses",
      icon: "profit",
      tone: netProfit < 0 ? "red" : "green",
      valueClass: netProfit < 0 ? "kpi-value--negative" : "kpi-value--positive",
      footer: "From Profit and Loss",
      list: {
        doctype: "GL Entry",
        filters: {
          company: company.value,
          ...dateRangeFilters,
        },
      },
    },
    {
      title: "Total Assets",
      value: formatCompactNumber(totalAssets, currency.value),
      subtitle: "Assets at period end",
      icon: "assets",
      tone: "blue",
      footer: "From Balance Sheet",
      list: {
        doctype: "Asset",
        filters: {
          company: company.value,
          docstatus: ["<", 2],
        },
      },
    },
  ];
});

const profitAndLossChart = computed(() => ({
  labels: profitAndLossReport.value?.chart?.data?.labels || [],
  series: getChartSeries(profitAndLossReport.value),
}));

const cashFlowChart = computed(() => ({
  labels: cashFlowReport.value?.chart?.data?.labels || [],
  series: getChartSeries(cashFlowReport.value, { dropEmpty: true }),
}));

const salesPurchaseChart = computed(() => {
  const { keys, labels } = buildMonthRange(fromDate.value, toDate.value);
  const salesByMonth = new Map(keys.map((key) => [key, 0]));
  const purchasesByMonth = new Map(keys.map((key) => [key, 0]));

  getReportRows(salesRegisterReport.value).forEach((row) => {
    const key = monthKey(row.posting_date);

    if (salesByMonth.has(key)) {
      salesByMonth.set(key, salesByMonth.get(key) + toNumber(row.grand_total));
    }
  });

  getReportRows(purchaseRegisterReport.value).forEach((row) => {
    const key = monthKey(row.posting_date);

    if (purchasesByMonth.has(key)) {
      purchasesByMonth.set(
        key,
        purchasesByMonth.get(key) + toNumber(row.grand_total)
      );
    }
  });

  return {
    labels,
    series: [
      {
        name: "Sales",
        data: keys.map((key) => salesByMonth.get(key)),
      },
      {
        name: "Purchases",
        data: keys.map((key) => purchasesByMonth.get(key)),
      },
    ],
  };
});

const ageingChart = computed(() => {
  const receivable = getAgeingBuckets(receivableReport.value);
  const payable = getAgeingBuckets(payableReport.value);

  return {
    labels: receivable.labels,
    series: [
      { name: "Receivables", data: receivable.values },
      { name: "Payables", data: payable.values },
    ],
  };
});

const topReceivables = computed(() => getTopOutstanding(receivableReport.value));
const topPayables = computed(() => getTopOutstanding(payableReport.value));

const depreciationTotal = computed(() =>
  sumRows(
    (assetDepreciationReport.value?.result || []).filter(isReportDataRow),
    "depreciation_amount"
  )
);

const bankReconciliation = computed(() => {
  const rows = bankReconciliationReport.value?.result || [];
  const findRow = (label) =>
    rows.find((row) => row?.payment_entry === label);

  const glBalanceRow = findRow(
    "Bank Statement balance as per General Ledger"
  );
  const outstandingRow = findRow(
    "Outstanding Cheques and Deposits to clear"
  );
  const incorrectRow = findRow(
    "Cheques and Deposits incorrectly cleared"
  );
  const calculatedRow = findRow("Calculated Bank Statement balance");

  const summaryLabels = new Set([
    "Bank Statement balance as per General Ledger",
    "Outstanding Cheques and Deposits to clear",
    "Cheques and Deposits incorrectly cleared",
    "Calculated Bank Statement balance",
  ]);

  return {
    account: bankAccount.value,
    glBalance: toNumber(glBalanceRow?.debit),
    outstandingDebit: toNumber(outstandingRow?.debit),
    outstandingCredit: toNumber(outstandingRow?.credit),
    incorrectDebit: toNumber(incorrectRow?.debit),
    calculatedBalance: toNumber(calculatedRow?.debit),
    unclearedEntries: rows.filter(
      (row) => row?.payment_entry && !summaryLabels.has(row.payment_entry)
    ).length,
  };
});

function mapInvoice(row, type, tone) {
  return {
    id: `${type}-${row.name}`,
    type,
    doctype: type,
    name: row.name,
    date: row.posting_date,
    party: row.customer_name || row.supplier_name || row.customer || row.supplier,
    amount: row.grand_total,
    status: row.status,
    tone,
  };
}

function mapPayment(row) {
  return {
    id: `Payment Entry-${row.name}`,
    type: "Payment Entry",
    doctype: "Payment Entry",
    name: row.name,
    date: row.posting_date,
    party: row.party,
    amount: toNumber(row.received_amount) || toNumber(row.paid_amount),
    status: row.status,
    tone: "payment",
  };
}

function mapJournal(row) {
  return {
    id: `Journal Entry-${row.name}`,
    type: "Journal Entry",
    doctype: "Journal Entry",
    name: row.name,
    date: row.posting_date,
    party: row.title || row.user_remark || row.voucher_type,
    amount: row.total_debit,
    status: row.docstatus === 1 ? "Submitted" : "Draft",
    tone: "journal",
  };
}

function mergeRecentTransactions({
  sales,
  purchases,
  payments,
  journals,
} = {}) {
  return [
    ...(sales || []).map((row) => mapInvoice(row, "Sales Invoice", "sales")),
    ...(purchases || []).map((row) =>
      mapInvoice(row, "Purchase Invoice", "purchase")
    ),
    ...(payments || []).map(mapPayment),
    ...(journals || []).map(mapJournal),
  ]
    .filter((transaction) => transaction.name && transaction.date)
    .sort((left, right) => {
      const dateComparison = String(right.date).localeCompare(String(left.date));

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return String(right.name).localeCompare(String(left.name));
    })
    .slice(0, 8);
}

async function loadCompanies() {
  const list = await getList("Company", {
    fields: ["name", "default_currency", "default_bank_account"],
    order_by: "name asc",
    limit_page_length: 0,
  });

  companies.value = list || [];

  const preferredCompany = getUserDefault("Company");
  const selectedCompany =
    companies.value.find((item) => item.name === preferredCompany) ||
    companies.value[0];

  company.value = selectedCompany?.name || "";
  currency.value = selectedCompany?.default_currency || "INR";
  bankAccount.value = selectedCompany?.default_bank_account || "";
}

async function setDefaultPeriod() {
  const today = getToday();
  toDate.value = today;

  try {
    const fiscalYears = await getList("Fiscal Year", {
      fields: ["name", "year_start_date", "year_end_date"],
      filters: [
        ["year_start_date", "<=", today],
        ["year_end_date", ">=", today],
      ],
      order_by: "year_start_date desc",
      limit_page_length: 1,
    });

    const currentFiscalYear = fiscalYears?.[0];
    fiscalYear.value = currentFiscalYear?.name || "";
    fromDate.value =
      currentFiscalYear?.year_start_date || `${today.slice(0, 4)}-01-01`;
  } catch {
    fiscalYear.value = "";
    fromDate.value = `${today.slice(0, 4)}-01-01`;
  }
}

async function resolveBankAccount() {
  if (bankAccount.value) {
    return;
  }

  try {
    const accounts = await getList("Account", {
      fields: ["name", "account_type"],
      filters: {
        company: company.value,
        account_type: ["in", ["Bank", "Cash"]],
        is_group: 0,
      },
      order_by: "account_type asc, name asc",
      limit_page_length: 1,
    });

    bankAccount.value = accounts?.[0]?.name || "";
  } catch {
    bankAccount.value = "";
  }
}

function getRecentTransactionFilters() {
  return {
    company: company.value,
    posting_date: ["between", [fromDate.value, toDate.value]],
    docstatus: 1,
  };
}

function buildJobs() {
  const context = reportContext.value;

  const jobs = [
    [
      "profitAndLoss",
      () =>
        runReport(
          REPORT_NAMES.profitAndLoss,
          buildReportFilters(REPORT_NAMES.profitAndLoss, context)
        ),
    ],
    [
      "balanceSheet",
      () =>
        runReport(
          REPORT_NAMES.balanceSheet,
          buildReportFilters(REPORT_NAMES.balanceSheet, context)
        ),
    ],
    [
      "cashFlow",
      () =>
        runReport(
          REPORT_NAMES.cashFlow,
          buildReportFilters(REPORT_NAMES.cashFlow, context)
        ),
    ],
    [
      "receivable",
      () =>
        runReport(
          REPORT_NAMES.accountsReceivable,
          buildReportFilters(REPORT_NAMES.accountsReceivable, context)
        ),
    ],
    [
      "payable",
      () =>
        runReport(
          REPORT_NAMES.accountsPayable,
          buildReportFilters(REPORT_NAMES.accountsPayable, context)
        ),
    ],
    [
      "salesRegister",
      () =>
        runReport(
          REPORT_NAMES.salesRegister,
          buildReportFilters(REPORT_NAMES.salesRegister, context)
        ),
    ],
    [
      "purchaseRegister",
      () =>
        runReport(
          REPORT_NAMES.purchaseRegister,
          buildReportFilters(REPORT_NAMES.purchaseRegister, context)
        ),
    ],
    [
      "stockBalance",
      () =>
        runReport(
          REPORT_NAMES.stockBalance,
          buildReportFilters(REPORT_NAMES.stockBalance, context)
        ),
    ],
    [
      "assetDepreciation",
      () =>
        runReport(
          REPORT_NAMES.assetDepreciationLedger,
          buildReportFilters(REPORT_NAMES.assetDepreciationLedger, context)
        ),
    ],
    [
      "recentSales",
      () =>
        getList("Sales Invoice", {
          fields: [
            "name",
            "posting_date",
            "customer",
            "customer_name",
            "grand_total",
            "outstanding_amount",
            "status",
          ],
          filters: getRecentTransactionFilters(),
          order_by: "posting_date desc, modified desc",
          limit_page_length: 8,
        }),
    ],
    [
      "recentPurchases",
      () =>
        getList("Purchase Invoice", {
          fields: [
            "name",
            "posting_date",
            "supplier",
            "supplier_name",
            "grand_total",
            "outstanding_amount",
            "status",
          ],
          filters: getRecentTransactionFilters(),
          order_by: "posting_date desc, modified desc",
          limit_page_length: 8,
        }),
    ],
    [
      "recentPayments",
      () =>
        getList("Payment Entry", {
          fields: [
            "name",
            "posting_date",
            "party",
            "paid_amount",
            "received_amount",
            "payment_type",
            "status",
          ],
          filters: getRecentTransactionFilters(),
          order_by: "posting_date desc, modified desc",
          limit_page_length: 8,
        }),
    ],
    [
      "recentJournals",
      () =>
        getList("Journal Entry", {
          fields: [
            "name",
            "posting_date",
            "title",
            "user_remark",
            "voucher_type",
            "total_debit",
            "docstatus",
          ],
          filters: getRecentTransactionFilters(),
          order_by: "posting_date desc, modified desc",
          limit_page_length: 8,
        }),
    ],
  ];

  if (bankAccount.value) {
    jobs.push([
      "bankReconciliation",
      () =>
        runReport(
          REPORT_NAMES.bankReconciliation,
          buildReportFilters(REPORT_NAMES.bankReconciliation, context)
        ),
    ]);
  }

  return jobs;
}

const jobLabels = {
  profitAndLoss: "Profit and Loss",
  balanceSheet: "Balance Sheet",
  cashFlow: "Cash Flow",
  receivable: "Accounts Receivable",
  payable: "Accounts Payable",
  salesRegister: "Sales Register",
  purchaseRegister: "Purchase Register",
  stockBalance: "Stock Balance",
  assetDepreciation: "Asset Depreciation",
  bankReconciliation: "Bank Reconciliation",
  recentSales: "Recent sales",
  recentPurchases: "Recent purchases",
  recentPayments: "Recent payments",
  recentJournals: "Recent journals",
};

async function loadDashboard() {
  if (!company.value || !fromDate.value || !toDate.value) {
    loading.value = false;
    return;
  }

  if (fromDate.value > toDate.value) {
    errors.value = ["From date cannot be after To date."];
    loading.value = false;
    return;
  }

  loading.value = true;
  errors.value = [];

  try {
    await resolveBankAccount();

    const results = await Promise.all(
      buildJobs().map(async ([key, job]) => {
        try {
          return { key, data: await job(), error: null };
        } catch (error) {
          return {
            key,
            data: null,
            error: error?.message || String(error),
          };
        }
      })
    );

    const data = Object.fromEntries(
      results.map((result) => [result.key, result.data])
    );

    profitAndLossReport.value = data.profitAndLoss;
    balanceSheetReport.value = data.balanceSheet;
    cashFlowReport.value = data.cashFlow;
    receivableReport.value = data.receivable;
    payableReport.value = data.payable;
    salesRegisterReport.value = data.salesRegister;
    purchaseRegisterReport.value = data.purchaseRegister;
    stockBalanceReport.value = data.stockBalance;
    assetDepreciationReport.value = data.assetDepreciation;
    bankReconciliationReport.value = data.bankReconciliation;
    recentTransactions.value = mergeRecentTransactions({
      sales: data.recentSales,
      purchases: data.recentPurchases,
      payments: data.recentPayments,
      journals: data.recentJournals,
    });

    errors.value = results
      .filter((result) => result.error)
      .map(
        (result) =>
          `${jobLabels[result.key] || result.key}: ${result.error}`
      );

    lastUpdated.value = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } finally {
    loading.value = false;
  }
}

async function handleCompanyChange(name) {
  company.value = name;

  const selectedCompany = companies.value.find((item) => item.name === name);
  currency.value = selectedCompany?.default_currency || "INR";
  bankAccount.value = selectedCompany?.default_bank_account || "";

  await loadDashboard();
}

async function handleDateChange({ from_date, to_date }) {
  fromDate.value = from_date;
  toDate.value = to_date;

  if (fromDate.value && toDate.value) {
    await loadDashboard();
  }
}

function handleOpenReport(reportName) {
  openReport(reportName, buildReportFilters(reportName, reportContext.value));
}

function handleOpenMetric(metric) {
  if (metric?.list) {
    openList(metric.list.doctype, metric.list.filters);
  }
}

function handleOpenVoucher({ doctype, name }) {
  openDocument(doctype, name);
}

function scrollToReports() {
  document
    .getElementById("report-library")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

onMounted(async () => {
  try {
    await loadCompanies();
    await setDefaultPeriod();
    await loadDashboard();
  } catch (error) {
    errors.value = [error?.message || String(error)];
    loading.value = false;
  }
});
</script>

<template>
  <main class="accounting-dashboard">
    <DashboardHeader
      :companies="companies"
      :company="company"
      :from-date="fromDate"
      :to-date="toDate"
      :loading="loading"
      :last-updated="lastUpdated"
      @company-change="handleCompanyChange"
      @date-change="handleDateChange"
      @refresh="loadDashboard"
      @open-reports="scrollToReports"
    />

    <div v-if="errors.length" class="error-banner">
      <div class="error-banner-icon">!</div>
      <div>
        <strong>Some dashboard sections could not be loaded.</strong>
        <ul>
          <li v-for="error in visibleErrors" :key="error">{{ error }}</li>
        </ul>
        <p v-if="errors.length > visibleErrors.length">
          And {{ errors.length - visibleErrors.length }} more section(s).
        </p>
      </div>
    </div>

    <SummaryCards
      :metrics="metrics"
      :loading="loading"
      @select="handleOpenMetric"
    />

    <section class="dashboard-grid dashboard-grid--charts">
      <DashboardChart
        title="Income vs Expenses"
        :subtitle="`Monthly performance · ${periodLabel}`"
        :labels="profitAndLossChart.labels"
        :series="profitAndLossChart.series"
        :currency="currency"
        :loading="loading"
        :colors="['#20bf88', '#e5484d', '#6040c5']"
        open-report-label="Open P&L"
        @open-report="handleOpenReport(REPORT_NAMES.profitAndLoss)"
      />

      <DashboardChart
        title="Cash Flow"
        subtitle="Net cash movement by activity"
        :labels="cashFlowChart.labels"
        :series="cashFlowChart.series"
        :currency="currency"
        :loading="loading"
        type="area"
        :colors="['#3987f5', '#0f9f8f', '#c43f9d', '#6040c5']"
        open-report-label="Open Cash Flow"
        @open-report="handleOpenReport(REPORT_NAMES.cashFlow)"
      />

      <DashboardChart
        title="Sales vs Purchases"
        subtitle="Invoiced value by month"
        :labels="salesPurchaseChart.labels"
        :series="salesPurchaseChart.series"
        :currency="currency"
        :loading="loading"
        :colors="['#493b91', '#ffad19']"
        open-report-label="Open registers"
        @open-report="handleOpenReport(REPORT_NAMES.salesRegister)"
      />

      <DashboardChart
        title="Receivable vs Payable Ageing"
        subtitle="Outstanding balance by ageing bucket"
        :labels="ageingChart.labels"
        :series="ageingChart.series"
        :currency="currency"
        :loading="loading"
        :colors="['#3987f5', '#ffad19']"
        open-report-label="Open AR ageing"
        @open-report="handleOpenReport(REPORT_NAMES.accountsReceivable)"
      />
    </section>

    <section class="dashboard-grid dashboard-grid--tables">
      <PartyOutstandingTable
        title="Top Receivables"
        subtitle="Largest outstanding customer invoices"
        :rows="topReceivables"
        :currency="currency"
        :loading="loading"
        empty-text="No outstanding customer invoices for this period."
        open-report-label="Open AR"
        @open-report="handleOpenReport(REPORT_NAMES.accountsReceivable)"
        @open-voucher="handleOpenVoucher"
      />

      <PartyOutstandingTable
        title="Top Payables"
        subtitle="Largest outstanding supplier bills"
        :rows="topPayables"
        :currency="currency"
        :loading="loading"
        empty-text="No outstanding supplier bills for this period."
        open-report-label="Open AP"
        @open-report="handleOpenReport(REPORT_NAMES.accountsPayable)"
        @open-voucher="handleOpenVoucher"
      />
    </section>

    <section class="dashboard-grid dashboard-grid--tables">
      <RecentTransactions
        :transactions="recentTransactions"
        :currency="currency"
        :loading="loading"
        @open-voucher="handleOpenVoucher"
      />

      <BankReconciliationCard
        :data="bankReconciliation"
        :currency="currency"
        :loading="loading"
        @open-report="handleOpenReport(REPORT_NAMES.bankReconciliation)"
      />
    </section>

    <section class="dashboard-section">
      <ReportLibrary @open-report="handleOpenReport" />
    </section>

    <footer class="dashboard-footer">
      <span v-if="depreciationTotal">
        Depreciation posted: {{ formatCurrency(depreciationTotal, currency) }}
      </span>
    </footer>
  </main>
</template>
