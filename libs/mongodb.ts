import mongoose from "mongoose";

// Connect to MongoDB
async function DBconnect() {
  try {
    if (process.env.MONGODB_URL) {
      if (mongoose.connection.readyState === 1) {
        console.log("Already connected to MongoDB");
        return;
      }
      await mongoose.connect(process.env.MONGODB_URL);
      console.log("Connected to MongoDB");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

async function DBdisconnect(){
  try {
    mongoose.disconnect();
  } catch (error) {
    console.error("Error disconnect to MongoDB:", error);
  }
}

export {
  DBconnect, DBdisconnect
}
