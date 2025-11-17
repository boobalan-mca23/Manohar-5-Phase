const exprees=require('express')
const router=exprees.Router()

const auth=require('../controllers/auth.controller')
router.post('/register',auth.userRegister)
router.post('/login',auth.loginUser)

module.exports=router
