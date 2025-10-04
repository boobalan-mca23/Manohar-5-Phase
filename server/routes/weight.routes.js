const express=require('express')
const route=express.Router();
 
const {getWeightController}=require('../controllers/weight.controllers');
 
route.get('/getWeight',getWeightController)
 
module.exports=route;