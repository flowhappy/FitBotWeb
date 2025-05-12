<template>
  <table class="table tablesorter" :class="tableClass">
    <thead :class="theadClasses">
      <tr>
        <slot name="columns">
          <th v-for="column in columns" :key="column">{{ column }}</th>
        </slot>
      </tr>
    </thead>
    <tbody :class="tbodyClasses">
      <tr
        v-for="(item, index) in data"
        :key="index"
        @mouseover="hoveredRowIndex = index"
        @mouseout="hoveredRowIndex = null"
        @click="emitRowClick(item)"
        :class="{ 'row-hover-active': hoveredRowIndex === index }"
        class="clickable-row"
      >
        <slot :row="item">
          <td
            v-for="(column, colIndex) in columns"
            :key="colIndex"
            v-if="hasValue(item, column)"
          >
            <slot
              :name="`cell(${column})`"
              :value="itemValue(item, column)"
              :item="item"
              :column="column"
            >
              {{ itemValue(item, column) }}
            </slot>
          </td>
        </slot>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: "base-table",
  props: {
    tableClass: { type: String, default: "" },
    theadClasses: { type: String, default: "" },
    tbodyClasses: { type: String, default: "" },
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
  },
  data() {
    return {
      hoveredRowIndex: null,
    };
  },
  methods: {
    hasValue(item, column) {
      const lowerCaseColumn =
        typeof column === "string" ? column.toLowerCase() : column;
      return (
        item &&
        typeof item[lowerCaseColumn] !== "undefined" &&
        item[lowerCaseColumn] !== null
      );
    },
    itemValue(item, column) {
      const lowerCaseColumn =
        typeof column === "string" ? column.toLowerCase() : column;
      return item[lowerCaseColumn];
    },
    emitRowClick(item) {
      this.$emit("row-click", item);
    },
  },
  emits: ["row-click"],
};
</script>

<style>
.clickable-row {
  cursor: pointer;
}

.table tbody tr.row-hover-active {
  background-color: #f5f5f5;
}
</style>
