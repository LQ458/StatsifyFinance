import mongoose from "mongoose";

const globalWithMongoose = global as typeof globalThis & {
  _mongooseConnectionPromise?: Promise<typeof mongoose>;
};

async function DBconnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!globalWithMongoose._mongooseConnectionPromise) {
    globalWithMongoose._mongooseConnectionPromise = mongoose
      .connect(uri)
      .catch((error) => {
        globalWithMongoose._mongooseConnectionPromise = undefined;
        throw error;
      });
  }

  return globalWithMongoose._mongooseConnectionPromise;
}

export { DBconnect };
