const { default: mongoose } = require("mongoose");

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGOOB_URI);
    if(conn.connection.readyState === 1) console.log('DB connection is successfully')
    else console.log('DB connecting')
  } catch (e) {
    console.log("DB connection is failed");
    throw new Error(e);
  }
};

module.exports = dbConnect;
