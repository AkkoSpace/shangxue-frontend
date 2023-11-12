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
              <t-form-item label="交易 ID" name="transactionId">
                <t-input
                  v-model="formData.transactionId"
                  :style="{ minWidth: '130px' }"
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
                  :options="TRANSACTION_STATUS_OPTIONS"
                  class="form-item-content`"
                  placeholder="请选择交易状态"
                />
              </t-form-item>
            </t-col>
            <t-col :flex="1">
              <t-form-item label="交易日期" name="transactionDate">
                <t-date-picker
                  v-model="formData.transactionDate"
                  :on-change="onDateChange"
                  :style="{ minWidth: '130px', width: '100%' }"
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
      >
        <!--        日期仅保留年月日-->
        <template #transactionDate="{ row }">
          {{ row.transactionDate.split('T')[0] }}
        </template>
        <template #amount="{ row }">
          <!--          展示两位小数，展示千分位-->
          {{ row.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}
        </template>
        <template #status="{ row }">
          <t-tag v-if="row.status === TRANSACTION_STATUS.UNPAID" theme="warning" variant="light">未付款</t-tag>
          <t-tag v-if="row.status === TRANSACTION_STATUS.PAID" theme="success" variant="light">已付款</t-tag>
          <t-tag v-if="row.status === TRANSACTION_STATUS.CANCELED" theme="danger" variant="light">已取消</t-tag>
          <t-tag v-if="row.status === TRANSACTION_STATUS.REFUNDED" theme="danger" variant="light">已退款</t-tag>
        </template>
        <template #op-title>
          <t-space>
            <span>操作</span>
            <t-button size="small" style="margin: -2px -5px 0 0" theme="primary" @click="handleClickAdd">新增</t-button>
          </t-space>
        </template>
        <template #op="slotProps">
          <a class="t-button-link" @click="handleClickOp(slotProps)">管理</a>
          <a class="t-button-link" @click="handleClickDelete(slotProps)">删除</a>
        </template>
      </t-table>
      <t-pagination
        :current="pagination.current"
        :pageSize="pagination.pageSize"
        :total="pagination.total"
        @change="handlePaginateChange"
      />
    </div>
    <!--非基本页面-->
    <!--新增-->
    <t-dialog
      :closeBtn="false"
      :closeOnEscKeydown="false"
      :closeOnOverlayClick="false"
      :visible.sync="saveVisible"
      @cancel="onCancelSave"
      @confirm="onConfirmSave"
    >
      <div slot="header">
        <span style="vertical-align: middle">新增交易订单</span>
      </div>
      <t-form
        ref="saveForm"
        :data="saveFormData"
        :label-width="80"
        :rules="saveFormRules"
        :status-icon="true"
        label-align="right"
        style="margin-left: 20px"
      >
        <t-form-item label="交易 ID" name="transactionId">
          <t-input
            v-model="saveFormData.transactionId"
            :style="{ minWidth: '130px', width: '90%' }"
            class="form-item-content"
            placeholder="请输入交易 ID"
            type="search"
          />
        </t-form-item>
        <t-form-item label="交易日期" name="transactionDate">
          <t-date-picker
            v-model="saveFormData.transactionDate"
            :style="{ minWidth: '130px', width: '90%' }"
            class="form-item-content"
            placeholder="请选择交易日期"
          />
        </t-form-item>
        <t-form-item label="交易金额" name="amount">
          <t-input
            v-model="saveFormData.amount"
            :style="{ minWidth: '130px', width: '90%' }"
            class="form-item-content"
            placeholder="请输入交易金额"
            suffix="元"
            type="search"
          />
        </t-form-item>
        <t-form-item label="交易状态" name="status">
          <t-select
            v-model="saveFormData.status"
            :options="TRANSACTION_STATUS_OPTIONS"
            :style="{ minWidth: '130px', width: '90%' }"
            class="form-item-content"
            placeholder="请选择交易状态"
          />
        </t-form-item>
        <t-form-item label="备注" name="description">
          <t-input
            v-model="saveFormData.description"
            :style="{ minWidth: '130px', width: '90%' }"
            class="form-item-content"
            placeholder="请输入备注"
            type="search"
          />
        </t-form-item>
      </t-form>
    </t-dialog>
    <!--删除-->
    <t-dialog
      :body="confirmBody"
      :confirmBtn="{
        theme: 'danger',
      }"
      :visible.sync="deleteVisible"
      header="确认删除当前所选交易订单？"
      theme="warning"
      @cancel="onCancel"
      @confirm="onConfirmDelete"
    >
    </t-dialog>
  </div>
</template>
<script>
import { prefix } from '@/config/global';

