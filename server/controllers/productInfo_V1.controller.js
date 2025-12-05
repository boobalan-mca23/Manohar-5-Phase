const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { LOT_TYPE } = require("@prisma/client");
const { makeProductId } = require("../helperFunction/makeProductId");

const createNewProduct = async (req, res) => {
  try {
    const {
      tag_number = "",
      before_weight = 0,
      after_weight = 0,
      product_number,
      lot_id = "",
      barcode_weight,
      difference,
      adjustment,
      final_weight,
      productName,
      workerName,
      grossWeight,
      stoneWeight,
      netWeight,
      goldSmithCode,
      itemCode,
      itemType,
    } = req.body;

    const existLot = await prisma.lot_info.findUnique({
      where: {
        id: Number(lot_id),
      },
    });

    if (!existLot) {
      return res.status(400).json({ message: "Invalid Lot Id" });
    }

    const validTypes = Object.values(LOT_TYPE); // ["STONE", "PLAIN"]

    if (!itemType || !validTypes.includes(itemType.toUpperCase())) {
      return res.status(400).json({
        message: `Invalid Type. Allowed values: ${validTypes.join(", ")}`,
      });
    }

    const type = itemType.toUpperCase();
    const isStone = type === "STONE";
    const isPlain = type === "PLAIN";

    // Stone fields
    const stoneFields = isStone
      ? {
          tag_number,
          before_weight: Number(before_weight),
          after_weight: Number(after_weight),
          barcode_weight: barcode_weight ? String(barcode_weight) : null,
          difference: Number(difference),
          adjustment: Number(adjustment),
          final_weight: Number(final_weight),
          product_number:
            product_number + "__" + Math.floor(Math.random() * 1000),
          itemType: itemType.toUpperCase(),
        }
      : {
          tag_number: "",
          before_weight: 0,
          after_weight: 0,
          barcode_weight: "",
          difference: 0,
          adjustment: 0,
          final_weight: 0,
          product_number: "",
        };

    // Plain fields
    const plainFields = isPlain
      ? {
          productName,
          workerName,
          grossWeight,
          stoneWeight,
          netWeight,
          goldSmithCode,
          itemCode,
          itemType: itemType.toUpperCase(),
        }
      : {
          productName: "",
          workerName: "",
          grossWeight: "",
          stoneWeight: "",
          netWeight: "",
          goldSmithCode: "",
          itemCode: "",
        };

    const productInfo = {
      ...stoneFields,
      ...plainFields,
      updated_at: new Date(),
      lot_id: Number(lot_id),
    };

    // product Images
    const img = {
      before_weight_img: isStone ? req.files[0]?.filename? req.files[0]?.filename: null: null,
      after_weight_img: null,
      final_weight_img: null,
      gross_weight_img: isPlain ? req.files[0]?.filename ? req.files[0]?.filename : null : null,
    };

    let newProduct = await prisma.product_info.create({
      data: {
        ...productInfo,
        product_images: {
          create: img,
        },
      },
      include: {
        product_images: true,
      },
    });

    if (itemType.toUpperCase() === LOT_TYPE.PLAIN) {
      // this create product number for plain products
      newProduct = await makeProductId(goldSmithCode, itemCode, newProduct);
    }

    res.status(200).json({
      success: true,
      message: "Product Successfully Created",
      newProduct,
      productImage: newProduct.product_images,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "Error Creating Product" });
  }
};

// const createNewProduct = async (req, res) => {
//   try {
//     const {
//       tag_number,
//       before_weight,
//       after_weight,
//       product_number,
//       lot_id,
//       barcode_weight,
//     } = req.body;

//     const weight1 = parseFloat(before_weight);
//     const weight2 = parseFloat(after_weight);

//     // const weight3 = parseFloat((weight1 - weight2).toFixed(3));
//     // const weight4 = parseFloat((weight3 - (weight3 * 0.0001)).toFixed(3));
//     // const weight5 = parseFloat((weight4 - (weight4 * 0.1)).toFixed(3));

//     // const weight5Str = "123"

//     // const finalProductNumber = `${tag_number}00${weight5Str}`;
//     const finalProductNumber = product_number;

//     const newProduct = await prisma.product_info.create({
//       data: {
//         tag_number,
//         before_weight: weight1,
//         after_weight: weight2,
//         // difference: weight3,
//         // adjustment: weight4,
//         // final_weight: weight5,
//         barcode_weight: parseFloat(barcode_weight),
//         product_number: tag_number + Math.random(4) * 1000,
//         lot_id: lot_id,
//       },
//     });

//     res.status(200).json({
//       message: "Product Successfully Created",
//       newProduct,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(404).json({ error: "Error Creating Product" });
//   }
// };

const getAllProducts = async (req, res) => {
  try {
    const lot_id = parseInt(req.params.lot_id);
    const getProducts = await prisma.product_info.findMany({
      where: {
        lot_id,
      },
    });
    res.status(200).json(getProducts);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "No Products found" });
  }
};

