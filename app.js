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

const productRoutes = require('./routes/product');
app.use('/product', productRoutes);

const categoryRoutes = require('./routes/category');
app.use('/categories', categoryRoutes);

const port = process.env.SERVER_PORT;
app.get("/",(res,resp)=>{
    resp.send("Home page");
});
mongoose.connect('mongodb+srv://hassanshahzadvs:XDXCynXkMxzSSmZS@e-com.h5pzt3u.mongodb.net/?retryWrites=true&w=majority')
.then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => console.log('Error connecting to MongoDB:', err));
console.log("server running on port ",port)
