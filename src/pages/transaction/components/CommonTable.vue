<template>
  <div class="transaction-common-table">
    <t-form
      ref="form"
      :data="formData"
      :label-width="80"
      :style="{ marginBottom: '8px' }"
      colon
      @reset="onReset"
      @submit="onSubmit"
    >
      <t-row>
        <t-col :span="10">
          <t-row :gutter="[16, 24]">
            <t-col :flex="1">
              <t-form-item label="交易 ID" name="transactionID">
                <t-input
                  v-model="formData.transactionID"
                  :style="{ minWidth: '134px' }"
                  class="form-item-content"
                  placeholder="请输入交易 ID"
                  type="search"
                />
              </t-form-item>
            </t-col>
            <t-col :flex="1">
              <t-form-item label="交易状态" name="status">
                <t-select
                  v-model="formData.status"
                  :options="CONTRACT_STATUS_OPTIONS"
                  class="form-item-content`"
                  placeholder="请选择交易状态"
                />
              </t-form-item>
            </t-col>
            <t-col :flex="1">
              <t-form-item label="交易日期" name="transactionDate">
                <t-date-picker
                  v-model="formData.transactionDate"
                  :style="{ minWidth: '134px' }"
                  class="form-item-content"
                  placeholder="请选择交易日期"
                />
              </t-form-item>
            </t-col>
          </t-row>
        </t-col>

        <t-col :span="2" class="operation-container">
          <t-button :style="{ marginLeft: '8px' }" theme="primary" type="submit"> 查询</t-button>
          <t-button theme="default" type="reset" variant="base"> 重置</t-button>
        </t-col>
      </t-row>
    </t-form>
    <div class="table-container">
      <t-table
        :columns="columns"
        :data="data"
        :headerAffixProps="{ offsetTop, container: getContainer }"
        :headerAffixedTop="true"
        :hover="hover"
        :loading="dataLoading"
        :rowKey="rowKey"
        :verticalAlign="verticalAlign"
        @change="rehandleChange"
        @page-change="rehandlePageChange"
      >
        <template #status="{ row }">
          <t-tag v-if="row.status === TRANSACTION_STATUS.FAIL" theme="danger" variant="light">审核失败</t-tag>
          <t-tag v-if="row.status === TRANSACTION_STATUS.AUDIT_PENDING" theme="warning" variant="light">待审核</t-tag>
          <t-tag v-if="row.status === TRANSACTION_STATUS.EXEC_PENDING" theme="warning" variant="light">待履行</t-tag>
          <t-tag v-if="row.status === TRANSACTION_STATUS.EXECUTING" theme="success" variant="light">履行中</t-tag>
          <t-tag v-if="row.status === TRANSACTION_STATUS.FINISH" theme="success" variant="light">已完成</t-tag>
        </template>
        <template #contractType="{ row }">
          <p v-if="row.contractType === CONTRACT_TYPES.MAIN">审核失败</p>
          <p v-if="row.contractType === CONTRACT_TYPES.SUB">待审核</p>
          <p v-if="row.contractType === CONTRACT_TYPES.SUPPLEMENT">待履行</p>
        </template>
        <template #paymentType="{ row }">
          <p v-if="row.paymentType === CONTRACT_PAYMENT_TYPES.PAYMENT" class="payment-col">
            付款
            <trend class="dashboard-item-trend" type="up" />
          </p>
          <p v-if="row.paymentType === CONTRACT_PAYMENT_TYPES.RECIPT" class="payment-col">
            收款
            <trend class="dashboard-item-trend" type="down" />
          </p>
        </template>
        <template #op="slotProps">
          <a class="t-button-link" @click="rehandleClickOp(slotProps)">管理</a>
          <a class="t-button-link" @click="handleClickDelete(slotProps)">删除</a>
        </template>
      </t-table>
      <t-pagination :current="pagination.current" :pageSize="pagination.pageSize" :total="pagination.total" />
    </div>
    <!--非基本页面-->
    <t-dialog
      :body="confirmBody"
      :onCancel="onCancel"
      :visible.sync="confirmVisible"
      header="确认删除当前所选合同？"
      @confirm="onConfirmDelete"
    >
    </t-dialog>
  </div>
