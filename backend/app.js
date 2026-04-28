const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const cookieParser = require("cookie-parser");
// Route
const userRouter = require("./routes/web/v1/user.route");
const adminRouter = require("./routes/web/v1/admin.route");
const productRouter = require("./routes/web/v1/product.route");
const chatRouter = require("./routes/web/v1/chat.route");
const cartRouter = require("./routes/web/v1/cart.route");
const orderRouter = require("./routes/web/v1/order.route");
const wishlistRouter = require("./routes/web/v1/wishlist.route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set(db());

// cors origin --> allow only that website that mention into origin group, ex. backend only res when localhost 3002 send reqest, other than give cors error
// localhost 3002 --> req --> accept --> give response
// localhost 3004 --> req --> cors error --> don't give response
// in origin you mention frontend urls (deveopment, producation both)
app.use(cors({ origin: "http://localhost:3002", credentials: true }));

PORT = process.env.PORT;

// temp route --> in Backend we Don't create a Home Route. after Teasting / Developement Remove Home Route
app.get("/", (req, res) => {
  res.status(401).json({ message: "Access Denined !!" });
});
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/product", productRouter);
app.use("/bot", chatRouter);
app.use("/cart", cartRouter);
app.use("/order", orderRouter);
app.use("/wishlist", wishlistRouter)

app.listen(PORT, () => {
  console.log(`✅ server is Running on PORT ${PORT}`);
});
