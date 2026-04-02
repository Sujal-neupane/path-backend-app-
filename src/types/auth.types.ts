import {z} from 'zod';

export const LoginSchena = z.object({
    // these are the schema for the login request body which will be validated using zod
    // zod is basically a schema validation library for typescript which is used to validate the request body and also to infer the types from the schema
})

export const RegisterSchema = z.object({
    // these are the schema for the register request body which will be validated using zod
    // zod is basically a schema validation library for typescript which is used to validate the request body and also to infer the types from the schema
})