import { MuServer } from '../../../server';
import { MuChildProcessSocketServer } from '../server';

module.exports = () => {
    const socketServer = new MuChildProcessSocketServer();
    const muServer = new MuServer(socketServer);

    muServer.start();
};
