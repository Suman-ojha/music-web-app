const express = require("express");
const router = express.Router();

const user = require("../models/user");
const admin = require("../config/firebase.config");

router.get("/login", async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(500).send({ message: "invalid Token" });
  }
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decodeValue = await admin.auth().verifyIdToken(token);
    if (!decodeValue) {
      return res.status(505).json({ message: "unauthorized" });
    } else {
      //checking user exits or not
      const userExists = await user.findOne({ user_id: decodeValue.user_id });
      if (!userExists) {
        const newUser = new user({
          name: decodeValue.name,
          email: decodeValue.email,
          imageURL: decodeValue.picture,
          user_id: decodeValue.user_id,
          email_verified: decodeValue.email_verified,
          role: "member",
          auth_time:decodeValue.auth_time,
        });
        try {
          const savedUser = await newUser.save();
          res.status(200).json({ user: savedUser });
        } catch (error) {
          res.status(400).json({ success: false, msg: error.message });
        }
      } else {
        updateNewUserData(decodeValue,req,res)
      }
    }
  } catch (error) {
    return res.status(505).json({ message: error.message });
  }
});


const updateNewUserData=async(decodeValue,req,res)=>{
  const filter={user_id : decodeValue.user_id};
  const options={
    upsert :true,
    new:true
  };
  try{

    const result=await user.findOneAndUpdate(
      filter,
      {auth_time :decodeValue.auth_time},
      options
    );
    res.status(200).send({user :result})
  }catch(error){
res.status(400).send({success:false, msg:error});
  }

}

module.exports = router;
