const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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


