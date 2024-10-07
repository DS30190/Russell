const mongoose = require('mongoose');
require('dotenv').config(); // Assurez-vous que cela est importé en haut de votre fichier

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connecté: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Erreur de connexion à MongoDB: ${err.message}`);
        process.exit(1); // Arrête l'application en cas d'erreur de connexion
    }
};

module.exports = connectDB;


