const express= require('express');
const mongoose = require('mongoose')
const cron = require('node-cron');
require('dotenv').config()
const cors = require('cors');
const app = express();
app.use(express.json({limit: '50mb'}))
app.use(cors());


const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const reviewRoutes = require('./routes/review');
app.use('/review', reviewRoutes);

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

const productRoutes = require('./routes/product');
app.use('/product', productRoutes);

const categoryRoutes = require('./routes/category');
app.use('/categories', categoryRoutes);

const cartRoutes = require('./routes/cart');
app.use('/cart', cartRoutes);

const orderRoutes = require('./routes/order');
app.use('/order', orderRoutes);

//const port = process.env.SERVER_PORT;
const port = 8000;
app.get("/",(res,resp)=>{
    resp.send("Home page");
});
mongoose.connect('mongodb+srv://hassanshahzadvs:XDXCynXkMxzSSmZS@e-com.h5pzt3u.mongodb.net/?retryWrites=true&w=majority')
.then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => console.log('Error connecting to MongoDB:', err));
console.log("server running on port ",port)