</template>
<script>
import { prefix } from '@/config/global';
import Trend from '@/components/trend/index.vue';

import {
  CONTRACT_PAYMENT_TYPES,
  CONTRACT_STATUS_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_TYPES,
  TRANSACTION_STATUS,
} from '@/constants';

export default {
  name: 'transaction-table',
  components: {
    Trend,
  },
  data() {
    return {
      TRANSACTION_STATUS,
      CONTRACT_STATUS_OPTIONS,
      CONTRACT_TYPES,
      CONTRACT_TYPE_OPTIONS,
      CONTRACT_PAYMENT_TYPES,
      prefix,
      formData: {
        name: '',
        no: undefined,
        status: undefined,
      },
      data: [],
      dataLoading: false,
      value: 'first',
      columns: [
        {
          title: '交易单号',
          width: 200,
          align: 'left',
          ellipsis: true,
          colKey: 'transactionId',
        },
        {
          title: '交易日期',
          width: 200,
          ellipsis: true,
          colKey: 'transactionDate',
        },
        {
          title: '交易金额 (元)',
          width: 200,
          ellipsis: true,
          colKey: 'amount',
        },
        { title: '交易状态', colKey: 'status', width: 200, cell: { col: 'status' } },

        {
          align: 'left',
          fixed: 'right',
          width: 200,
          colKey: 'op',
          title: '操作',
        },
      ],
      rowKey: 'index',
      tableLayout: 'auto',
      verticalAlign: 'top',
      bordered: true,
      hover: true,
      rowClassName: (rowKey) => `${rowKey}-class`,
      // 与pagination对齐
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0,
      },
      confirmVisible: false,
      deleteIdx: -1,
    };
  },
  computed: {
    confirmBody() {
      if (this.deleteIdx > -1) {
        const { name } = this.data?.[this.deleteIdx];
        return `删除后，${name}的所有合同信息将被清空，且无法恢复`;
      }
      return '';
    },
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
    this.dataLoading = true;
    this.$request
      .get('/api/transaction/list/page', {
        params: {
          current: this.pagination.current,
          pageSize: this.pagination.pageSize,
        },
      })
      .then((res) => {
        if (res.code === 0) {
          const { data } = res;
          this.data = data.records;
          this.pagination = {
            ...this.pagination,
            total: data.total,
          };
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        this.dataLoading = false;
      });
  },
  methods: {
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    onReset(data) {
      console.log(data);
    },
    onSubmit(data) {
      console.log(data);
    },
    rehandlePageChange(curr, pageInfo) {
      console.log('分页变化', curr, pageInfo);
    },
    rehandleChange(changeParams, triggerAndData) {
      console.log('统一Change', changeParams, triggerAndData);
    },
    rehandleClickOp({ text, row }) {
      console.log(text, row);
    },
    handleClickDelete(row) {
      this.deleteIdx = row.rowIndex;
      this.confirmVisible = true;
    },
    onConfirmDelete() {
      // 真实业务请发起请求
      this.data.splice(this.deleteIdx, 1);
      this.pagination.total = this.data.length;
      this.confirmVisible = false;
      this.$message.success('删除成功');
      this.resetIdx();
    },
    onCancel() {
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
  },
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.transaction-common-table {
  height: 100%;
  padding: 30px 32px;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
}

.form-item-content {
  width: 100%;
}

.table-container {
  height: 100%;
  margin-top: 16px;

  /deep/ .t-table {
    height: calc(100% - 48px);
  }
}

.operation-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.payment-col {
  display: flex;

  .trend-container {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }
}

.t-button + .t-button {
  margin-left: var(--td-comp-margin-s);
}
</style>
