import { Types } from 'mongoose';
import {
  AddCheckpointDtoType,
  CreateTrekDtoType,
  ListTreksQueryDtoType,
  UpdateCheckpointDtoType,
  UpdateTrekStatusDtoType,
} from '../dtos/trekking.dtos';
import { ITrek, TrekStatus } from '../model/trek.model';
import { TrekRepository } from '../repository/trek.repository';
import { HttpError } from '../errors/http-error';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class TrekService {
  private readonly trekRepository: TrekRepository;

  constructor(trekRepository: TrekRepository = new TrekRepository()) {
    this.trekRepository = trekRepository;
  }

  private ensureValidObjectId(id: string, label: string): void {
    // Validate ids at the service boundary to fail fast before hitting the repository.
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpError(400, `${label} is invalid`);
    }
  }

  async createTrek(userId: string, payload: CreateTrekDtoType): Promise<ITrek> {
    this.ensureValidObjectId(userId, 'User id');

    if (payload.endDate && payload.endDate < payload.startDate) {
      throw new HttpError(400, 'End date cannot be earlier than start date');
    }

    return this.trekRepository.create({
      user_id: new Types.ObjectId(userId),
      title: payload.title,
      route_name: payload.routeName,
      region: payload.region,
      difficulty: payload.difficulty,
      status: 'planned',
      cover_image_url: payload.coverImageUrl,
      gallery_image_urls: payload.galleryImageUrls ?? [],
      is_official: false,
      is_published: true,
      created_by_role: 'user',
      start_date: payload.startDate,
      end_date: payload.endDate,
      target_budget_npr: payload.targetBudgetNpr,
      expected_distance_km: payload.expectedDistanceKm,
      expected_elevation_gain_m: payload.expectedElevationGainM,
      notes: payload.notes,
      checkpoints: [],
    });
  }

  async listTreks(query: ListTreksQueryDtoType): Promise<{ data: ITrek[]; meta: PaginationMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [treks, total] = await Promise.all([
      this.trekRepository.listCatalog({
        status: query.status as TrekStatus | undefined,
        difficulty: query.difficulty,
        region: query.region,
        isOfficial: query.isOfficial,
        skip,
        limit,
      }),
      this.trekRepository.countCatalog({
        status: query.status as TrekStatus | undefined,
        difficulty: query.difficulty,
        region: query.region,
        isOfficial: query.isOfficial,
      }),
    ]);

    return {
      data: treks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getTrekById(trekId: string): Promise<ITrek> {
    this.ensureValidObjectId(trekId, 'Trek id');

    const trek = await this.trekRepository.findById(trekId);
    if (!trek) {
      throw new HttpError(404, 'Trek not found');
    }

    return trek;
  }

  async updateTrekStatus(userId: string, trekId: string, payload: UpdateTrekStatusDtoType): Promise<ITrek> {
    this.ensureValidObjectId(userId, 'User id');
    this.ensureValidObjectId(trekId, 'Trek id');

    const trek = await this.trekRepository.updateStatusForUser(trekId, userId, payload.status);
    if (!trek) {
      throw new HttpError(404, 'Trek not found');
    }

    return trek;
  }

  async addCheckpoint(userId: string, trekId: string, payload: AddCheckpointDtoType): Promise<ITrek> {
    this.ensureValidObjectId(userId, 'User id');
    this.ensureValidObjectId(trekId, 'Trek id');

    const existingTrek = await this.trekRepository.findByIdForUser(trekId, userId);
    if (!existingTrek) {
      throw new HttpError(404, 'Trek not found');
    }

    // Enforce deterministic ordering for timeline rendering in the mobile app.
    const duplicateOrder = existingTrek.checkpoints.some((checkpoint) => checkpoint.order === payload.order);
    if (duplicateOrder) {
      throw new HttpError(409, 'Checkpoint order already exists in this trek');
    }

    const trek = await this.trekRepository.pushCheckpointForUser(trekId, userId, {
      title: payload.title,
      order: payload.order,
      altitude_m: payload.altitudeM,
      latitude: payload.latitude,
      longitude: payload.longitude,
      estimated_arrival: payload.estimatedArrival,
      notes: payload.notes,
      is_reached: false,
    });

    if (!trek) {
      throw new HttpError(404, 'Trek not found');
    }

    return trek;
  }

  async updateCheckpoint(
    userId: string,
    trekId: string,
    checkpointId: string,
    payload: UpdateCheckpointDtoType,
  ): Promise<ITrek> {
    this.ensureValidObjectId(userId, 'User id');
    this.ensureValidObjectId(trekId, 'Trek id');
    this.ensureValidObjectId(checkpointId, 'Checkpoint id');

    const reachedAt = payload.isReached ? payload.reachedAt ?? new Date() : undefined;

    const trek = await this.trekRepository.updateCheckpointForUser(trekId, userId, checkpointId, {
      is_reached: payload.isReached,
      reached_at: reachedAt,
      notes: payload.notes,
    });

    if (!trek) {
      throw new HttpError(404, 'Trek or checkpoint not found');
    }

    return trek;
  }

  async getTrekSummary(trekId: string): Promise<Record<string, unknown>> {
    const trek = await this.getTrekById(trekId);

    const reachedCount = trek.checkpoints.filter((checkpoint) => checkpoint.is_reached).length;
    const totalCount = trek.checkpoints.length;
    const completionRatio = totalCount === 0 ? 0 : reachedCount / totalCount;

    return {
      trekId: String(trek._id),
      title: trek.title,
      routeName: trek.route_name,
      status: trek.status,
      progress: {
        checkpointsReached: reachedCount,
        totalCheckpoints: totalCount,
        completionRatio,
      },
      planning: {
        expectedDistanceKm: trek.expected_distance_km,
        expectedElevationGainM: trek.expected_elevation_gain_m,
        targetBudgetNpr: trek.target_budget_npr,
      },
      timeline: {
        startDate: trek.start_date,
        endDate: trek.end_date,
      },
    };
  }
}
