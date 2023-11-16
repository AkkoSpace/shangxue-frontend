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
                  :style="{ minWidth: '130px' }"
                  class="form-item-content"
                  placeholder="请选择交易状态"
                />
              </t-form-item>
            </t-col>
            <t-col :flex="1">
              <t-form-item label="交易日期" name="transactionDate">
                <t-date-picker
                  v-model="formData.transactionDate"
                  :style="{ minWidth: '130px' }"
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
        <!--日期仅保留年月日-->
        <template #transactionDate="{ row }">
          {{ row.transactionDate.split('T')[0] }}
        </template>
        <template #amount="{ row }">
          <!--展示两位小数，展示千分位-->
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
          <t-space>
            <a class="t-button-link" @click="handleClickDetail(slotProps)">
              <t-icon name="browse" />
            </a>
            <a class="t-button-link" @click="handleClickUpdate(slotProps)">
              <t-icon name="edit-2" />
            </a>
            <a class="t-button-link" @click="handleClickDelete(slotProps)">
              <t-icon name="delete-1" />
            </a>
          </t-space>
        </template>
        <template #footerSummary>
          <div class="t-table__row-filter-inner">
            <div>
              <!--TODO 不存在未付款的交易，暂时不展示-->
              <t-space>
                <span>最早一笔未付款时间：</span>
                <span>
                  {{
                    data
                      .filter((item) => item.status === TRANSACTION_STATUS.UNPAID)
                      .sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate))[0]
                      .transactionDate.split('T')[0]
                  }}
                </span>
                <span>总未付款金额：¥</span>
                <span>{{
                  data
                    .filter((item) => item.status === TRANSACTION_STATUS.UNPAID)
                    .reduce((prev, curr) => prev + curr.amount, 0)
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }}</span>
              </t-space>
            </div>
          </div>
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
      :header="saveTitle"
      :visible.sync="saveVisible"
      @cancel="onCancelSave"
      @confirm="onConfirmSave"
    >
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
    <t-dialog
      :cancelBtn="null"
      :closeBtn="false"
      :closeOnEscKeydown="false"
      :closeOnOverlayClick="false"
      :visible.sync="viewVisible"
      header="查看交易订单"
      @confirm="onConfirmView"
    >
      <t-space direction="vertical" style="width: 100%">
        <t-divider align="center" dashed>订单信息</t-divider>
        <t-row>
          <t-col :span="3">
            <span>交易 ID：</span>
          </t-col>
          <t-col :span="9">
            <span>{{ detailData.transactionId }}</span>
          </t-col>
        </t-row>
        <t-row>
          <t-col :span="3">
            <span>交易日期：</span>
          </t-col>
          <t-col :span="9">
            <span>{{ detailData.transactionDate }}</span>
          </t-col>
        </t-row>
        <t-row>
          <t-col :span="3">
            <span>交易金额：</span>
          </t-col>
          <t-col :span="9">
            <span>{{ detailData.amount }} 元</span>
          </t-col>
        </t-row>
        <t-row>
          <t-col :span="3">
            <span>交易状态：</span>
          </t-col>
          <t-col :span="9">
            <span v-if="detailData.status === TRANSACTION_STATUS.UNPAID">未付款</span>
            <span v-if="detailData.status === TRANSACTION_STATUS.PAID">已付款</span>
            <span v-if="detailData.status === TRANSACTION_STATUS.CANCELED">已取消</span>
            <span v-if="detailData.status === TRANSACTION_STATUS.REFUNDED">已退款</span>
          </t-col>
        </t-row>
        <t-row>
          <t-col :span="3">
            <span>备注：</span>
          </t-col>
          <t-col :span="9">
            <span v-if="detailData.description">{{ detailData.description }}</span>
            <span v-else style="color: var(--td-text-color-placeholder)">暂无描述</span>
          </t-col>
        </t-row>
        <t-divider align="center" dashed>其他信息</t-divider>
        <t-row>
          <t-col :span="3">
            <span>创建时间：</span>
          </t-col>
          <t-col :span="9">
            <span>{{ detailData.createTime }}</span>
          </t-col>
        </t-row>
        <t-row>
          <t-col :span="3">
            <span>更新时间：</span>
          </t-col>
          <t-col :span="9">
            <span>{{ detailData.updateTime }}</span>
          </t-col>
        </t-row>
      </t-space>
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
        transactionDate: undefined,
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
      detailData: {},
      btnLoading: false,
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
      saveTitle: '新增交易订单',
      saveType: 'add',
      saveVisible: false,
      viewVisible: false,
      deleteVisible: false,
      deleteIdx: -1,
      deleteTransactionId: '',
    };
  },
  computed: {
    TRANSACTION_STATUS_OPTIONS() {
      return TRANSACTION_STATUS_OPTIONS;
    },
    confirmBody() {
      if (this.deleteIdx > -1) {
        return `删除后，${this.deleteTransactionId} 的所有订单信息将被清空，且无法恢复`;
      }
      return '';
    },
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
    this.tempLogin();
    this.getTransactionList();
  },
  methods: {
    /* ===================================== 页面事件 ===================================== */
    /* ------------ 页面通用事件 ----------- */
    // 分页变化
    handlePaginateChange(pageInfo) {
      this.pagination.current = pageInfo.current;
      this.pagination.pageSize = pageInfo.pageSize;
      this.getTransactionList();
    },
    /* ------------ 查询 ----------- */
    // 查询交易
    onSubmit() {
      this.getTransactionList();
    },
    // 重置查询条件
    onReset() {
      this.formData = {
        transactionId: undefined,
        transactionDate: undefined,
        status: undefined,
      };
      this.getTransactionList();
    },
    /* ------------ 新增 ----------- */
    // 新增交易订单
    handleClickAdd() {
      this.saveTitle = '新增交易订单';
      this.saveType = 'add';
      this.saveVisible = true;
    },
    // 确认新增
    onConfirmSave() {
      if (this.saveType === 'add') {
        this.addTransactionOrder();
      }
      if (this.saveType === 'update') {
        this.updateTransactionOrder();
      }
    },
    // 取消新增
    onCancelSave() {
      this.$refs.saveForm.reset();
      this.initSaveFormData();
    },
    /* ------------ 更新 ----------- */
    // 更新交易订单
    handleClickUpdate(row) {
      this.saveTitle = '更新交易订单';
      this.saveType = 'update';
      this.saveFormData = {
        id: row.row.id,
        transactionId: row.row.transactionId,
        transactionDate: row.row.transactionDate,
        amount: row.row.amount,
        status: row.row.status,
        description: row.row.description,
      };
      this.saveVisible = true;
    },
    /* ------------ 详情 ----------- */
    // 查看交易订单详情
    handleClickDetail(row) {
      this.viewVisible = true;
      this.getTransactionDetail(row.row.id);
    },
    // 确认查看
    onConfirmView() {
      this.viewVisible = false;
    },
    /* ------------ 删除 ----------- */
    // 删除交易订单
    handleClickDelete(row) {
      this.deleteIdx = row.row.id;
      this.deleteTransactionId = row.row.transactionId;
      this.deleteVisible = true;
    },
    // 确认删除
    onConfirmDelete() {
      this.delTransactionOrder();
    },
    // 取消删除
    onCancel() {
      this.resetIdx();
    },
    // 重置删除索引
    resetIdx() {
      this.deleteIdx = -1;
    },

    /* ===================================== 请求后端 ===================================== */
    // TODO 临时登录待移除
    tempLogin() {
      this.$request
        .post('/api/user/login', {
          userAccount: 'admin',
          userPassword: 'Yan990817',
        })
        .then((res) => {
          if (res.code === 0) {
            this.$message.success('登录成功');
          }
        });
    },
    // 获取交易列表
    getTransactionList() {
      this.dataLoading = true;
      this.$request
        .get('/api/transaction/list/page', {
          params: {
            current: this.pagination.current,
            pageSize: this.pagination.pageSize,
            sortOrder: 'descend',
            sortField: 'transactionDate',
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
    // 新增交易订单
    addTransactionOrder() {
      this.$request
        .post('/api/transaction/add', this.saveFormData)
        .then((res) => {
          if (res.code === 0) {
            this.$message.success('提交成功');
            this.saveVisible = false;
            this.$refs.saveForm.reset();
            this.initSaveFormData();
            this.getTransactionList();
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    // 更新交易订单
    updateTransactionOrder() {
      this.$request
        .post('/api/transaction/update', this.saveFormData)
        .then((res) => {
          if (res.code === 0) {
            this.$message.success('提交成功');
            this.saveVisible = false;
            this.$refs.saveForm.reset();
            this.initSaveFormData();
            this.getTransactionList();
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    // 删除交易订单
    delTransactionOrder() {
      this.$request
        .post('/api/transaction/delete', { id: this.deleteIdx })
        .then((res) => {
          if (res.code === 0) {
            this.$message.success('删除成功');
            this.deleteVisible = false;
            this.getTransactionList();
            this.resetIdx();
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    // 获取交易订单详情
    getTransactionDetail(id) {
      this.$request
        .get('/api/transaction/get', {
          params: {
            id,
          },
        })
        .then((res) => {
          if (res.code === 0) {
            this.detailData = res.data;
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    /* =====================================   其他   ===================================== */
    // 初始化表单内容: saveFormData
    initSaveFormData() {
      this.saveFormData = {
        transactionId: 'XD',
        transactionDate: undefined,
        amount: undefined,
        status: 0,
        description: undefined,
      };
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
