import mongoose, { Mongoose } from "mongoose";
import Database from "../Database.mts";

export default class MongoDatabase extends Database<Mongoose> {
    mongoClient!: Mongoose;

    constructor() {
        super();
    }
    async connect(): Promise<void> {
        this.setClient(await mongoose.connect(process.env.DATABASE_MONGODB_URI));
    }
    async disconnect(): Promise<void> {
        await this.mongoClient.disconnect();
    }
    getClient(): Mongoose {
        return this.mongoClient;
    }
    setClient(client: Mongoose): void {
        this.mongoClient = client;
    }
}