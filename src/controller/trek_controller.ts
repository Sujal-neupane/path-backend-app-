import { Request, Response } from 'express';
import {
  AddCheckpointDto,
  CreateTrekDto,
  ListTreksQueryDto,
  UpdateCheckpointDto,
  UpdateTrekStatusDto,
} from '../dtos/trekking.dtos';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { HttpError } from '../errors/http-error';
import { TrekService } from '../services/trek.service';

const trekService = new TrekService();

export class TrekController {
  private getParam(value: string | string[] | undefined, label: string): string {
    if (!value) {
      throw new HttpError(400, `${label} is required`);
    }

    return Array.isArray(value) ? value[0] : value;
  }

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      // Every trek endpoint is user-scoped; never allow anonymous creation.
      if (!req.user?.id) {
        throw new HttpError(401, 'Unauthorized');
      }

      const parsed = CreateTrekDto.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(400, 'Invalid create trek payload', parsed.error.issues);
      }

      const trek = await trekService.createTrek(req.user.id, parsed.data);

      return res.status(201).json({
        success: true,
        message: 'Trek created successfully',
        data: trek,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || 'Failed to create trek',
        details: error.details,
      });
    }
  }

  async list(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        throw new HttpError(401, 'Unauthorized');
      }

      const parsed = ListTreksQueryDto.safeParse(req.query);
      if (!parsed.success) {
        throw new HttpError(400, 'Invalid list query payload', parsed.error.issues);
      }

      const response = await trekService.listTreks(req.user.id, parsed.data);

      return res.status(200).json({
        success: true,
        message: 'Treks fetched successfully',
        ...response,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || 'Failed to fetch treks',
        details: error.details,
      });
    }
  }

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        throw new HttpError(401, 'Unauthorized');
      }

      const trekId = this.getParam(req.params.trekId, 'Trek id');
      const trek = await trekService.getTrekById(req.user.id, trekId);

      return res.status(200).json({
        success: true,
        message: 'Trek fetched successfully',
        data: trek,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || 'Failed to fetch trek',
        details: error.details,
      });
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        throw new HttpError(401, 'Unauthorized');
      }

      const parsed = UpdateTrekStatusDto.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(400, 'Invalid status update payload', parsed.error.issues);
      }

      const trekId = this.getParam(req.params.trekId, 'Trek id');
      const trek = await trekService.updateTrekStatus(req.user.id, trekId, parsed.data);

      return res.status(200).json({
        success: true,
        message: 'Trek status updated successfully',
        data: trek,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || 'Failed to update trek status',
        details: error.details,
      });
    }
  }

  async addCheckpoint(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        throw new HttpError(401, 'Unauthorized');
      }

      const parsed = AddCheckpointDto.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(400, 'Invalid checkpoint payload', parsed.error.issues);
      }

      const trekId = this.getParam(req.params.trekId, 'Trek id');
      const trek = await trekService.addCheckpoint(req.user.id, trekId, parsed.data);

      return res.status(201).json({
        success: true,
        message: 'Checkpoint added successfully',
        data: trek,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || 'Failed to add checkpoint',
        details: error.details,
      });
    }
  }

  async updateCheckpoint(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        throw new HttpError(401, 'Unauthorized');
      }

      const parsed = UpdateCheckpointDto.safeParse(req.body);
      if (!parsed.success) {
        throw new HttpError(400, 'Invalid checkpoint update payload', parsed.error.issues);
      }

      const trekId = this.getParam(req.params.trekId, 'Trek id');
      const checkpointId = this.getParam(req.params.checkpointId, 'Checkpoint id');

      const trek = await trekService.updateCheckpoint(
        req.user.id,
        trekId,
        checkpointId,
        parsed.data,
      );

      return res.status(200).json({
        success: true,
        message: 'Checkpoint updated successfully',
        data: trek,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || 'Failed to update checkpoint',
        details: error.details,
      });
    }
  }

  async summary(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        throw new HttpError(401, 'Unauthorized');
      }

      const trekId = this.getParam(req.params.trekId, 'Trek id');
      const summary = await trekService.getTrekSummary(req.user.id, trekId);

      return res.status(200).json({
        success: true,
        message: 'Trek summary fetched successfully',
        data: summary,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || 'Failed to fetch trek summary',
        details: error.details,
      });
    }
  }
}
