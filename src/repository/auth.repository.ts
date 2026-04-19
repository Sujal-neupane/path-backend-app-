import { UserModel, IUser } from "../model/auth.model";

export interface IAuthRepository {
    getUserByEmail (email: string): Promise<IUser | null>;
    getUserById (id: string): Promise<IUser | null>;
    createUser (userData: Pick<IUser, 'full_name' | 'email' | 'phone_number' | 'password'>): Promise<IUser>;
    updateUser (id: string, updateData: Partial<Pick<IUser, 'full_name' | 'email' | 'phone_number' | 'password'>>): Promise<IUser | null>;
    savePasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
    getUserByPasswordResetToken(email: string, token: string, now: Date): Promise<IUser | null>;
    clearPasswordResetToken(userId: string): Promise<void>;
}
// made iauthrepository for the calling crud operations in the service layer and also to make the code more modular and testable by separating the database operations from the business logic in the service layer

export class AuthRepository implements IAuthRepository {
    async createUser(userData: Pick<IUser, 'full_name' | 'email' | 'phone_number' | 'password'>): Promise<IUser> {
        const user = new UserModel(userData);
        return await user.save();
    }
    
    async getUserByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email });
    } 
    
    async getUserById(id: string): Promise<IUser | null> {
        return await UserModel.findById(id);
    }
    
    async updateUser(id: string, updateData: Partial<Pick<IUser, 'full_name' | 'email' | 'phone_number' | 'password'>>): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    }

    async savePasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, {
            $set: {
                resetPasswordToken: token,
                resetPasswordExpires: expiresAt,
            },
        });
    }

    async getUserByPasswordResetToken(email: string, token: string, now: Date): Promise<IUser | null> {
        return await UserModel.findOne({
            email,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: now },
        });
    }

    async clearPasswordResetToken(userId: string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, {
            $unset: {
                resetPasswordToken: 1,
                resetPasswordExpires: 1,
            },
        });
    }
}