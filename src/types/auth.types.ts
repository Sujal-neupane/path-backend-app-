import { z } from 'zod';

export const LoginSchema = z.object({
    // these are the schema for the login request body which will be validated using zod
    // zod is basically a schema validation library for typescript which is used to validate the request body and also to infer the types from the schema
    email: z.string().email('Please use a valid email').transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
});

export const RegisterSchema = z.object({
    // these are the schema for the register request body which will be validated using zod
    // zod is basically a schema validation library for typescript which is used to validate the request body and also to infer the types from the schema
    fullName: z.string().min(3).max(50),
    email: z.string().email('Please use a valid email').transform((value) => value.toLowerCase()),
    phoneNumber: z.string().min(10).max(15),
    password: z.string().min(8).max(128),
});