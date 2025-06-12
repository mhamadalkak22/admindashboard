const bcrypt = require("bcryptjs");

const password = "2481989Nour@@hashem";

async function generateHash() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log("Your hashed password is:");
  console.log(hash);
}

generateHash();
