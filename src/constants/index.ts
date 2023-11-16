interface IOption {
  value: number | string;
  label: string;
}
// 合同状态枚举
export const CONTRACT_STATUS = {
  FAIL: 0,
  AUDIT_PENDING: 1,
  EXEC_PENDING: 2,
  EXECUTING: 3,
  FINISH: 4,
};

export const CONTRACT_STATUS_OPTIONS: Array<IOption> = [
  { value: CONTRACT_STATUS.FAIL, label: '审核失败' },
  { value: CONTRACT_STATUS.AUDIT_PENDING, label: '待审核' },
  { value: CONTRACT_STATUS.EXEC_PENDING, label: '待履行' },
  { value: CONTRACT_STATUS.EXECUTING, label: '审核成功' },
  { value: CONTRACT_STATUS.FINISH, label: '已完成' },
];

// 交易状态枚举: 0-未付款，1-已付款，2-已取消，3-已退款
export const TRANSACTION_STATUS = {
  UNPAID: 0,
  PAID: 1,
  CANCELED: 2,
  REFUNDED: 3,
};

export const TRANSACTION_STATUS_OPTIONS: Array<IOption> = [
  { value: TRANSACTION_STATUS.UNPAID, label: '未付款' },
  { value: TRANSACTION_STATUS.PAID, label: '已付款' },
  { value: TRANSACTION_STATUS.CANCELED, label: '已取消' },
  { value: TRANSACTION_STATUS.REFUNDED, label: '已退款' },
];

// 合同类型枚举
export const CONTRACT_TYPES = {
  MAIN: 0,
  SUB: 1,
  SUPPLEMENT: 2,
};

export const CONTRACT_TYPE_OPTIONS: Array<IOption> = [
  { value: CONTRACT_TYPES.MAIN, label: '主合同' },
  { value: CONTRACT_TYPES.SUB, label: '子合同' },
  { value: CONTRACT_TYPES.SUPPLEMENT, label: '补充合同' },
];

// 合同收付类型枚举
export const CONTRACT_PAYMENT_TYPES = {
  PAYMENT: 0,
  RECIPT: 1,
};

// 通知的优先级对应的TAG类型
export const NOTIFICATION_TYPES = {
  low: 'primary',
  middle: 'warning',
  high: 'danger',
};
