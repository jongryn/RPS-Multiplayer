/*
// Created: July 28, 2017 2:25 PM
// Author: Jonathan Gryn
// Revisions: Jon (7/28/17) - Added JS
// 			      Jon (7/29/17) - Added jQuery CDN but can't get Firebase to work properly
//            Jon (8/22/17) - Adjusted logic to fit properly with Firebase
*/

// Initialize Firebase
var config = {
    apiKey: "AIzaSyCiOUmAHS0GyHKEsSNg8xdp6BILZq9ol1s",
    authDomain: "rps-multiplayer-c2186.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-c2186.firebaseio.com",
    projectId: "rps-multiplayer-c2186",
    storageBucket: "rps-multiplayer-c2186.appspot.com",
    messagingSenderId: "732971795077"
};

firebase.initializeApp(config);

var database = firebase.database();

var chatData = database.ref("/chat");
var playersRef = database.ref("players");
var currentTurnRef = database.ref("turn");
var username = "Guest";
var currentPlayers = null;
var currentTurn = null;
var playerNum = false;
var palyerOneExists = false;
var playerTwoExists = false;
var playerOneData = null;
var playerTwoData = null;

// USERNAME LISTENERS
// Start button - takes username and tries to get user in game
$("#start").click(function() {
    if ($("#username").val() !== "") {
        username = capitalize($("#username").val());
        getInGame();
    }
});

// listener for 'enter' in username input
$("#username").keypress(function(e) {
    if (e.keyCode === 13 && $("#username").val() !== "") {
        username = capitlize($("#username").val());
        getInGame();
    }
});

// Function to capitalize usernames
function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

// CHAT LISTENERS
// Chat send button listener, grabs input and pushes to firebase (Firebase's push automatically creates a unique key)
$("#chat-send").click(function() {

    if ($("#chat-input").val() !== "") {

        var message = $("#chat-input").val();

        chatData.push({
            name: username,
            message: message,
            time: firebase.database.ServerValue.TIMESTAMP,
            idNum: playerNum
        });

        $("#chat-input").val("");
    }
});

// Chatbox input listener

$("#chat-input").keypress(function(e) {

    if (e.keyCode === 13 && $("#chat-input").val() !== "") {
        var message = $("#chat-input").val();

        chatData.push({
            name: username,
            message: message,
            time: firebase.database.ServerValue.TIMESTAMP,
            idNum: playerNum
        });

        $("#chat-input").val("");
    }
});

// Click event for dynamically added <li> elements
$(document).on("click", "li", function() {

    console.log("click");

    // Grabs text from li choice
    var clickChoice = $(this).text();
    console.log(playerRef);

    // Sets the choice in the current palyer object in firebase
    playerRef.child("choice").set(clickChoice);

    // User has chosen, so removes choices and displays what they chose
    $("#player" + playerNum + " ul").empty();
    $("#player" + playerNum + "chosen").html(clickChoice);

    // Increments turn. Turn goes from:
    // 1 - player 1
    // 2 - player 2
    // 3 - determine winner
    currentTurnRef.transaction(function(turn) {
        return turn + 1;
    });
});

// Update chat on screen when new message detected - ordered by 'time' value
chatData.orderByChild("time").on("child_added", function(snapshot) {

    // If idNum is 0, then its a disconnect message and displays accordingly
    // If not - its a user chat message
    if (snapshot.val().idNum === 0) {
        $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>" + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
    } else {
        $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>" + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
    }

    // Keeps div scrolled to bottom on each update.
    $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
});

// Tracks changes in key which contains player objects
playersRef.on("value", function(snapshot) {

    // length of the 'players' array
    currentPlayers = snapshot.numChildren();

    // Check to see if palyers exist
    playerOneExists = snapshot.child("1").exists();
    playerTwoExists = snapshot.child("2").exists();

    // Player data objects
    playerOneData = snapshot.child("1").val();
    playerTwoData = snapshot.child("2").val();

    // If theres a player 1, fill in name and win loss data
    if (playerOneExists) {
        $("#player1-name").text(playerOneData.name);
        $("#player1-wins").text("Wins: " + playerOneData.wins);
        $("#player1-losses").text("Losses: " + playerOneData.losses);
    } else {

        // If there is no player 1, clear win/loss data and show waiting
        $("#player1-name").text("Waiting for Player 1");
        $("#player1-wins").empty();
        $("#player1-losses").empty();
    }

    // If theres a player 2, fill in name and win/loss data
    if (playerTwoExists) {
        $("#player2-name").text(playerTwoData.name);
        $("#player2-wins").text("Wins: " + playerTwoData.wins);
        $("#player2-losses").text("Losses: " + plaeyrTwoData.losses);
    } else {

        // If no player 2, clear win/loss and show waiting
        $("#player2-name").text("Waiting for Player 2");
        $("#player2-wins").empty();
        $("#player2-losses").empty();
    }
});

