<script setup>
import { computed } from "vue";
import { ArrowUpRight } from "lucide-vue-next";
import { REPORT_LIBRARY } from "../../services/reports.js";

defineEmits(["open-report"]);

const groupedReports = computed(() => {
  const groups = new Map();

  REPORT_LIBRARY.forEach((report) => {
    if (!groups.has(report.category)) {
      groups.set(report.category, []);
    }

    groups.get(report.category).push(report);
  });

  return [...groups.entries()].map(([category, reports]) => ({
    category,
    reports,
  }));
});
</script>

<template>
  <section id="report-library" class="report-library qb-card">
    <header class="report-library-header">
      <div>
        <h2>Standard Report Library</h2>
        <p>
          Open any report with the current company and date range already
          applied.
        </p>
      </div>

      <span class="report-library-note">Existing ERPNext reports</span>
    </header>

    <div class="report-library-body">
      <div
        v-for="group in groupedReports"
        :key="group.category"
        class="report-group"
      >
        <h3>{{ group.category }}</h3>

        <div class="report-grid">
          <button
            v-for="report in group.reports"
            :key="report.name"
            type="button"
            class="report-tile"
            @click="$emit('open-report', report.name)"
          >
            <span class="report-tile-icon">{{ report.short }}</span>

            <span class="report-tile-copy">
              <span class="report-tile-name">{{ report.name }}</span>
              <span class="report-tile-description">
                {{ report.description }}
              </span>
            </span>

            <ArrowUpRight :size="14" class="report-tile-arrow" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.report-library {
  scroll-margin-top: 12px;
}

.report-library-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 15px 16px 12px;
  border-bottom: 1px solid var(--border-color, #edf0f7);
}

.report-library-header h2 {
  color: var(--text-color, #17153c);
}

.report-library-header p {
  margin: 3px 0 0;
  color: var(--text-muted, #78809b);
  font-size: 11px;
  line-height: 1.4;
}

.report-library-note {
  flex-shrink: 0;
  padding: 3px 8px;
  color: #6040c5;
  font-size: 10px;
  font-weight: 600;
  background: #f3eefe;
  border-radius: 999px;
}

.report-library-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 15px 16px 18px;
}

.report-group h3 {
  margin-bottom: 8px;
  color: var(--text-muted, #78809b);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.report-tile {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 9px;
  padding: 10px;
  text-align: left;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e1e6f2);
  border-radius: 9px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.report-tile:hover {
  border-color: #c4b8ef;
  box-shadow: 0 4px 12px rgb(73 59 145 / 9%);
  transform: translateY(-1px);
}

.report-tile-icon {
  display: grid;
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  color: #6040c5;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: -0.2px;
  background: #f3eefe;
  border-radius: 8px;
  place-items: center;
}

.report-tile-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.report-tile-name {
  overflow: hidden;
  color: var(--text-color, #17153c);
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-tile-description {
  display: -webkit-box;
  overflow: hidden;
  color: var(--text-muted, #78809b);
  font-size: 10px;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.report-tile-arrow {
  flex-shrink: 0;
  color: #a5acbf;
  margin-top: 1px;
}

@media (max-width: 1100px) {
  .report-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .report-library-header,
  .report-library-body {
    padding-right: 12px;
    padding-left: 12px;
  }

  .report-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
