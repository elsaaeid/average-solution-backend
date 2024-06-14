const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const { error } = require("console");
const cloudinary = require("cloudinary").v2;

// Create Prouct
const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, liveDemo, description } = req.body;

  //   Validation
  if (!name || !category || !liveDemo || !description) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Portfolio React",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Create Product
  const product = await Product.create({
    user: req.user.id,
    name,
    sku,
    category,
    liveDemo,
    description,
    image: fileData,
  });

  res.status(201).json(product);
});

// Get all Products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('likedBy');
    res.json(products);
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Get single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  res.status(200).json(product);
});

// Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  await product.remove();
  res.status(200).json({ message: "Product deleted." });
});

// Update Product
const updateProduct = asyncHandler(async (req, res) => {
  const { name, category, liveDemo, description } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);

  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Portfolio React",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Update Product
  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: id },
    {
      name,
      category,
      liveDemo,
      description,
      image: Object.keys(fileData).length === 0 ? product?.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedProduct);
});

// Like Product
 const likeProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
   
try {
  const product = await Product.findById(id);
  const user = await User.findById(userId);
  if (!product.likedBy.includes(user.id)) {
    product.likes++;
    product.likedBy.push(user.id);
    user.likedProducts.push(product.id);
    await product.save();
    await user.save();
  }
  res.json({ message: 'Product liked successfully' });
  } catch(error) { 
    res.status(500).json({ message: error.message });
  }
});

// unLike Product
const unLikeProduct =  asyncHandler(async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
   
try {
  const product = await Product.findById(id);
  const user = await User.findById(userId);
  if (product.likedBy.includes(user.id)) {
    product.likes--;
    product.likedBy.pull(user.id);
    user.likedProducts.pull(product.id);
    await product.save();
    await user.save();
  }
  res.json({ message: 'Product unliked successfully' });
  } catch(error) { 
    res.status(500).json({ message: error.message });
  }
});


module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  likeProduct,
  unLikeProduct,
};

