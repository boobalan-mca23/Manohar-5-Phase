const {PrismaClient} =require('@prisma/client')
const prisma = new PrismaClient()

exports.createGoldSmith =async(req,res)=>{
     const  {name,phone,address,goldSmithCode}=req.body
     
     try {
           if(!name||!phone||!address||!goldSmithCode) {
            return res.status(400).json({message:"Fields are Important"})
           }
         
           const existPhone=await prisma.masterGoldSmith.findFirst({
            where:{
                phone
            }
          })
          if(existPhone) return res.status(400).json({message:"Phone Number Already Exist"})

          const newGoldSmith =await prisma.masterGoldSmith.create({
            data:{
                name:name||"",
                phone:phone||"",
                address:address||"",
                goldSmithCode:goldSmithCode||""
            }
          })
          
          return res.status(201).json({
            success:true,
            message:"GoldSmith Created SuccessFully",
            newGoldSmith
        })

     }
      catch(err){
         console.log(err.message)
         return res.status(500).json({err:err.message})
      
     } 
}

exports.updateGoldSmith=async(req,res)=>{
     const {id}=req.params
     const  {name,phone,address,goldSmithCode}=req.body

    try{

     if(!name||!phone||!address||!goldSmithCode) {
            return res.status(400).json({message:"Fields are Important"})
        }
     const existGoldSmith=await prisma.masterGoldSmith.findUnique({
        where:{
            id:parseInt(id)
        }
     })     

     if(!existGoldSmith) return res.status(400).json({message:"GoldSmith Not Found"})

        const updateGoldSmith=await prisma.masterGoldSmith.update({
            where:{
                id:parseInt(id)
            },
            data:{
                name:name||"",
                phone:phone||"",
                address:address||"",
                goldSmithCode:goldSmithCode||""
            }
        })
   
           return res.status(200).json({
            success:true,
            message:"GoldSmith Updated SuccessFully",
            updateGoldSmith
        })


    }catch(err){
         console.log(err.message)
         return res.status(500).json({err:err.message})
    }
}

exports.deleteGoldSmithById=async(req,res)=>{
      const {id}=req.params

      try{
        
        const existGoldSmith=await prisma.masterGoldSmith.findUnique({
        where:{
            id:parseInt(id)
        } })

        if(!existGoldSmith) return res.status(400).json({message:"GoldSmith Not Found"})
        
        const deletedGoldSmith=await prisma.masterGoldSmith.delete({
               where:{
                id:parseInt(id)
               }
          })
         return res.status(200).json({
            success:true,
            message:"GoldSmith Deleted SucessFully",
            deletedGoldSmith
        })
       }
      catch(err){

        console.log(err.message)
        return res.status(500).json({err:err.message})
      }
 }

exports.getAllGoldSmith=async(req,res)=>{
      const page=req.query.page
      const limit=req.query.limit
      const skip=(page-1) * limit

      try{
       const allGoldSmith=await prisma.masterGoldSmith.findMany({
          
          skip:parseInt(skip),
          take:parseInt(limit),
          orderBy:{
            id:"desc"
          }
       })
      const totalCount = await prisma.masterGoldSmith.count();
       
       return res.status(200).json({
        totalCount,
        totalPage:Math.ceil(totalCount/limit),
        success:true,
        allGoldSmith
      })

      }catch(err){
         console.log(err.message)
         return res.status(500).json({err:err.message})
      }
}
