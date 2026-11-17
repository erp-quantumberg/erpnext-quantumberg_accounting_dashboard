<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Bell, ChevronDown, Landmark } from "lucide-vue-next";

const props = defineProps({
  apiNamespace: {
    type: String,
    default: "quantumberg_accounting_dashboard.api",
  },
});

const searchText = ref("");
const searchResults = ref([]);
const searchOpen = ref(false);
const searchBusy = ref(false);
const menuOpen = ref("");
const company = ref("");
const companies = ref([]);
const currentLanguage = ref(window.frappe?.boot?.lang || "en");

const user = computed(() => window.frappe?.session?.user || "Guest");
const userInitials = computed(() => {
  const name = user.value === "Guest" ? "G" : user.value.split("@")[0];
  return name.split(/[ ._-]/).filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
});
const displayUser = computed(() => {
  const info = window.frappe?.boot?.user_info?.[user.value];
  return info?.fullname || user.value;
});
const languageLabel = computed(() => {
  const labels = { en: "English", hi: "\u0939\u093f\u0928\u094d\u0926\u0940" };
  return labels[currentLanguage.value] || (currentLanguage.value || "").toUpperCase();
});

let searchTimer;
let outsideHandler;

function goHome() {
  window.frappe?.set_route?.("");
}

function routeToList(doctype) {
  window.frappe?.set_route?.("List", doctype);
  searchOpen.value = false;
  searchText.value = "";
}

function runSearch() {
  const term = searchText.value.trim();
  if (!term) {
    searchResults.value = [];
    searchOpen.value = false;
    return;
  }
  searchOpen.value = true;
  searchBusy.value = true;
  window.frappe.call({
    method: "frappe.desk.search.search_link",
    args: { doctype: "DocType", txt: term, page_length: 8 },
    callback: (r) => {
      searchResults.value = (r.message || []).map((item) => ({
        label: item.value || item.name,
        value: item.value || item.name,
      }));
      searchBusy.value = false;
    },
    error: () => {
      searchResults.value = [];
      searchBusy.value = false;
    },
  });
}

function onSearchInput() {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(runSearch, 250);
}

function onGlobalKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.querySelector("#qg-global-search")?.focus();
  }
  if (event.key === "Escape") {
    searchOpen.value = false;
    menuOpen.value = "";
  }
}

function toggleMenu(name) {
  menuOpen.value = menuOpen.value === name ? "" : name;
}

async function loadCompanies() {
  if (!window.frappe?.call || user.value === "Guest") return;
  try {
    const r = await window.frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Company",
        fields: ["name"],
        limit_page_length: 100,
        order_by: "name asc",
      },
    });
    companies.value = (r.message || []).map((x) => x.name);
    company.value =
      window.frappe.defaults?.get_user_default?.("Company") ||
      window.frappe.boot?.sysdefaults?.company ||
      companies.value[0] ||
      "";
  } catch (e) {
    console.warn("Quantumberg Global UI: unable to load companies", e);
  }
}

async function selectCompany(value) {
  if (!value || value === company.value) {
    menuOpen.value = "";
    return;
  }
  try {
    await window.frappe.call({
      method: `${props.apiNamespace}.set_default_company`,
      args: { company: value },
    });
    company.value = value;
    menuOpen.value = "";
    window.frappe.show_alert?.({
      message: `Default company changed to ${value}`,
      indicator: "green",
    });
    // Reload so forms and reports pick up the new default.
    window.setTimeout(() => window.location.reload(), 600);
  } catch (e) {
    window.frappe.msgprint?.({
      message: "Could not change the default company. Check your permissions.",
      indicator: "red",
    });
  }
}

function openNotifications() {
  menuOpen.value = "";

  // Use Frappe's built-in notification panel from the sidebar.
  const sidebarButton = document.querySelector(".sidebar-notification");
  if (sidebarButton) {
    sidebarButton.click();
    return;
  }

  const dropdown = document.querySelector(".dropdown-notifications");
  if (dropdown) {
    dropdown.classList.toggle("hidden");
    if (!dropdown.classList.contains("hidden")) {
      window.jQuery?.(dropdown).trigger("show.bs.dropdown");
    }
    return;
  }

  window.frappe?.set_route?.("List", "Notification Log");
}

function openUserProfile() {
  if (user.value !== "Guest") window.frappe?.set_route?.("Form", "User", user.value);
  menuOpen.value = "";
}

