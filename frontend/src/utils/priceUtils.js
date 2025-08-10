export const formatPrice = (price) => {
    if (price === null || price === undefined) {
        return '₹0.00';
    }
    
    if (typeof price === 'string' && price.includes('₹')) {
        const numericValue = price.replace(/[₹,\s]/g, '');
        const parsedPrice = parseFloat(numericValue);
        if (isNaN(parsedPrice)) {
            return '₹0.00';
        }
        return `₹${parsedPrice.toFixed(2)}`;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
        return '₹0.00';
    }
    
    return `₹${numericPrice.toFixed(2)}`;
};


export const formatCurrency = (price) => {
    return formatPrice(price);
};


export const formatDiscount = (discount) => {
    if (discount === null || discount === undefined || discount === 0 || isNaN(discount)) {
        return null;
    }
    const percentage = Number(discount * 100).toFixed(0);
    return `${percentage}% Off`;
};

export const formatRating = (rating) => {
    if (rating === null || rating === undefined || isNaN(rating)) {
        return '0.0';
    }
    return Number(rating).toFixed(1);
};
