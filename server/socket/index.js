const socketIo = require("socket.io");
const {
  handleOnboardingSocketEvents,
} = require("../services/onboadingService");

const setupSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  handleOnboardingSocketEvents(io);

  return io;
};

module.exports = setupSocket;
