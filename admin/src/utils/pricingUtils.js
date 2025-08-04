export const calculateDiscountPercentage = (price, oldPrice) => {
    if (!price || !oldPrice || oldPrice <= 0 || price <= 0) {
        return 0;
    }
    
    if (price >= oldPrice) {
        return 0;
    }
    
    const discount = (oldPrice - price) / oldPrice;
    return Math.round(discount * 10000) / 10000;
};

export const calculateDiscountDisplay = (price, oldPrice) => {
    const discount = calculateDiscountPercentage(price, oldPrice);
    return Math.round(discount * 100);
};

export const formatDiscountDisplay = (discount) => {
    if (!discount || discount <= 0) {
        return '0';
    }
    return Math.round(discount * 100).toString();
};

export const validatePricing = (pricing) => {
    const errors = {};
    
    if (!pricing.price || pricing.price <= 0) {
        errors.price = 'A valid price is required.';
    }
    
    if (pricing.oldPrice && pricing.oldPrice <= 0) {
        errors.oldPrice = 'Old price must be greater than 0 if provided.';
    }
    
    if (pricing.oldPrice && pricing.price && parseFloat(pricing.price) > parseFloat(pricing.oldPrice)) {
        errors.oldPrice = 'Old price should be higher than current price for a valid discount.';
    }
    
    if (!pricing.stock || pricing.stock < 0) {
        errors.stock = 'A valid stock count is required.';
    }
    
    return errors;
};
