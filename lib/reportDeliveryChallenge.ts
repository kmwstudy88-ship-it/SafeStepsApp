export function validDeliveryChallenge(token:string,code:string){
 return /^[0-9a-f]{48}$/i.test(token)&&/^[0-9]{6}$/.test(code);
}
