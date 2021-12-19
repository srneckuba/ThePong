let running = false;
function scrolldown() {
  document.getElementById("messages_list").scrollTop = document.getElementById("messages_list").scrollHeight;
}
function on_enter_send() {
  var message_input = document.getElementsByTagName("input")[2];
  message_input.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      document.getElementsByTagName("button")[1].click();
    }
  });
}
function refresh() {
  var token = new fernet.Token({
    secret: new fernet.Secret(btoa(md5(document.getElementsByTagName("input")[1].value))),
    ttl: 0,
  });
  messages = document.getElementById('messages_list').getElementsByClassName("message");
  var client_message_list_lenght = Object.keys(messages).length;
  users = document.getElementById("sidebar").getElementsByTagName('div');
  var client_users_list_lenght = Object.keys(users).length;
  var encrypted_request = token.encode("username=" + document.getElementsByTagName("input")[0].value + ";action=recheck;client_message_list_lenght=" + client_message_list_lenght + ";client_users_list_lenght=" + client_users_list_lenght);
  var xmlHttp = new XMLHttpRequest();
  if (!running) {
    console.log(running);
    running = true;
    xmlHttp.timeout = 20000;
    xmlHttp.open( "GET", "http://" + document.getElementsByTagName("p")[0].textContent + "/?arguments=" + encrypted_request, true ); // false for synchronous request
    xmlHttp.send( null );
    xmlHttp.onload = function (e) {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
          document.getElementById("date_time").style.border = "2px dashed #00ff12";
          var encrypted_data = xmlHttp.responseText
          var token = new fernet.Token({
            secret: new fernet.Secret(btoa(md5(document.getElementsByTagName("input")[1].value))),
            token: encrypted_data,
            ttl: 0
          });
          var decrypted_data = token.decode();
          parser = new DOMParser();
          parsed_data = parser.parseFromString(decrypted_data,"text/xml");
          messages_xml = parsed_data.getElementsByTagName("message");
          users_xml = parsed_data.getElementsByTagName("users")[0].getElementsByTagName("user");
          status_xml = parsed_data.getElementsByTagName("status")[0];
          var messages_list_len_before = document.getElementsByClassName("message").length;
          document.getElementsByClassName("messages_list")[0].innerHTML = "";
          for(var i = 0; i < messages_xml.length; i++) {
              var message_xml = messages_xml[i];
              time = message_xml.children[0].textContent;
              username = message_xml.children[1].textContent;
              text = message_xml.children[2].textContent;
              message = document.createElement("div");
              message.setAttribute("class", "message");
              time_html = document.createElement("p")
              time_html.setAttribute("class", "date_time");
              time_html.textContent = time;
              username_html = document.createElement("p");
              username_html.setAttribute("class", "username");
              username_html.textContent = username;
              pointer = document.createElement("p");
              pointer.setAttribute("class", "pointer");
              pointer.textContent = "-->";
              text_html = document.createElement("p");
              text_html.setAttribute("class", "text");
              text_html.textContent = text;
              message.appendChild(time_html);
              message.appendChild(username_html);
              message.appendChild(pointer);
              message.appendChild(text_html);
              document.getElementsByClassName("messages_list")[0].appendChild(message);
          }
          document.getElementsByClassName("sidebar")[0].innerHTML = "";
          for(var i = 0; i < users_xml.length; i++) {
            var user_xml = users_xml[i];
            user_html = document.createElement("div");
            user_html.textContent = user_xml.textContent;
            document.getElementsByClassName("sidebar")[0].appendChild(user_html);
          }
          document.getElementsByClassName("topbar")[0].removeChild(document.getElementsByClassName("topbar")[0].getElementsByTagName("p")[1]);
          server_date_time = document.createElement("p");
          server_date_time.setAttribute("style", "float: right");
          server_date_time.setAttribute("style", "border: 2px dashed #00ff12");
          server_date_time.setAttribute("id", "date_time");
          server_date_time.textContent = status_xml.getElementsByTagName("time")[0].textContent;
          document.getElementsByClassName("topbar")[0].appendChild(server_date_time);
          var messages_list_len_now = document.getElementsByClassName("message").length;
          if (messages_list_len_now !== messages_list_len_before) {
            scrolldown();
          }
          running = false;
        } else {
          running = false;
          console.error(xmlHttp.statusText);
          document.getElementById("date_time").style.border = "2px dashed #ff0000";
          setTimeout(function() {}, 2000);
        }
      }
      };
  } else {
    document.getElementById("date_time").style.border = "2px dashed #ff9100";
  }
  setTimeout(function() {
    refresh();
  }, 200);

}
function send_message() {
  var message = document.getElementsByTagName("input")[2].value;
  var token = new fernet.Token({
    secret: new fernet.Secret(btoa(md5(document.getElementsByTagName("input")[1].value))),
    ttl: 0,
  });
  var encrypted_request = token.encode("username=" + document.getElementsByTagName("input")[0].value + ";action=send_message;message=" + message);
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", "http://" + document.getElementsByTagName("p")[0].textContent + "/?arguments=" + encrypted_request, false ); // false for synchronous request
  xmlHttp.send( null );
  document.getElementsByTagName("input")[2].value = "";
}
function test_password() {
  var token = new fernet.Token({
    secret: new fernet.Secret(btoa(md5(document.getElementsByTagName("input")[1].value))),
    token: document.getElementById("testmessage").textContent,
    ttl: 0
  });
  if (document.getElementsByTagName("input")[0].value !== "") {
    try {
      decrpted_response = token.decode();
      document.getElementsByTagName("input")[1].style.border = "1px dashed white";
      document.getElementsByClassName("login")[0].style.display = "none";
      document.getElementsByClassName("topbar")[0].style.display = "block";
      document.getElementsByClassName("sidebar")[0].style.display = "block";
      document.getElementsByClassName("messages_list")[0].style.display = "block";
      document.getElementsByClassName("message_input")[0].style.display = "block";
      refresh();
    } catch {
      document.getElementsByTagName("input")[1].style.border = "1px dashed red";
    }
  } else {
    document.getElementsByTagName("input")[0].style.border = "1px dashed red";
  }
}
//  var xmlHttp = new XMLHttpRequest();
//  xmlHttp.open( "GET", url, false ); // false for synchronous request
//  xmlHttp.send( null );
//  var encrypted_response = xmlHttp.responseText;
