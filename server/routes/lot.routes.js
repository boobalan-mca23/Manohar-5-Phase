const express = require("express");
const {
  postLotInfo,
  getAllLots,
  getLotById,
  deleteLot,
  updateLotData,
} = require("../controllers/lot.controller");

const router = express.Router();

// description : To create a lot
//  body:  {
//      lot_name:"A15"
//     }
// route - url/api/lot/lot_info

router.post("/lot_info", postLotInfo);

// description : fetch all lots
// route - url/api/lot

router.get("/", getAllLots);

// delete a lot
// params : lot_id
// route - url/api/lot/lot_info/:id

router.delete("/lot_info/:lot_id", deleteLot);

// particular lot details
//  body : {
//     lot_id :5

// }
// route - url/api/lot/lot_data
router.post("/lot_data",getLotById)


// update lot info
// body: {
//     "lot_id":"5",                    required
//     "bulk_weight_before": 2.22,      optional
//     "bulk_after_weight": 2.22,       optional
//     "lot_process": "not_completed"   optional
// }
// route - url/api/lot/modify_lot
router.post("/modify_lot", updateLotData);

module.exports = router;
