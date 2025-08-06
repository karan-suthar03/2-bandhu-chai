import React from 'react';
import {
    Assignment, CheckCircle, LocalShipping, Inventory, Cancel, Schedule, Done,
    CreditCard, AccountBalance, Phone, Wallet, MonetizationOn
} from '@mui/icons-material';
import {PaymentMethodEnum, PaymentStatusEnum, StatusEnum} from "../enums.js";

export const parseAddress = (address) => {
    if (!address) return { street: '', city: '', state: '', pincode: '', landmark: '' };
    if (typeof address === 'string') {
        try {
            const parsed = JSON.parse(address);
            return typeof parsed === 'object' && parsed !== null ? parsed : { street: address };
        } catch (e) {
            return { street: address };
        }
    }
    return address;
};

export const getStatusColor = (status) => {
    const colorMap = {
        [StatusEnum.DELIVERED]: 'success',
        [StatusEnum.CANCELLED]: 'error',
        [StatusEnum.REFUNDED]: 'error',
        [StatusEnum.RETURNED]: 'warning',
        [StatusEnum.SHIPPED]: 'info',
        [StatusEnum.OUT_FOR_DELIVERY]: 'info',
        [StatusEnum.PROCESSING]: 'primary',
        [StatusEnum.CONFIRMED]: 'primary',
    };
    return colorMap[status] || 'default';
};

export const getStatusLabel = (status) => {
    const labels = {
        [StatusEnum.PENDING]: 'Pending',
        [StatusEnum.CONFIRMED]: 'Confirmed',
        [StatusEnum.PROCESSING]: 'Processing',
        [StatusEnum.SHIPPED]: 'Shipped',
        [StatusEnum.OUT_FOR_DELIVERY]: 'On the Way',
        [StatusEnum.DELIVERED]: 'Delivered',
        [StatusEnum.CANCELLED]: 'Cancelled',
        [StatusEnum.RETURNED]: 'Returned',
        [StatusEnum.REFUNDED]: 'Refunded'
    };
    return labels[status] || status;
};

export const getStatusIcon = (status) => {
    const iconMap = {
        [StatusEnum.PENDING]: <Schedule />,
        [StatusEnum.CONFIRMED]: <CheckCircle />,
        [StatusEnum.PROCESSING]: <Inventory />,
        [StatusEnum.SHIPPED]: <LocalShipping />,
        [StatusEnum.OUT_FOR_DELIVERY]: <LocalShipping />,
        [StatusEnum.DELIVERED]: <Done />,
        [StatusEnum.CANCELLED]: <Cancel />,
        [StatusEnum.REFUNDED]: <Cancel />,
        [StatusEnum.RETURNED]: <Cancel />,
    };
    return iconMap[status] || <Assignment />;
};

export const getPaymentStatusColor = (status) => {
    const colorMap = {
        [PaymentStatusEnum.COMPLETED]: 'success',
        [PaymentStatusEnum.FAILED]: 'error',
        [PaymentStatusEnum.REFUNDED]: 'info',
        [PaymentStatusEnum.PENDING]: 'warning',
    };
    return colorMap[status] || 'warning';
};

export const getPaymentStatusLabel = (status) => {
    const labels = {
        [PaymentStatusEnum.PENDING]: 'Pending',
        [PaymentStatusEnum.COMPLETED]: 'Paid',
        [PaymentStatusEnum.FAILED]: 'Failed',
        [PaymentStatusEnum.REFUNDED]: 'Refunded'
    };
    return labels[status] || status;
};

export const getPaymentMethodIcon = (method) => {
    const iconMap = {
        [PaymentMethodEnum.CREDIT_CARD]: <CreditCard />,
        [PaymentMethodEnum.DEBIT_CARD]: <CreditCard />,
        [PaymentMethodEnum.NET_BANKING]: <AccountBalance />,
        [PaymentMethodEnum.UPI]: <Phone />,
        [PaymentMethodEnum.WALLET]: <Wallet />,
        [PaymentMethodEnum.CASH_ON_DELIVERY]: <MonetizationOn />,
    };
    return iconMap[method] || <MonetizationOn />;
};

export const getPaymentMethodLabel = (method) => {
    const labels = {
        [PaymentMethodEnum.CASH_ON_DELIVERY]: 'Cash on Delivery',
        [PaymentMethodEnum.CREDIT_CARD]: 'Credit Card',
        [PaymentMethodEnum.DEBIT_CARD]: 'Debit Card',
        [PaymentMethodEnum.UPI]: 'UPI',
        [PaymentMethodEnum.NET_BANKING]: 'Net Banking',
        [PaymentMethodEnum.WALLET]: 'Digital Wallet'
    };
    return labels[method] || method;
};

export const getStatusChipProps = (status) => {
    const props = { label: 'N/A', sx: { color: '#fff', border: 'none' } };
    switch (status) {
        case 'PENDING': props.label = 'Pending'; props.sx.bgcolor = '#ff9800'; break;
        case 'CONFIRMED': props.label = 'Confirmed'; props.sx.bgcolor = '#2196f3'; break;
        case 'PROCESSING': props.label = 'Processing'; props.sx.bgcolor = '#00bcd4'; break;
        case 'SHIPPED': props.label = 'Shipped'; props.sx.bgcolor = '#673ab7'; break;
        case 'OUT_FOR_DELIVERY': props.label = 'On the Way'; props.sx.bgcolor = '#3f51b5'; break;
        case 'DELIVERED': props.label = 'Delivered'; props.sx.bgcolor = 'success.main'; break;
        case 'CANCELLED': props.label = 'Cancelled'; props.sx.bgcolor = 'error.main'; break;
        case 'RETURNED': props.label = 'Returned'; props.sx.bgcolor = 'warning.main'; break;
        case 'REFUNDED': props.label = 'Refunded'; props.sx.bgcolor = 'info.main'; break;
        default: props.label = status || 'N/A'; props.sx.bgcolor = 'grey.500'; break;
    }
    return props;
};

export const getPaymentStatusChipProps = (status) => {
    const props = { label: 'N/A', sx: { color: '#fff', border: 'none' } };
    switch (status) {
        case 'PENDING': props.label = 'Pending'; props.sx.bgcolor = '#ff9800'; break;
        case 'COMPLETED': props.label = 'Paid'; props.sx.bgcolor = '#4caf50'; break;
        case 'FAILED': props.label = 'Failed'; props.sx.bgcolor = '#f44336'; break;
        case 'REFUNDED': props.label = 'Refunded'; props.sx.bgcolor = '#03a9f4'; break;
        default: props.label = status || 'N/A'; props.sx.bgcolor = 'grey.500'; break;
    }
    return props;
};

export const getPaymentMethodChipProps = (method) => {
    const props = { label: 'N/A', sx: { color: '#fff', border: 'none' } };
    switch (method) {
        case 'CASH_ON_DELIVERY': props.label = 'Cash On Delivery'; props.sx.bgcolor = '#795548'; break;
        case 'CREDIT_CARD': props.label = 'Credit Card'; props.sx.bgcolor = '#3f51b5'; break;
        case 'DEBIT_CARD': props.label = 'Debit Card'; props.sx.bgcolor = '#009688'; break;
        case 'UPI': props.label = 'UPI'; props.sx.bgcolor = '#4caf50'; break;
        case 'NET_BANKING': props.label = 'Net Banking'; props.sx.bgcolor = '#2196f3'; break;
        case 'WALLET': props.label = 'Wallet'; props.sx.bgcolor = '#ff9800'; break;
        default: props.label = method || 'N/A'; props.sx.bgcolor = 'grey.500'; break;
    }
    return props;
};