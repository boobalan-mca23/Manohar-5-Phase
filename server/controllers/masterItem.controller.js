const {PrismaClient} =require('@prisma/client')
const prisma = new PrismaClient()

exports.createMasterItem=async(req,res)=>{
    const {itemName,itemCode}=req.body

    try{
         if(!itemName||!itemCode) return res.status(400).json({message:"Fields Are Important"})

         const existItemName=await prisma.masterItems.findFirst({
           where:{
             OR:[{itemName},{itemCode}]
            }
        })
        if(existItemName){
            const duplicateField=existItemName.itemName===itemName?"Item Name" : "Item Code"
            return res.status(400).json({message:`${duplicateField} already Exist`})
        }

        const newItem=await prisma.masterItems.create({
            data:{
                itemName:itemName||"",
                itemCode:itemCode||""
            }
        })
        return res.status(201).json({
            success:true,
            newItem,
            message:"Item Created SuccessFully"})
        }
      catch(err){
         console.log(err.message)
         return res.status(500).json({err:err.message})
    }
}

exports.updateMasterItem=async(req,res)=>{
       const {id}=req.params
       const {itemName,itemCode}=req.body
      
    try{
         if(!itemName||!itemCode) return res.status(400).json({message:"Fields Are Important"})
          
       const existItem=await prisma.masterItems.findUnique({
        where:{
            id:parseInt(id)
        }  })

        if(!existItem) return res.status(400).json({message:"Master Item  Not Found"})

        const updatedItem=await prisma.masterItems.update({
            where:{
                id:parseInt(id)
            },
            data:{
                itemCode:itemCode||"",
                itemName:itemName||""
            }
        })

       return res.status(200).json({
            success:true,
            message:"Item Updated ",
            updatedItem
        })
          
     }
     catch(err){ 
         console.log(err.message)
         return res.status(500).json({err:err.message})
     }
}

exports.deleteMasterItem=async(req,res)=>{
    const {id}=req.params
    
    try{
        const existItem=await prisma.masterItems.findUnique({
        where:{
            id:parseInt(id)
        }  })

        if(!existItem) return res.status(400).json({message:"Master Item  Not Found"})

        const deletedItem=await prisma.masterItems.delete({
            where:{
                id:parseInt(id)
            }
        })
        return res.status(200).json({
            success:true,
            message:"Item Deleted",
            deletedItem
        })
    }
    catch(err){
         console.log(err.message)
         return res.status(500).json({err:err.message})
    }
}

exports.getAllMasterItem=async(req,res)=>{
     const page=req.query.page
     const limit=req.query.limit
     const skip=(page-1) * limit
     try{
       const allMasterItem=await prisma.masterItems.findMany({
          skip:parseInt(skip),
          take:parseInt(limit),
          orderBy:{
            id:"desc"
          }
       })
        const totalCount = await prisma.masterItems.count();

       return res.status(200).json({
        success:true,
        allMasterItem,
        totalCount,
        totalPage:Math.ceil(totalCount/limit),
      })

      }catch(err){
         console.log(err.message)
         return res.status(500).json({err:err.message})
      }
}

exports.getAllItems = async (req,res)=>{
    try {
    const all = await prisma.masterItems.findMany({
      orderBy: { id: 'desc' }
    });
    res.status(200).json({ success: true, allItems: all });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

