import mongoose, { Schema, model, Types } from "mongoose";
import slugify from "slugify";

const memberSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["owner", "admin", "member", "viewer"],
            default: "member",
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const workspaceSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50,
        },

        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 300,
        },

        color: {
            type: String,
            default: "#FF5733",
            match: /^#([0-9A-F]{3}){1,2}$/i, // HEX validation
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        members: {
            type: [memberSchema],
            validate: [(val) => val.length > 0, "At least one member required"],
        },

        projects: [
            {
                type: Schema.Types.ObjectId,
                ref: "Project",
            },
        ],

        isActive: {
            type: Boolean,
            default: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },

        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

workspaceSchema.index({ name: "text", description: "text" });
workspaceSchema.index({ owner: 1, createdAt: -1 });

workspaceSchema.pre("save", async function () {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }

    // Ensure owner is always in members
    if (this.owner) {
        const isOwnerExists = this.members.some(
            (m) => m.user.toString() === this.owner.toString()
        );

        if (!isOwnerExists) {
            this.members.push({
                user: this.owner,
                role: "owner",
            });
        }
    }
});


workspaceSchema.methods.hasAccess = function (
    userId,
    role
) {
    const member = this.members.find(
        (m) => m.user.toString() === userId.toString()
    );

    if (!member) return false;

    const roleHierarchy = ["viewer", "member", "admin", "owner"];

    return (
        roleHierarchy.indexOf(member.role) >= roleHierarchy.indexOf(role)
    );
};



workspaceSchema.statics.findActive = function () {
    return this.find({ isDeleted: false, isActive: true });
};



workspaceSchema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
};


const Workspace = model("Workspace", workspaceSchema);

export default Workspace;