const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path'); // Required for path.join()
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', 'config', '.env') });

// console.log('RAZORPAY_API_KEY:', process.env.RAZORPAY_API_KEY);
console.log('PORT:', process.env.PORT);

if (!process.env.RAZORPAY_API_KEY || !process.env.RAZORPAY_API_SECRET) {
  throw new Error('Razorpay API keys missing in .env file');
}

// const connectDB = require('./database/connection.js'); // <- MongoDB connection
// connectDB();

mongoose.connect('mongodb+srv://root:wV5GkuphFMi38tLc@messservice.jez2yl8.mongodb.net/eatFeed', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());

app.use(require('./routes/root'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
