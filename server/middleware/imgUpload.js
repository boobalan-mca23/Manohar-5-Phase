
// Cloudinary img upload...

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {

    // get itemType from request body
    const itemType = req.body.itemType; // "PLAIN" or "STONE"

    let folderName = 'manoharJewellery/plain';

    if (itemType === 'STONE') {
      folderName = 'manoharJewellery/stone';
    }

    return {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 ,fieldSize:20 * 1024 * 1024},
});

module.exports = upload;

