const amqp = require('amqplib/callback_api');
const Message = require('../models/Message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('a user connected');

    //Event handlers for friend requests
    socket.on('sendFriendRequest', (data) => {
      console.log('sendFriendRequest event emitted with data:', data);
      io.emit('friendRequest', data);
    });

    socket.on('cancelFriendRequest', (data) => {
      console.log('cancelFriendRequest event emitted with data:', data);
      io.emit('friendRequestCancelled', data);
    });

    socket.on('acceptFriendRequest', (data) => {
      console.log('acceptFriendRequest event emitted with data:', data);
      io.emit('friendRequestAccepted', data);
    });

    socket.on('deleteFriend', (data) => {
      console.log('deleteFriend event emitted with data:', data);
      io.emit('friendDeleted', data);
    });

    //Event handlers for messages
    socket.on('sendMessage', (message) => {
      sendMessageToQueue(io, message);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

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

      channel.consume(QUEUE_NAME, (msg) => {
        if (msg !== null) {
          const message = JSON.parse(msg.content.toString());

          if (message.action === 'delete') {
            // Delete user from leaderboard
            io.emit('deleteUserFromLeaderboard', message);
          } else {
            // Update leaderboard
            io.emit('updateLeaderboard', message);
          }

          channel.ack(msg);
        }
      });

      console.log(`RabbitMQ connected and consuming queue: ${QUEUE_NAME}`);
    });
  });
};

const sendMessageToQueue = (io, message) => {
  amqp.connect('amqp://localhost', (error0, connection) => {
    if (error0) throw error0;
    connection.createChannel((error1, channel) => {
      if (error1) throw error1;

      const queue = 'chatMessages';
      channel.assertQueue(queue, { durable: false });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
      console.log(" [x] Sent %s", message);

      channel.consume(queue, async (msg) => {
        const receivedMessage = JSON.parse(msg.content.toString());
        const newMessage = new Message(receivedMessage);
        await newMessage.save();
        io.emit('receiveMessage', receivedMessage);
      }, { noAck: true });
    });
  });
};
