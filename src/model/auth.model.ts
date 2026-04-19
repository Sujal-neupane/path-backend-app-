import { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        full_name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 80,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        phone_number: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Keep API responses clean by removing internal Mongo fields.
UserSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        ret.id = ret._id?.toString();
        delete ret._id;
        return ret;
    },
});

export const UserModel = model<IUser>('User', UserSchema);