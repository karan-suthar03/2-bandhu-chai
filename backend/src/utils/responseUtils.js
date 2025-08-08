export const createSuccessResponse = (data, message = 'Success') => ({
    success: true,
    message,
    ...data
});

export const createErrorResponse = (message, code = 'ERROR', details = null) => ({
    success: false,
    error: {
        code,
        message,
        details
    }
});

export const createPaginatedResponse = (data, pagination) => ({
    success: true,
    data,
    pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
    }
});

export const sendResponse = (res, statusCode, data) => {
    return res.status(statusCode).json(data);
};

export const sendSuccess = (res, data, message = 'Success') => {
    return sendResponse(res, 200, createSuccessResponse(data, message));
};

export const sendCreated = (res, data, message = 'Created successfully') => {
    return sendResponse(res, 201, createSuccessResponse(data, message));
};

export const sendNotFound = (res, message = 'Resource not found') => {
    return sendResponse(res, 404, createErrorResponse(message, 'NOT_FOUND'));
};

export const sendBadRequest = (res, message = 'Bad request', details = null) => {
    return sendResponse(res, 400, createErrorResponse(message, 'BAD_REQUEST', details));
};
