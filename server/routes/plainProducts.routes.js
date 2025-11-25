const express=require('express')
const router=express.Router()
const upload=require('../middleware/plainImgUpload')
const plainProduct=require('../controllers/plainProducts.controller')

router.post('/',upload.single('file'),plainProduct.createPlainProducts)
router.put('/:id',upload.single('file'),plainProduct.updatePlainProduct)
router.get('/:id',plainProduct.getPlain_Product_ById)
router.delete('/:id',plainProduct.delete_Plain_Products)



module.exports=router
