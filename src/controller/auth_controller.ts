import {
    CreateUserDto,
    LoginUserDto,
    PasswordResetConfirmDto,
    PasswordResetRequestDto,
    UpdateUserDto,
} from "../dtos/auth.dtos";
import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { HttpError } from "../errors/http-error";



const authService = new AuthService();

export class AuthController{

    async register(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDto.safeParse(req.body);
            if (!parsedData.success) {
                throw new HttpError(400, 'Invalid register payload', parsedData.error.issues);
            }

            const { token, user } = await authService.createUser(parsedData.data);

            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    token,
                    user,
                },
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || 'Internal server error',
                details: error.details,
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDto.safeParse(req.body);
            if (!parsedData.success) {
                throw new HttpError(400, 'Invalid login payload', parsedData.error.issues);
            }

            const { token, user } = await authService.loginUser(parsedData.data.email, parsedData.data.password);

            return res.status(200).json({
                success: true,
                message: 'User logged in successfully',
                data: {
                    token,
                    user,
                },
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || 'Internal server error',
                details: error.details,
            });
        }
    }

    async requestPasswordReset(req: Request, res: Response) {
        try {
            const parsedData = PasswordResetRequestDto.safeParse(req.body);
            if (!parsedData.success) {
                throw new HttpError(400, 'Invalid password reset request payload', parsedData.error.issues);
            }

            const result = await authService.requestPasswordReset(parsedData.data.email);
            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || 'Error requesting reset',
                details: error.details,
            });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const parsedData = PasswordResetConfirmDto.safeParse(req.body);
            if (!parsedData.success) {
                throw new HttpError(400, 'Invalid password reset payload', parsedData.error.issues);
            }

            const result = await authService.resetPassword(
                parsedData.data.email,
                parsedData.data.token,
                parsedData.data.newPassword,
            );

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || 'Error resetting password',
                details: error.details,
            });
        }
    }

    async me(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user?.id) {
                throw new HttpError(401, 'Unauthorized');
            }

            const user = await authService.getUserById(req.user.id);
            return res.status(200).json({
                success: true,
                message: 'Profile fetched successfully',
                data: user,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || 'Failed to fetch profile',
                details: error.details,
            });
        }
    }

    async updateMe(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user?.id) {
                throw new HttpError(401, 'Unauthorized');
            }

            const parsedData = UpdateUserDto.safeParse(req.body);
            if (!parsedData.success) {
                throw new HttpError(400, 'Invalid profile update payload', parsedData.error.issues);
            }

            const user = await authService.updateUser(req.user.id, parsedData.data);
            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: user,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || 'Failed to update profile',
                details: error.details,
            });
        }
    }
}