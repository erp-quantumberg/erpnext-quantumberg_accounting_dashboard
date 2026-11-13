<script setup>
import {
  Building2,
  Landmark,
  Package,
  PiggyBank,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-vue-next";

defineProps({
  metrics: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["select"]);

function selectMetric(metric) {
  emit("select", metric);
}

function onKeydown(event, metric) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    selectMetric(metric);
  }
}

const icons = {
  receivable: WalletCards,
  payable: ReceiptText,
  cash: Landmark,
  inventory: Package,
  income: TrendingUp,
  expense: TrendingDown,
  profit: PiggyBank,
  assets: Building2,
};

const iconClasses = {
  purple: "kpi-icon-purple",
  blue: "kpi-icon-blue",
  green: "kpi-icon-green",
  orange: "kpi-icon-orange",
  red: "kpi-icon-red",
  teal: "kpi-icon-teal",
};
</script>

<template>
  <section class="kpi-grid">
    <article
      v-for="metric in metrics"
      :key="metric.title"
      class="kpi-card"
      :class="{ 'kpi-card--clickable': metric.list }"
      :role="metric.list ? 'button' : undefined"
      :tabindex="metric.list ? 0 : undefined"
      @click="metric.list && selectMetric(metric)"
      @keydown="metric.list && onKeydown($event, metric)"
    >
      <div class="kpi-card-main">
        <div class="kpi-card-content">
          <p class="kpi-title">{{ metric.title }}</p>
          <p v-if="loading" class="kpi-value kpi-value--loading">
            <span class="skeleton-block"></span>
          </p>
          <p v-else class="kpi-value" :class="metric.valueClass">
            {{ metric.value }}
          </p>
          <p class="kpi-description">{{ metric.subtitle }}</p>
        </div>

        <div
          class="kpi-icon"
          :class="iconClasses[metric.tone] || 'kpi-icon-purple'"
        >
          <component :is="icons[metric.icon] || WalletCards" :size="19" />
        </div>
      </div>

      <div class="kpi-footer">
        <span class="kpi-dot"></span>
        <span>{{ metric.footer || "Live ERPNext data" }}</span>
      </div>

      <div class="kpi-bottom-border"></div>
    </article>
  </section>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  min-width: 0;
  margin-top: 12px;
}

.kpi-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 12px 14px 10px;
  overflow: hidden;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e1e6f2);
  border-radius: 11px;
  box-shadow: 0 2px 7px rgb(31 41 55 / 5%);
  transition:
    box-shadow 0.18s ease,
    transform 0.18s ease,
    border-color 0.18s ease;
}

.kpi-card--clickable {
  cursor: pointer;
}

.kpi-card--clickable:hover {
  transform: translateY(-1px);
}

.kpi-card--clickable:focus-visible {
  outline: 2px solid #493b91;
  outline-offset: 2px;
}

.kpi-card-main {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.kpi-card-content {
  flex: 1 1 auto;
  min-width: 0;
}

.kpi-title {
  margin: 0;
  color: var(--text-muted, #78809b);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2px;
  line-height: 1.5;
  overflow-wrap: break-word;
  text-transform: uppercase;
}

.kpi-value {
  margin: 5px 0 0;
  color: var(--text-color, #17153c);
  font-size: 21px;
  font-weight: 650;
  line-height: 1.3;
  letter-spacing: -0.5px;
  overflow-wrap: anywhere;
}

.kpi-value--loading {
  width: 72%;
  height: 24px;
  margin-top: 7px;
}

.kpi-value--loading .skeleton-block {
  display: block;
  width: 100%;
  height: 100%;
}

.kpi-value--positive {
  color: #07825f;
}

.kpi-value--negative {
  color: #c81e4a;
}

.kpi-description {
  margin: 3px 0 0;
  color: var(--text-muted, #78809b);
  font-size: 11px;
  line-height: 1.45;
  overflow-wrap: break-word;
}

.kpi-icon {
  display: flex;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
}

.kpi-icon-purple {
  color: #6d28d9;
  background: #f3eefe;
}

.kpi-icon-blue {
  color: #2563eb;
  background: #eff6ff;
}

.kpi-icon-green {
  color: #059669;
  background: #ecfdf5;
}

.kpi-icon-orange {
  color: #c2410c;
  background: #fff7ed;
}

.kpi-icon-red {
  color: #be123c;
  background: #fff1f2;
}

.kpi-icon-teal {
  color: #0f766e;
  background: #ecfdf5;
}

.kpi-footer {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 8px;
  padding-top: 6px;
  color: var(--text-muted, #78809b);
  font-size: 11px;
  line-height: 1.4;
  border-top: 1px solid var(--border-color, #edf0f7);
}

.kpi-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  background: #20bf88;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgb(32 191 136 / 12%);
}

.kpi-bottom-border {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #493b91, #c43f9d);
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .kpi-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
  }

  .kpi-card {
    padding: 11px;
  }

  .kpi-value {
    font-size: 19px;
  }
}
</style>
