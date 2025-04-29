import { exit } from 'process';
import { db } from '../config/db';

const clearData = async () => {
    try {
        await db.sync({force:true});
        console.log('Data cleaned successfully');
        exit(0);
    } catch (error) {
        //console.error('Error cleaning data:', error);
        exit(1);
    }
}

if(process.argv[2] === '--clear') {
    clearData();
}