function openUserSettings() {
  if (user.value !== "Guest") {
    window.frappe?.set_route?.("Form", "User", user.value, { user_settings: 1 });
  }
  menuOpen.value = "";
}

function logout() {
  window.frappe?.app?.logout?.();
}

function changeLanguage(language) {
  if (language === currentLanguage.value) {
    menuOpen.value = "";
    return;
  }
  window.frappe.call({
    method: `${props.apiNamespace}.set_user_language`,
    args: { language },
    callback: () => window.location.reload(),
    error: () => window.frappe.msgprint?.("Unable to change language."),
  });
  menuOpen.value = "";
}

onMounted(() => {
  loadCompanies();
  window.addEventListener("keydown", onGlobalKeydown);
  outsideHandler = (event) => {
    if (!event.target.closest("#quantumberg-global-header")) {
      menuOpen.value = "";
      searchOpen.value = false;
    }
  };
  document.addEventListener("click", outsideHandler);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onGlobalKeydown);
  document.removeEventListener("click", outsideHandler);
  window.clearTimeout(searchTimer);
});
</script>

<template>
  <div class="qg-header">
    <div class="qg-left">
      <button class="qg-brand" type="button" @click="goHome">
        <span class="qg-mark"><Landmark :size="18" /></span>
        <span class="qg-brand-name">quantumberg <small>ERP</small></span>
      </button>

      <div class="qg-menu-wrap" v-if="companies.length">
        <button class="qg-select" type="button" @click.stop="toggleMenu('company')">
          <span class="qg-truncate">{{ company || "Select company" }}</span>
          <ChevronDown class="qg-chevron" :size="16" />
        </button>
        <div v-if="menuOpen === 'company'" class="qg-dropdown qg-company-menu">
          <div class="qg-dropdown-title">Switch company</div>
          <button v-for="item in companies" :key="item" class="qg-dropdown-item"
                  :class="{ active: item === company }" @click="selectCompany(item)">
            {{ item }} <span v-if="item === company">✓</span>
          </button>
        </div>
      </div>
    </div>

    <div class="qg-search-wrap">
      <span class="qg-search-icon">⌕</span>
      <input id="qg-global-search" v-model="searchText" type="search"
             placeholder="Search DocTypes..." autocomplete="off"
             @input="onSearchInput" @focus="searchText && (searchOpen = true)"
             @keydown.enter="searchResults[0] && routeToList(searchResults[0].value)" />
      <kbd>Ctrl+K</kbd>
      <div v-if="searchOpen" class="qg-dropdown qg-search-results">
        <div class="qg-dropdown-title">{{ searchBusy ? "Searching..." : "DocTypes" }}</div>
        <button v-for="item in searchResults" :key="item.value" class="qg-dropdown-item"
                @click="routeToList(item.value)">
          <span>{{ item.label }}</span><small>Open list</small>
        </button>
        <div v-if="!searchBusy && !searchResults.length" class="qg-empty">No matching DocTypes</div>
      </div>
    </div>

    <div class="qg-actions">
      <button class="qg-icon-button qg-bell" title="Notifications" @click.stop="openNotifications">
        <Bell :size="20" /><span class="qg-notification-dot"></span>
      </button>

      <div class="qg-menu-wrap">
        <button class="qg-action-button" @click.stop="toggleMenu('language')">
          <span class="qg-globe">◎</span><span>{{ languageLabel }}</span><ChevronDown class="qg-chevron" :size="16" />
        </button>
        <div v-if="menuOpen === 'language'" class="qg-dropdown qg-right-menu">
          <button class="qg-dropdown-item" @click="changeLanguage('en')">English</button>
          <button class="qg-dropdown-item" @click="changeLanguage('hi')">हिन्दी</button>
        </div>
      </div>

      <div class="qg-menu-wrap">
        <button class="qg-user-button" @click.stop="toggleMenu('user')">
          <span class="qg-avatar">{{ userInitials }}</span>
          <span class="qg-user-name">{{ displayUser }}</span>
          <ChevronDown class="qg-chevron" :size="16" />
        </button>
        <div v-if="menuOpen === 'user'" class="qg-dropdown qg-right-menu">
          <div class="qg-user-summary"><strong>{{ displayUser }}</strong><small>{{ user }}</small></div>
          <button class="qg-dropdown-item" @click="openUserProfile">My profile</button>
          <button class="qg-dropdown-item" @click="openUserSettings">User settings</button>
          <button class="qg-dropdown-item qg-danger" @click="logout">Log out</button>
        </div>
      </div>
    </div>
  </div>
</template>
