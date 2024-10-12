import mongoose from "mongoose";

export const UserAuthorizationSchema = mongoose.model("UserAuthorizations", new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    authorizedPermissions: {
        type: Array,
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
