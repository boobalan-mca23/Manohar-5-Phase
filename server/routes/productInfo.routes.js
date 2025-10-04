// const express = require('express');
// const { getAllProducts, createNewProduct, deleteProduct, UpdatingProduct,deleteAllProduct, getProductByNumber} = require('../controllers/productInfo.controllers');
// const router = express.Router();

// router.get('/getAll',getAllProducts)
// router.get('/getSerial/:product_number',getProductByNumber)
// router.post('/create',createNewProduct)
// router.put('/update/:id',UpdatingProduct)
// router.delete('/delete/:id',deleteProduct)
// router.delete('/deleteAll',deleteAllProduct)

// module.exports = router;

const express = require("express");
const {
  getAllProducts,
  deleteProduct,
  UpdatingProduct,
  deleteAllProduct,
  createNewProduct,
  getProductByNumber,
} = require("../controllers/productInfo.controllers");
const router = express.Router();


router.get("/getAll", getAllProducts);
router.get("/getSerial/:bill_number/:product_number", getProductByNumber);
router.post("/create", createNewProduct);
router.put("/update/:id", UpdatingProduct);
router.delete("/delete/:id", deleteProduct);
router.delete("/deleteAll", deleteAllProduct);


module.exports = router;
