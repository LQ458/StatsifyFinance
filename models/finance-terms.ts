import mongoose, { now } from "mongoose";

const Schema = mongoose.Schema;

const financeTermsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  enTitle: {
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

const FinanceTerms =
  mongoose.models.FinanceTerms ||
  mongoose.model("FinanceTerms", financeTermsSchema);
export default FinanceTerms;
