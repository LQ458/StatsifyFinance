import mongoose from "mongoose";

const Schema = mongoose.Schema;

const quantWikiSchema = new Schema({
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
  tags: {
    type: [String],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  relatedArticles: {
    type: [String],
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

const QuantWiki =
  mongoose.models.QuantWiki || mongoose.model("QuantWiki", quantWikiSchema);
export default QuantWiki;
