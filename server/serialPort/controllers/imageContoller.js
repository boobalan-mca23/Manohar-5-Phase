const multer = require("multer");
const express = require("express");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
const uploadDir = path.join(__dirname, "../../uploads");

console.log("Upload directory:", uploadDir);

app.get("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

const uploadImage = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({
        message: "Error uploading the image",
        error: err.message,
      });
    }
    console.log(req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { fieldName, productId } = req.body;
  

    if (
      !fieldName ||
      !productId ||
      !["before_weight_img", "after_weight_img", "final_weight_img"].includes(
        fieldName
      )
    ) {
      return res
        .status(400)
        .json({ message: "Invalid field name or missing productId" });
    }

    try {
      const productInfo = await prisma.product_info.findUnique({
        where: { id: parseInt(productId) },
      });

      if (!productInfo) {
        return res.status(404).json({ message: "Product info not found" });
      }

      let productImage = await prisma.product_images.findFirst({
        where: { product_id: productInfo.id },
      });

      if (!productImage) {
        productImage = await prisma.product_images.create({
          data: {
            product_id: productInfo.id,
            before_weight_img:
              fieldName === "before_weight_img" ? req.file.filename : null,
            after_weight_img: null,
            final_weight_img: null,
          },
        });

        return res.status(201).json({
          message: "Image uploaded and new product image record created",
          productImage,
        });
      }

      const updatedProduct = await prisma.product_images.update({
        where: { id: productImage.id},
        data: {
          [fieldName]: req.file.filename,
        },
      });
      console.log("yyyyyyyyyyy", updatedProduct),
        res.status(200).json({
          message: "Image uploaded and product image updated successfully",
          productImage: updatedProduct,
        });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        message: "Error saving image to the database",
        error: error.message,
      });
    }
  });
};
const getImages = async (req, res) => {
  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const productImage = await prisma.product_images.findFirst({
      where: { product_id: parseInt(productId) },
    });

    if (!productImage) {
      return res
        .status(404)
        .json({ message: "No images found for this product" });
    }

    const baseUrl = "/uploads/";

    res.status(200).json({
      before_weight_img: productImage.before_weight_img
        ? `${baseUrl}${productImage.before_weight_img}`
        : null,
      after_weight_img: productImage.after_weight_img
        ? `${baseUrl}${productImage.after_weight_img}`
        : null,
      final_weight_img: productImage.final_weight_img
        ? `${baseUrl}${productImage.final_weight_img}`
        : null,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({ message: "Error fetching images" });
  }
};

module.exports = { uploadImage, getImages };
