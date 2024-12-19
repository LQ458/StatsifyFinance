import mongoose, { now } from "mongoose";

const Schema = mongoose.Schema;

const learnSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  enTitle: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: false,
  },
  featured: {
    type: Boolean,
    required: true,
    default: false,
  },
  type: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Learn = mongoose.models.Learn || mongoose.model("Learn", learnSchema);
export default Learn;
