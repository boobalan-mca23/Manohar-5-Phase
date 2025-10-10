const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {productCheckAtBill}=require('../utils/checkProducts')
exports.getAllRestore= async (req, res) => {
  try {
    const allRestore = await prisma.restors.findMany({
        orderBy:{
        created_at:"desc"
    }});
    res.status(200).json(allRestore);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "No bills" });
  }
};

exports.createRestore = async (req, res) => {
  try {
    const {description,restore_products} = req.body;
 
    console.log(restore_products, "rrrrrrrrrrrrrr");
 
    const random4Digit = Math.floor(1000 + Math.random() * 9000);
    const todayDate = new Date().toISOString().split("T")[0].replace(/-/g, "");
 
    const resultString = `${random4Digit}${todayDate}`;
    
    const newRestore = await prisma.restors.create({
      data: {
        restore_number: resultString,
        description:description,
      },
    });
 
    const restoreNumber = newRestore.restore_number;
 
    if (restoreNumber) {
      const mappedData = restore_products.map((e) => {
        return {
          restore_number : restoreNumber,
          product_id: e.id,
        };
      });
 
      const newRestoreItems = await prisma.restoreItems.createMany({
        data: mappedData,
      });
 
      console.log("iiii", newRestoreItems );
     const productsId=mappedData.map((item,_)=>item.product_id)
     console.log('productsId',productsId)
       await prisma.product_info.updateMany({
         where:{
          id:{in:productsId}
         },
       data:{
         product_type:"active"
        }
     })

     await prisma.bill_items.deleteMany({
      where:{
        product_id:{in:productsId}
      }
     })
    
      res.status(200).json({ "newRestoreItems":newRestoreItems});
    } else {
      res.status(404).json({ error: "No restore number" });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "No Restore" });
  }
};

exports.deleteRestore=async(req,res)=>{
   try {
    const { id } = req.params;

    const delRestore = await prisma.restors.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({ message: "Restore Deleted Successfully", delRestore });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "No Restore deleted" });
  }
}
exports.getRestoreById = async (req, res) => {
  try {
    const restoreNo = req.params.restore_number;
    const allRestore = await prisma.restoreItems.findMany({
      where: {
        restore_number: restoreNo,
      },
      select: {
        productInfo: true,
      },
    });
    const restore = allRestore.map((elem) => {
      return {
        ...elem.productInfo,
      };
    });
    res.status(200).json({ products: restore });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "No Restore" });
  }

};


exports.getProductByNumber = async (req, res) => {
  try {
    const {product_number} = req.params;
    const ifExistAtBill=await productCheckAtBill(product_number)
        console.log('is Already in bill',ifExistAtBill)
        if(!ifExistAtBill){
          return res.status(400).json({message:"This product does not Include to Restore"})
        }
    const product = await prisma.product_info.findMany({
      where: {
        product_number,
        product_type: "sold",
        // lot_info: { lot_process: "completed" },
      },
      select: {
        id: true,
        product_number: true,
        before_weight: true,
        after_weight: true,
        difference: true,
        adjustment: true,
        final_weight: true,
        barcode_weight:true,
        tag_number: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (product.length === 0) {
      return res.status(500).json({ msg: "Product not found" });
    }
    
    console.log('product',product)

    res.status(200).json({
      message: "Product found",
      product_info:product,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the product" });
  }
};


