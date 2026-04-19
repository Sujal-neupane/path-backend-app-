import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		email: string;
	};
}

export const authenticate = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): Response | void => {
	const authHeader = req.headers.authorization;
	const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
	const cookieToken = req.cookies?.accessToken as string | undefined;
	const token = bearerToken || cookieToken;

	if (!token) {
		return res.status(401).json({
			success: false,
			message: 'Missing authorization token',
		});
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

		if (!decoded?.id || !decoded?.email) {
			return res.status(401).json({
				success: false,
				message: 'Invalid token payload',
			});
		}

		req.user = {
			id: String(decoded.id),
			email: String(decoded.email),
		};

		next();
	} catch {
		return res.status(401).json({
			success: false,
			message: 'Token verification failed',
		});
	}
};
