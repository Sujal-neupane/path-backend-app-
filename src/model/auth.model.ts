import mongoose, { Document, Schema } from 'mongoose';
import { LoginSchema, RegisterSchema } from '../types/auth.types';
import { time } from 'node:console';


const UserSchema: Schema = new Schema(
    {
        full_name: { type: String, required:true},
        email: { type: String, required: true, unique:true},
        phone_number: { type: String, required: true},
        password: { type: String, required: true},
    },{
    timestamps: true
    }
);

export interface IUser extends Document {
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);