export const validateRequired = (fields, data) => {
    const missing = [];
    for (const field of fields) {
        if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
            missing.push(field);
        }
    }
    return missing;
};

export const validateId = (id, fieldName = 'ID') => {
    const parsedId = parseInt(id);
    if (!id || isNaN(parsedId)) {
        throw new Error(`Valid ${fieldName} is required`);
    }
    return parsedId;
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, '');

    const phoneRegex = /^[0-9]{10,12}$/;
    return phoneRegex.test(digits);
};

export const sanitizeString = (str) => {
    return str ? str.trim() : '';
};

export const validatePagination = (page, limit) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return {
        page: Math.max(1, pageNum),
        limit: Math.min(100, Math.max(1, limitNum)),
        offset: (Math.max(1, pageNum) - 1) * Math.min(100, Math.max(1, limitNum))
    };
};
