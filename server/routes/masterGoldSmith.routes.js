const express=require('express')
const router= express.Router()

const goldSmith=require('../controllers/masterGoldSmith.controller')

router.post('/',goldSmith.createGoldSmith)
router.put('/:id',goldSmith.updateGoldSmith)
router.delete('/:id',goldSmith.deleteGoldSmithById)
router.get('/',goldSmith.getAllGoldSmith)
router.get('/allGS', goldSmith.getAllGS)

module.exports=router
