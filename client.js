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
  var myUsername = '';

  const { JoinChatRequest,
          JoinChatResponse,
          SendMessageRequest,
          SendMessageResponse,
          LeaveChatRequest,
          LeaveChatResponse
        } = require('./chat_pb.js');

  const {ChatClient} = require('./chat_grpc_web_pb.js');

  var client = new ChatClient('http://' + window.location.hostname + ':8080', null, null);

  joinButton.onclick = function(){
    myUsername = usernameInput.value;
    if(myUsername){

      var joinChatRequest = new JoinChatRequest();

      joinChatRequest.setUsername(myUsername);

      var chatStream = client.joinChat(joinChatRequest, {});
      joinDiv.innerHTML = "";
      chatDiv.style.visibility = "visible";

      chatStream.on('data', (response) => {
        receiverID = response.getReceiverid();
        senderID = response.getSenderid();
        var messageType = response.getMessagetype();
        var newMessage = response.getMessage();

        var formattedMessage = "";
        if(messageType==="update"){
          messageHistory.innerHTML += '<div class="update_chat"><p class="update_chat">' + newMessage + '</p></div>';
        }
        else if(messageType=="error"){
          messageHistory.innerHTML += '<div class="update_chat danger"><p class="update_chat">ERROR: ' + newMessage + '</p></div>';
        }
        else if(receiverID===senderID){
          messageHistory.innerHTML += '<div class="outgoing_msg"><div class="sent_msg"><p>' + newMessage + '</p></div></div>';
        }
        else {
          messageHistory.innerHTML += '<div class="incoming_msg"><div class="incoming_msg_img"><img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"></div><div class="received_msg"><div class="received_withd_msg"><p>' + newMessage + '</p></div></div></div>';
        }

        messageInput.value = "";
        usernames = response.getUsersList();
        usernameList.innerHTML = "";

        for (var i=0; i< usernames.length; i++){
          var user = usernames[i];
          var activeChatDiv = '<div class="chat_list">';
          if(senderID===user.getUserid()){
            	activeChatDiv = '<div class="chat_list active_chat">';
          }
          usernameList.innerHTML += activeChatDiv + '<div class="chat_people"><div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div><div class="chat_ib"><h5>' + user.getUsername() + '</h5></div></div></div>';
        }
      });
    }
    else {
      alert("No Username Input");
    }
  }

  messageSend.onclick = function() {
    if(messageInput.value){
      var request = new SendMessageRequest();
      request.setMessage(messageInput.value);
      request.setSenderid(receiverID);
      client.sendMessage(request, {}, (err, response) => {

      });
    }
    else {
      alert("no message input");
    }
  }
  window.addEventListener('beforeunload', function(event) {
    var request = new LeaveChatRequest();
    request.setSenderid(receiverID);
    request.setUsername(myUsername);
    client.leaveChat(request, {}, (err, response) => {
      console.log("Removed from Chat User List");
    });
  });
};
