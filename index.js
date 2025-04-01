const express = require("express");
const mongoose = require("mongoose");
const { userRouter } = require("./routes/user")
const { courseRouter } = require("./routes/course");
const { adminRouter } = require("./routes/admin");

const app = express();
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);

async function main() {
  await mongoose.connect("mongodb+srv://rohini2garg1:dWtTJHBy2oMR2Mhd@cluster0.w8pwsdp.mongodb.net/rohini-course-app-1");
app.listen(3000);
console.log("listen on port 3000");
}

main()
