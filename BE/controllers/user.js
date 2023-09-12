const User = require("../models/user");
const asyncHandler = require("express-async-handler");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");

const jwt = require("jsonwebtoken");

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
  if (user) throw new Error("User has existed");
  else {
    const newUser = await User.create(req.body);
    return res.status(200).json({
      sucess: newUser ? true : false,
      mes: newUser ? "Resgister successfully" : "Something went wrong",
    });
  }
});

// Dang nhap User
// Refresh Token => Cap moi acces token
// Access Token => Xac thuc nguoi dung, phan quyen nguoi dung
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({
      sucess: false,
      mes: "Missing input",
    });

  const response = await User.findOne({ email });

  if (response && (await response.isCorrectPassword(password))) {
    // Tách password và role khỏi response
    const { password, role, ...userData } = response.toObject();
    // Tạo access token
    const accessToken = generateAccessToken(response._id, role);
    // Tạo refresh token
    const refreshToken = generateAccessToken(response._id);

    // Lưu refresh Token vào database
    await User.findByIdAndUpdate(response._id, { refreshToken }, { new: true });
    //Lưu refresh Token vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      sucess: true,
      accessToken,
      userData,
    });
  } else {
    throw new Error("Invalid credentials");
  }
});

// Lay User hien tai
const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const users = await User.findById(_id).select('-refreshToken -password -role');
  return res.status(200).json({
    success: false,
    rs: users ? users : 'User not found'
  })
});

// Chuc nang refreshToken User
const refreshAccessToken = asyncHandler(async(req, res)=>{
  // Lấy token từ cookies
  const cookie = req.cookies
  // Check xem có token hay không 
  if(!cookie && !cookie.refreshToken) throw new Error('No refresh token in cookies')
  // Check token có hợp lệ hay không
  const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
  const response = await User.findOne({_id:rs._id, refreshToken:cookie.refreshToken})
    return res.status(200).json({
      success: response ? true : false,
      newAccessToken: response ? generateAccessToken(response._id, response.role) : 'Refresh token not matched'
    })
})






module.exports = {
  register,
  login,
  getCurrent,
  refreshAccessToken
  
};
