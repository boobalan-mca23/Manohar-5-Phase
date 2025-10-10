const express=require('express')
const router=express.Router()

const restore=require('../controllers/restore.controllers')
router.get('/',restore.getAllRestore)
router.post('/',restore.createRestore)
router.get('/:restore_number',restore.getRestoreById)
router.delete('/:id',restore.deleteRestore)
router.get('/productNo/:product_number',restore.getProductByNumber)

module.exports=router