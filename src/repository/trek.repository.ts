import { Types } from 'mongoose';
import { ITrek, ITrekCheckpoint, TrekModel, TrekStatus } from '../model/trek.model';

type CreateTrekInput = {
  user_id: Types.ObjectId;
  title: string;
  route_name: string;
  region: string;
  difficulty: ITrek['difficulty'];
  status: TrekStatus;
  start_date: Date;
  end_date?: Date;
  target_budget_npr?: number;
  expected_distance_km?: number;
  expected_elevation_gain_m?: number;
  notes?: string;
  checkpoints: Omit<ITrekCheckpoint, '_id'>[];
};

export interface ITrekRepository {
  create(data: CreateTrekInput): Promise<ITrek>;
  listByUser(userId: string, filters: { status?: TrekStatus; skip: number; limit: number }): Promise<ITrek[]>;
  countByUser(userId: string, status?: TrekStatus): Promise<number>;
  findByIdForUser(trekId: string, userId: string): Promise<ITrek | null>;
  updateStatusForUser(trekId: string, userId: string, status: TrekStatus): Promise<ITrek | null>;
  pushCheckpointForUser(trekId: string, userId: string, checkpoint: Omit<ITrekCheckpoint, '_id'>): Promise<ITrek | null>;
  updateCheckpointForUser(
    trekId: string,
    userId: string,
    checkpointId: string,
    patch: Partial<Pick<ITrekCheckpoint, 'is_reached' | 'reached_at' | 'notes'>>,
  ): Promise<ITrek | null>;
}

export class TrekRepository implements ITrekRepository {
  async create(data: CreateTrekInput): Promise<ITrek> {
    const trek = new TrekModel(data);
    return trek.save();
  }

  async listByUser(userId: string, filters: { status?: TrekStatus; skip: number; limit: number }): Promise<ITrek[]> {
    const query: Record<string, unknown> = { user_id: new Types.ObjectId(userId) };

    if (filters.status) {
      query.status = filters.status;
    }

    return TrekModel.find(query)
      .sort({ createdAt: -1 })
      .skip(filters.skip)
      .limit(filters.limit);
  }

  async countByUser(userId: string, status?: TrekStatus): Promise<number> {
    const query: Record<string, unknown> = { user_id: new Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }

    return TrekModel.countDocuments(query);
  }

  async findByIdForUser(trekId: string, userId: string): Promise<ITrek | null> {
    return TrekModel.findOne({
      _id: new Types.ObjectId(trekId),
      user_id: new Types.ObjectId(userId),
    });
  }

  async updateStatusForUser(trekId: string, userId: string, status: TrekStatus): Promise<ITrek | null> {
    return TrekModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(trekId),
        user_id: new Types.ObjectId(userId),
      },
      {
        $set: { status },
      },
      { new: true },
    );
  }

  async pushCheckpointForUser(
    trekId: string,
    userId: string,
    checkpoint: Omit<ITrekCheckpoint, '_id'>,
  ): Promise<ITrek | null> {
    return TrekModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(trekId),
        user_id: new Types.ObjectId(userId),
      },
      {
        $push: {
          checkpoints: checkpoint,
        },
      },
      { new: true },
    );
  }

  async updateCheckpointForUser(
    trekId: string,
    userId: string,
    checkpointId: string,
    patch: Partial<Pick<ITrekCheckpoint, 'is_reached' | 'reached_at' | 'notes'>>,
  ): Promise<ITrek | null> {
    const setPatch: Record<string, unknown> = {};
    if (typeof patch.is_reached === 'boolean') {
      setPatch['checkpoints.$.is_reached'] = patch.is_reached;
    }
    if (patch.reached_at) {
      setPatch['checkpoints.$.reached_at'] = patch.reached_at;
    }
    if (typeof patch.notes === 'string') {
      setPatch['checkpoints.$.notes'] = patch.notes;
    }

    return TrekModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(trekId),
        user_id: new Types.ObjectId(userId),
        'checkpoints._id': new Types.ObjectId(checkpointId),
      },
      {
        $set: setPatch,
      },
      { new: true },
    );
  }
}
