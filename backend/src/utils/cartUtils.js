export const calculateItemPrice = (variant, quantity) => {
    const basePrice = variant.price * quantity;
    const discount = variant.oldPrice ? (variant.oldPrice - variant.price) * quantity : 0;
    return {
        basePrice,
        discount,
        finalPrice: basePrice
    };
};

export const calculateOrderSummary = (items, policies = {}) => {
    const {
        freeShippingThreshold = 999,
        baseShippingCost = 99
    } = policies;

    let subtotal = 0;
    let totalDiscount = 0;
    let itemCount = 0;

    items.forEach(item => {
        const { basePrice, discount } = calculateItemPrice(item.selectedVariant || item, item.quantity);
        subtotal += basePrice;
        totalDiscount += discount;
        itemCount += item.quantity;
    });

    const shippingCost = subtotal >= freeShippingThreshold ? 0 : baseShippingCost;
    const finalTotal = subtotal + shippingCost;

    return {
        subtotal,
        totalDiscount,
        shippingCost,
        finalTotal,
        itemCount,
        freeShippingThreshold
    };
};

export const enrichCartItems = (cartItems, products) => {
    const enrichedItems = [];
    
    for (const cartItem of cartItems) {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product) continue;
        
        const variant = product.variants.find(v => v.id === cartItem.variantId);
        if (!variant) continue;
        
        enrichedItems.push({
            ...product,
            selectedVariant: variant,
            price: variant.price,
            oldPrice: variant.oldPrice,
            size: variant.size,
            stock: variant.stock,
            quantity: cartItem.quantity,
            addedAt: cartItem.addedAt,
            variantId: cartItem.variantId
        });
    }
    
    return enrichedItems;
};

export const validateCartStock = (cartItems, products) => {
    const stockIssues = [];
    
    for (const cartItem of cartItems) {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product) continue;
        
        const variant = product.variants.find(v => v.id === cartItem.variantId);
        if (!variant) continue;
        
        if (variant.stock < cartItem.quantity) {
            stockIssues.push({
                productId: product.id,
                productName: `${product.name} (${variant.size})`,
                requested: cartItem.quantity,
                available: variant.stock
            });
        }
    }
    
    return stockIssues;
};

export const getDefaultVariant = (product) => {
    if (product.defaultVariant) {
        return product.defaultVariant.id;
    }
    if (product.variants && product.variants.length > 0) {
        return product.variants[0].id;
    }
    return null;
};
