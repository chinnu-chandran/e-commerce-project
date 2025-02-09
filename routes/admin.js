const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth')

const {body} = require('express-validator') 

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product',isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products',isAuth, adminController.getProducts);

// // router.get('/hello', adminController.getJsonProduct);

// // /admin/add-product => POST
router.post('/add-product',
    [
       body('title')
        .isString()
        .isLength({min: 3})
        .trim(),
       body('price')
        .isFloat(),
       body('description')
        .isLength({min: 3, max: 400})
        .trim()
    ],
    isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId',isAuth, adminController.getEditProduct);

router.post('/edit-product',
    [
        body('title')
         .isAlphanumeric()
         .isLength({min: 3})
         .trim(),
        // body('imageUrl')
        //  .isURL(),
        body('price')
         .isFloat(),
        body('description')
         .isLength({min: 3, max: 400})
         .trim()
   ],isAuth, adminController.postEditProduct);

router.delete('/product/:productId',isAuth, adminController.deleteProduct);

module.exports = router;
