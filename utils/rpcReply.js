import { connect } from "../services/rabbit.service.js";

export async function rpcReply(data, replyTo, correlationId) {
  const ch = await connect();
  console.log(replyTo, correlationId)
  if (!replyTo || !correlationId) {
    console.error("❌ Missing replyTo or correlationId");
    return;
  }

  console.log("📤 Replying via:", replyTo);
  console.log("📤 With Correlation ID:", correlationId);

  ch.sendToQueue(replyTo, Buffer.from(JSON.stringify(data)), {
    correlationId,
  });
}
