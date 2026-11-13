const DEFAULT_AGEING_LABELS = [
  "<0",
  "0-30",
  "31-60",
  "61-90",
  "91-120",
  "121-Above",
];

export function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

export function sumRows(rows, field) {
  return (rows || []).reduce((total, row) => total + toNumber(row?.[field]), 0);
}

export function isReportDataRow(row) {
  if (!row || Array.isArray(row) || row.bold) {
    return false;
  }

  if ("voucher_no" in row) {
    return Boolean(row.voucher_no && row.party);
  }

  return true;
}

export function formatCurrency(
  value,
  currency = "INR",
  { maximumFractionDigits = 0, minimumFractionDigits = 0 } = {}
) {
  const amount = toNumber(value);

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    return `${currency || "INR"} ${amount.toFixed(maximumFractionDigits)}`;
  }
}

export function formatCompactNumber(value, currency = "INR") {
  const amount = toNumber(value);
  const absolute = Math.abs(amount);

  if (absolute >= 10000000) {
    return `${formatCurrency(amount / 10000000, currency, {
      maximumFractionDigits: 2,
    })} Cr`;
  }

  if (absolute >= 100000) {
    return `${formatCurrency(amount / 100000, currency, {
      maximumFractionDigits: 2,
    })} L`;
  }

  if (absolute >= 1000) {
    return `${formatCurrency(amount / 1000, currency, {
      maximumFractionDigits: 1,
    })} K`;
  }

  return formatCurrency(amount, currency, { maximumFractionDigits: 0 });
}

export function formatNumber(value, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
  }).format(toNumber(value));
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = parseDate(value);

  if (!date) {
    return value || "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function monthKey(value) {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

export function buildMonthRange(fromDate, toDate) {
  const start = parseDate(fromDate);
  const end = parseDate(toDate);

  if (!start || !end || start > end) {
    return { keys: [], labels: [] };
  }

  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  const keys = [];
  const labels = [];

  while (cursor <= last) {
    keys.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`
    );
    labels.push(
      new Intl.DateTimeFormat("en-IN", {
        month: "short",
        year: "2-digit",
      }).format(cursor)
    );
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return { keys, labels };
}

export function getChartSeries(report, { dropEmpty = false } = {}) {
  const datasets = report?.chart?.data?.datasets || [];

  return datasets
    .map((dataset) => ({
      name: dataset.name || "Value",
      data: (dataset.values || dataset.data || []).map((value) =>
        value === null || value === undefined ? 0 : toNumber(value)
      ),
    }))
    .filter((series) => {
      if (!dropEmpty) {
        return true;
      }

      return series.data.some((value) => value !== 0);
    });
}

export function getAgeingBuckets(report) {
  const rows = (report?.result || []).filter(isReportDataRow);
  const labels = report?.chart?.data?.labels?.length
    ? report.chart.data.labels
    : DEFAULT_AGEING_LABELS;

  return {
    labels,
    values: labels.map((_, index) =>
      rows.reduce((total, row) => total + toNumber(row[`range${index}`]), 0)
    ),
  };
}

export function getPartyName(row) {
  return (
    row?.party_name ||
    row?.customer_name ||
    row?.supplier_name ||
    row?.party ||
    row?.customer ||
    row?.supplier ||
    "—"
  );
}

export function getStatusTone(status) {
  const normalized = String(status || "").toLowerCase();

  if (/paid|submitted|reconciled|approved|completed/.test(normalized)) {
    return "success";
  }

  if (/overdue|unpaid|pending|draft|partly/.test(normalized)) {
    return "warning";
  }

  if (/cancel|reject|failed/.test(normalized)) {
    return "danger";
  }

  return "neutral";
}
