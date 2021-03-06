
module.exports = (io) => {
  //Set socket io listeners
  console.log('SOCKET SETUP IS BEING RUN ---------------------')
  io.on('connection', (socket) => {
    console.log('the user has been connected');
    //on conversation entry, join broadcast channel
    socket.on('enter conversation', (conversation) => {
      socket.join(conversation);
      console.log('joined' + conversation);
    });

    socket.on('leave conversation', (conversation) => {
      socket.leave(conversation);
      console.log('left' + conversation);
    });

    socket.on('new message', (message) => {
      console.log('this is server side', message)

      socket.in(message.conversationId).broadcast.emit('new message', message);
    });

console.log('SOCKET IS BEING DISCONNECTED--------------')
    socket.on('disconnect', () => {
      console.log('user has been disconnected');
    });
  });
}
