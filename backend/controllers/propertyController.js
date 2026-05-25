const Property = require("../models/Property");
const { createSignedUpload, uploadImage, deleteImage } = require("../config/cloudinary");

const parseAmenities = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
};

const propertyPayload = (body) => {
  const fields = [
    "title", "description", "purpose", "propertyType", "price", "city",
    "locality", "address", "bedrooms", "bathrooms", "areaSqFt",
  ];
  const result = {};
  fields.forEach((field) => {
    if (body[field] !== undefined) result[field] = body[field];
  });
  if (body.amenities !== undefined) result.amenities = parseAmenities(body.amenities);
  return result;
};

const uploadedImagesFromBody = (value) => {
  if (!value) return [];
  let images;
  try {
    images = typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    const error = new Error("Uploaded gallery details are invalid");
    error.statusCode = 400;
    throw error;
  }
  if (!Array.isArray(images) || images.length > 10) {
    const error = new Error("Upload up to 10 property images");
    error.statusCode = 400;
    throw error;
  }
  const valid = images.every((image) => (
    typeof image?.url === "string"
    && image.url.startsWith("https://res.cloudinary.com/")
    && typeof image.publicId === "string"
    && image.publicId.startsWith("rentsell/properties/")
  ));
  if (!valid) {
    const error = new Error("Uploaded gallery details are invalid");
    error.statusCode = 400;
    throw error;
  }
  return images.map(({ url, publicId }) => ({ url, publicId }));
};

const listProperties = async (req, res) => {
  const query = { status: "active" };
  ["purpose", "propertyType", "city"].forEach((field) => {
    if (req.query[field]) query[field] = req.query[field];
  });
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }
  if (req.query.search) query.$text = { $search: req.query.search };

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const [properties, total] = await Promise.all([
    Property.find(query).populate("owner", "name avatar").sort({ isFeatured: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Property.countDocuments(query),
  ]);
  res.json({ properties, page, pages: Math.ceil(total / limit), total });
};

const getProperty = async (req, res) => {
  const ownerFields = req.user ? "name avatar phone" : "name avatar";
  const property = await Property.findById(req.params.id).populate("owner", ownerFields);
  if (!property || (property.status !== "active" && !req.user)) {
    return res.status(404).json({ message: "Property not found" });
  }
  res.json({ property });
};

const createProperty = async (req, res) => {
  const directImages = uploadedImagesFromBody(req.body.uploadedImages);
  const fileImages = await Promise.all((req.files || []).map((file) => uploadImage(file.buffer, file.mimetype)));
  const images = [...directImages, ...fileImages];
  if (images.length > 10) {
    return res.status(400).json({ message: "Upload up to 10 property images" });
  }
  const property = await Property.create({ ...propertyPayload(req.body), images, owner: req.user._id });
  res.status(201).json({ property });
};

const createPropertyUploadSignature = async (req, res) => {
  res.json(createSignedUpload());
};

const findOwnedProperty = async (id, user) => {
  const property = await Property.findById(id);
  if (!property) return null;
  if (user.role !== "admin" && !property.owner.equals(user._id)) {
    const error = new Error("You cannot modify this property");
    error.statusCode = 403;
    throw error;
  }
  return property;
};

const updateProperty = async (req, res) => {
  const property = await findOwnedProperty(req.params.id, req.user);
  if (!property) return res.status(404).json({ message: "Property not found" });

  Object.assign(property, propertyPayload(req.body));
  if (req.files?.length) {
    const newImages = await Promise.all(req.files.map((file) => uploadImage(file.buffer, file.mimetype)));
    property.images.push(...newImages);
  }
  if (req.user.role !== "admin") property.status = "pending";
  await property.save();
  res.json({ property });
};

const deleteProperty = async (req, res) => {
  const property = await findOwnedProperty(req.params.id, req.user);
  if (!property) return res.status(404).json({ message: "Property not found" });
  await Promise.all(property.images.map((image) => deleteImage(image.publicId)));
  await property.deleteOne();
  res.json({ message: "Property deleted" });
};

const myProperties = async (req, res) => {
  const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ properties });
};

module.exports = {
  listProperties,
  getProperty,
  createProperty,
  createPropertyUploadSignature,
  updateProperty,
  deleteProperty,
  myProperties,
};
