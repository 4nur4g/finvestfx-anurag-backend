const Product = require('../models/product');

const getAllProducts = async (req, res) => {
  const { category, name, sort, fields } = req.query;
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

  let result = Product.find(queryObject);
  if (sort) {
    const sortList = sort.split(',').join('');
    result = result.sort(sortList);
  } else {
    result = result.sort('name');
  }

  if (fields) {
    const fieldsList = fields.split(',').join(' ');
    console.log(fieldsList);
    result = result.select(fieldsList);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const products = await result.skip(skip).limit(limit);

  res.status(200).json({
    products,
    nbHits: products.length,
    page,
    limit,
  });
};

module.exports = {
  getAllProducts,
};
