const jwt=require("jsonwebtoken");
const User=require("../models/User");

module.exports.verifyToken=async (req,res,next)=>{
    const token=req.cookies.jwt;
    if(!token){
        return res.status(401).json({message:"No token, authorization denied."});
    }
    try{
        const decoded=jwt.verify(process.env.JWT_SECRET);
        req.user=await user.findById(decoded.id).select("-passsword");
        next();
    }
    catch(err){
        res.status(401).json({message:"Unauthorized! Acceess Denied"});

    }
}

module.exports.isAdmin = (req, res, next) => {
    try {
      if (req.user.authrole !== "admin")
        return res.status(403).json({
          message: "You are not admin",
        });
  
      next();
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

module.exports.isOwner=async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
      return res.status(404).json({ message: "User not found" });
  }

  if (req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Unauthorized action" });
  }

  next();
};
