import NodeCache from "node-cache";

const serverCache = new NodeCache({stdTTL:0 ,checkperiod:0});

export const getServerCache = (keyName : string)=>{
    const cachedKey = serverCache.get(keyName);
    return cachedKey;
}

export const setServerCache = (keyName:string,key: any,options : {ttl:number} = {ttl:0} )=>{
    const mergedOptions = {...options}
    
    const success = serverCache.set(keyName,key,mergedOptions.ttl);
    return success;
}

export const deleteServerCacheKey = (keyName:string)=>{
    const deletedCount = serverCache.del(keyName);
    return deletedCount;
}