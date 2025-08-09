import prisma from "../config/prisma.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { sendSuccess, sendBadRequest, sendNotFound } from "../utils/responseUtils.js";
import { validateRequired } from "../utils/validationUtils.js";
import { ReviewService } from "../services/reviewService.js";

const toInt = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? def : n;
};

const isValidEmail = (email) => {
  return typeof email === 'string' && /.+@.+\..+/.test(email);
};

const listProductReviews = asyncHandler(async (req, res) => {
  const productId = toInt(req.params.productId, 0);
  if (!productId) return sendBadRequest(res, "Invalid productId");

  const filters = {
    page: req.query.page,
    limit: req.query.limit
  };

  const result = await ReviewService.getProductReviews(productId, filters);
  
  if (!result) {
    return sendNotFound(res, "Product not found");
  }

  return sendSuccess(res, result);
});

const createProductReview = asyncHandler(async (req, res) => {
  const productId = toInt(req.params.productId, 0);
  if (!productId) return sendBadRequest(res, "Invalid productId");

  const { name, email, rating, comment } = req.body || {};

  const missing = validateRequired(['name', 'email', 'rating'], { name, email, rating });
  if (missing.length) return sendBadRequest(res, `Missing: ${missing.join(', ')}`);
  if (!isValidEmail(email)) return sendBadRequest(res, 'Invalid email');

  const ratingNum = toInt(rating, 0);
  if (ratingNum < 1 || ratingNum > 5) return sendBadRequest(res, 'Rating must be between 1 and 5');

  const result = await ReviewService.createReview(productId, {
    name,
    email,
    rating: ratingNum,
    comment
  });

  if (!result) {
    return sendNotFound(res, 'Product not found');
  }

  return sendSuccess(res, { data: result }, 'Review submitted');
});

export { listProductReviews, createProductReview };
