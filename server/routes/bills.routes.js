
// const express = require('express');
// const { getAllBills, createBills, deleteBills } = require('../controllers/bills.controllers');
// const router = express.Router();

// router.get('/getAll',getAllBills);
// router.post('/create',createBills);
// router.delete('/delete/:id',deleteBills);

// module.exports = router;



const express = require('express');
const { getAllBills, createBills, deleteBills, modifyBillHold, getBillsByBillNumber, postBillDetails } = require('../controllers/bills.controllers');
const router = express.Router();

router.get('/getAll',getAllBills);
router.get("/bills/:bill_number",getBillsByBillNumber)
router.post('/create',createBills);
router.delete('/delete/:id',deleteBills); 

// modify the bill items form hold to sold
// Route : url/bills/modify_bill
// body :{
//     bill_number:22
// }


router.post("/modify_bill",modifyBillHold)






router.post("/bill-details",postBillDetails)


module.exports = router;
