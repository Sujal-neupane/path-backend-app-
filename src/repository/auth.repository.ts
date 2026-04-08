
import { UserModel, IUser } from "../model/auth.model";

export interface IAuthRepository {
    getUserByEmail (email: string): Promise<IUser | null>;
    getUserById (id: string): Promise<IUser | null>;
    createUser (userData: Partial<IUser>): Promise<IUser>;
    updateUser (id: string, updateData: Partial<IUser>): Promise<IUser | null>;
    deleteUser (id: string): Promise<IUser | null>;
}
// made iauthrepository for the calling crud operations in the service layer and also to make the code more modular and testable by separating the database operations from the business logic in the service layer

export class AuthRepository implements IAuthRepository {
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(userData);
        return await user.save();
    }
    
    async getUserByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email });
    } 
    
    async getUserById(id: string): Promise<IUser | null> {
        return await UserModel.findById(id);
    }
    
    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    }
    
    async deleteUser(id: string): Promise<IUser | null> {
        return await UserModel.findByIdAndDelete(id);
    }
}