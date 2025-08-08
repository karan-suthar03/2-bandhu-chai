import prisma from "../config/prisma.js";

export class QueryBuilder {
    constructor(model) {
        this.model = model;
        this.whereConditions = [];
        this.includeOptions = {};
        this.sortOptions = {};
        this.paginationOptions = {};
    }

    where(conditions) {
        if (Array.isArray(conditions)) {
            this.whereConditions.push(...conditions);
        } else {
            this.whereConditions.push(conditions);
        }
        return this;
    }

    search(searchTerm, fields) {
        if (searchTerm && searchTerm.trim()) {
            const searchConditions = fields.map(field => ({
                [field]: { contains: searchTerm.trim(), mode: 'insensitive' }
            }));
            this.whereConditions.push({ OR: searchConditions });
        }
        return this;
    }

    include(options) {
        this.includeOptions = { ...this.includeOptions, ...options };
        return this;
    }

    orderBy(field, direction = 'asc') {
        this.sortOptions = { [field]: direction };
        return this;
    }

    paginate(page, limit) {
        this.paginationOptions = {
            skip: (page - 1) * limit,
            take: limit
        };
        return this;
    }

    build() {
        const query = {};
        
        if (this.whereConditions.length > 0) {
            query.where = this.whereConditions.length === 1 
                ? this.whereConditions[0]
                : { AND: this.whereConditions };
        }

        if (Object.keys(this.includeOptions).length > 0) {
            query.include = this.includeOptions;
        }

        if (Object.keys(this.sortOptions).length > 0) {
            query.orderBy = this.sortOptions;
        }

        if (Object.keys(this.paginationOptions).length > 0) {
            query.skip = this.paginationOptions.skip;
            query.take = this.paginationOptions.take;
        }

        return query;
    }

    async execute() {
        const query = this.build();
        return await prisma[this.model].findMany(query);
    }

    async count() {
        const query = this.build();
        delete query.include;
        delete query.orderBy;
        delete query.skip;
        delete query.take;
        return await prisma[this.model].count(query);
    }
}

export const createQuery = (model) => new QueryBuilder(model);

export const createStringFilter = (value, field) => {
    return value && value.trim() ? { [field]: { contains: value.trim(), mode: 'insensitive' } } : null;
};

export const createExactFilter = (value, field) => {
    return value && value.trim() ? { [field]: value.trim() } : null;
};

export const createRangeFilter = (min, max, field) => {
    const conditions = {};
    if (min !== undefined && min !== null) conditions.gte = parseFloat(min);
    if (max !== undefined && max !== null) conditions.lte = parseFloat(max);
    return Object.keys(conditions).length > 0 ? { [field]: conditions } : null;
};

export const createDateFilter = (dateValue, field) => {
    if (!dateValue) return null;
    
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return null;
    
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    return { [field]: { gte: startOfDay, lte: endOfDay } };
};