const getProductByNumber = async (req, res) => {
  try {
    const { bill_number, product_number, bill_type } = req.params;

    // const billing_type = bill_type === "party" ? "hold" : "sold";

    const product = await prisma.product_info.findMany({
      where: {
        product_number: product_number,
        product_type: "active",
        // lot_info: { lot_process: "completed" },
      },
    });
    if (product.length === 0) {
      return res.status(500).json({ msg: "Product not found" });
    }
    res.status(200).json({
      message: "Product found",
      product: product[0],
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the product" });
  }
};

const restoreProductByNumber = async (req, res) => {
  try {
    const { product_number } = req.params;
    console.log('productNo',product_number)
   


    const billing_type = "active";
    const product = await prisma.product_info.updateMany({
      where: {
        product_number,
      },
      data: {
        product_type: billing_type,
      },
    });
    // console.log(product)
    if (product.length === 0) {
      res.status(500).json({ error: "Product Not found" });
    }
    const product_info = await prisma.product_info.findMany({
      where: {
        product_number,
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
    res.status(200).json({
      message: "Product found",
      product_info,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the product" });
  }
};

// const createNewProduct = async (req, res) => {
//     try {
//       const { tag_number, before_weight, after_weight } = req.body;
//       const {bill_number} = req.params;

//       const weight1 = parseFloat(before_weight);
//       const weight2 = parseFloat(after_weight);

//       const weight3 = (weight1 - weight2);
//       const weight4 = weight3 - (weight3 * 0.0001);
//       const weight5 = weight4 - (weight4 * 0.1);
//       const weight5Str = Math.abs(weight5).toFixed(3).replace('.', '').slice(0, 3);
//      const  finalProductNumber = `${tag_number}00${weight5Str}`

//               const newProduct = await prisma.product_info.create({
//         data: {
//           tag_number,
//           before_weight: weight1,
//           after_weight: weight2,
//           difference: weight3,
//           adjustment: weight4,
//           final_weight: weight5,
//           product_number: finalProductNumber,
//           created_at: new Date(),
//           updated_at: new Date()
//         }
//       });

//       res.status(200).json({
//         message: "Product Successfully Created",
//         newProduct,

//       });
//     } catch (error) {
//       console.log(error);
//       res.status(404).json({ error: "Error Creating Product" });
//     }
//   };

// const UpdatingProduct = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { tag_number,before_weight,after_weight,difference,adjustment,final_weight, product_number } = req.body;

//         const updateProduct = await prisma.product_info.update({
//             where: { id: parseInt(id) },
//             data: {
//                 tag_number,
//                 before_weight,
//                 after_weight,
//                 difference,
//                 adjustment,
//                 final_weight,
//                 product_number,
//                 updated_at: new Date(),
//             }
//         });

//         res.status(200).json({ message: "Updated Successfully", updateProduct });
//     } catch (error) {
//         console.log(error);
//         res.status(404).json({ error: "Product not Updated" });
//     }
// };

const UpdatingProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Destructure all the expected fields from the request body
    const {
      before_weight,
      after_weight,
      barcode_weight,
      difference,
      adjustment,
      final_weight,
      productName,
      workerName,
      grossWeight,
      stoneWeight,
      netWeight,
      goldSmithCode,
      itemCode,
      itemType,
    } = req.body;

    const existProduct = await prisma.product_info.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existProduct) {
      return res.status(400).json({ message: "Invalid Product Id" });
    }

    const validTypes = Object.values(LOT_TYPE); // ["STONE", "PLAIN"]

    if (!itemType || !validTypes.includes(itemType.toUpperCase())) {
      return res.status(400).json({
        message: `Invalid Type. Allowed values: ${validTypes.join(", ")}`,
      });
    }

    const type = itemType.toUpperCase();
    const isStone = type === "STONE";
    const isPlain = type === "PLAIN";

    // Stone fields
    const stoneFields = isStone
      ? {
          before_weight: Number(before_weight),
          after_weight: Number(after_weight),
          barcode_weight: barcode_weight ? String(barcode_weight) : null,
          difference: Number(difference),
          adjustment: Number(adjustment),
          final_weight: Number(final_weight),
          itemType: itemType.toUpperCase(),
        }
      : {
          before_weight: 0,
          after_weight: 0,
          barcode_weight: "",
          difference: 0,
          adjustment: 0,
          final_weight: 0,
        };

    // Plain fields
    const plainFields = isPlain
      ? {
          productName,
          workerName,
          grossWeight,
          stoneWeight,
          netWeight,
          goldSmithCode,
          itemCode,
          itemType: itemType.toUpperCase(),
        }
      : {
          productName: "",
          workerName: "",
          grossWeight: "",
          stoneWeight: "",
          netWeight: "",
          goldSmithCode: "",
          itemCode: "",
        };

    const productInfo = {
      ...stoneFields,
      ...plainFields,
      updated_at: new Date(),
    };

    let fileMap = {};
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        fileMap[file.fieldname] = file.filename;
      });
    }

    const img = {
      before_weight_img: isStone ? fileMap["before_weight_img"] || null : null,
      after_weight_img: isStone ? fileMap["after_weight_img"] || null : null,
      final_weight_img: isStone ? fileMap["final_weight_img"] || null : null,
      gross_weight_img: isPlain ? fileMap["gross_weight_img"] || null : null,
    };

    // Update the product in the database

    let updateProduct = await prisma.product_info.update({
      where: { id: Number(id) },
      data: {
        ...productInfo,
      },
    });

    let productImage = await prisma.product_images.findFirst({
      where: { product_id: Number(id) },
    });

    if (productImage) {
      // Update existing image
      await prisma.product_images.update({
        where: { id: productImage.id },
        data: img,
      });
    } else {
      // Create new image set
      await prisma.product_images.create({
        data: {
          product_id: Number(id),
          ...img,
        },
      });
    }

    if (itemType.toUpperCase() === LOT_TYPE.PLAIN) {
      // this update product number for plain products
      updateProduct = await makeProductId(
        goldSmithCode,
        itemCode,
        updateProduct
      );
    }

    res.status(200).json({
      message: " Product Updated Successfully",
      success: true,
      updateProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "Product not Updated" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const delProduct = await prisma.product_info.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: "Deleted Successfully", delProduct });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "Product not deleted" });
  }
};