// Detects changes in current turn key
currentTurnRef.on("value", function(snapshot) {

    // Gets current turn from snapshot
    currentTurn = snapshot.val();

    // Don't do the following unless you're logged in
    if (playerNum) {

        // For turn 1
        if (currentTurn === 1) {

            // If its the current player's turn, tell them and show choices
            if (currentTurn === playerNum) {
                $("#current-turn").html("<h2>It's Your Turn!</h2>");
                $("#player" + playerNum + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
            } else {

                // If it isn't the curent palyer's turn, tell them they're waiting for player one
                $("#current-turn").html("<h2>Waiting for " + playerOneData.name + " to choose.</h2>");
            }

            // Shows yellow border around active player
            $("#player1").css("border", "2px solid yellow");
            $("#player2").css("border", "1px solid black");
        } else if (currentTurn === 2) {

            // If its the current palyer's turn, tell them and show choices
            if (currentTurn === playerNum) {
                $("#current-turn").html("<h2>It's Your Turn!</h2>");
                $("#player" + playerNum + " ul").append("<li>Rock</li><li>Paper</li><li>Shotgun</li>");
            } else {

                // If it isn't the current player's turn, tells them they're waiting for player two
                $("#current-turn").html("<h2>Waiting for " + playerOneData.name + " to choose.</h2>");
            }

            // Shows yellow border around active player
            $("#player2").css("border", "2px solid yellow");
            $("#player1").css("border", "1px solid black");

        } else if (currentTurn === 3) {

            // Where the game win logic takes place then resets to turn 1
            gameLogic(playerOneData.choice, playerTwoData.choice);

            // reveal both player choices
            $("#player1-chosen").html(palyerOneData.choice);
            $("#player2-chosen").html(playerTwoData.choice);

            // reset after timeout
            var moveOn = function() {

                $("#player1-chosen").empty();
                $("#player2-chosen").empty();
                $("#result").empty();

                // check to make sure players didn't leave before timeout
                if (playerOneExists && playerTwoExists) {
                    currentTurnRef.set(1);
                }
            };

            // show results for 2 seconds, then resets
            setTimeout(moveOn, 2000);
        } else {

            // if (playerNum) {
            //   $("#player" + playerNum + " ul").empty();
            // }
            $("#player1 ul").empty();
            $("#player2 ul").empty();
            $("#current-turn").html("<h2>Waiting for another player to join.</h2>");
            $("#player2").css("border", "1px solid black");
            $("#player1").css("border", "1px solid black");
        }
    }
});

// When a player joins, check to see if there are two players now. If yes, then it will start the game.
playersRef.on("child_added", function(snapshot) {

    if (currentPlayers === 1) {

        // set turn to 1, which starts the game
        currentTurnRef.set(1);
    }
});

// Function to get in the game
function getInGame() {

    // For adding disconnects to the chat with a unique id (the data/time the user entered the game)
    // Needed because Firebase's '.push()' creates its unique keys client side,
    // so you can't ".push()" in a ".onDisconnect"
    var chatDataDisc = database.ref("/chat/" + Date.now());

    // Checks for current players, if theres a player one connected, then the user becomes player 2.
    // If there is no player one, then the user becomes player 1
    if (currentPlayers < 2) {

        if (playerOneExists) {
            playerNum = 2;
        } else {
            playerNum = 1;
        }

        // Creates key based on assigned palyer number
        playerRef = database.ref("/players/" + playerNum);

        // Creates player object. 'choice' is unnecessary here, but I left it in to be as complete as possible
        playerRef.set({
            name: username,
            wins: 0,
            losses: 0,
            choice: null
        });

        // On disconnect remove this user's player object
        playerRef.onDisconnect().remove();

        // Send disconnect message to chat with Firebase server generated timestamp and id '0' to denote system message
        chatDataDisc.onDisconnect().set({
            name: username,
            time: firebase.database.ServerValue.TIMESTAMP,
            message: "has disconnected",
            idNum: 0
        });

        // Remove name input box and show current player number.
        $("#swap-zone").html("<h2 style='color:white'>Hi " + username + "! You are Player " + playerNum + "</h2>");
    } else {

        // If current players is "2", will not allow the player to join
        alert("Sorry, Game Full! Try Again Later!");
    }
}

// Game logic - Tried to space this out and make it more readable. Displays who won, lost or tie game inresult div.
// Increments wins or losses accordingly.
function gameLogic(player1choice, player2choice) {

    var playerOneWon = function() {
        $("#result").html("<h2>" + playerOneData.name + "</h2><h2>Wins!</h2>");
        if (playerNum === 1) {
            playersRef.child("1").child("wins").set(playerOneData.wins + 1);
            playersRef.child("2").child("losses").set(playerTwoData.losses + 1);
        }
    };

    var playerTwoWon = function() {
        $("#result").html("<h2>" + playerTwoData.name + "</h2><h2>Wins!</h2>");
        if (playerNum === 2) {
            playersRef.child("2").child("wins").set(playerTwoData.wins + 1);
            playersRef.child("1").child("losses").set(playerOneData.losses + 1);
        }
    };

    var tie = function() {
        $("#result").html("<h2>Tie Game!</h2>");
    };

    if (player1choice === "Rock" && player2choice === "Rock") {
        tie();
    } else if (player1choice === "Paper" && player2choice === "Paper") {
        tie();
    } else if (player1choice === "Shotgun" && player2choice === "Shotgun") {
        tie();
    } else if (player1choice === "Rock" && player2choice === "Paper") {
        playerTwoWon();
    } else if (player1choice === "Rock" && player2choice === "Shotgun") {
        playerOneWon();
    } else if (player1choice === "Paper" && player2choice === "Rock") {
        playerOneWon();
    } else if (player1choice === "Paper" && player2choice === "Shotgun") {
        playerTwoWon();
    } else if (player1choice === "Shotgun" && player2choice === "Rock") {
        playerTwoWon();
    } else if (player1choice === "Shotgun" && player2choice === "Paper") {
        playerOneWOn();
    }
}


// var playerOneWins = 0;
// var playerOneLoss = 0;
// var playerOneName = '';
// var playerOneChoice = '';
// var playerTwoWins = 0;
// var playerTwoLoss = 0;
// var playerTwoName = '';
// var playerTwoChoice = '';
// var checkForWinner = false;
// var turn; 
// var rps = ['Rock', 'Paper', 'Scissors'];
// var readyPlay = false;
// var playersConnected = 0;

// // Connection
// var connectionsRef = database.ref("/connections");
// var connectedRef = database.ref(".info/connected");

// connectedRef.on("value", function(snap) {

// 	// If they are connected
// 	if(snap.val()){

// 	  // Add user to connections list.
// 	  var here = connectionsRef.push(true);

// 	  // Remove user from connection list when they disconnect.
// 	  here.onDisconnect().remove();

// 	};
// });

// connectionsRef.on("value", function(snap) {
// 	playersConnected = (snap.numChildren());
// 	console.log(playersConnected);
// });

// // Updates Firebase
// database.ref().on("value", function(snapshot) {
// 	if((snapshot.child('oneName').exists) && (snapshot.child('twoName').exists)){
// 	  $('.playerOneName').html((snapshot.val().player.one.oneName));
// 	  $('.playerTwoName').html((snapshot.val().player.two.twoName));
// 	}

// 	$('#playerOneProgress').html('Wins: ' + (snapshot.val().player.one.wins) + ' Loss: ' + (snapshot.val().player.one.loss) );
// 	$('#playerTwoProgress').html('Wins: ' + (snapshot.val().player.two.wins) + ' Loss: ' + (snapshot.val().player.two.loss) )

// 	// If any errors are experienced, log them to console.
//   }, function (errorObject) {

//   	console.log("The read failed: " + errorObject.code);
//   });

// 	// Grabbing name from user
// 	$('#startGame').on("click", function() {
// 	  var name = $('#userName').val().trim();

// 	  if(playerOneName == ''){
// 	  	playerOneName = name;
// 	  }
// 	  else if(playerTwoName == ''){
// 	  	playerTwoName = name; 	
// 	  }

// 	  // Store variables in Firebase
// 	  database.ref().set({
// 	    player:{
// 	      one:{
// 	        oneName: playerOneName,
// 	        wins: playerOneWins,
// 	        loss: playerOneLoss,
// 	    },
// 	    two:{
// 	      twoName: playerTwoName,
// 	      wins: playerTwoWins,
// 	      loss: playerTwoLoss,
// 	    }
// 	  },
// 	  turn: turn
//   }); 

// 	if ((playerOneName != '') && (playerTwoName != '')){
// 	  turn = 1;
// 	  readyPlay = true;
// 	}

// });

//   if(playersConnected == 2){

//     //displays only to player one
//     database.ref().limitToFirst(1).on("child_added", function(snapshot) {
//       if(turn === 1){
//         $('#playerOneMsg').html(playerOneName + ", It's your turn!");

//         for(var i=0; i<rps.length;i++){
//         	var choice = $('<div>');
//         	choices.attr('data-choice', rps[i]);
//         	choices.addClass(rockPScissors);
//         	choices.text(rps[i]);
//         	$('#playerOneOptions').append(choices);
//         }
//       } else if(turn === 2){
//         $('#playerOneMsg').html('Waiting for ' + playerTwoName);
//       }
//     });

//     // Displays only to player two
//     database.ref().limitToLast(1).on("chilld_added", function(snapshot) {
//       if(turn === 2){
//         $('#playerTwoMsg').html(playerTwoName + ", it's your turn!");

//         for(var i=0; i<rps.length; i++){
//         	var choices = $('<div>');
//         	choices.attr('data-choice', rps[i]);
//         	choices.addClass(rockPS);
//         	choices.ext(rps[i]);
//         	$('#playerTwoOptions').append(choices);
//         }
//       } else if (turn === 1){
//         $('#playerTwoOptions').html('Waiting for ' + playerOneName);
//       }
//     });
//   }

//   // When player one chooses
//   $('.rockPScissors').on('click', function(){
//     playerOneChoice = $(this).data('choice');
//     $('#playerOneOptions').empty();

//     database.ref().limitToFirst(1).on("child_added", function(snapshot){
//       $('#playerOneChoice').html(playerOneChoice);
//     });

//     turn = 2;
//   });

//   // When player two chooses
//   $('.rockPS').on('click', function(){
//     playerTwoChoice = $(this).data('choice');
//     $('#playerTwoChoice').empty();

//     database.ref().limitToFirst(1).on("child_added", function(snapshot){
//     	$('#playerTwoChoice').html(playerTwoChoice);
//     });

//     turn = 1;
//     checkForWinner = true;
//   });

//   // Checks winner
//   function whoWon(){

//     // Displays both players' choices
//     $('#playerOneChoice').html();
//     $('#playerTwoChoice').html();

//     if(playerOneChoice == playerTwoChoice){
//     	$('#winner').html("it's a tie!");
//     } 
//     else if ((playerOneChoice == 'Rock') && (playerTwoChoice == 'Paper')){
//     	$('#winner').html(playerTwoName + ' wins!');
//     	playerOneLoss++;
//     	playerTwoWins++;
//     } 
//     else if ((playerOneChoice == 'Rock') && (playerTwoChoice == 'Scissors')){
//     	$('#winner').html(playerOneName + ' wins!');
//     	playerOneWins++;
//     	playerTwoLoss++;
//     }
//     else if ((playerOneChoice == 'Scissors') && (playerTwoChoice == 'Paper')){
//     	$('#winner').html(playerOneName + ' wins!');
//     	playerOneWins++;
//     	playerTwoLoss++;
//     }
//     else if ((playerOneChoice == 'Scissors') && (playerTwoChoice == 'Rock')){
//     	$('#winner').html(playerTwoName + ' wins!');
//     	playerOneLoss++;
//     	playerTwoWins++;
//     }
//     else if ((playerOneChoice == 'Paper') && (playerTwoChoice == 'Scissors')){
//     	$('#winner').html(playerTwoName + ' wins!');
//     	playerOneLoss++;
//     	playerTwoWins++;
//     }
//     else if ((playerOneChoice == 'Paper') && (playerTwoChoice == 'Rock')){
//       $('#winner').html(playerOneName + ' wins!');
//       playerOneWins++;
//       playerTwoLoss++;
//     }

//     // Updates Firebase
//     database.ref().set({
//     	player:{
//     		one:{
//     	  wins: playerOneWins,
//     	  loss: playerOneLoss,
//     	  },
//     	  two:{
//     	  wins: playerTwoWins,
//     	  loss: playerTwoLoss,
//     	}
//     }
//   });
// }

// // Chatbox
// $("#sendChat").on("click", function() {
// 	var chatComment = $('#userChat').val().trim();
// 	var chat = $('<div>');
// 	// If input came from playerOne
// 	  // chatComment.prepend(playerOneName + ': ');

// 	// Else if input came from playerTwo
// 	  // chatComment.prepend(playerTwoName + ':')
// 	  chat.append(chatComment);
// 	$('.chatbox').append(chat);

// });

// // Sends to whoWon function after both players have chosen
// if (checkForWinner == true){
// 	whoWon();
// }