// server.ts
import app from './app.ts';

// add PORT and APP_ENV to your .env file
app.listen(process.env["PORT"], () => {
    console.log(`Server running on port ${process.env["PORT"]}`); 
    console.log(`Environment ${process.env["APP_ENV"]}`);
});