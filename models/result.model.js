import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    testName: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
    },
    questionResults: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        questionText: {
          type: String,
          required: true,
        },
        correctAnswer: {
          type: String,
          required: true,
        },
        userAnswer: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
        feedback: {
          type: String,
          default: "",
        },
      },
    ],
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Result = mongoose.model("Result", ResultSchema);
