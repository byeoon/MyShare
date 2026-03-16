function coreLogMessage(message, ...args) {
    return console.log('\x1b[32m%s\x1b[0m', '[Core] ' + message, ...args);
} 

function securityLogMessage(message, ...args) {
    return console.log('\x1b[31m%s\x1b[0m', "[Security] " + message, ...args);
} 

function notesLogMessage(message, ...args) {
    return console.log('\x1b[36m%s\x1b[0m', "[Notes] " + message, ...args);
} 

module.exports = {
    notesLogMessage: notesLogMessage,
    securityLogMessage: securityLogMessage,
    coreLogMessage: coreLogMessage
  };