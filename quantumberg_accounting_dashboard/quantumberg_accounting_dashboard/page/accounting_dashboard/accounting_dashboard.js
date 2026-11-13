frappe.pages["accounting-dashboard"].on_page_load = function (wrapper) {
  const page = frappe.ui.make_app_page({
    parent: wrapper,
    title: "Accounting Dashboard",
    single_column: true,
  });

  page.main.html(`
    <div
      id="quantumberg-accounting-dashboard-root"
      style="width:100%; min-height:80vh;"
    >
      <div style="padding:24px;color:#64748b;">
        Loading Accounting Dashboard...
      </div>
    </div>
  `);

  const root = page.main.find(
    "#quantumberg-accounting-dashboard-root"
  )[0];

  const assetBase =
    "/assets/quantumberg_accounting_dashboard/dashboard";

  let cssPath = `${assetBase}/index.css`;
  let jsPath = `${assetBase}/index.js`;

  async function resolveAssetPaths() {
    let version = "";

    try {
      const response = await fetch(`${assetBase}/version.json?ts=${Date.now()}`, {
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        version = data?.version
          ? `?v=${encodeURIComponent(data.version)}`
          : "";
      }
    } catch (error) {
      version = "";
    }

    if (!version) {
      version = `?v=${Date.now()}`;
    }

    cssPath = `${assetBase}/index.css${version}`;
    jsPath = `${assetBase}/index.js${version}`;
  }

  function loadCSS() {
    let link = document.querySelector(
      'link[data-quantumberg-accounting-dashboard="css"]'
    );

    if (
      link?.dataset.loaded === "true" &&
      link.getAttribute("href") === cssPath
    ) {
      return Promise.resolve();
    }

    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.dataset.quantumbergAccountingDashboard = "css";
      document.head.appendChild(link);
    }

    return new Promise((resolve, reject) => {
      link.onload = () => {
        link.dataset.loaded = "true";
        resolve();
      };

      link.onerror = () => {
        reject(new Error("Failed to load Accounting Dashboard CSS"));
      };

      link.href = cssPath;
    });
  }

  function loadJS() {
    if (window.QuantumbergAccountingDashboard) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      let script = document.querySelector(
        'script[data-quantumberg-accounting-dashboard="js"]'
      );

      if (script) {
        if (script.dataset.loaded === "true") {
          resolve();
          return;
        }

        script.addEventListener("load", resolve, { once: true });
        script.addEventListener(
          "error",
          () =>
            reject(
              new Error("Failed to load Accounting Dashboard JavaScript")
            ),
          { once: true }
        );

        return;
      }

      script = document.createElement("script");
      script.src = jsPath;
      script.dataset.quantumbergAccountingDashboard = "js";

      script.onload = () => {
        script.dataset.loaded = "true";
        resolve();
      };

      script.onerror = () => {
        reject(new Error("Failed to load Accounting Dashboard JavaScript"));
      };

      document.body.appendChild(script);
    });
  }

  async function initializeDashboard() {
    try {
      await resolveAssetPaths();
      await loadCSS();
      await loadJS();

      const dashboard = window.QuantumbergAccountingDashboard;

      if (!dashboard || typeof dashboard.mount !== "function") {
        throw new Error(
          "Vue mount function is missing. Check frontend/src/main.js."
        );
      }

      dashboard.mount(root);
    } catch (error) {
      console.error("Accounting Dashboard initialization failed:", error);

      root.innerHTML = `
        <div style="
          margin:20px;
          padding:20px;
          background:#fff1f2;
          color:#be123c;
          border-radius:8px;
        ">
          <h3>Unable to load Accounting Dashboard</h3>
          <p>${frappe.utils.escape_html(error.message || String(error))}</p>
          <p>Check the browser Console for details.</p>
        </div>
      `;
    }
  }

  initializeDashboard();
};
