import mongoose from "mongoose";

export const InstallationStoreSchema = mongoose.model("Installation", new mongoose.Schema({
    teamId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    installation: {
        type: Object,
        required: true,
    },
    createdAt: {
        type: Number,
        default: Date.now,
    },
    updatedAt: {
        type: Number,
        default: Date.now,
    },
}));
