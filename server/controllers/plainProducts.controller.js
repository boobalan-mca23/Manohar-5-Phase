const {PrismaClient}=require('@prisma/client')
const prisma=new PrismaClient()
const {makeProductId}=require('../helperFunction/makeProductId')

exports.createPlainProducts=async(req,res)=>{

     const {plainLotId,productName,workerName,goldSmithCode,itemCode,grossWeight,stoneWeight,netWeight}=req.body
     
    try{
      let imgUrl="" 
      
      if(!plainLotId||!productName||!workerName||!grossWeight||!stoneWeight||!netWeight||!goldSmithCode||!itemCode){
             return res.status(400).json({message:"Missing Fields"})    
          }
        const existLot=await prisma.plainLot.findUnique({where:{
            lotId:parseInt(plainLotId)
        }})
        if(!existLot) return res.status(400).json({message:"Lot Id is Not Found"})
       
       if(req.file){
         imgUrl=`/uploads/${req.file.filename}`
       }
       const newProduct=await prisma.plainProducts.create({
        data:{
            plainLotId:parseInt(plainLotId)||0,
            product_id:"",
            productName:productName||"",
            workerName:workerName||"",
            grossWeight:grossWeight||"",
            stoneWeight:stoneWeight||"",
            netWeight:netWeight||"",
            grossWtImgUrl:imgUrl||""
       }})

       // generate productID

       const productInfo= await makeProductId(goldSmithCode,itemCode,newProduct)

       return res.status(201).json({success:true,message:"New Product Created",productInfo})

      } 
      catch(err){
         console.log('err',err.message)
         return res.status(500).json({err:err.message})
      }  
}

exports.updatePlainProduct=async(req,res)=>{
    const {id}=req.params
    const {productName,workerName,grossWeight,stoneWeight,netWeight,goldSmithCode,itemCode}=req.body
    
    try{
         if(isNaN(id)) return res.status(400).json({message:"Invalid Id"})

        if(!productName||!workerName||!grossWeight||!stoneWeight||!netWeight||!goldSmithCode||!itemCode){
             return res.status(400).json({message:"Missing Fields"})    
        }
          
        const existProduct=await prisma.plainProducts.findUnique({where:{id:parseInt(id)}})

        if(!existProduct) return res.status(400).json({message:"Product Not Found In Db"})
      
        let imgUrl="" 

        if(req.file){
         imgUrl=`/uploads/${req.file.filename}`
       }
       const updatePlainProduct=await prisma.plainProducts.update({
        where:{
          id:parseInt(id)
        },
        data:{
            productName:productName||"",
            product_id:"",
            workerName:workerName||"",
            grossWeight:grossWeight||"",
            stoneWeight:stoneWeight||"",
            netWeight:netWeight||"",
            grossWtImgUrl:imgUrl||""
        }
       })
       // generate productID

       const productInfo= await makeProductId(goldSmithCode,itemCode,updatePlainProduct)
 
       return res.status(200).json({success:true,message:"Plain Product Updated",productInfo})
     }
     catch(err){
         console.log('err',err.message)
         return res.status(500).json({err:err.message})
    }
}

exports.getPlain_Product_ById=async(req,res)=>{
     const {id}=req.params

    try{

      if(isNaN(id)) return res.status(400).json({message:"Invalid Id"})

      const existProduct=await prisma.plainProducts.findUnique({where:{id:parseInt(id)}})
      
      if(!existProduct) return res.status(400).json({message:"Product Not Found In Db"})
      const productInfo=await prisma.plainProducts.findUnique({
       where:{
          id:parseInt(id)
          }
        })
      return res.status(200).json({success:true,productInfo})

     }catch(err){
         console.log('err',err.message)
         return res.status(500).json({err:err.message})
     }
}

exports.delete_Plain_Products=async(req,res)=>{
      const {id}=req.params
    
      try{

      if(isNaN(id)) return res.status(400).json({message:"Invalid Id"})

      const existProduct=await prisma.plainProducts.findUnique({where:{id:parseInt(id)}})
      
      if(!existProduct) return res.status(400).json({message:"Product Not Found In Db"})

        const deletedPlainProduct=await prisma.plainProducts.delete({
          where:{
            id:parseInt(id)
          }
        })

        return res.status(200).json({success:true,message:"Plain Product Deleted",deletedPlainProduct})
        
     }catch(err){
         console.log('err',err.message)
         return res.status(500).json({err:err.message})
     }
}

exports.getPlain_LotInfo_ByLotId=async(req,res)=>{
     const {id}=req.params
     try{
       if(isNaN(id)) return res.status(400).json({message:"Invalid Id"})

       const existProduct=await prisma.plainLot.findUnique({
        where:{
          id:parseInt(id)
        },
       
      })
      
      if(!existProduct) return res.status(400).json({message:"Lot Not Found In Db"})

        const products=await prisma.plainLot.findUnique({
          where:{
            id:parseInt(id)
          },
          include:{
            plainProduct:true
          }
        })

        return res.status(200).json({success:true,products})

     }catch(err){
         console.log('err',err.message)
         return res.status(500).json({err:err.message})
     }
    }

