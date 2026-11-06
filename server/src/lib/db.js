import mongoose from "mongoose";

let connectionPromise;

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not set");
    }

    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI)
            .then(() => {
                console.log("MongoDB connected");
            })
            .catch((error) => {
                connectionPromise = undefined;
                throw error;
            });
    }

    await connectionPromise;
};

export { connectDB };