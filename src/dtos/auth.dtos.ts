import z from "zod";


export const CreateUserDto = z.object({
    fullName: z.string().min(3).max(50),
    email: z.string().email('Please use a valid email').transform((value) => value.toLowerCase()),
    phoneNumber: z.string().min(10).max(15),
    password: z.string().min(8).max(128),
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;

export const LoginUserDto = z.object({
    email: z.string().email('Please use a valid email').transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
});

export type LoginUserDtoType = z.infer<typeof LoginUserDto>;

export const PasswordResetRequestDto = z.object({
    email: z.string().email('Please use a valid email').transform((value) => value.toLowerCase()),
});

export type PasswordResetRequestDtoType = z.infer<typeof PasswordResetRequestDto>;

export const PasswordResetConfirmDto = z.object({
    email: z.string().email('Please use a valid email').transform((value) => value.toLowerCase()),
    token: z.string().min(6).max(64),
    newPassword: z.string().min(8).max(128),
});

export type PasswordResetConfirmDtoType = z.infer<typeof PasswordResetConfirmDto>;

export const UpdateUserDto = z.object({
    fullName: z.string().min(3).max(50).optional(),
    email: z.string().email('Please use a valid email').transform((value) => value.toLowerCase()).optional(),
    phoneNumber: z.string().min(10).max(15).optional(),
    password: z.string().min(8).max(128).optional(),
});

export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;

