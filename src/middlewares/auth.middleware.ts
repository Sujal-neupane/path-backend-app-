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

	if (!authHeader?.startsWith('Bearer ')) {
		return res.status(401).json({
			success: false,
			message: 'Missing or invalid authorization token',
		});
	}

	const token = authHeader.split(' ')[1];

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
