const { Router } = require("express");
const adminRouter = Router();
const { adminModel, courseModel } = require("../db");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");
const { adminMiddleware } = require("../middleware/admin");

adminRouter.post("/signup", async function(req, res) {
  const requiredBody = z.object({
    email: z.string().min(5).max(100).email(),
    password: z.string().min(5).max(),
    firstName: z.string().min().max(30),
    lastName: z.string().min().max(30)
  })

  const parsedDataWithSuccess = requiredBody.safeParse(req.body);

  if (!parsedDataWithSuccess.success) {
    res.json({
      message: "Incorrect format",
      error: parsedDataWithSuccess.error
    });
    return
  }

  const { email, password, firstName, lastName } = req.body;

  const hashedPassword = await bcrypt.hash(password, 5);

  await adminModel.create({
    email: email,
    password: hashedPassword,
    firstName: firstName,
    lastName: lastName,
  })
  res.json({
    message: "signup succeeded"
  })
});


adminRouter.post("/signin", async function(req, res) {
  const { email, password } = req.body;

  const admin = await adminModel.findOne({
    email: email
  });

  if (!admin) {
    res.status(403).json({
      message: "admin does not exit in our db"
    });
    return
  };

  const passwordMatch = await bcrypt.compare(password, admin.password);
  console.log(passwordMatch);

  if (passwordMatch) {
    const token = jwt.sign({
      id: admin._id.toString()
    }, JWT_ADMIN_PASSWORD)
    res.json({
      token: token
    })
  } else {
    res.status(403).json({
      message: "Incorrect credentials"
    })
  }
});

adminRouter.post("/course", adminMiddleware, function(req, res) {
  const adminId = req.userId;

  const { title, description, imageUrl, price } = req.body;

  const course = courseModel.create({
    title: title,
    description: description,
    imageUrl: imageUrl,
    price: price,
    creatorId: adminId
  })
  
  res.json({
    message: "course created",
    creatorId: course._id
  });
});

adminRouter.put("/course", function(req, res) {
  res.json({
    message: "signup endpoint"
  });
});

adminRouter.get("/course/bulk", function(req, res) {
  res.json({
    message: "signup endpoint"
  });
});

module.exports = {
  adminRouter: adminRouter
}