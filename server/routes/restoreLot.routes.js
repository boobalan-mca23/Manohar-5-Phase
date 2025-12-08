const express=require('express')
const router=express.Router()
const lot=require('../controllers/restoreLot.controller')

router.get('/getDiactivateLots',lot.get_Diactivate_Lots)
router.put('/changetoDiactivate/:id',lot.change_To_Diactivate)
router.put('/changetoActivate',lot.activateLot)


module.exports=router