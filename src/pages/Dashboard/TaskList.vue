<template>
  <base-table :data="tableData" thead-classes="text-primary">
    <template slot-scope="{ row }">
      <td class="text-left">
        <p class="title">{{ row.title }}</p>
        <p class="text-muted">{{ row.description }}</p>
      </td>
    </template>
  </base-table>
</template>
<script>
import BaseTable from "@/components/BaseTable";

export default {
  components: {
    BaseTable,
  },

  computed: {
    tableData() {
      return this.$t("dashboard.taskList");
    },
  },
};
</script>
<style></style>
