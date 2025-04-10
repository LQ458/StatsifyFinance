import mongoose, { now } from "mongoose";

const Schema = mongoose.Schema;

const articlesSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  enTitle: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  enDesc: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  enContent: {
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

const Articles =
  mongoose.models.Articles || mongoose.model("Articles", articlesSchema);
export default Articles;
