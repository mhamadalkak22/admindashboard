const bcrypt = require("bcryptjs");

// Static admin credentials
const staticAdmin = {
  email: "nourhashem5@gmail.com",
  password: "2481989Nour@@hashem", // This will be hashed in the login process
  name: "Anwar Hashem",
};

// Pre-hashed password for static admin (generated with salt round 10)
const hashedPassword =
  "$2a$10$HQIZvTMfqcZkpd0GCUA1buJr9Nu380JfFJAaTijWPj3FBkUjk1XG6"; // This is the hash for 'admin123'

module.exports = {
  staticAdmin,
  hashedPassword,
};
