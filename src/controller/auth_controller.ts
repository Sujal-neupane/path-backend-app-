import { success } from "zod";
import { CreateUserDto, CreateUserDtoType, LoginUserDto, LoginUserDtoType } from "../dtos/auth.dtos";
import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";



const authService = new AuthService();


interface AuthenticatedRequest extends Request{
    user?: {
        id: string;
        email: string;
    };
}
// this interface is used to extend the Request interface from express to include the user property which will be added to the request object after the user is authenticated using the auth middleware

export class AuthController{

   async register(req: Request, res: Response) {
    try{
        const parsedData = CreateUserDto.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({
                success: false, 
                error: parsedData.error.issues,
            });
        }
        const userData: CreateUserDtoType = parsedData.data;
        const{token, user} = await authService.createUser(userData);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user,
            }
        });
    }catch (error: Error | any) {
        console.error('Register error', error.message);
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        })
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    error: parsedData.error.issues,
                });
            }
            const loginData: LoginUserDtoType = parsedData.data;
            const { token, user } = await authService.loginUser(loginData.email, loginData.password);
            return res.status(200).json({
                success: true,
                message: 'User logged in successfully',
                data: {
                    token,
                    user,
                }
            });
        } catch (error: Error | any) {
            console.error('Login error', error.message);
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || 'Internal Server Error',
            });
         }
    }

    async requestPasswordReset(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ success: false, message: 'Email required' });

            const result = await authService.requestPasswordReset(email);
            return res.status(200).json({
                success: true,
                ...result 
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || 'Error requesting reset'
            });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { email, token, newPassword } = req.body;
            if (!email || !token || !newPassword) {
                return res.status(400).json({ success: false, message: 'Missing fields' });
            }

            const result = await authService.resetPassword(email, token, newPassword);
            return res.status(200).json({
                success: true,
                ...result
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || 'Error resetting password'
            });
        }
    }
}