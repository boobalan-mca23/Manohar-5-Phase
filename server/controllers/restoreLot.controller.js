
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.change_To_Diactivate = async (req, res) => {
  const { id } = req.params;
  try {

    if (isNaN(id))  return res.status(400).json({ message: "Lot id is Required" });
    const existLot = await prisma.lot_info.findUnique({
      where: {
        id:parseInt(id),
      },
    });

    if (!existLot) return res.status(400).json({ message: "Lot Not Found" });

    const deletedLot = await prisma.lot_info.update({
      where: {
        id:parseInt(id),
      },
      data: {
        isAvailable:false,
      },
    });
    return res
      .status(200)
      .json({ success: true,message: "Lot Deleted SucessFully",deletedLot,});
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: err.message });
  }
};

// get All deleted lots
exports.get_Diactivate_Lots=async(req,res)=>{
    try{

      const deletedLots=await prisma.lot_info.findMany({
        where:{
            isAvailable:false
        }
      })
       return res.status(200).json({ success: true,message:"Deleted lot Fetched SuccessFully",deletedLots,});

    }catch(err){
        console.log(err.message);
        return res.status(500).json({ message: err.message });
    }
}

// changeToactivate stage
exports.activateLot=async(req,res)=>{
     
      const {id}=req.params

      try{
        if (isNaN(id))  return res.status(400).json({ message: "Lot id is Required" });
         const existLot = await prisma.lot_info.findUnique({
          where: {
           id:parseInt(id),
         },
        });

        if (!existLot) return res.status(400).json({ message: "Lot Not Found" });

        const changeToActivate=await prisma.lot_info.update({
            where:{
                id:parseInt(id),
            },
            data:{
                isAvailable:true
            }
        })
        return res.status(200).json({ success: true,message: "Change to Activate SuccessFully",changeToActivate,});
      
      }catch(err){
        console.log(err.message);
        return res.status(500).json({ message: err.message });
      }
}