import mongoose, { now } from "mongoose";

const Schema = mongoose.Schema;

const articlesCategorySchema = new Schema({
  title: {
    type: String,
    required: true    
  },
  order: {
    type: Number,
    default: 1
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

const ArticlesCategory = mongoose.models.ArticlesCategory || mongoose.model("ArticlesCategory", articlesCategorySchema);
export default ArticlesCategory;
