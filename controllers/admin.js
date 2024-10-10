const mongoose = require('mongoose')

const fileHelper = require('../util/file')

const{validationResult} = require('express-validator')


const Product = require('../models/product');
const { ValidationError } = require('sequelize');
// const { default: mongoose } = require('mongoose');

exports.getAddProduct = (req, res, next) => {
  if(!req.session.isLoggedIn){
    return res.redirect('/login')
  }
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage : null,
    validationErrors: []
    // isAuthenticated: req.session.isLoggedIn
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  // console.log(imageUrl);
  if(!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title: title ,
        price: price ,
        description: description
      },
      errorMessage : 'Attatched file is not an image',
      validationErrors:[]

    });
  }
  const imageUrl = image.path; //path that where the file was saved after the upload.

  const errors = validationResult(req);

  if(!errors.isEmpty()){
    console.log(errors.array())
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title: title ,
        imageUrl:imageUrl,
        price: price ,
        description: description
      },
      errorMessage : errors.array()[0].msg,
      validationErrors: errors.array()

    });
  }
  


 
  const product = new Product({
    // _id : new mongoose.Types.ObjectId('66e91189633264f3bc556db8'),
    title: title,
    price: price,
    description: description,
    imageUrl:imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      // res.redirect('/500')

      // return res.status(500).render('admin/edit-product', {  //500 server side issue code
      //   pageTitle: 'add Product',
      //   path: '/admin/add-product',
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title: title ,
      //     imageUrl: imageUrl ,
      //     price: price ,
      //     description: description
      //   },
      //   errorMessage : 'database operation failed , please try again ',
      //   ValidationErrors :  []
      // });


      // console.log('an error occured')
      // console.log(err);
      const error =  new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      // product.imageUrl = updatedImageUrl;
      if(!image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};



exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', 'name') 66e91189633264f3bc556db8
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      const error =  new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.getProducts = (req, res, next) => {
//   Product.find({userId: req.user._id })
//     // .select('title price -_id')
//     // .populate('userId', 'name')
//     .then(products => {
//       console.log(products);
//       res.render('admin/products', {
//         prods: products,
//         pageTitle: 'Admin Products',
//         path: '/admin/products',
//         // isAuthenticated: req.session.isLoggedIn
//       });
//     })
//     .catch(err => console.log(err));
// };

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error('Product not found.'));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.status(200).json({message: 'success'});
    })
    .catch(err => {
      res.status(500).json({message: 'failed'});

    });
};
