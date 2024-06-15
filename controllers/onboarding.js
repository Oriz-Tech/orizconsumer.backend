const register = (req, res)=>{ 
    res.status(200).json({message: "register user"}) 
} 
  
  
// Export of all methods as object 
module.exports = { 
    register,
}