const txtInputCodeElem = document.getElementById("codeInput");
const btngo = document.getElementById("submitBtn");
const fileInput = document.getElementById("fileInput");
const validTableSection = document.getElementById("resultTableContainer");
const clearBtn = document.getElementById("clearBtn");

const url = "http://localhost:8080/AI-Code-Review/server/apis/review.php";
const allowed_severities = ["low", "medium", "high"];

async function handleclickbutton() {
  const text = txtInputCodeElem.value.trim();
  const file = fileInput.files[0];
  let istext = true;

  if (!text && !file) {
    alert("Please enter code or select a file");
    return;
  }

  if (text && file) {
    alert("Please enter only one input (text OR file)");
    return;
  }

  if (file) istext = false;

  const [isexecuted, validatelist, errorlist, message] = await initilCall(
    url,
    text,
    file,
    istext
  );

  if (!isexecuted) {
    console.error("API error:", message);
    return;
  }

  validTableSection.innerHTML = "";

  if (validatelist.length > 0) {
    createtable(validatelist, ["Severity", "Issue", "Suggestion"], false);
  }

  if (errorlist.length > 0) {
    createtable(errorlist, ["Errors"], true);
  }
}

function createtable(datalist, headlist, iserror) {
  const table = document.createElement("table");
  table.className = "table";


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

    
      const cells = [data.severity, data.issue, data.suggestion];
      cells.forEach(value => {
        const td = document.createElement("td");
        td.textContent = value || "";
        row.appendChild(td);
      });
    

    tbody.appendChild(row);
  });

  table.appendChild(tbody);


    validTableSection.appendChild(table);
  
}
txtInputCodeElem.addEventListener("input", () => {
  fileInput.disabled = txtInputCodeElem.value.trim().length > 0;
});

fileInput.addEventListener("change", () => {
  txtInputCodeElem.disabled = fileInput.files.length > 0;
})
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
btngo.addEventListener("click", handleclickbutton);

clearBtn.addEventListener("click", () => {
  txtInputCodeElem.value = "";
  fileInput.value = "";
  validTableSection.innerHTML = "";
  fileInput.disabled = false;
  txtInputCodeElem.disabled = false;
});
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function initilCall(url, code, file, istext) {
  try {
    let result = null;
    let isCorrectResponse = true;
    let errorList = [];
    let validateList = [];

    if (istext) {
      result = await PostText(url, code);
    } else {
      result = await PostFile(url, file);
    }

    const [isGeneralValid, message] = validateResponse(result);
    if (!isGeneralValid)
      return [!isCorrectResponse, errorList, validateList, message];

    result.data.issues.forEach((item, index) => {
      const [isvalid, res] = validatEachItem(item, index);
      if (isvalid) validateList.push(res);
      else errorList.push(res);
    });

    return [true, validateList, errorList, null];
  } catch (error) {
    return [false, null, null, error.message];
  }
}

async function PostText(url, code) {
  try {
    const result = await axios.post(url, { code });
    return result;
  } catch (error) {
    return { error: error.message };
  }
}

async function PostFile(url, file) {
  try {
    const formdata = new FormData();
    formdata.append("file", file);
    const response = await axios.post(url, formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    return { error: error.message };
  }
}

function validateResponse(response) {
  let isValid = true;
  let message = "";

  if (!response || response.error) {
    return [false, response?.error || "Unknown error"];
  }

  const contentType = response.headers["content-type"] || "";

  if (!contentType.includes("application/json")) {
    isValid = false;
    message = "Response is not JSON";
  } else if (typeof response.data !== "object") {
    isValid = false;
    message = "Response data is not an object";
  } else if (!Array.isArray(response.data.issues)) {
    isValid = false;
    message = "Response data.issues is not an array";
  } else if (response.data.error) {
    isValid = false;
    message = "Server returned an error";
  }

  return [isValid, message];
}

function validatEachItem(item, index) {
  let itemValide = true;
  const itemError = [];

  if (!item.severity || !allowed_severities.includes(item.severity)) {
    itemError.push("Missing expected severity");
    itemValide = false;
  }
  if (!item.issue || typeof item.issue != "string") {
    itemError.push("Missing expected issue");
    itemValide = false;
  }
  if (!item.suggestion || typeof item.suggestion != "string") {
    itemError.push("Missing expected suggestion");
    itemValide = false;
  }

  return itemValide ? [true, item] : [false, itemError.join(", ")];
}