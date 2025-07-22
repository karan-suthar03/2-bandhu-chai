export const formatPrice = (price) => {
    return Number(price).toFixed(2);
};


export const formatCurrency = (price) => {
    return `₹${formatPrice(price)}`;
};


export const formatDiscount = (discount) => {
    return `${Number(discount*100).toFixed(2)}% Off`;
};
