const express = require("express");
const router = express.Router();

const {
  protect
} = require("./authMiddleware");
const {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createProduct);
router.patch("/:id", protect, upload.single("image"), updateProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
