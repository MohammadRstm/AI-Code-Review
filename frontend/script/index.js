const txtInputCodeElem = document.getElementById("txtInputCode");
const btngo = document.getElementById("btnGo");

// define sections to place tables
const validTableSection = document.getElementById("validTableSection");

const url = 'http://localhost/AI-Code-Review/server/apis/review.php';

async function handleclickbutton() {
  const code = txtInputCodeElem.value.trim();

  if (code.length === 0) {
    alert("Please provide either a file or a code snippet");
    return;
  }

  const [isexecuted, validatelist, message] = await postaskAiAsText(url, code);
  if (!isexecuted) {
    console.error("API error:", message);
    return;
  }


  validTableSection.innerHTML = "";
  // errortablesection.innerHTML = "";

  if (validatelist.length > 0) {
    createtable(validatelist, ["Severity", "Issue", "Suggestion"], false);
  }

  // if (errorlist.length > 0) {
  //   createtable(errorlist, ["Errors"], true);
  // }
}

function createtable(datalist, headlist, iserror) {
  const table = document.createElement("table");
  table.className = "tableerror";


  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headlist.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);


  const tbody = document.createElement("tbody");

  datalist.forEach((data, index) => {
    const row = document.createElement("tr");

    
    if (Array.isArray(data)) {
      data.forEach(value => {
        const td = document.createElement("td");
        td.textContent = value;
        row.appendChild(td);
      });
    } 
 
    else if (typeof data === "object") {
      const cells = [data.severity, data.issue, data.suggestion];
      cells.forEach(value => {
        const td = document.createElement("td");
        td.textContent = value || "";
        row.appendChild(td);
      });
    }

    tbody.appendChild(row);
  });

  table.appendChild(tbody);

  if (iserror) {
    errortablesection.appendChild(table);
  } else {
    validTableSection.appendChild(table);
  }
}


btngo.addEventListener("click", handleclickbutton);


const allowed_severities=["low","medium","high"];


 async function postaskAiAsText(url,code){
   try {    
      const result = await axios.post(url, { code },
      {
        headers: {
          "Content-Type": "application/json",
      }});
      console.log(result);

      const [isgeneralvalid, message] = validateresponse(result);
       if (!isgeneralvalid)
         {
            return [false, null, null, message];
            
         }

            const errorlist = [];
            const validlist = [];

        result.data.issues.forEach((item, index) => {
        const [isvalid, res] = validateachitem(item, index);
        if (isvalid) validlist.push(res);
        else errorlist.push(res);
  });

  return [true, validlist, errorlist, null];
} catch (error) {
  console.log("Server error",error.message);
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

 function validateresponse(response){
  const contentType = response.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    console.log("valid1")
    return [false,"Response is not as expected"];
  }

  if(typeof response.data !="object"){
    console.log("valid")
    return [false,"response is not data"];
  }

  if(!Array.isArray(response.data.issues)){
    return[false,"response is not array as expected"];
  }
  return [true,"ok"]



}
 function validateachitem(item,index){
    let itemvalide=true
    const itemerror=[];
   /* if(item.error ){
        itemerror.push("the server error :",item.error);

        itemvalide=false;
    }*/
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


