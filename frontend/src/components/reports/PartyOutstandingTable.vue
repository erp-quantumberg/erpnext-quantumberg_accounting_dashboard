<script setup>
import { ArrowUpRight } from "lucide-vue-next";
import {
  formatCurrency,
  formatDate,
  getPartyName,
} from "../../utils/formatters.js";

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  currency: { type: String, default: "INR" },
  emptyText: { type: String, default: "No outstanding balances." },
  openReportLabel: { type: String, default: "Open report" },
});

defineEmits(["open-report", "open-voucher"]);
</script>

<template>
  <section class="table-card qb-card">
    <header class="table-card-header">
      <div class="min-w-0">
        <h2>{{ title }}</h2>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>

      <button type="button" class="dashboard-link" @click="$emit('open-report')">
        {{ openReportLabel }}
        <ArrowUpRight :size="13" />
      </button>
    </header>

    <div v-if="loading" class="table-skeleton">
      <div
        v-for="row in 5"
        :key="row"
        class="skeleton-block table-skeleton-row"
      ></div>
    </div>

    <div v-else-if="!rows.length" class="empty-state table-empty">
      {{ emptyText }}
    </div>

    <div v-else class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Party</th>
            <th>Voucher</th>
            <th>Due date</th>
            <th class="numeric">Outstanding</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.voucher_no || row.name">
            <td>
              <span class="party-name">{{ getPartyName(row) }}</span>
              <span class="party-meta">{{ row.voucher_type || "Voucher" }}</span>
            </td>
            <td>
              <button
                type="button"
                class="voucher-link"
                @click="
                  $emit('open-voucher', {
                    doctype: row.voucher_type,
                    name: row.voucher_no,
                  })
                "
              >
                {{ row.voucher_no || "—" }}
              </button>
            </td>
            <td class="date-cell">{{ formatDate(row.due_date) }}</td>
            <td class="numeric amount-cell">
              {{ formatCurrency(row.outstanding, currency) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.table-card {
  display: flex;
  min-height: 100%;
  flex-direction: column;
}

.table-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 15px 11px;
  border-bottom: 1px solid var(--border-color, #edf0f7);
}

.table-card-header h2 {
  color: var(--text-color, #17153c);
}

.table-card-header p {
  margin: 3px 0 0;
  color: var(--text-muted, #78809b);
  font-size: 11px;
  line-height: 1.4;
}

.table-scroll {
  min-width: 0;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 9px 12px;
  color: var(--text-muted, #78809b);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.25px;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
  background: var(--subtle-fg, #f8f9fd);
  border-bottom: 1px solid var(--border-color, #edf0f7);
}

td {
  padding: 10px 12px;
  color: var(--text-color, #333333);
  font-size: 12px;
  vertical-align: middle;
  border-bottom: 1px solid var(--border-color, #f0f2f8);
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr:hover {
  background: var(--subtle-fg, #fafbff);
}

.party-name {
  display: block;
  max-width: 210px;
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.party-meta {
  display: block;
  margin-top: 2px;
  color: var(--text-muted, #78809b);
  font-size: 10px;
}

.voucher-link {
  padding: 0;
  color: #6040c5;
  font-size: 12px;
  font-weight: 500;
  background: transparent;
  border: 0;
  white-space: nowrap;
}

.voucher-link:hover {
  text-decoration: underline;
}

.date-cell {
  color: var(--text-muted, #78809b);
  white-space: nowrap;
}

.numeric {
  text-align: right;
}

.amount-cell {
  font-weight: 650;
  white-space: nowrap;
}

.table-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}

.table-skeleton-row {
  width: 100%;
  height: 26px;
}

.table-skeleton-row:nth-child(odd) {
  opacity: 0.7;
}

.table-empty {
  min-height: 220px;
}

@media (max-width: 700px) {
  .table-card-header {
    padding: 12px;
  }

  th,
  td {
    padding: 9px 10px;
  }
}
</style>
