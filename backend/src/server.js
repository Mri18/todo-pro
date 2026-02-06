import app from './app.js';
import { env } from './config/env.js';
import connectDB from './config/db.js';

async function startServer() {
    try {
        await connectDB();  
        app.listen(env.port, () => {
            console.log(`Server is running on port ${env.port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }   
}

startServer();