<template>
  <t-card :bordered="false" class="transaction-order">
    <common-table />
  </t-card>
</template>
<script lang="ts">
import CommonTable from '../components/CommonTable.vue';

export default {
  name: 'TransactionOrder',
  components: {
    CommonTable,
  },
};
</script>

<style lang="less" scoped>
.transaction-order {
  height: 100%;
  width: 100%;

  /deep/ .t-card__body {
    height: 100%;
  }
}
</style>
