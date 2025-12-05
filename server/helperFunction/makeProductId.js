const {PrismaClient}=require('@prisma/client')
const prisma=new PrismaClient()

exports.makeProductId=async(goldSmithCode,itemCode,product)=>{
    //  Remove trailing zeros like 13.340 → 13.34  
    let cleanWeight = product.grossWeight.replace(/\.?0+$/, "");
   // Pad cleanWeight with leading zeros until length is 6
    let paddedWeight = cleanWeight.padStart(6, "0");
    // Final Product Id

    let id="PL"+product.id+""+goldSmithCode+""+itemCode+paddedWeight
    const updateProduct=await prisma.product_info.update({
        where:{
          id:product.id
        },
        data:{
           product_number:id
        }
    })
    return updateProduct;

}