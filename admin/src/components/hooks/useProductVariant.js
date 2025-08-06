import { useState } from 'react';

export const useProductVariants = (initialVariants = [], initialDefaultVariantId = null) => {
    const [variants, setVariants] = useState(initialVariants);
    const [defaultVariantId, setDefaultVariantId] = useState(initialDefaultVariantId);

    const handleAddVariant = () => {
        const newVariant = {
            id: `temp_${Date.now()}`,
            size: '',
            price: '',
            oldPrice: '',
            stock: '',
            sku: ''
        };
        setVariants(prev => [...prev, newVariant]);
    };

    const handleRemoveVariant = (idToRemove) => {
        if (defaultVariantId === idToRemove) {
            setDefaultVariantId(null);
        }
        setVariants(prev => prev.filter(v => v.id !== idToRemove));
    };

    const handleVariantChange = (id, field, value) => {
        setVariants(prev => prev.map(v => (v.id === id ? { ...v, [field]: value } : v)));
    };

    return {
        variants,
        setVariants,
        defaultVariantId,
        setDefaultVariantId,
        handleAddVariant,
        handleRemoveVariant,
        handleVariantChange
    };
};