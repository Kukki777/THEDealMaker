const { v2: cloudinary } = require("cloudinary");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const uploadsDirectory = path.join(__dirname, "..", "uploads");
const propertyFolder = "rentsell/properties";

const imageExtension = (mimeType) => {
  const extensions = {
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return extensions[mimeType] || ".jpg";
};

const localImageUrl = (filename) => {
  const baseUrl =
    process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 5001}`;
  return `${baseUrl.replace(/\/$/, "")}/uploads/${filename}`;
};

const saveImageLocally = async (buffer, mimeType) => {
  await fs.mkdir(uploadsDirectory, { recursive: true });
  const filename = `${crypto.randomUUID()}${imageExtension(mimeType)}`;
  await fs.writeFile(path.join(uploadsDirectory, filename), buffer);
  return { url: localImageUrl(filename), publicId: `local:${filename}` };
};

const configureCloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  return true;
};

const uploadImage = (buffer, mimeType) => {
  if (process.env.UPLOAD_STORAGE === "local") {
    return saveImageLocally(buffer, mimeType);
  }

  return new Promise((resolve, reject) => {
    if (!configureCloudinary()) {
      const error = new Error("Cloudinary is not configured");
      error.statusCode = 503;
      reject(error);
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: propertyFolder, resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

const createSignedUpload = () => {
  if (!configureCloudinary()) {
    const error = new Error("Cloudinary is not configured");
    error.statusCode = 503;
    throw error;
  }

  const timestamp = Math.round(Date.now() / 1000);
  return {
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: propertyFolder,
    timestamp,
    signature: cloudinary.utils.api_sign_request(
      { folder: propertyFolder, timestamp },
      process.env.CLOUDINARY_API_SECRET
    ),
  };
};

const deleteImage = async (publicId) => {
  if (publicId?.startsWith("local:")) {
    const filename = path.basename(publicId.slice("local:".length));
    await fs.unlink(path.join(uploadsDirectory, filename)).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
    return;
  }
  if (publicId && configureCloudinary()) {
    await cloudinary.uploader.destroy(publicId);
  }
};

module.exports = { createSignedUpload, uploadImage, deleteImage };
