const express = require('express');
const productRoutes = express.Router();
const { AuthValidator } = require('../Middleware/AuthValidation');
const { deleteProduct, updateProduct, getProducts, createProduct, getProductById } = require('../Controller/productController');


productRoutes.use(AuthValidator);

productRoutes.put('/api/v1/update-product/:productId', updateProduct);
productRoutes.post('/api/v1/create-product', createProduct);

productRoutes.get('/api/v1/get-all-products', getProducts);
productRoutes.get('/api/v1/get-product-by-id/:productId', getProductById);
productRoutes.delete('/api/v1/delete-product/:productId', deleteProduct);


module.exports = productRoutes;
