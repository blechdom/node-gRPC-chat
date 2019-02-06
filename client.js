window.onload = function(){

  var messageInput = document.getElementById('message-input');
  var messageSend = document.getElementById('message-send');
  var messageHistory = document.getElementById('message-history');
  var usernameInput = document.getElementById('username-input');
  var joinButton = document.getElementById('join-btn');
  var joinDiv = document.getElementById('join-div');
  var chatDiv = document.getElementById('chat-div');
  var usernameList = document.getElementById('username-list');
  chatDiv.style.visibility = "hidden";
  joinDiv.style.visibility = "visible";
  var receiverID = '';
  var usernames = [];

  const { JoinChatRequest,
          JoinChatResponse,
          SendMessageRequest,
          SendMessageResponse,
        } = require('./chat_pb.js');

  const {ChatClient} = require('./chat_grpc_web_pb.js');

  var client = new ChatClient('http://' + window.location.hostname + ':8080', null, null);

  joinButton.onclick = function(){

    var joinChatRequest = new JoinChatRequest();

    joinChatRequest.setUsername(usernameInput.value);

    var chatStream = client.joinChat(joinChatRequest, {});
    joinDiv.innerHTML = "";
    chatDiv.style.visibility = "visible";

    chatStream.on('data', (response) => {
      console.log(JSON.stringify(response, null, 4));
      receiverID = response.getReceiverid();
      senderID = response.getSenderid();
      var messageType = response.getMessagetype();
      var newMessage = response.getMessage();
      console.log("receiveid: " + receiverID + " senderid: " + senderID + " message: " + newMessage);
      var formattedMessage = "";
      if(messageType==="update"){
        messageHistory.innerHTML += '<div class="update_chat"><p class="update_chat">' + newMessage + '</p></div>';
      }
      else if(messageType=="error"){
        messageHistory.innerHTML += '<div class="update_chat danger"><p class="update_chat">ERROR: ' + newMessage + '</p></div>';
      }
      else if(receiverID===senderID){
        messageHistory.innerHTML += '<div class="outgoing_msg"><div class="sent_msg"><p>' + newMessage + '</p><span class="time_date">' + senderID + '</span></div></div>';
      }
      else {
        messageHistory.innerHTML += '<div class="incoming_msg"><div class="incoming_msg_img"><img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"></div><div class="received_msg"><div class="received_withd_msg"><p>' + newMessage + '</p><span class="time_date">' + senderID + '</span></div></div></div>';
      }

      messageInput.value = "";
      usernames = response.getUsernamesList();
      var usernameHTML = '';
      for(var i=0; i<usernames.length; i++){
        usernameHTML = usernameHTML + '<div class="chat_list"><div class="chat_people"><div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div><div class="chat_ib"><h5>' +
        usernames[i] + '</h5></div></div></div>';
      }
      usernameList.innerHTML = usernameHTML;
    });
  }

  messageSend.onclick = function() {
    var request = new SendMessageRequest();
    request.setMessage(messageInput.value);
    request.setSenderid(receiverID);
    client.sendMessage(request, {}, (err, response) => {
      console.log(response.getStatus());
    });
  }
};
