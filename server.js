
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
var user_array = [];

async function doJoinChat(call) {
  var username = call.request.username;
  var requestID = call.metadata._internal_repr["x-request-id"];
  user_array.push({
    userid: requestID[0],
    username: username
  });

  console.log("username_array " + JSON.stringify(user_array));

  var joinMessage = {
    message: username + " joined the chat",
    senderID: requestID[0],
    messageType: "update"
  };

  console.log(username + " joined the chatroom with ID: " + requestID[0]);

  console.log("call array length: " + user_array.length);

  messageEmitter.on('chatMessage', function(chatMessage) {
      call.write({
        receiverid: requestID[0],
        senderid: chatMessage.senderID,
        message: chatMessage.message,
        users: user_array,
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

function doLeaveChat(call, callback) {
  var senderID = call.request.senderid;
  var username = call.request.username;

  for(var i = 0; i < user_array.length; i++) {
    if(user_array[i].userid == senderID) {
        user_array.splice(i, 1);
        break;
    }
  }
  var leaveMessage = username + " has left the chat.";
  var chatMessage = {
    message: leaveMessage,
    senderID: senderID,
    messageType: "update"
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
    sendMessage: doSendMessage,
    leaveChat: doLeaveChat
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
