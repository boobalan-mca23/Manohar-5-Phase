const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createPlainLot = async (req, res) => {
  const { lotId } = req.body;
  try {
    if (!lotId) return res.status(400).json({ message: "LotId is Required" });

    const existLot = await prisma.plainLot.findUnique({
      where: {
        lotId:parseInt(lotId),
      },
    });

    if (existLot)
      return res
        .status(400)
        .json({ message: "The Lot Id is already added. Try to add Other Id" });

    const newLot = await prisma.plainLot.create({
      data: {
        lotId:parseInt(lotId),
      },
    });
    return res
      .status(201)
      .json(
        { success: true, message: "Plain Lot Created", newLot });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: err.message });
  }
};


exports.getPlainLotById = async (req, res) => {
  const { id } = req.params;

  try {
    if (isNaN(id))  return res.status(400).json({ message: "Lot id is Required" });

    const ifExist = await prisma.plainLot.findUnique({
      where: { id: parseInt(id), },
    });

    if (!ifExist) return res.status(400).json({ message: "Lot Id not found in the database" });
    
    const lotInfo = await prisma.plainLot.findUnique({
      where: {
        id: parseInt(id),
        isAvailable:true
      },
      include: {
        plainProduct: true,
      },
    });
    
    return res.status(200).json({success:true,lotInfo})

  } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: err.message });
  }
};



exports.getAllLot = async (req, res) => {
  try {
    const allPlainLot = await prisma.plainLot.findMany({
      where: {
        isAvailable:true,
      },
    });
    return res
      .status(200)
      .json({ allPlainLot, message: "Fetched All Plain Lots", success: true });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: err.message });
  }
};

exports.change_To_Diactivate = async (req, res) => {
  const { id } = req.params;
  try {

    if (isNaN(id))  return res.status(400).json({ message: "Lot id is Required" });
    const existLot = await prisma.plainLot.findUnique({
      where: {
        id:parseInt(id),
      },
    });

    if (!existLot) return res.status(400).json({ message: "Lot Not Found" });

    const deletedLot = await prisma.plainLot.update({
      where: {
        id:parseInt(id),
      },
      data: {
        isAvailable:false,
      },
    });
    return res
      .status(200)
      .json({ success: true,message: "Plain Lot Deleted SucessFully",deletedLot,});
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: err.message });
  }
};


exports.get_Diactivate_Lots=async(req,res)=>{
    try{

      const deletedLots=await prisma.plainLot.findMany({
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


exports.activateLot=async(req,res)=>{
     
      const {id}=req.params

      try{
        if (isNaN(id))  return res.status(400).json({ message: "Lot id is Required" });
         const existLot = await prisma.plainLot.findUnique({
          where: {
           id:parseInt(id),
         },
        });

        if (!existLot) return res.status(400).json({ message: "Lot Not Found" });

        const changeToActivate=await prisma.plainLot.update({
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


exports.deletePlainLot=async(req,res)=>{
        const {id}=req.params

        try{
     if (isNaN(id))  return res.status(400).json({ message: "Lot id is Required" });
         const existLot = await prisma.plainLot.findUnique({
          where: {
           id:parseInt(id),
         },
        });

        if (!existLot) return res.status(400).json({ message: "Lot Not Found" });

        const permenentDelete=await prisma.plainLot.delete({
          where:{
            id:parseInt(id),
          }
        })
        res.status(200).json({message:"Lot Deleted Permenantly",success:true,permenentDelete})
        }catch(err){
           console.log(err.message);
           return res.status(500).json({ message: err.message });
        }
  }



