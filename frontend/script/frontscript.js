import { postaskAiAsText } from "./getpostscript.js";

const txtinputcode = document.getElementById("txtinputcode");
const btngo = document.getElementById("btngo");

// define sections to place tables
const validtablesection = document.getElementById("validtablesection");
const errortablesection = document.getElementById("errortablesection");

const url = 'http://localhost:8080/AI-Code-Review/server/apis/review.php';



async function handleclickbutton() {
  const code = txtinputcode.value.trim();

  if (code.length === 0) {
    console.log(" Please enter some code first!");
    return;
  }

  const [isexecuted, validatelist, errorlist, message] = await postaskAiAsText(url, code);

  if (!isexecuted) {
    console.error("API error:", message);
    return;
  }


  validtablesection.innerHTML = "";
  errortablesection.innerHTML = "";

  if (validatelist.length > 0) {
    createtable(validatelist, ["Severity", "Issue", "Suggestion"], false);
  }

  if (errorlist.length > 0) {
    createtable(errorlist, ["Errors"], true);
  }
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
    validtablesection.appendChild(table);
  }
}


btngo.addEventListener("click", handleclickbutton);