const Admin = require("../models/Admin");
const { staticAdmin } = require("./adminConfig");

const initializeAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: staticAdmin.email });

    if (!adminExists) {
      // Create new admin with static credentials
      const admin = new Admin({
        email: staticAdmin.email,
        password: staticAdmin.password, // Will be hashed by the model's pre-save middleware
        name: staticAdmin.name,
      });

      await admin.save();
      console.log("Static admin account created in database");
    } else {
      console.log("Static admin account already exists in database");
    }
  } catch (error) {
    console.error("Error initializing admin:", error);
  }
};

module.exports = initializeAdmin;
