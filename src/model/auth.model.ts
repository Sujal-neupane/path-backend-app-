import mongoose, { Document, Schema } from 'mongoose';
import { LoginSchema, RegisterSchema } from '../types/auth.types';
import { time } from 'node:console';


const Login: Schema = new Schema({
    email:{ type: String, required: true, unique:true},
    password:{ type: String, required: true},
}, { timestamps: true });

const Register: Schema =new Schema(
    {
        full_name: { type: String, required:true},
        email: { type: String, required: true, unique:true},
        phone_number: { type: String, required: true},
        password: { type: String, required: true},
    },{
    timestamps: true
    }
)

export interface ILogin extends Document {
    email: string;
    password: string;
}

export interface IRegister extends Document {
    full_name: string;
    email: string;
    phone_number: string;
    password: string;
}

export const LoginModel = mongoose.model<ILogin>('Login', Login);
export const RegisterModel = mongoose.model<IRegister>('Register', Register);