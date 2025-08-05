// These enums match exactly with the database schema enums
const StatusEnum = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    RETURNED: 'RETURNED',
    REFUNDED: 'REFUNDED'
};

const PaymentStatusEnum = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED'
};

const PaymentMethodEnum = {
    CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
    CREDIT_CARD: 'CREDIT_CARD',
    DEBIT_CARD: 'DEBIT_CARD',
    UPI: 'UPI',
    NET_BANKING: 'NET_BANKING',
    WALLET: 'WALLET'
};


export {StatusEnum, PaymentStatusEnum, PaymentMethodEnum};