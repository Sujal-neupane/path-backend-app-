import z from 'zod';

export const TrekStatusEnum = z.enum(['planned', 'active', 'paused', 'completed', 'cancelled']);
export type TrekStatus = z.infer<typeof TrekStatusEnum>;

export const TrekDifficultyEnum = z.enum(['easy', 'moderate', 'hard', 'extreme']);
export type TrekDifficulty = z.infer<typeof TrekDifficultyEnum>;

export const CreateTrekDto = z.object({
  title: z.string().min(3).max(120),
  routeName: z.string().min(3).max(120),
  region: z.string().min(2).max(80),
  difficulty: TrekDifficultyEnum,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  targetBudgetNpr: z.number().nonnegative().optional(),
  expectedDistanceKm: z.number().positive().optional(),
  expectedElevationGainM: z.number().nonnegative().optional(),
  coverImageUrl: z.string().url().optional(),
  galleryImageUrls: z.array(z.string().url()).max(10).optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateTrekDtoType = z.infer<typeof CreateTrekDto>;

export const ListTreksQueryDto = z.object({
  status: TrekStatusEnum.optional(),
  difficulty: TrekDifficultyEnum.optional(),
  region: z.string().min(2).max(80).optional(),
  isOfficial: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export type ListTreksQueryDtoType = z.infer<typeof ListTreksQueryDto>;

export const UpdateTrekStatusDto = z.object({
  status: TrekStatusEnum,
});

export type UpdateTrekStatusDtoType = z.infer<typeof UpdateTrekStatusDto>;

export const AddCheckpointDto = z.object({
  title: z.string().min(2).max(100),
  order: z.number().int().min(1),
  altitudeM: z.number().nonnegative(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  estimatedArrival: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

export type AddCheckpointDtoType = z.infer<typeof AddCheckpointDto>;

export const UpdateCheckpointDto = z.object({
  isReached: z.boolean(),
  reachedAt: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

export type UpdateCheckpointDtoType = z.infer<typeof UpdateCheckpointDto>;
