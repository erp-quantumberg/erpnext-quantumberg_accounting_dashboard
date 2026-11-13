import { createApp } from "vue";
import "./style.css";
import "./styles/global-header.css";
import App from "./App.vue";
import GlobalHeader from "./components/header/GlobalHeader.vue";

let app = null;
let headerApp = null;

window.QuantumbergAccountingDashboard = {
  mount(element) {
    if (!element) {
      throw new Error("Accounting Dashboard root element not found");
    }

    if (app) {
      app.unmount();
      app = null;
    }

    app = createApp(App);
    app.mount(element);
  },

  unmount() {
    if (app) {
      app.unmount();
      app = null;
    }
  },

  mountHeader(element) {
    if (!element) {
      throw new Error("Accounting Dashboard header root element not found");
    }

    if (headerApp) {
      headerApp.unmount();
      headerApp = null;
    }

    headerApp = createApp(GlobalHeader);
    headerApp.mount(element);
  },

  unmountHeader() {
    if (headerApp) {
      headerApp.unmount();
      headerApp = null;
    }
  },
};

const devRoot = document.getElementById("app");

if (devRoot) {
  window.QuantumbergAccountingDashboard.mount(devRoot);
}
