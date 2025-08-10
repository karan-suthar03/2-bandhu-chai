const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if (err.code === 'P2002') {
        statusCode = 400;
        message = 'Duplicate entry error';
    } else if (err.code === 'P2025') {
        statusCode = 404;
        message = 'Record not found';
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorHandler;
