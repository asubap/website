import app from "./app";
import dotenv from "dotenv";
import { Server } from "http";
dotenv.config();

const findAvailablePort = async (startPort: number): Promise<number> => {
  const net = require('net');
  
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    
    const tryPort = (port: number) => {
      server.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          tryPort(port + 1);
        } else {
          reject(err);
        }
      });
      
      server.once('listening', () => {
        server.close(() => resolve(port));
      });
      
      server.listen(port);
    };
    
    tryPort(startPort);
  });
};

const startServer = async (): Promise<Server> => {
  try {
    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const availablePort = await findAvailablePort(PORT);
    
    // Store the port in app settings for use in routes
    app.set('port', availablePort);
    
    return new Promise((resolve) => {
      const server = app.listen(availablePort, () => {
        console.log(`🚀 Server running on http://localhost:${availablePort}`);
        resolve(server);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  startServer().then(server => {
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
});

startServer();