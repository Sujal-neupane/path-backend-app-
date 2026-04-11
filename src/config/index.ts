import dotend from 'dotenv';


export const PORT: number = 
process.env.PORT ? parseInt(process.env.PORT) : 5999;

export const MONGODB_URI: string = 
process.env.MONGODB_URI || 'mongodb://localhost:27017/path';

export const JWT_SECRET: string =
process.env.JWT_SECRET || 'qwertyuiopasdfghjklzxcvbnm1234567890';

export const JWT_EXPIRES_IN: string =
process.env.JWT_expiresIn || '7d'; 

export const NODE_ENV: string =
process.env.NODE_ENV || 'development';

export const CORS_ORIGIN: string[] =
process.env.CORS_ORIGIN?.split(',') || 
['http://localhost:50505050',
  'http://localhost:5999',
  'http://localhost:9999'
];

