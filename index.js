'use strict';
const readline = require('readline');
const { io } = require('socket.io-client');
const socket = io.connect('http://localhost:3003/games');
const inquirer = require('inquirer');
// const chalk = require('chalk');

//readline provides in-line editing and history capabilities for interactive programs with a command-line interface.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
socket.emit('JOIN', 'adventureGame');

const login = () => {
  inquirer.prompt([{ type: 'list', name: 'sign', message: 'Welcome to Adventure AI!', choices: ['Sign in', 'Sign up', 'Continue as guest'] }]).then((answers) => {
    if (answers.sign === 'Sign up') {
      let userObj = {};
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
      let userObj = {};
      inquirer.prompt([{ type: 'input', name: 'name', message: 'Enter Username' }]).then((answers) => {
        userObj = { ...userObj, ...answers };
        inquirer.prompt([{ type: 'input', name: 'password', message: 'Enter Password' }]).then((answers) => {
          userObj = { ...userObj, ...answers };
          socket.emit('SIGN-IN', userObj);
        });
      });
    } else {
      console.log('continue as guest');
    }
  }).catch((error) => {
    if (error.isTtyError) {
      console.log('Prompt could not be rendered in the current environment');
    } else {
      console.log('Something else went wrong');
    }
  });
};

socket.on('AI-REPLY', payload => {
  console.log('AI: ', payload.message);
});

const main = async () => {
  let userWantsToExit = false;
  socket.emit('GET-MESSAGE', { queueId: 'adventureGame' });

  // we will keep looping until the game is going on and player hasn't typed "bye" which will end the game and end the readline.
  while (!userWantsToExit) {
    const message = await new Promise(resolve => {
      rl.question('Enter a message (type "bye" to exit): ', answer => {
        resolve(answer);
      });
    });
    userWantsToExit = message === 'bye';

    if (!userWantsToExit) {
      socket.emit('NEW-MESSAGE', { queueId: 'adventureGame', message: message });
    }
  }
  rl.close();
  socket.disconnect();
};

login();
// main();
