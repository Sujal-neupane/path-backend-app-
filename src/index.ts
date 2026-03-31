
import { app } from './app';
import {PORT, NODE_ENV } from './config';
import { connectDatabase } from './database/mongodb';




async function startServer() {
    try {
        await connectDatabase();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(` Server running at http://localhost:${PORT}`);
            console.log(` Server accessible at http://0.0.0.0:${PORT}`);
            console.log(` Environment: ${NODE_ENV}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();