import {
  CONTRACT_PAYMENT_TYPES,
  CONTRACT_STATUS_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_TYPES,
  TRANSACTION_STATUS,
  TRANSACTION_STATUS_OPTIONS,
} from '@/constants';

export default {
  name: 'transaction-table',
  data() {
    return {
      TRANSACTION_STATUS,
      CONTRACT_STATUS_OPTIONS,
      CONTRACT_TYPES,
      CONTRACT_TYPE_OPTIONS,
      CONTRACT_PAYMENT_TYPES,
      prefix,
      formData: {
        transactionId: undefined,
        // transactionDate: undefined,
        status: undefined,
      },
      saveFormData: {
        transactionId: 'XD',
        transactionDate: undefined,
        amount: undefined,
        status: 0,
        description: undefined,
      },
      saveFormRules: {
        transactionId: [{ required: true, message: '请输入交易 ID', trigger: 'blur' }],
        transactionDate: [{ required: true, message: '请选择交易日期', trigger: 'blur' }],
        amount: [{ required: true, message: '请输入交易金额', trigger: 'blur' }],
        // status: [{ required: true, message: '请选择交易状态', trigger: 'blur' }],
      },
      data: [],
      dataLoading: false,
      value: 'first',
      columns: [
        {
          title: '交易单号',
          width: 150,
          align: 'left',
          ellipsis: true,
          colKey: 'transactionId',
        },
        {
          title: '交易日期',
          width: 120,
          ellipsis: true,
          colKey: 'transactionDate',
        },
        {
          title: '交易金额 (元)',
          width: 100,
          align: 'right',
          ellipsis: true,
          colKey: 'amount',
        },
        { title: '交易状态', align: 'center', colKey: 'status', width: 100, cell: { col: 'status' } },
        {
          align: 'center',
          fixed: 'right',
          width: 120,
          colKey: 'op',
          title: 'op-title',
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
      saveTitle: '新增订单',
      saveVisible: false,
      deleteVisible: false,
      deleteIdx: -1,
    };
  },
  computed: {
    TRANSACTION_STATUS_OPTIONS() {
      return TRANSACTION_STATUS_OPTIONS;
    },
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
    this.getTransactionList();
  },
  methods: {
    // ==== 页面事件 ====
    // 查询交易
    onSubmit() {
      this.getTransactionList();
    },
    // 重置查询条件
    onReset() {},
    // 新增交易
    handleClickAdd() {
      this.saveVisible = true;
    },
    onConfirmSave() {
      // TODO 临时发起登录请求
      // this.$request
      //   .post('/api/user/login', {
      //     userAccount: 'admin',
      //     userPassword: 'Yan990817',
      //   })
      //   .then((res) => {
      //     if (res.code === 0) {
      //       this.$message.success('登录成功');
      //     }
      //   });

      this.$request
        .post('/api/transaction/add', this.saveFormData)
        .then((res) => {
          if (res.code === 0) {
            this.$message.success('提交成功');
            this.saveVisible = false;
            this.$refs.saveForm.reset();
            this.saveFormData = {
              transactionId: 'XD',
              transactionDate: undefined,
              amount: undefined,
              status: 0,
              description: undefined,
            };
            this.getTransactionList();
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    onCancelSave() {
      this.$refs.saveForm.reset();
    },
    // 分页变化
    handlePaginateChange(curr, pageInfo) {
      console.log('分页变化', curr, pageInfo);
    },
    handleClickOp({ text, row }) {
      console.log(text, row);
    },
    handleClickDelete(row) {
      this.deleteIdx = row.rowIndex;
      this.deleteVisible = true;
    },
    onConfirmDelete() {
      // 真实业务请发起请求
      this.data.splice(this.deleteIdx, 1);
      this.pagination.total = this.data.length;
      this.deleteVisible = false;
      this.$message.success('删除成功');
      this.resetIdx();
    },
    onCancel() {
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },

    // ==== 请求后端接口 ====
    // 获取交易列表
    getTransactionList() {
      this.dataLoading = true;
      this.$request
        .get('/api/transaction/list/page', {
          params: {
            current: this.pagination.current,
            pageSize: this.pagination.pageSize,
            ...this.formData,
          },
        })
        .then((res) => {
          if (res.code === 0) {
            const { data } = res;
            this.data = data.records;
            this.pagination.total = Number(data.total);
          }
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          this.dataLoading = false;
        });
    },

    // ==== 工具方法 ====
    // 格式化日期
    onDateChange() {
      console.log('onDateChange', this.formData.transactionDate);
      this.formData.transactionDate = this.formData.transactionDate.format('YYYY-MM-DD');
    },
    // 获取容器
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
  },
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.transaction-common-table {
  height: 100%;
  padding: 16px;
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
    height: calc(100% - 60px);
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
