const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency
    }).format(amount || 0);
};

export const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};


const formatDiscount = (discount) =>
    discount === 0 ? 'No Discount' : `${parseFloat((discount * 100).toFixed(2))}%`;

const isUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}
export { formatCurrency, formatDiscount, isUrl };