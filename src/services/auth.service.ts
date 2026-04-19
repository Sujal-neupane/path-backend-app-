import { randomInt } from 'crypto';
import jwt from 'jsonwebtoken';
import { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { HttpError } from '../errors/http-error';
import { AuthRepository } from '../repository/auth.repository';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config';
import { CreateUserDtoType, UpdateUserDtoType } from '../dtos/auth.dtos';

interface AuthUserView {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
}

interface AuthResponse {
    token: string;
    user: AuthUserView;
}

export class AuthService {
    private readonly authRepository: AuthRepository;

    constructor(authRepository: AuthRepository = new AuthRepository()) {
        this.authRepository = authRepository;
    }

    private signToken(payload: { id: string; email: string }): string {
        return jwt.sign(payload, JWT_SECRET as Secret, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
    }

    private mapUser(user: {
        _id: unknown;
        email: string;
        full_name: string;
        phone_number: string;
    }): AuthUserView {
        return {
            id: String(user._id),
            email: user.email,
            fullName: user.full_name,
            phoneNumber: user.phone_number,
        };
    }

    async createUser(userData: CreateUserDtoType): Promise<AuthResponse> {
        const existingUser = await this.authRepository.getUserByEmail(userData.email);
        if (existingUser) {
            throw new HttpError(400, 'Email already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = await this.authRepository.createUser({
            full_name: userData.fullName,
            email: userData.email,
            phone_number: userData.phoneNumber,
            password: hashedPassword,
        });

        const token = this.signToken({
            id: user._id.toString(),
            email: user.email,
        });

        return {
            token,
            user: this.mapUser(user),
        };
    }
    
    async loginUser(email: string, password: string): Promise<AuthResponse> {
        const user = await this.authRepository.getUserByEmail(email);
        if (!user) {
            throw new HttpError(404, 'User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new HttpError(401, 'Invalid credentials');
        }

        const token = this.signToken({
            id: user._id.toString(),
            email: user.email,
        });

        return {
            token,
            user: this.mapUser(user),
        };
    }

    async getUserById(userId: string): Promise<AuthUserView> {
        const user = await this.authRepository.getUserById(userId);

        if (!user) {
            throw new HttpError(404, 'User not found');
        }

        return this.mapUser(user);
    }

    async requestPasswordReset(email: string): Promise<{ message: string; resetToken: string }> {
        const user = await this.authRepository.getUserByEmail(email);
        if (!user) {
            throw new HttpError(404, 'User with this email does not exist');
        }

        const resetToken = String(randomInt(100000, 1000000));
        const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

        await this.authRepository.savePasswordResetToken(user._id.toString(), resetToken, resetPasswordExpires);

        return {
            message: 'Password reset code generated',
            // Keep this only for local testing; in production it should be sent via email/SMS.
            resetToken,
        };
    }

    async resetPassword(email: string, token: string, newPass: string): Promise<{ message: string }> {
        const user = await this.authRepository.getUserByPasswordResetToken(email, token, new Date());

        if (!user) {
            throw new HttpError(400, 'Invalid or expired reset token');
        }

        const hashedPassword = await bcrypt.hash(newPass, 10);
        await this.authRepository.updateUser(user._id.toString(), { password: hashedPassword });
        await this.authRepository.clearPasswordResetToken(user._id.toString());

        return { message: 'Password reset successful' };
    }

    async updateUser(userId: string, updateData: UpdateUserDtoType): Promise<AuthUserView> {
        const payload: UpdateUserDtoType = { ...updateData };

        if (payload.password) {
            payload.password = await bcrypt.hash(payload.password, 10);
        }

        const mappedPayload: Record<string, string> = {};
        if (payload.fullName) mappedPayload.full_name = payload.fullName;
        if (payload.email) mappedPayload.email = payload.email;
        if (payload.phoneNumber) mappedPayload.phone_number = payload.phoneNumber;
        if (payload.password) mappedPayload.password = payload.password;

        const user = await this.authRepository.updateUser(userId, mappedPayload);
        if (!user) {
            throw new HttpError(404, 'User not found');
        }

        return this.mapUser(user);
    }
}