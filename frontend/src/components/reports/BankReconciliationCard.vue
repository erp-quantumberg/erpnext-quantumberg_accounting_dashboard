<script setup>
import { ArrowUpRight, Landmark } from "lucide-vue-next";
import { formatCurrency } from "../../utils/formatters.js";

defineProps({
  data: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  currency: { type: String, default: "INR" },
});

defineEmits(["open-report"]);
</script>

<template>
  <section class="bank-card qb-card">
    <header class="bank-card-header">
      <div class="min-w-0">
        <h2>Bank Reconciliation</h2>
        <p>Ledger balance versus calculated bank statement balance</p>
      </div>

      <button
        v-if="data?.account"
        type="button"
        class="dashboard-link"
        @click="$emit('open-report')"
      >
        Open report
        <ArrowUpRight :size="13" />
      </button>
    </header>

    <div v-if="loading" class="bank-skeleton">
      <div class="skeleton-block bank-skeleton-title"></div>
      <div
        v-for="row in 4"
        :key="row"
        class="skeleton-block bank-skeleton-row"
      ></div>
    </div>

    <div v-else-if="!data?.account" class="empty-state bank-empty">
      No default bank or cash account is configured for this company.
    </div>

    <div v-else class="bank-content">
      <div class="bank-account">
        <div class="bank-account-icon">
          <Landmark :size="18" />
        </div>
        <div class="min-w-0">
          <p class="bank-account-label">Reconciling account</p>
          <p class="bank-account-name">{{ data.account }}</p>
        </div>
        <span class="bank-status">
          <span class="bank-status-dot"></span>
          Live
        </span>
      </div>

      <dl class="bank-figures">
        <div class="bank-figure">
          <dt>GL balance</dt>
          <dd>{{ formatCurrency(data.glBalance, currency) }}</dd>
        </div>
        <div class="bank-figure">
          <dt>Uncleared debits</dt>
          <dd>{{ formatCurrency(data.outstandingDebit, currency) }}</dd>
        </div>
        <div class="bank-figure">
          <dt>Uncleared credits</dt>
          <dd>{{ formatCurrency(data.outstandingCredit, currency) }}</dd>
        </div>
        <div class="bank-figure bank-figure--total">
          <dt>Calculated statement balance</dt>
          <dd>{{ formatCurrency(data.calculatedBalance, currency) }}</dd>
        </div>
      </dl>

      <footer class="bank-footer">
        <span>{{ data.unclearedEntries }} uncleared entr{{ data.unclearedEntries === 1 ? "y" : "ies" }}</span>
        <span>As on period end</span>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.bank-card {
  display: flex;
  min-height: 100%;
  flex-direction: column;
}

.bank-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 15px 11px;
  border-bottom: 1px solid var(--border-color, #edf0f7);
}

.bank-card-header h2 {
  color: var(--text-color, #17153c);
}

.bank-card-header p {
  margin: 3px 0 0;
  color: var(--text-muted, #78809b);
  font-size: 11px;
  line-height: 1.4;
}

.bank-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 14px 15px 0;
}

.bank-account {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--subtle-fg, #f8f9fd);
  border: 1px solid var(--border-color, #edf0f7);
  border-radius: 9px;
}

.bank-account-icon {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  color: #6040c5;
  background: #f3eefe;
  border-radius: 9px;
  place-items: center;
}

.bank-account-label {
  margin: 0;
  color: var(--text-muted, #78809b);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.25px;
  text-transform: uppercase;
}

.bank-account-name {
  margin: 2px 0 0;
  overflow: hidden;
  color: var(--text-color, #17153c);
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bank-status {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 5px;
  padding: 2px 7px;
  margin-left: auto;
  color: #047857;
  font-size: 10px;
  font-weight: 600;
  background: #ecfdf5;
  border-radius: 999px;
}

.bank-status-dot {
  width: 5px;
  height: 5px;
  background: #10b981;
  border-radius: 50%;
}

.bank-figures {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  padding: 12px 0;
  margin: 0;
}

.bank-figure {
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid var(--border-color, #edf0f7);
  border-radius: 8px;
}

.bank-figure--total {
  color: #ffffff;
  background: linear-gradient(135deg, #493b91, #6040c5);
  border-color: transparent;
}

.bank-figure dt {
  overflow: hidden;
  color: var(--text-muted, #78809b);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2px;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.bank-figure dd {
  margin: 4px 0 0;
  overflow: hidden;
  color: var(--text-color, #17153c);
  font-size: 13px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bank-figure--total dt,
.bank-figure--total dd {
  color: #ffffff;
}

.bank-figure--total dt {
  opacity: 0.78;
}

.bank-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 0;
  margin-top: auto;
  color: var(--text-muted, #78809b);
  font-size: 10px;
  border-top: 1px solid var(--border-color, #edf0f7);
}

.bank-skeleton {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}

.bank-skeleton-title {
  width: 65%;
  height: 50px;
}

.bank-skeleton-row {
  width: 100%;
  height: 48px;
}

.bank-empty {
  min-height: 260px;
}

@media (max-width: 700px) {
  .bank-card-header {
    padding: 12px;
  }

  .bank-content {
    padding: 12px 12px 0;
  }

  .bank-figures {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
