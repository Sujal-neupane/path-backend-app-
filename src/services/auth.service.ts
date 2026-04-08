import { UserModel } from '../model/auth.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {profile} from 'console';
import {HttpError} from '../error/http-error';
import { AuthRepository } from '../repository/auth.repository';
import { JWT_SECRET } from '../config';


const CLIENT_URL = process.env.CLIENT_URL as string;

export class AuthService {
    async createUser( userData: any){
        const existingUser = await  UserModel.findOne({ email: userData.email });
        if (existingUser) {
            throw new HttpError(400, 'Email already exists');
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = new UserModel({
            full_name: userData.fullName,
            email: userData.email,
            phone_number: userData.phoneNumber,
            password: hashedPassword,
        });
         await user.save();

         const token = jwt.sign(
            {
                id:user._id.toString(),
                email: user.email,
            },
            JWT_SECRET,
            { expiresIn: '30d' }
         ); 
         return {
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                full_name: user.full_name,
                phone_number: user.phone_number,
            }
         }
    }
    
    async loginUser (email: string, password: string) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new HttpError(404, 'User not found');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new HttpError(401, 'Invalid credentials');
        }
        const token = jwt.sign(
            {
                id: user._id.toString(),
                email: user.email,
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        return {
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
            }
        };
    }

    async getUserById (userId: string) {
        const user = await UserModel.findById(userId);

        if (!user) {
            throw new HttpError(404, 'User not found');
        }
        return {
            id: user._id.toString(),
            email: user.email,
        };
    }

    async updateUser (userId: string, updateData: any) {

        const user = await UserModel.findByIdAndUpdate(
            userId,
            {$set: updateData},
            {new: true}
        );
        if (!user) {
            throw new HttpError(404, 'User not found');
        }
        return {
            id: user._id.toString(),
            email: user.email,
        };
    }
}

// so for the auth service basically we impemented the business logic for the authentication and user management and we are using the auth repository to interact with the database and we are also using the http error class to handle the errors and we are also using the jwt to generate the token for the user and we are also using bcrypt to hash the password for the user and we are also using the zod to validate the request body for the login and register routes