
// // Cloudinary img upload...

// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const cloudinary = require('../config/cloudinary');

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params:{
//       folder:"manoharJewellery",
//       allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], 
//       // transformation: [{ width: 800, crop: 'limit' }],
//   }
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 20 * 1024 * 1024 ,fieldSize:20 * 1024 * 1024},
// });

// module.exports = upload;

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');

// Create directory if not exists (recursive ensures parent folders created)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueName + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 ,fieldSize:20 * 1024 *1024} // 5MB max
});

module.exports = upload;


