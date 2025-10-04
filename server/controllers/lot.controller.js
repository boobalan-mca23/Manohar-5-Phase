const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// create new lot
const postLotInfo = async (req, res, error) => {
  console.log("data", req.body);
  try {
    const {
      lot_name,
      bulk_weight_before,
      bulk_after_weight,
      adjustment_percent,
      lot_process,
    } = req.body;

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
    const lots = await prisma.lot_info.findMany();
    if (lots) {
      return res
        .status(200)
        .json({ msg: "successfully fetched", result: lots });
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
const getLotById = async (req, res, next) => {
  try {
    const { lot_id } = req.body;

    // Check if lot_id is provided
    if (!lot_id) {
      return res.status(400).json({ msg: "Lot ID is required." });
    }

    // Fetch the lot by its ID
    const lot = await prisma.lot_info.findUnique({
      where: { id: Number(lot_id) },
      include: { products: true },
    });

    // Check if the lot exists
    if (!lot) {
      return res.status(404).json({ msg: "Lot not found." });
    }

    // Return the fetched lot
    return res.status(200).json({ msg: "Successfully fetched", result: lot });
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
