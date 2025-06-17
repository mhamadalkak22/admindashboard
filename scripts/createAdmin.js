const mongoose = require("mongoose");
const Admin = require("../models/Admin");
require("dotenv").config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "nourhashem5@gmail.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create new admin user
    const admin = new Admin({
      email: "nourhashem5@gmail.com",
      password: "2481989Nour@@hashem", 
      name: "Anwar Hashem",
    });

    await admin.save();
    console.log("Admin user created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdmin(); 