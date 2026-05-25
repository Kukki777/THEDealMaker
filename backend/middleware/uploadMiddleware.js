const multer = require("multer");

const imageFilter = (req, file, callback) => {
  if (!file.mimetype.startsWith("image/")) {
    return callback(new Error("Only image uploads are accepted"));
  }
  callback(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

module.exports = upload;
