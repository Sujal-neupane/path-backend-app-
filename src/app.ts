import express, {Application, NextFunction, Request, Response} from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { PORT, CORS_ORIGIN, NODE_ENV } from './config';
import cookieParser from 'cookie-parser';
import { time } from 'node:console';
import e from 'express';


const app: Application = express();



app.disable('etag');
// so basically etag helps for api responses to prevent 304 caching issue 


app.use(helmet());

// cors configurations for cross-origin resource sharing like what to accept and what not to accept
// CORS
const corsOptions = {
    origin: CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));



// for preflight requests which handles all the routes and methods for cross-origin requests

app.use(cookieParser());
// for parsing cookies from the request headers and also for jwt in cookie based authentication

app.use(morgan(NODE_ENV === 'production'? 'combined' : 'dev'));
// for logging http requests and responses in the console for development and production environment

app.use(express.json({limit: '50mb'}));
// for parsing json request bodies with a size limit of 50mb

app.use(express.urlencoded({extended: true, limit: '50mb'}));
// for parsing urlencoded request bodies with a size limit of 50mb and extended option for rich objects and arrays



app.use('/health', (req: Request, res: Response) => {
    return res.status(200).json({
        status: 'ok',
        time: new Date().toISOString(),
        environment: NODE_ENV,
    });
    });
// for health check endpoint to check if the server is running and also to get the environment and time of the server

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: 'Welcome to Path API',
    });
});
// for root endpoint to check if the server is running and also to get a welcome message

app.use((req: Request, res: Response) => {
    return res.status(404).json({
        success: false,
        error: 'Not Found',
    });
});
// for handling 404 errors for undefined routes



export { app };

