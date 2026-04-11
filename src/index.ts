
import { app } from './app';
import {PORT, NODE_ENV } from './config/index';
import { connectDatabase } from './database/mongodb';




async function startServer() {
    try {
        await connectDatabase();
        
        app.listen(PORT, '127.0.0.1', () => {
            console.log(` Server running at http://localhost:${PORT}`);
            console.log(` Server accessible at http://127.0.0.1:${PORT}`); // make this 127.0.0.1 because localhost can be resolved to both ipv4 and ipv6 and it can cause some issues in some environments so it's better to use
            console.log(` Environment: ${NODE_ENV}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();