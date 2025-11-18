require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const port = process.env.PORT||5002;
const app = express();
const billRoutes = require("./routes/bills.routes");
const productRoutes = require("./routes/productInfo.routes");
const imageRoutes = require("./routes/image.routes");
const lotRoutes = require("./routes/lot.routes");
const productRoutes_v1 = require("./routes/productinfo_v1.routes");
const weightRoute=require('./routes/weight.routes')
const restoreRoutes=require('./routes/restore.routes')
const goldSmithRoutes=require('./routes/masterGoldSmith.routes')
const masterItem=require('./routes/masterItem.routes')
const authRoutes=require('./routes/auth.routes')
const userRoutes=require('./routes/user.routes')
const plainLotRoutes=require('./routes/plainLot.routes')
const plainProducts=require('./routes/plainProducts.routes')
const uploadDir = path.join(__dirname, "../uploads");
console.log("xxxxxxxxxxxxxx", uploadDir);
  
app.use(express.json());
app.use(cors());  

app.use("/bills", billRoutes);
app.use("/api/products", productRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/v1/lot", lotRoutes);
app.use("/api/v1/products", productRoutes_v1);
app.use("/api/v1/weight",weightRoute)
app.use("/api/v1/restore",restoreRoutes)
app.use("/api/v1/goldSmith",goldSmithRoutes)
app.use("/api/v1/masterItem",masterItem)
app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/user",userRoutes)
app.use("/api/v1/plainLot",plainLotRoutes)
app.use("/api/v1/plainProducts",plainProducts)


app.use(express.static(uploadDir));
app.get("/uploads/:image_name", (req, res) => {
  return res.sendFile(path.resolve(uploadDir, req.params.image_name));
});

const buildPath = path.join(__dirname, "../client/build");
app.use(express.static(buildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(port, () => {
  console.log("Server is Running on " + port);
});
