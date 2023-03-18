'use strict';
const { io } = require('socket.io-client');
const socket = io.connect('http://localhost:3001/games');
// const socket = io.connect('https://adventureai-server.onrender.com/games');
const inquirer = require('inquirer');
const chalk = require('chalk');

function login(){
  inquirer.prompt([{ type: 'list', name: 'sign', message: chalk.green('Welcome to Adventure AI!'), choices: ['Sign in', 'Sign up', 'Continue as guest'] }]).then((answers) => {
    let userObj = {};
    if (answers.sign === 'Sign up') {
      inquirer.prompt([{ type: 'input', name: 'name', message: 'Choose a username' }]).then((answers) => {
        userObj = { ...userObj, ...answers };
        inquirer.prompt([{ type: 'input', name: 'password', message: 'Create a password' }]).then((answers) => {
          userObj = { ...userObj, ...answers };
          inquirer.prompt([{ type: 'list', name: 'role', message: 'choose a role', choices: ['user', 'write', 'admin'] }]).then((answers) => {
            userObj = { ...userObj, ...answers };
            socket.emit('SIGN-UP', userObj);
          });
        });
      });
    } else if (answers.sign === 'Sign in') {
      inquirer.prompt([{ type: 'input', name: 'name', message: 'Enter Username' }]).then((answers) => {
        userObj = { ...userObj, ...answers };
        inquirer.prompt([{ type: 'input', name: 'password', message: 'Enter Password' }]).then((answers) => {
          userObj = { ...userObj, ...answers };
          socket.emit('SIGN-IN', userObj);
        });
      });
    } else {
      console.log('app no work sorry');
    }
  }).catch((error) => {
    if (error.isTtyError) {
      console.log('Prompt could not be rendered in the current environment');
    } else {
      console.log('Something else went wrong');
    }
  });
}

function roomBool(payload){
  inquirer.prompt([{ type: 'list', name: 'roomBool', message: chalk.green('Adventure AI'), choices: ['New Game', 'View active games'] }]).then((answers) => {
    if (answers.roomBool === 'New Game') {
      socket.emit('NEW-GAME', payload);
    }
    // else if (answers.roomBool === 'Continue game') {
    //   socket.emit('CONTINUE-GAME', {...payload, ...answers});
    // } 
    else {
      socket.emit('VIEW-GAMES', payload);
    }
  });
}

async function main(user){

  console.log(chalk.green(`Hello ${user.user.name}`));
  let userWantsToExit = false;

  while (!userWantsToExit) {
    await inquirer.prompt([{ type: 'input', name: 'message', message: 'Enter a message (type "bye" to exit): ' }]).then((answers) => {
      userWantsToExit = answers.message === 'bye';
      if (!userWantsToExit) {
        socket.emit('NEW-MESSAGE', { queueId: 'adventureGame', message: answers.message });
      }
    });
  }
  socket.disconnect();
}

socket.on('AI-REPLY', payload => {
  console.log('AI: ', payload.message);
});

socket.on('LOGGED-IN', payload => {
  roomBool(payload);
  // main(payload);
  // payload.message = 'hello';
  // socket.emit('NEW-MESSAGE', payload);
});

socket.on('ALL-ROOMS', payload => {
  let q = payload.allRooms;
  if (payload.allRooms.length) {
    inquirer.prompt([{ type: 'list', name: 'userRoom', message: chalk.green('Available rooms'), choices: q }]).then((answers) => {
      socket.emit('JOIN-ROOM', {...answers, ...payload});
    });
  } else {
    console.log('No available rooms');
    roomBool(payload);
  }
});

login();
