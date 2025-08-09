import prisma from "../config/prisma.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { sendSuccess, sendBadRequest, sendNotFound } from "../utils/responseUtils.js";
import { validateRequired } from "../utils/validationUtils.js";

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

  const page = Math.max(1, toInt(req.query.page, 1));
  const limit = Math.min(50, Math.max(1, toInt(req.query.limit, 10)));
  const skip = (page - 1) * limit;

  const [product, reviews, total, agg] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId }, select: { id: true } }),
    prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reviewerName: true,
        rating: true,
        comment: true,
        isVerified: true,
        createdAt: true
      },
      skip,
      take: limit
    }),
    prisma.review.count({ where: { productId } }),
    prisma.review.groupBy({
      by: ['rating'],
      _count: { rating: true },
      where: { productId }
    })
  ]);

  if (!product) return sendNotFound(res, "Product not found");

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const g of agg) {
    breakdown[g.rating] = g._count.rating;
    sum += g.rating * g._count.rating;
  }
  const average = total > 0 ? parseFloat((sum / total).toFixed(2)) : 0;

  return sendSuccess(res, {
    data: reviews,
    summary: {
      average,
      count: total,
      breakdown,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
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

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, deactivated: true } });
  if (!product || product.deactivated) return sendNotFound(res, 'Product not found');

  const result = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        productId,
        reviewerName: String(name).trim().slice(0, 100),
        reviewerEmail: String(email).trim().toLowerCase().slice(0, 200),
        rating: ratingNum,
        comment: (comment ? String(comment).trim() : null),
        isVerified: false
      },
      select: {
        id: true,
        reviewerName: true,
        rating: true,
        comment: true,
        isVerified: true,
        createdAt: true
      }
    });
    const counts = await tx.review.groupBy({ by: ['rating'], _count: { rating: true }, where: { productId } });
    let total = 0; let sum = 0; let reviewCount = 0;
    for (const c of counts) { total += c._count.rating; sum += c.rating * c._count.rating; }
    reviewCount = total;
    const average = total > 0 ? sum / total : 0;

    await tx.product.update({ where: { id: productId }, data: { rating: average, reviewCount } });

    return created;
  });

  return sendSuccess(res, { data: result }, 'Review submitted');
});

export { listProductReviews, createProductReview };
