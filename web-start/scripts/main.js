/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
// Initializes MotivateMe.
function MotivateMe() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');
  this.specificDate = document.getElementById('specific-date');

  // Saves message on form submit.
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
MotivateMe.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Loads chat messages history and listens for upcoming ones.
MotivateMe.prototype.loadMessages = function() {
  // Reference to the /messages/ database path.
  const userRef = this.userRef = this.database.ref('users');
  this.userRef.off();
  this.messagesRef = this.database.ref('messages');
  this.messagesRef.off();

  var uid = this.auth.currentUser.uid.toString();

  // this.userRef.once('value', function(snapshot) {
  //   if (snapshot.hasChildren()) {
  //     inDatabase = true;
  //   }
  // });

  console.log(this.database.ref('users/Ray'));
  console.log(uid);
  console.log(this.userRef);

userRef.once("value")
    .then(function(snapshot) {
      console.log('has child', uid)
  if (!snapshot.hasChild(uid)) {
    console.log('entered poop');
    const entry = { }
    entry[uid] = {"taskList": {0:
                                {"taskID": "empty",
                                "status": "emptyStatus"}
                              }};
    userRef.update(entry)
    // this.taskListRef = this.database.ref('users/' + uid);
    // this.taskListRef.update({taskList: []});


    // this.userRef.push({name: {"taskList": []}});
    // this.userRef.update({"user": {"taskList": []}});
  }
})

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.deadline);
  }.bind(this);
  this.messagesRef.limitToLast(12).on('child_added', setMessage);
  this.messagesRef.limitToLast(12).on('child_changed', setMessage);
};

// Saves a new message on the Firebase DB.
MotivateMe.prototype.saveMessage = function(e) {

  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.messageInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;

    // Add a new message entry to the Firebase Database.
    this.messagesRef.push({
      name: currentUser.displayName,
      text: this.messageInput.value,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png',
      deadline: this.specificDate.value || new Date(Date.now()+2.592e+9).toISOString().substring(0,10)
    }).then(function() {
      // Clear message text field and SEND button state.
      MotivateMe.resetMaterialTextfield(this.messageInput);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
MotivateMe.prototype.saveImageMessage = function(event) {
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  this.imageForm.reset();

  // Check if the user is signed-in
  if (this.checkSignedInWithMessage()) {

    // We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.auth.currentUser;
    this.messagesRef.push({
      name: currentUser.displayName,
      imageUrl: MotivateMe.LOADING_IMAGE_URL,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function(data) {
      // Upload the image to Firebase Storage.
      this.storage.ref(currentUser.uid + '/' + Date.now() + '/' + file.name)
          .put(file, {contentType: file.type})
          .then(function(snapshot) {
            // Get the file's Storage URI and update the chat message placeholder.
            var filePath = snapshot.metadata.fullPath;
            data.update({imageUrl: this.storage.ref(filePath).toString()});
          }.bind(this)).catch(function(error) {
            console.error('There was an error uploading a file to Firebase Storage:', error);
          });
    }.bind(this));
  }
};

// Signs-in Friendly Chat.
MotivateMe.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat.
MotivateMe.prototype.signOut = function() {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
MotivateMe.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // We load currently existing chant messages.
    this.loadMessages();

  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
MotivateMe.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Resets the given MaterialTextField.
MotivateMe.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
MotivateMe.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +

      '<div class ="join"><button class="mdl-button" type="button">Join</button></div>'+
      '<div class="input"><input class="filled-in" type="checkbox"></input><div class="deadline"></div> <div class="usrCnt"></div></div>' +
    '</div>';

// Displays a Message in the UI.
MotivateMe.prototype.displayMessage = function(key, name, text, picUrl, deadline) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = MotivateMe.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.messageList.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }

  var messageElement = div.querySelector('.message');
  messageElement.textContent = text;

  if (deadline){
    var deadlineElement = div.querySelector('.deadline');
    deadlineElement.textContent = deadline;
  }


  var input = div.querySelector('.input').firstChild;

  var uid = firebase.auth().currentUser.uid;
  var taskListRef = this.database.ref("users/" + uid + "/taskList");

  console.log('Input Name', name)
  console.log('curr user name', firebase.auth().currentUser.displayName)

  taskListRef.once('value', function(snapshot) {
    var count = 1;
    if (name == firebase.auth().currentUser.displayName && count == 1){
    console.log("equal asss")
    const entry = { }
    var a = snapshot.numChildren()
    console.log('index', a);
    entry[a] = {"taskID": key, "status": true}
    taskListRef.update(entry)
    count = count + 1
  }
   });

  input.addEventListener('click', this.finishTask.bind(this, key));

  var join = div.querySelector('.join').firstChild;
  join.addEventListener('click', this.disableButton.bind(this, join));
  join.addEventListener('click', this.joinTask.bind(this, key, name));
  // Replace all line breaks by <br>.
  messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');

  // Show the card fading-in and scroll to view the new message.
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  }

  // Show the card fading-in.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
  this.messageInput.focus();
};

MotivateMe.prototype.disableButton = function(inDiv) {
  inDiv.setAttribute('disabled', 'true');
}

MotivateMe.prototype.joinTask = function(key, name) {

  var div = document.getElementById(key);
  // div.value = "Joined!"
  var uid = firebase.auth().currentUser.uid;
  var currUser = firebase.auth().currentUser.displayName;
  var taskListRef = this.database.ref("users/" + uid + "/taskList");
  taskListRef.once('value', function(snapshot) {
    var count = 1
    if (name != currUser && count == 1){
    const entry = { }
    var a = snapshot.numChildren();
    console.log('index', a);
    entry[a] = {"taskID": key, "status": true}
    taskListRef.update(entry)
    count = count + 1
  }
   });

   var taskRef = this.database.ref("messages/" +key + "/usrs")
   taskRef.once('value', function(snapshot) {
     var count = 1;
     if (count == 1 && name != currUser) {
     var a = snapshot.numChildren();
     const entry = { };
     entry[a] = uid;
     taskRef.update(entry);
     console.log("log", a);
     div.querySelector('.usrCnt').textContent = "Number of Users: " + a.toString();
     count = count + 1;
   }
   })


}

MotivateMe.prototype.finishTask = function(key) {
  var div = document.getElementById(key);
  div.parentNode.removeChild(div);
  this.database.ref("messages/"+key).remove();
}

// Enables or disables the submit button depending on the values of the input
// fields.
MotivateMe.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
MotivateMe.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.');
  } else if (config.storageBucket === '') {
    window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
        'actually a Firebase bug that occurs rarely. ' +
        'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
        'and make sure the storageBucket attribute is not empty. ' +
        'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
        'displayed there.');
  }
};

window.onload = function() {
  window.friendlyChat = new MotivateMe();
};
