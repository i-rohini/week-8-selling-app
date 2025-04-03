const { Router } = require("express");
const { userModel, purchaseModel, courseModel } = require("../db");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");
const { userMiddleware } = require("../middleware/user");

const userRouter = Router();

    userRouter.post("/signup", async function(req, res) {

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

      await userModel.create({
        email: email,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
      })
      res.json({
        message: "signup succeeded"
      })
    });

    userRouter.post("/signin", async function(req, res) {
      const { email, password } = req.body;

      const user = await userModel.findOne({
        email: email
      });

      if (!user) {
        res.status(403).json({
          message: "User does not exit in our db"
        });
        return
      };

      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(passwordMatch);

      if (passwordMatch) {
        const token = jwt.sign({
          id: user._id.toString()
        }, JWT_USER_PASSWORD)
        res.json({
          token: token
        })
      } else {
        res.status(403).json({
          message: "Incorrect credentials"
        })
      }
    });

    userRouter.get("/purchases", userMiddleware, async function(req, res) {
      const userId = req.userId;

      const purchases = await purchaseModel.find({
        userId,
      })

      let purchasedCourseIds = [];

      for (let i = 0; i < purchases.length; i++) {
        purchasedCourseIds.push(purchases[i].courseId)
      }

      const coursesData = await courseModel.find({
        _id: { $in: purchasedCourseIds } //.map(x => x.courseId)
      })

      res.json({
        purchases,
        coursesData
      });
    });

module.exports = {
  userRouter: userRouter
}