import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

let app = null;

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
};

const devRoot = document.getElementById("app");

if (devRoot) {
  window.QuantumbergAccountingDashboard.mount(devRoot);
}
