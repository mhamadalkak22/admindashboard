const bcrypt = require("bcryptjs");

// Function to generate hash
async function generateHash(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log("\nPassword Hash Generator Results:");
    console.log("----------------------------------------");
    console.log("Original Password:", password);
    console.log("Generated Hash:", hash);
    console.log("----------------------------------------");
    console.log(
      "\nCopy this hash into your adminConfig.js file for the hashedPassword value.\n"
    );
  } catch (error) {
    console.error("Error generating hash:", error);
  }
}

// Generate hash for the password
generateHash("2481989Nour@@hashem");
