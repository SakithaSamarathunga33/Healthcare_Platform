// Simple logger utility
const logger = {
    info: (message, ...args) => {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`, ...args);
    },
    success: (message, ...args) => {
        console.log(`[SUCCESS] ${new Date().toISOString()}: ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args);
    },
    debug: (message, ...args) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...args);
        }
    },
    server: (message, ...args) => {
        console.log(`[SERVER] ${new Date().toISOString()}: ${message}`, ...args);
    },
    database: (message, ...args) => {
        console.log(`[DB] ${new Date().toISOString()}: ${message}`, ...args);
    },
    banner: () => {
        console.log('\n🏥 MEDICAL APPOINTMENT SYSTEM 🏥');
        console.log('Server Starting Up...\n');
    },
    connectionSuccess: (host, port) => {
        console.log('\n🎉 CONNECTION SUCCESS 🎉');
        console.log(`🌐 Server running on: http://localhost:${port}`);
        console.log(`🗄️  Database: ${host}`);
        console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    },
    routes: (routes) => {
        console.log('📍 API ROUTES LOADED');
        routes.forEach(route => {
            console.log(`  ${route}`);
        });
        console.log('');
    }
};

export default logger;