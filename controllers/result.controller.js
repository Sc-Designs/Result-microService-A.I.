import { Result } from "../models/result.model.js";
import cleanUpResult from "../../user/utils/cleanUpUser.js";
import { subscribeToQueue } from "../services/rabbit.service.js";

const sendResult = async (req,res) => {
    const {id} = req.params;
    const result = await Result.findById(id);
    const cleanResult = cleanUpResult(result);
    res.status(200).json(cleanResult);
}


export default sendResult;