const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

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