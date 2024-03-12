export function isJSON(brand:string){
    try{
        JSON.parse(brand)
        return true
    }catch{
        return false
    }
}