const deleteAllProduct = async (req, res) => {
  try {
    const deleteAllProducts = await prisma.product_info.deleteMany();
    res
      .status(200)
      .json({ message: "Deleted Successfully", deleteAllProducts });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "Can't delete All Product" });
  }
};

const calculateAdjustments = async (req, res) => {
  try {
    const lot_no = Number(req.params.lot_no);

    const lot_info = await prisma.lot_info.findUnique({
      where: {
        id: lot_no,
      },
    });

    let bulk_before_weight = lot_info.bulk_weight_before;
    let bulk_after_weight = lot_info.bulk_after_weight;
    let diff_bulk_weight = bulk_after_weight - bulk_before_weight;
    let diff_products_weight = 0;
    let no_of_products = 0;
    const products = await prisma.product_info.findMany({
      where: {
        lot_id: lot_no,
      },
    });
    no_of_products = products.length;
    products.map(
      (elem) => (diff_products_weight += elem.after_weight - elem.before_weight)
    );
    // console.log(diff_bulk_weight,diff_products_weight,diff_bulk_weight >= diff_products_weight)
    let calculated_products = [];
    if (diff_bulk_weight >= diff_products_weight) {

      calculated_products = products.map((elem) => {
        let diff_weigh = parseFloat(
          (elem.after_weight - elem.before_weight).toFixed(3)
        );
        let calculated_adjustment = diff_weigh;
        console.log(calculated_adjustment)
        let final_weight = calculated_adjustment *0.9;
        
        return {
          ...elem,
          difference: diff_weigh,
          adjustment: calculated_adjustment,
          final_weight: parseFloat(final_weight.toFixed(2)),
          product_number:
          lot_info.lot_name +
          "0" +
          final_weight.toFixed(2).replace(".", "").replace("-", "")+"__"+Math.random(1000).toFixed(2),
        };
        
        // diff_products_weight += diff_weigh
      });
      
      // return res.status(200).json({
        //   name: "without adjustment",
        //   message: "Successfully calculated",
        //   products: calculated_products,
        // });
      } else {
      // console.log("works")
      calculated_products = products.map((elem) => {
        let diff_weigh = parseFloat(
          (elem.after_weight - elem.before_weight).toFixed(3)
        );
        let calculated_adjustment = parseFloat(
          (
            diff_weigh -
            (diff_products_weight - diff_bulk_weight) / no_of_products
          ).toFixed(3)
        );
        let final_weight = calculated_adjustment*0.9;

        return {
          ...elem,
          difference: diff_weigh,
          adjustment: calculated_adjustment,
          final_weight: parseFloat(final_weight.toFixed(2)),
          product_number:
            lot_info.lot_name +
            "0" +
            final_weight.toFixed(2).replace(".", "").replace("-", "")+"__"+Math.random(1000).toFixed(2),
        };

        // diff_products_weight += diff_weigh
      });
    }
    if (calculated_products.length !== 0) {
      let inserted_products = await Promise.all(
        calculated_products.map(async (elem) => {
          return await prisma.product_info.update({
            data: {
              adjustment: elem.adjustment,
              final_weight: elem.final_weight,
              difference: elem.difference,
              product_number: elem.product_number,
            },
            where: {
              id: elem.id,
            },
          });
        })
      );

      return res.status(200).json({
        name: "adjustment",
        message: "Successfully calculated",
        products: calculated_products,
        inserted_products,
      });
    }
    return res.status(200).json({
      name: "adjustment",
      message: "Successfully calculated",
      products: calculated_products,
      inserted_products: [],
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "Can't delete All Product" });
  }
};

module.exports = {
  getAllProducts,
  getProductByNumber,
  createNewProduct,
  UpdatingProduct,
  deleteProduct,
  deleteAllProduct,
  restoreProductByNumber,
  calculateAdjustments,
};
