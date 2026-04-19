import { Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const dashboardService = new DashboardService();

export class DashboardController {
  async getOverview(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const overview = await dashboardService.getOverview(userId);
      return res.status(200).json({
        success: true,
        message: 'Dashboard overview fetched successfully',
        data: overview,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || 'Failed to fetch dashboard overview',
        details: error.details,
      });
    }
  }
}
