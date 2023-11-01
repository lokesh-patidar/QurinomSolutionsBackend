const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
     title: {
          type: String,
          required: [true, 'Title is required'],
     },
     description: {
          type: String,
          required: [true, 'Description is required'],
     },
     price: {
          type: Number,
          required: [true, 'Price is required'],
     },
     subCategory: {
          type: String,
          required: [true, 'Sub-category is required'],
     },
     tags: [{
          type: String,
     }],
     category: {
          type: String,
          required: [true, 'Category is required'],
     },
}, { timestamps: true });

const ProductModel = mongoose.model('Product', productSchema);

module.exports = { ProductModel };
