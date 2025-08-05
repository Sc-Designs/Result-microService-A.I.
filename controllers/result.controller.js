import { Result } from "../models/result.model.js";
import cleanUpResult from "../utils/cleanUpResult.js";

const sendResult = async (req,res) => {
    const {id} = req.params;
    const result = await Result.findById(id);
    const cleanResult = cleanUpResult(result, true);
    res.status(200).json(cleanResult);
}

const limitResultsSend = async (req, res)=>{
    const {start = " 0"} = req.query;
    const userId = req.user._id;
    const results = await Result.find({user: userId})
        .sort({completedAt: -1})
        .skip(Number(start))
        .limit(5);
    const cleanResults = results.map(result => cleanUpResult(result));
    res.status(200).json(cleanResults);
}

const defultResult = async (req, res) => {
  try {
    const userId = req.user._id;

    // Pagination params
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 2;

    // Fetch paginated recent results
    const recentResults = await Result.find({ user: userId })
      .sort({ completedAt: -1 })
      .skip(start)
      .limit(limit + 1) // fetch 1 extra to check "hasMore"
      .lean();

    if (recentResults.length === 0) {
      return res.status(200).json({
        results: [],
        avgScore: 0,
        bestScore: 0,
        hasMore: false,
      });
    }

    const hasMore = recentResults.length > limit;
    if (hasMore) recentResults.pop();

    const cleanResults = recentResults.map((result) => cleanUpResult(result));

    const allResults = await Result.find({ user: userId })
      .select("score")
      .lean();

    let avgScore = 0;
    let bestScore = 0;

    if (allResults.length) {
      const totalScore = allResults.reduce((sum, r) => sum + (r.score || 0), 0);
      avgScore = totalScore / allResults.length;
      bestScore = Math.max(...allResults.map((r) => r.score || 0));
    }

    res.status(200).json({
      results: cleanResults,
      avgScore: Number(avgScore.toFixed(2)),
      bestScore,
      hasMore,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export { sendResult, limitResultsSend, defultResult };