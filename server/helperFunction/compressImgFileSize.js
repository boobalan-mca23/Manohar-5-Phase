const sharp = require("sharp");
const fs = require("fs/promises");
const path = require("path");
 
exports.compressImage = async (filePath) => {
  try {
    await fs.access(filePath);
 
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    const tempPath = path.join(dir, `${base}_temp${ext}`);
 
    const beforeSize = (await fs.stat(filePath)).size;
 
    //  Force sharp to fully release file
    await sharp(filePath)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 70, mozjpeg: true })
      .toFile(tempPath);
 
    //  Windows-safe replace (NO unlink first)
    await fs.rename(tempPath, filePath);
 
    const afterSize = (await fs.stat(filePath)).size;
 
    console.log(
      `Image compressed: ${(beforeSize / 1024).toFixed(2)} KB → ${(afterSize / 1024).toFixed(2)} KB`
    );
  } catch (err) {
    console.error("Image compression failed:", err.message);
  }
};