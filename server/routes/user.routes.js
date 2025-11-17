const express=require('express')
const router=express.Router()
const user=require('../controllers/user.controller')

router.put('/:id',user.updateUser)
router.get('/:id',user.getUserById)
router.get('/',user.getAllUser)
router.delete('/:id',user.deleteUser)

module.exports=router