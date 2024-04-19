import mongoose from "mongoose";

async function connectToDB(testDB : typeof mongoose ,databaseTestURL : string){
    const DB_URL_TEST = process.env.DB_URL_TEST as string;

    await testDB.connect(databaseTestURL).then(async()=>{
    }).catch((error)=>{
       console.log(error);
    })
}

async function disconnectFromDB(testDB : typeof mongoose){
    testDB.disconnect()
}

export default {connectToDB,disconnectFromDB}

