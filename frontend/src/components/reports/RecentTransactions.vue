<script setup>
import {
  formatCurrency,
  formatDate,
  getStatusTone,
} from "../../utils/formatters.js";

defineProps({
  transactions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  currency: { type: String, default: "INR" },
});

defineEmits(["open-voucher"]);
</script>

<template>
  <section class="transactions-card qb-card">
    <header class="transactions-card-header">
      <div class="min-w-0">
        <h2>Recent Transactions</h2>
        <p>Latest invoices, payments and journal entries in the period</p>
      </div>

      <span class="transactions-count">
        {{ loading ? "Loading" : `${transactions.length} shown` }}
      </span>
    </header>

    <div v-if="loading" class="transactions-skeleton">
      <div
        v-for="row in 6"
        :key="row"
        class="skeleton-block transactions-skeleton-row"
      ></div>
    </div>

    <div v-else-if="!transactions.length" class="empty-state transactions-empty">
      No transactions found for this period.
    </div>

    <div v-else class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Voucher</th>
            <th>Date</th>
            <th>Party</th>
            <th class="numeric">Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>
              <span class="type-badge" :class="`type-badge--${transaction.tone}`">
                {{ transaction.type }}
              </span>
            </td>
            <td>
              <button
                type="button"
                class="voucher-link"
                @click="
                  $emit('open-voucher', {
                    doctype: transaction.doctype,
                    name: transaction.name,
                  })
                "
              >
                {{ transaction.name }}
              </button>
            </td>
            <td class="date-cell">{{ formatDate(transaction.date) }}</td>
            <td>
              <span class="party-cell">{{ transaction.party || "—" }}</span>
            </td>
            <td class="numeric amount-cell">
              {{ formatCurrency(transaction.amount, currency) }}
            </td>
            <td>
              <span
                class="status-badge"
                :class="`status-badge--${getStatusTone(transaction.status)}`"
              >
                {{ transaction.status || "—" }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="transactions-footer">
      <span>Standard ERPNext documents only</span>
      <span>Sales · Purchases · Payments · Journals</span>
    </footer>
  </section>
</template>

<style scoped>
.transactions-card {
  display: flex;
  min-height: 100%;
  flex-direction: column;
}

.transactions-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 15px 11px;
  border-bottom: 1px solid var(--border-color, #edf0f7);
}

.transactions-card-header h2 {
  color: var(--text-color, #17153c);
}

.transactions-card-header p {
  margin: 3px 0 0;
  color: var(--text-muted, #78809b);
  font-size: 11px;
  line-height: 1.4;
}

.transactions-count {
  flex-shrink: 0;
  color: var(--text-muted, #78809b);
  font-size: 11px;
  white-space: nowrap;
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
  padding: 9px 12px;
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

.type-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
  border-radius: 999px;
}

.type-badge--sales {
  color: #1d4ed8;
  background: #eff6ff;
}

.type-badge--purchase {
  color: #b45309;
  background: #fffbeb;
}

.type-badge--payment {
  color: #047857;
  background: #ecfdf5;
}

.type-badge--journal {
  color: #6d28d9;
  background: #f3eefe;
}

.status-badge--success {
  color: #047857;
  background: #ecfdf5;
}

.status-badge--warning {
  color: #b45309;
  background: #fffbeb;
}

.status-badge--danger {
  color: #be123c;
  background: #fff1f2;
}

.status-badge--neutral {
  color: #475569;
  background: #f1f5f9;
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

.party-cell {
  display: block;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.transactions-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}

.transactions-skeleton-row {
  width: 100%;
  height: 27px;
}

.transactions-empty {
  min-height: 240px;
}

.transactions-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 15px;
  margin-top: auto;
  color: var(--text-muted, #78809b);
  font-size: 10px;
  border-top: 1px solid var(--border-color, #edf0f7);
}

@media (max-width: 700px) {
  .transactions-card-header {
    padding: 12px;
  }

  th,
  td {
    padding: 9px 10px;
  }
}
</style>
