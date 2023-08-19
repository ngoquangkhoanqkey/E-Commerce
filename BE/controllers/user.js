const User = require("../models/user");
const asyncHandler = require("express-async-handler");

// Đăng kí User
const register = asyncHandler(async (req, res) => {
  const { email, password, firstname, lastname } = req.body;

  if (!email || !password || !firstname || !lastname)
    return res.status(400).json({
      sucess: false,
      mes: "Missing input",
    });

  //Check User
  const user = await User.findOne({ email: email });
  if(user)
    throw new Error('User has existed')
  else{
    const newUser = await User.create(req.body);
    return res.status(200).json({
      sucess: newUser ? true : false,
      mes: newUser ? 'Resgister successfully': 'Something went wrong'
    })
  }
});

// Dang nhap User
const login = asyncHandler(async (req, res) => {
  const { email, password} = req.body;

  if (!email || !password)
    return res.status(400).json({
      sucess: false,
      mes: "Missing input",
    });
  
  const response = await User.findOne({email})

  if(response && await response.isCorrectPassword(password)){
    const {password, role, ...userData} = response.toObject();
    return res.status(200).json({
      sucess: true,
      userData
    })
  }else {
     throw new Error('Invalid credentials')
  }

});

module.exports = {
  register,
  login
};
