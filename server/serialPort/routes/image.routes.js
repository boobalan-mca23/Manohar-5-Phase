const express = require("express");
const router = express.Router();
const { uploadImage, getImages } = require("../controllers/imageContoller");

router.post("/upload", uploadImage);
router.get("/", getImages);

module.exports = router;
