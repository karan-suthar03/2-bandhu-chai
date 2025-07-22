export const ORDER_STATUS = {
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

export const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED'
};

export const PAYMENT_METHOD = {
    CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
    CREDIT_CARD: 'CREDIT_CARD',
    DEBIT_CARD: 'DEBIT_CARD',
    UPI: 'UPI',
    NET_BANKING: 'NET_BANKING',
    WALLET: 'WALLET'
};

export const STATUS_PROGRESSION = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED],
    [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.RETURNED],
    [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.RETURNED],
    [ORDER_STATUS.CANCELLED]: [],
    [ORDER_STATUS.RETURNED]: [ORDER_STATUS.REFUNDED],
    [ORDER_STATUS.REFUNDED]: []
};

export const STATUS_DESCRIPTIONS = {
    [ORDER_STATUS.PENDING]: 'Order received and awaiting confirmation',
    [ORDER_STATUS.CONFIRMED]: 'Order confirmed and being prepared',
    [ORDER_STATUS.PROCESSING]: 'Order is being processed and packed',
    [ORDER_STATUS.SHIPPED]: 'Order has been shipped',
    [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Order is out for delivery',
    [ORDER_STATUS.DELIVERED]: 'Order has been delivered successfully',
    [ORDER_STATUS.CANCELLED]: 'Order has been cancelled',
    [ORDER_STATUS.RETURNED]: 'Order has been returned',
    [ORDER_STATUS.REFUNDED]: 'Order amount has been refunded'
};

export const isValidStatusTransition = (currentStatus, newStatus) => {
    const allowedTransitions = STATUS_PROGRESSION[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
};

export const getStatusMessage = (status) => {
    return STATUS_DESCRIPTIONS[status] || 'Unknown status';
};

export const canCancelOrder = (status) => {
    const cancellableStatuses = [
        ORDER_STATUS.PENDING,
        ORDER_STATUS.CONFIRMED,
        ORDER_STATUS.PROCESSING
    ];
    return cancellableStatuses.includes(status);
};

export const isFinalStatus = (status) => {
    const finalStatuses = [
        ORDER_STATUS.DELIVERED,
        ORDER_STATUS.CANCELLED,
        ORDER_STATUS.REFUNDED
    ];
    return finalStatuses.includes(status);
};

export const getOrderTimeline = (statusHistory) => {
    const timeline = statusHistory.map(history => ({
        status: history.status,
        message: getStatusMessage(history.status),
        timestamp: history.createdAt,
        notes: history.notes
    }));

    return timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};
