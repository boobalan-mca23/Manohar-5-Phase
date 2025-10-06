const{PrismaClient}=require('@prisma/client')
const prisma=new PrismaClient()

exports.productCheckAtBill=async(product_number)=>{
     const productId=await prisma.product_info.findFirst({
      where:{
        product_number:product_number
      },
      select:{
        id:true
      }
    })
    
    const ifExistAtBill=await prisma.bill_items.findFirst({
      where:{
        product_id:productId.id
      }
    })
    return ifExistAtBill
}

exports.productCheckAtRestore=async(product_number)=>{
 const productId=await prisma.product_info.findFirst({
      where:{
        product_number:product_number
      },
      select:{
        id:true
      }
    })
    
    const ifExistAtRestore=await prisma.restoreItems.findFirst({
      where:{
        product_id:productId.id
      }
    })
    return ifExistAtRestore
}