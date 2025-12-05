const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {LOT_TYPE}=require("@prisma/client")
// create new lot

const postLotInfo = async (req, res, error) => {

  try {
    const {
      lot_name,
      bulk_weight_before,
      bulk_after_weight,
      adjustment_percent,
      lot_process,
      type
    } = req.body;



    if (!lot_name) return res.status(400).json({ message: "LotName is Required" });

    // Traditional Prisma enum validation
    
    const validTypes = Object.values(LOT_TYPE); // ["STONE", "PLAIN"]
   
    if (!type || !validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({
        message: `Invalid Type. Allowed values: ${validTypes.join(", ")}`,
      });
    }
   
    if (lot_name) {
      const existingLot = await prisma.lot_info.findUnique({
        where: {
          lot_name,
        },
      });

      if (!existingLot) {
        const newLot = await prisma.lot_info.create({
          data: {
            lot_name,
            adjustment_percent,
            bulk_after_weight,
            bulk_weight_before,
            lot_process,
            type:type.toUpperCase()
          },
        });
        res.status(201).json({ msg: "successfully created", newLot });
      } else {
        return res.status(400).json({
          msg: "The Lot name is already added. Try to add Other Name",
        });
      }
    } else {
      return res.status(400).json({ msg: "Lot Name is not mentioned" });
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// fetch all lots

const getAllLots = async (req, res, next) => {

  try {
     const page=req.query.page||1
     const limit=req.query.limit||10
     const type=req.query.type

     const skip=(page-1) * limit

    const validTypes = Object.values(LOT_TYPE); // ["STONE", "PLAIN"]
   
    if (!type || !validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({
        message: `Invalid Type. Allowed values: ${validTypes.join(", ")}`,
      });
    }

    const lots = await prisma.lot_info.findMany({
      where:{
        isAvailable:true,
        type:type.toUpperCase()
      },
      skip:parseInt(skip),
      take:parseInt(limit),
      orderBy:{
        id:"desc"
      }
    });
     const totalCount = await prisma.lot_info.count({
        where: { isAvailable: true },
      });

    if (lots) {
     
      return res
        .status(200)
        .json({ 
          totalCount,
          totalPage:Math.ceil(totalCount/limit),
          msg: "successfully fetched", 
          result: lots });
    } else {
      return res.status(400).json({ msg: "failed to fetch lots" });
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// fetch lot items by id

// const getLotById = async (req, res, next) => {
//   try {
//     const { lot_id } = req.body;
//     console.log("jjjjjjjjjj", lot_id)
//     if (lot_id) {

//       const lot = await prisma.lot_info.findUnique({
//         where: {
//           id: Number(lot_id),
//         },
//         include: {
//           products: true,
//         },
//       });
//       return res.status(200).json({ msg: "successfully fetched", result: lot });
//     } else {
//       return res.status(400).json({ msg: "Lot Doesn't Exits" });
//     }
//   } catch (error) {
//     console.log(error);
//     return next(error);
//   }
// };

// get Products by Lot Id
const getLotById = async (req, res, next) => {
  try {
    const { id } = req.params;
   
    if(isNaN(id) || !id) return res.status(400).json({message:"Lot Id is Required"})

    // Check if lot_id is provided
    const existlot= await prisma.lot_info.findUnique({
      where:{
        id:parseInt(id)
      }
    })
    if (!existlot) {
      return res.status(400).json({ msg: "Lot Not Found." });
    }
   
    // Fetch the lot by its ID
    let lotInfo=await prisma.lot_info.findMany({
       where:{
        id:Number(id)
       },
      include: {
      products: {
        include: {
          product_images: true
        }
      }
    }
    })
    
    // Return the fetched lot
    return res.status(200).json({ msg: "Successfully fetched",lotInfo,success:true});
  } catch (error) {
    console.error("Error fetching lot:", error);
    return next(error);
  }
};
 
 
// delete a lot by id

const deleteLot = async (req, res, next) => {
  try {
    const { lot_id } = req.params;
    if (lot_id) {
      const lot = await prisma.lot_info.delete({
        where: {
          id: parseInt(lot_id),
        },
      });
      return res.status(200).json({ msg: "successfully deleted", result: lot });
    } else {
      return res.status(400).json({ msg: "Unable to delete the lot" });
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// update lot fields by id

const updateLotData = async (req, res, next) => {
  try {
    const lot_id = req.body.lot_id;
    const bulk_weight_before = req.body.bulk_weight_before;
    const bulk_after_weight = req.body.bulk_after_weight;
    const lot_process = req.body.lot_process;

    if (lot_id) {
      const existingLot = await prisma.lot_info.findUnique({
        where: {
          id: Number(lot_id),
        },
      });

      if (!existingLot) {
        return res.status(404).json({ msg: "Lot not found" });
      }

      const updateData = {
        bulk_weight_before:
          bulk_weight_before !== undefined
            ? bulk_weight_before
            : existingLot.bulk_weight_before,
        bulk_after_weight:
          bulk_after_weight !== undefined
            ? bulk_after_weight
            : existingLot.bulk_after_weight,
        lot_process:
          lot_process !== undefined ? lot_process : existingLot.lot_process,
      };

      const updatedLot = await prisma.lot_info.update({
        where: {
          id: Number(lot_id),
        },
        data: updateData,
      });

      return res
        .status(200)
        .json({ msg: "successfully updated", result: updatedLot });
    } else {
      return res.status(400).json({ msg: "Unable to delete the lot" });
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports = {
  postLotInfo,
  getAllLots,
  getLotById,
  deleteLot,
  updateLotData,
};
