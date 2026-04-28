module.exports.authAdmin = (req, res, next) =>{
   const user = req.user;

   // check user or user role
   if(!user || user.role !== "admin"){
     return res.status(403).json({message: "Access Denined !"})
   }

   next();
}