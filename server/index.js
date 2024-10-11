const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const multer = require('multer');
const { Server } = require('socket.io');
const http = require('http');
const amqp = require('amqplib/callback_api');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }
});

const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const topicRoutes = require('./routes/topics');
const subscriptionRoutes = require('./routes/subscriptions'); 
const leaderboardRoutes = require('./routes/leaderboard');
const socketHandler = require('./sockets/socket');

connectDB();
app.use(cors());
app.use(express.json());
app.use(multer().none());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/subscriptions', subscriptionRoutes); 
app.use('/api/leaderboard', leaderboardRoutes);

// RabbitMQ setup
const RABBITMQ_URL = 'amqp://localhost'; 
const QUEUE_NAME = 'leaderboardUpdates';

amqp.connect(RABBITMQ_URL, (err, connection) => {
  if (err) {
    throw err;
  }

  connection.createChannel((err, channel) => {
    if (err) {
      throw err;
    }

    channel.assertQueue(QUEUE_NAME, {
      durable: false
    });

    // Consume messages from the queue
    channel.consume(QUEUE_NAME, (msg) => {
      if (msg !== null) {
        const message = JSON.parse(msg.content.toString());
        // Emit update to all connected clients
        io.emit('updateLeaderboard', message);
        channel.ack(msg);
      }
    });

    console.log(`RabbitMQ connected and consuming queue: ${QUEUE_NAME}`);
  });
});

socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
