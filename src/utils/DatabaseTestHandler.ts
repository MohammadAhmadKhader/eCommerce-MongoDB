import mongoose from "mongoose";

async function connectToDB(testDB : typeof mongoose ,databaseTestURL : string){

    await testDB.connect(databaseTestURL).then(async()=>{
        console.log("Connected to Test Database successfully!")
    }).catch((error)=>{
       console.error(error);
    })
}

async function disconnectFromDB(testDB : typeof mongoose){
    testDB.disconnect()
}

export default {connectToDB,disconnectFromDB}

