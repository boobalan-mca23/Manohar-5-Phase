const express = require("express");
const {
  getAllProducts,
  deleteProduct,
  UpdatingProduct,
  deleteAllProduct,
  createNewProduct,
  getProductByNumber,
  restoreProductByNumber,
  calculateAdjustments,
} = require("../controllers/productInfo_V1.controller");
const router = express.Router();
//  To CREATE A NEW PRODUCT UNDER LOT NO
// BODY :-{
//     "tag_number": "A14102",
//     "before_weight": 1.6,
//     "after_weight": 5.72,
//     "barcode_weight":1.58,
//     "lot_id":1
// }
router.post("/create", createNewProduct);

//  To UPDATE A PRODUCT AFTER SOME DAYS
// Body - {  "before_weight":1.723, "after_weight":6.5,"barcode_weight":5897 }
// Params - {id - product_id}
router.put("/update/:id", UpdatingProduct);

// TO GET ALL PRODUCT UNDER A LOT
// PARAMS - lot_id - a lot id
router.get("/getAll/:lot_id", getAllProducts);

// TO SEARCH A PRODUCT USING PRODUCT NUMBER
// PARAMS - bill_number,product_number,bill_type-["customer","party"]
router.get(
  "/getSerial/:bill_number/:product_number/:bill_type",
  getProductByNumber
);

// TO DELETE a Particular Product

// PARAMS - 
router.delete('/delete/:id',deleteProduct)



// TO restore a product from hold to active
// PARAMS - PRODUCT NUMBER
router.get("/restore/:product_number", restoreProductByNumber);

// TO restore a product from hold to active
// PARAMS - PRODUCT NUMBER
router.get("/calculate/:lot_no", calculateAdjustments);

// router.delete('/deleteAll',deleteAllProduct)

module.exports = router;
