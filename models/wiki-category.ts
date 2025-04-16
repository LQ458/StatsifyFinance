import mongoose, { now } from "mongoose";

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  enTitle: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 1,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    default: null,
    ref: 'Category'
  },
  path: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Category =
  mongoose.models.wikiCategory || mongoose.model("wikiCategory", categorySchema);
export default Category;
