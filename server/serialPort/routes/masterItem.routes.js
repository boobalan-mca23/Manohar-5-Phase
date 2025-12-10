const express=require('express')
const router=express.Router()
const masterItem=require('../controllers/masterItem.controller')

router.post('/',masterItem.createMasterItem)
router.put('/:id',masterItem.updateMasterItem)
router.delete('/:id',masterItem.deleteMasterItem)
router.get('/',masterItem.getAllMasterItem)
router.get('/allItems',masterItem.getAllItems)

module.exports=router






















