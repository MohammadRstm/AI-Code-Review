const allowed_severities=["low","medium","high"];

export async function postaskAiAsText(url,code){
  try {
    const result = await axios.post(url, { code });
    console.log(result);
    // check response type
    const [isgeneralvalid, message] = validateresponse(result);

    if (!isgeneralvalid){
      console.log("Response data structure validation failed");
      return [false, null, null, message];    
    }

    const errorList = [];// invalid objects sent from review api (correct structure)
    const validList = [];// valid objects sent from review api (correct structure)

    result.data.issues.forEach((item, index) => {
    const [isValid, res] = validateachitem(item, index);

    if (isValid) validList.push(res);
    else errorList.push(res);
  });
  
  return [true, validList, errorList, null];
  }catch(error) {
    alert("Server error");
    console.log(error);
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

function validateresponse(response){
  let valid = true;
  let message = "";

  const contentType = response.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    valid = false;
    message = "Response is not JSON";
  }

  if(valid && (!response.data && typeof response.data.issues !="object")){
    valid = false;
    message = "Response data is missing or invalid";
  }

  if(valid && (!"issues" in response.data || !"file" in response.data)){
    valid = false;
    message = "Response data is not valid";
  }

  if (valid && !Array.isArray(response.data.issues)) {
    valid = false;
    message = "'issues' field is not an array.";
    return [valid, message];
  }

  return [valid,message];
}

function validateachitem(item,index){
    const itemError=[];

    if(!item.severity || !allowed_severities.includes(item.severity)){
      itemError.push("Field Validation error : missing/invalid `severity` field");
    }
    if(!item.issue || typeof item.issue !="string"){
      itemError.push("Field Validation error : missing/invalid `issue` field");
    }
   if(!item.suggestion || typeof item.suggestion !="string"){
      itemError.push("Field Validation error : missing/invalid `suggestion` field");
   }

   if(itemError.length == 0){
    return [true,item];
   }else{
    return [false,itemError]
   }



}


