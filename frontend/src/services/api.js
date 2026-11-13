function getFrappe() {
  return window.frappe;
}

function ensureFrappe() {
  if (!getFrappe()?.call) {
    throw new Error("Frappe API is not available. Open this page from Desk.");
  }
}

function normalizeError(error) {
  if (!error) {
    return "Request failed";
  }

  if (typeof error === "string") {
    return error;
  }

  const response = error.responseJSON || error;
  const serverMessages = response?._server_messages;

  if (serverMessages) {
    try {
      const messages = JSON.parse(serverMessages);
      const first = JSON.parse(messages[0]);
      const message = first?.message || messages[0];

      if (message) {
        return String(message).replace(/<[^>]+>/g, " ").trim();
      }
    } catch {
      return String(serverMessages);
    }
  }

  return (
    response?.exception ||
    response?.message ||
    error.message ||
    "Request failed"
  );
}

export function call(method, args = {}) {
  ensureFrappe();

  return new Promise((resolve, reject) => {
    getFrappe().call({
      method,
      args,
      type: "POST",
      callback: (response) => resolve(response?.message),
      error: (error) => reject(new Error(normalizeError(error))),
    });
  });
}

export function getList(doctype, options = {}) {
  return call("frappe.client.get_list", {
    doctype,
    ...options,
  });
}

export function getValue(doctype, fieldname, filters) {
  return call("frappe.client.get_value", {
    doctype,
    fieldname,
    filters,
  });
}

export function getCount(doctype, filters = {}) {
  return call("frappe.client.get_count", {
    doctype,
    filters,
  });
}

export function runReport(reportName, filters = {}) {
  return call("frappe.desk.query_report.run", {
    report_name: reportName,
    filters,
    are_default_filters: 0,
  });
}

export function openDocument(doctype, name) {
  if (!doctype || !name) {
    return;
  }

  if (getFrappe()?.set_route) {
    getFrappe().set_route("Form", doctype, name);
    return;
  }

  window.location.href = `/app/${encodeURIComponent(
    String(doctype).toLowerCase().replace(/\s+/g, "-")
  )}/${encodeURIComponent(name)}`;
}

export function openList(doctype, filters = null) {
  if (!doctype) {
    return;
  }

  if (getFrappe()?.set_route) {
    getFrappe().route_options =
      filters && Object.keys(filters).length ? filters : null;
    getFrappe().set_route("List", doctype);
    return;
  }

  window.location.href = `/app/${encodeURIComponent(
    String(doctype).toLowerCase().replace(/\s+/g, "-")
  )}`;
}

export function openReport(reportName, filters = {}) {
  if (getFrappe()?.set_route) {
    getFrappe().set_route("query-report", reportName, filters);
    return;
  }

  window.location.href = `/app/query-report/${encodeURIComponent(reportName)}`;
}

export function getToday() {
  return (
    getFrappe()?.datetime?.get_today?.() ||
    new Date().toISOString().slice(0, 10)
  );
}

export function getUserDefault(key) {
  return getFrappe()?.defaults?.get_user_default?.(key) || "";
}
