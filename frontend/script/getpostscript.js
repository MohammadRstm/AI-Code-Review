const allowed_severities=["low","medium","high"];

export async function postaskAiAsText(url,code){
  try {
    const result = await axios.post(url, { code });

    // check response type
    const [isgeneralvalid, message] = validateresponse(result);

    if (!isgeneralvalid){
      console.log("get11")
      return [false, null, null, message];    
    }

    const errorList = [];// invalid objects sent from review api (correct structure)
    const validList = [];// valid objects sent from review api (correct structure)

    result.data.forEach((item, index) => {
    const [isValid, res] = validateachitem(item, index);

    if (isValid) validList.push(res);
    else errorList.push(res);
  });
  
  return [true, validList, errorList, null];
  }catch(error) {
   console.log()
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

  const valid = true;
  const message = "";
  if (!contentType.includes("application/json")) {
    valid = false;
    message = "Response is not as expected";
  }

  if(valid && typeof response.data !="object"){
    valid = false;
    message = "response is not data";
  }

  if(valid && !Array.isArray(response.data)){
    valid = false;
    message = "response is not an array as exected"
  }
  return [valid,message];
}

export function validateachitem(item,index){
    let itemValide=true
    const itemError=[];

    if(!item.severity || ! allowed_severities.includes(item.severity)){
      itemError.push("the  error : missing expected severity field ");
      itemValide=false;
    }
    if(!item.issue || typeof item.issue !="string"){
        itemError.push("the  error : missing expected issue field");
        itemValide=false;
    }
   if(!item.suggestion || typeof item.suggestion !="string"){
        itemError.push("the error: missing expected suggestion field");
        itemValide=false;
   }

   if(itemValide){
     return [true,item];
   }else
   {
     return [false,itemError]
   }



}


