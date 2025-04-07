import express from 'express' 
import colors from 'colors'
import morgan from 'morgan'
import { db } from './config/db'

async function connectDB() {
    try {
        await db.authenticate();
        db.sync();
        console.log(colors.cyan.bold('DB is connected'))
    } catch (error) {
        console.log(colors.red.bold('DB connection error: '), error)
    }
}

connectDB();

const app = express()

app.use(morgan('dev'))

app.use(express.json())

export default app