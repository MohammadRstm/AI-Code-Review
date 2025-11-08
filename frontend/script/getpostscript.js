
const allowed_severities=["low","medium","high"];
const errorlist=[];
const validlist=[];

export async function postaskAiAsText(url,code){
   
       const result = await axios.post(url, { code });
try {
       const [isgeneralvalid, message] = validateresponse(result);
       if (!isgeneralvalid) return [false, null, null, message];

            const errorlist = [];
            const validlist = [];

        result.data.forEach((item, index) => {
        const [isvalid, res] = validateachitem(item, index);
        if (isvalid) validlist.push(res);
        else errorlist.push(res);
  });

  return [true, validlist, errorlist, null];
} catch (error) {
  return [false, null, null, error.message];
}

        
   
    
}
// export async function postaskAiFile(file,url){
//     const formdata=new FormData();
//     formdata.append("file",file)
//     const response=await axios.post(url,formdata,{
//         header:{
//             "content-Type":"multiple/form-data"
//         }
//     })
// }

export function validateresponse(response){
  const contentType = response.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    return [false,"Response is not as expected"];
  }

  if(typeof response.data !="object"){
    return [false,"response is not data"];
  }

  if(!Array.isArray(response.data)){
    return[false,"response is not array as expected"];
  }
  return [true,"ok"]



}
export function validateachitem(item,index){
    let itemvalide=true
    const itemerror=[];
    if(item.error ){
        itemerror.push("the server error :",item.error);

        itemvalide=false;
    }
    if(!item.severity || ! allowed_severities.includes(item.severity)){
        itemerror.push("the  error : missing expected severity ");
        itemvalide=false;
    }
    if(!item.issue || typeof item.issue !="string"){
        itemerror.push("the  error : missing expected issue ");
        itemvalide=false;
    }
   if(!item.suggestion || typeof item.suggestion !="string"){
        itemerror.push("the error: missing expected suggestion ");
        itemvalide=false;
   }

   if(itemvalide){
     return [true,item];
   }else
   {
     return [false,itemerror]
   }



}