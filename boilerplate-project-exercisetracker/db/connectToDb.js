const mongoose = require('mongoose');

async function connectToDb() {
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to db");
  }
  catch(err){
    console.log("error connecting to db");
  }
}

module.exports = connectToDb