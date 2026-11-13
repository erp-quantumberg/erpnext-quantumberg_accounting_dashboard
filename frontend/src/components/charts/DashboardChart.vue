<script setup>
import { computed } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { ArrowUpRight } from "lucide-vue-next";
import {
  formatCompactNumber,
  formatCurrency,
  toNumber,
} from "../../utils/formatters.js";

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  labels: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] },
  type: { type: String, default: "bar" },
  height: { type: Number, default: 285 },
  currency: { type: String, default: "INR" },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: "No data available for this period." },
  colors: { type: Array, default: () => ["#493b91", "#c43f9d", "#3987f5"] },
  stacked: { type: Boolean, default: false },
  horizontal: { type: Boolean, default: false },
  showLegend: { type: Boolean, default: true },
  openReportLabel: { type: String, default: "" },
});

const emit = defineEmits(["open-report"]);

const hasData = computed(() =>
  props.labels.length > 0 &&
  props.series.some((series) =>
    (series.data || []).some((value) => Math.abs(toNumber(value)) > 0)
  )
);

const chartOptions = computed(() => ({
  chart: {
    type: props.type,
    height: props.height,
    toolbar: { show: false },
    fontFamily: "inherit",
    stacked: props.stacked,
    animations: { enabled: true, speed: 350 },
    parentHeightOffset: 0,
  },
  colors: props.colors,
  plotOptions: {
    bar: {
      horizontal: props.horizontal,
      borderRadius: 4,
      borderRadiusApplication: "end",
      columnWidth: props.horizontal ? "58%" : "45%",
    },
  },
  dataLabels: { enabled: false },
  stroke: {
    curve: "smooth",
    width: props.type === "area" ? 2 : 0,
  },
  fill:
    props.type === "area"
      ? {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.35,
            opacityTo: 0.04,
            stops: [0, 100],
          },
        }
      : { opacity: 1 },
  xaxis: {
    categories: props.labels,
    labels: {
      style: { colors: "#78809b", fontSize: "11px" },
      rotate: 0,
      hideOverlappingLabels: true,
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      formatter: (value) => formatCompactNumber(value, props.currency),
      style: { colors: "#78809b", fontSize: "11px" },
    },
  },
  grid: {
    borderColor: "#edf0f7",
    strokeDashArray: 4,
    padding: { left: 6, right: 8, top: 0, bottom: 0 },
  },
  legend: {
    show: props.showLegend,
    position: "top",
    horizontalAlign: "right",
    fontSize: "12px",
    labels: { colors: "#78809b" },
    markers: { size: 6 },
    itemMargin: { horizontal: 8 },
  },
  tooltip: {
    y: {
      formatter: (value) => formatCurrency(value, props.currency),
    },
  },
  noData: {
    text: props.emptyText,
    align: "center",
    verticalAlign: "middle",
    style: { color: "#78809b", fontSize: "13px" },
  },
}));
</script>

<template>
  <section class="chart-card qb-card">
    <header class="chart-card-header">
      <div class="min-w-0">
        <h2>{{ title }}</h2>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>

      <button
        v-if="openReportLabel"
        type="button"
        class="dashboard-link"
        @click="emit('open-report')"
      >
        {{ openReportLabel }}
        <ArrowUpRight :size="13" />
      </button>
    </header>

    <div class="chart-card-body">
      <div v-if="loading" class="chart-skeleton">
        <div class="skeleton-block chart-skeleton-line chart-skeleton-line--short"></div>
        <div class="skeleton-block chart-skeleton-line"></div>
        <div class="skeleton-block chart-skeleton-line"></div>
      </div>

      <div v-else-if="!hasData" class="empty-state chart-empty">
        {{ emptyText }}
      </div>

      <VueApexCharts
        v-else
        :options="chartOptions"
        :series="series"
        :height="height"
      />
    </div>
  </section>
</template>

<style scoped>
.chart-card {
  display: flex;
  flex-direction: column;
}

.chart-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 15px 10px;
  border-bottom: 1px solid var(--border-color, #edf0f7);
}

.chart-card-header h2 {
  overflow: hidden;
  color: var(--text-color, #17153c);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-card-header p {
  margin: 3px 0 0;
  color: var(--text-muted, #78809b);
  font-size: 11px;
  line-height: 1.4;
}

.chart-card-body {
  min-width: 0;
  padding: 8px 10px 8px;
}

.chart-skeleton {
  display: flex;
  height: 285px;
  flex-direction: column;
  justify-content: flex-end;
  gap: 12px;
  padding: 28px 10px 16px;
}

.chart-skeleton-line {
  width: 100%;
  height: 52px;
}

.chart-skeleton-line:nth-child(2) {
  height: 92px;
}

.chart-skeleton-line:nth-child(3) {
  height: 70px;
}

.chart-skeleton-line--short {
  width: 42%;
  height: 14px;
  margin-bottom: auto;
}

.chart-empty {
  min-height: 285px;
}

@media (max-width: 700px) {
  .chart-card-header {
    padding: 12px 12px 9px;
  }

  .chart-card-body {
    padding: 6px 6px 6px;
  }
}
</style>
