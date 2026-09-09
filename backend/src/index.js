const AppDataSource = require('./database');
const app = require('./app');
const { coreLogMessage } = require('./utils/Logger');
const PORT = process.env.PORT || 3010;

AppDataSource.initialize()
    .then(() => {
        app.listen(PORT, () => coreLogMessage(`Server running on ${process.env.PORT}`));
    })
    .catch((error) => {
        coreLogMessage('Error while initializing server:', error?.stack || error?.message || error);
    });
