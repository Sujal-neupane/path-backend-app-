import { Document, Schema, model, Types } from 'mongoose';

export type TrekStatus = 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
export type TrekDifficulty = 'easy' | 'moderate' | 'hard' | 'extreme';

export interface ITrekCheckpoint {
  _id: Types.ObjectId;
  title: string;
  order: number;
  altitude_m: number;
  latitude?: number;
  longitude?: number;
  estimated_arrival?: Date;
  reached_at?: Date;
  notes?: string;
  is_reached: boolean;
}

export interface ITrek extends Document {
  user_id: Types.ObjectId;
  title: string;
  route_name: string;
  region: string;
  difficulty: TrekDifficulty;
  status: TrekStatus;
  start_date: Date;
  end_date?: Date;
  target_budget_npr?: number;
  expected_distance_km?: number;
  expected_elevation_gain_m?: number;
  notes?: string;
  checkpoints: ITrekCheckpoint[];
  createdAt: Date;
  updatedAt: Date;
}

const TrekCheckpointSchema = new Schema<ITrekCheckpoint>(
  {
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 1 },
    altitude_m: { type: Number, required: true, min: 0 },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    estimated_arrival: { type: Date },
    reached_at: { type: Date },
    notes: { type: String, trim: true },
    is_reached: { type: Boolean, default: false },
  },
  {
    _id: true,
    versionKey: false,
  },
);

const TrekSchema = new Schema<ITrek>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    route_name: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    region: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'hard', 'extreme'],
      default: 'moderate',
      required: true,
    },
    status: {
      type: String,
      enum: ['planned', 'active', 'paused', 'completed', 'cancelled'],
      default: 'planned',
      required: true,
      index: true,
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date },
    target_budget_npr: { type: Number, min: 0 },
    expected_distance_km: { type: Number, min: 0 },
    expected_elevation_gain_m: { type: Number, min: 0 },
    notes: { type: String, trim: true, maxlength: 1000 },
    checkpoints: { type: [TrekCheckpointSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

TrekSchema.index({ user_id: 1, createdAt: -1 });

// Convert internal mongo fields into API-friendly shape.
TrekSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const mapped = ret as unknown as Record<string, unknown>;
    mapped.id = String(mapped._id);
    delete mapped._id;

    if (Array.isArray(mapped.checkpoints)) {
      mapped.checkpoints = (mapped.checkpoints as Array<Record<string, unknown>>).map((item) => {
        const checkpoint = { ...item, id: String(item._id) } as Record<string, unknown>;
        delete checkpoint._id;
        return checkpoint;
      });
    }

    return mapped;
  },
});

export const TrekModel = model<ITrek>('Trek', TrekSchema);
