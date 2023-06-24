const Product = require('../models/product');
const {StatusCodes} = require("http-status-codes");
const {NotFoundError} = require("../errors");

const getAllProducts = async (req, res) => {
    const {category, name, sort, fields} = req.query;
    const queryObject = {};

    if (category) {
        queryObject.category = category;
    }
    if (name) {
        queryObject.name = {
            $regex: name,
            $options: 'i',
        };
    }

    const projectionObject = {};
    if (fields) {
        const fieldsList = fields.split(',');
        for (let field of fieldsList) {
            projectionObject[field] = 1;
        }
    }

    const sortObject = {};
    if (sort) {
        const sortList = sort.split(',');
        for (let item of sortList) {
            let key = item;
            let value = 1;
            if (item.startsWith('-')) {
                key = item.slice(1);
                value = -1;
            }
            sortObject[key] = value;
        }
    } else {
        sortObject.name = 1;
    }

    //Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.aggregate([
        {$match: queryObject},
        ...(Object.keys(projectionObject).length > 0 ? [{$project: projectionObject}] : []),
        {$sort: sortObject},
        {$skip: skip},
        {$limit: limit}
    ]);

    res.status(StatusCodes.OK).json({
        products,
        nbHits: products.length,
        page,
        limit,
    });
};

const getProduct = async (req, res) => {
    const {
        params: {id: productId},
    } = req

    const product = await Product.aggregate([
        {
            $match: {
                id: Number(productId),
            },
        },
    ]);

    if (product.length === 0) {
        throw new NotFoundError(`No product with id ${productId}`)
    }
    res.status(StatusCodes.OK).json({product})
}

module.exports = {
    getAllProducts,
    getProduct
};
