
const EventEmitter = require('events');
class MessageEmitter extends EventEmitter {}
const messageEmitter = new MessageEmitter();
const userListEmitter = new MessageEmitter();

var PROTO_PATH = __dirname + '/chat.proto';

var grpc = require('grpc');
var _ = require('lodash');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
var chat = protoDescriptor.chat;
var call_array = [];
var username_array = [];

async function doJoinChat(call) {

  var username = call.request.username;
  username_array.push(username);
  console.log("username_array " + username_array);
  var requestID = call.metadata._internal_repr["x-request-id"];
  var joinMessage = {
    message: username + " joined the chat",
    senderID: requestID,
    messageType: "update"
  };

  console.log(username + " joined the chatroom with ID: " + requestID[0]);

  console.log("call array length: " + call_array.length);

  messageEmitter.on('chatMessage', function(chatMessage) {
      call.write({
        receiverid: requestID,
        senderid: chatMessage.senderID,
        message: chatMessage.message,
        usernames: username_array,
        messagetype: chatMessage.messageType
      });
  });

  messageEmitter.emit('chatMessage', joinMessage);
}

function doSendMessage(call, callback) {
  var newMessage = call.request.message;
  var senderID = call.request.senderid;
  var chatMessage = {
    message: newMessage,
    senderID: senderID,
    messageType: "message"
  };
  console.log("message received: " + JSON.stringify(chatMessage));
  try {
    messageEmitter.emit('chatMessage', chatMessage);
  } catch(err) {
    console.error('caught while emitting:', err.message);
  }
  callback(null, {status: "message-received"});
}

function getServer() {
  var server = new grpc.Server();
  server.addService(chat.Chat.service, {
    joinChat: doJoinChat,
    sendMessage: doSendMessage
  });
  console.log("Chat Server Started");
  return server;
}

if (require.main === module) {
  var server = getServer();
  server.bind('0.0.0.0:9090', grpc.ServerCredentials.createInsecure());
  server.start();
}

exports.getServer = getServer;
