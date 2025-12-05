const {PrismaClient} =require('@prisma/client')
const prisma = new PrismaClient()

exports.createGoldSmith = async (req, res) => {
  try {
    const { name, phone, address, goldSmithCode } = req.body;

    if (!name || !goldSmithCode) {
      return res.status(400).json({ message: "Name & Code are required" });
    }

    // Check duplicate phone (optional)
    if (phone) {
      const existPhone = await prisma.masterGoldSmith.findFirst({
        where: { phone }
      });
      if (existPhone) {
        return res.status(400).json({ message: "Phone Number already exists" });
      }
    }

    const newGoldsmith = await prisma.masterGoldSmith.create({
      data: {
        name,
        phone: phone || null,
        address: address || null,
        goldSmithCode
      }
    });

    return res.status(201).json({
      success: true,
      message: "Goldsmith created successfully",
      data: newGoldsmith
    });
  } catch (err) {
    console.error("Create Error:", err);
    return res.status(500).json({ message: err.message });
  }
};


exports.updateGoldSmith = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, goldSmithCode } = req.body;

    const exists = await prisma.masterGoldSmith.findUnique({
      where: { id: Number(id) }
    });

    if (!exists) {
      return res.status(404).json({ message: "Goldsmith not found" });
    }

    const updated = await prisma.masterGoldSmith.update({
      where: { id: Number(id) },
      data: {
        name,
        phone: phone || null,
        address: address || null,
        goldSmithCode
      }
    });

    return res.status(200).json({
      success: true,
      message: "Goldsmith updated successfully",
      data: updated
    });
  } catch (err) {
    console.error("Update Error:", err);
    return res.status(500).json({ message: err.message });
  }
};


exports.deleteGoldSmithById = async (req, res) => {
  try {
    const { id } = req.params;

    const exists = await prisma.masterGoldSmith.findUnique({
      where: { id: Number(id) }
    });

    if (!exists) {
      return res.status(404).json({ message: "Goldsmith not found" });
    }

    await prisma.masterGoldSmith.delete({
      where: { id: Number(id) }
    });

    return res.status(200).json({
      success: true,
      message: "Goldsmith deleted successfully"
    });
  } catch (err) {
    console.error("Delete Error:", err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getAllGoldSmith = async (req, res) => {
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
      success: true,
      data: allGoldSmith,
      totalCount,
      totalPage:Math.ceil(totalCount / limit),
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: err.message });
  }
};

exports.getAllGS = async (req, res) => {
  try {
    const allGoldSmith = await prisma.masterGoldSmith.findMany({
      orderBy: {
        id: "desc"
      }
    });

    return res.status(200).json({
      success: true,
      allGoldSmith: allGoldSmith,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: err.message})
  };
};
