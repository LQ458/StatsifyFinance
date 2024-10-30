import mongoose, { now } from "mongoose";

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  title: {
    type: String,
    required: true    
  },
  order: {
    type: Number,
    default: 1
  },
  type: {
    type: String,
    required: true    
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
