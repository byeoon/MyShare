function coreLogMessage(...messages) {
    console.log('[Core]', ...messages);
}

function securityLogMessage(...messages) {
    console.log('[Security]', ...messages);
}

function notesLogMessage(...messages) {
    console.log('[Notes]', ...messages);
}

module.exports = {
    coreLogMessage,
    securityLogMessage,
    notesLogMessage,
};
