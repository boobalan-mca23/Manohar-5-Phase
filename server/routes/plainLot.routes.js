const express=require('express')
const router=express.Router()
const plainLot=require('../controllers/plainLot.controller')

router.post('/',plainLot.createPlainLot)
router.get('/',plainLot.getAllLot)
router.get('/getDiactivateLots',plainLot.get_Diactivate_Lots)
router.get('/:id',plainLot.getPlainLotById)
router.put('/changetoDiactivate/:id',plainLot.change_To_Diactivate)
router.put('/changetoActivate/:id',plainLot.activateLot)
router.delete('/:id',plainLot.deletePlainLot)

module.exports=router