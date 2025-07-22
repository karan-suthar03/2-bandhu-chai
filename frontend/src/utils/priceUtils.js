export const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
        return '₹0.00';
    }
    return `₹${Number(price).toFixed(2)}`;
};


export const formatCurrency = (price) => {
    return formatPrice(price);
};


export const formatDiscount = (discount) => {
    return `${Number(discount*100).toFixed(2)}% Off`;
};
