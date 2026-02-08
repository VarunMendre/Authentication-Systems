import mongoose from "mongoose";

export async function connectDB() {
    try {
        await mongoose.connect(
          "mongodb://admin:admin@127.0.0.1:27017/?replicaSet=myReplicaSet"
        );
        console.log("DB Connected");
    } catch (err) {
        console.log(err);
        console.log("DB Couldn't connect");
        process.exit(1);
    }
}

process.on("SIGINT", async () => {
    await mongoose.disconnect();
    console.log("Client Disconnected");
    process.exit(0);
});
