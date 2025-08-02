import amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";
let connection, channel;

async function connect() {
  if (connection && channel) return channel;
  try {
    connection = await amqp.connect(process.env.RABBIT_URL);
    channel = await connection.createChannel();
    console.log("🐇 RabbitMQ Connected Successfully");
    return channel;
  } catch (err) {
    console.error("❌ Failed to connect to RabbitMQ:", err);
  }
}



async function subscribeToQueue(queueName, callback) {
  if (!channel) await connect();
  await channel.assertQueue(queueName);

  channel.consume(queueName, (message) => {
    const content = JSON.parse(message.content.toString());
    callback(content, message); // ✅ pass full message
    channel.ack(message);
  });
}


// ✅ Publish normal message (non-RPC)
async function publishToQueue(queueName, data, options = {}) {
  if (!channel) await connect();
  await channel.assertQueue(queueName);
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), options);
}


// ✅ Publish as RPC (returns Promise)
async function rpcRequest(queueName, data) {
  if (!channel) await connect();

  const correlationId = uuidv4();
  const replyQueue = await channel.assertQueue("", { exclusive: true });

  return new Promise((resolve) => {
    // Listen for response
    channel.consume(
      replyQueue.queue,
      (msg) => {
        if (msg.properties.correlationId === correlationId) {
          const parsed = JSON.parse(msg.content.toString());
          resolve(parsed);
        }
      },
      { noAck: true }
    );

    // Send request
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
      correlationId,
      replyTo: replyQueue.queue,
    });
  });
}


export { connect, subscribeToQueue, publishToQueue, rpcRequest };
