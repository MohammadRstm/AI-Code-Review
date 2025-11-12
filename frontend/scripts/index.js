const txtInputCodeElem = document.getElementById("codeInput");
const btngo = document.getElementById("submitBtn");
const fileInput = document.getElementById("fileInput");
const validTableSection = document.getElementById("resultTableContainer");
const humanReviewTable = document.getElementById("humanReviewTable");
const clearBtn = document.getElementById("clearBtn");


const BASE_URL = "http://localhost/AI-Code-Review/server/apis";
const allowed_severities = ["low", "medium", "high"];

// for human to ai comparison
let currentCode = "";

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
  else currentCode = text;// used later in human to ai comparison

  const [isexecuted, validatelist, errorlist, message] = await initilCall(
    text,
    file,
    istext
  );

  if (!isexecuted) {
    console.error("API error:", message);
    return;
  }

  validTableSection.innerHTML = "";

<<<<<<< HEAD:frontend/script/index.js
  if (validatelist.length > 0) {
    createtable(validatelist, ["Severity", "Issue", "Suggestion"]);
=======
  if (!istext && file) { 
    const fileNameDisplay = document.createElement("p");
    fileNameDisplay.textContent = `File: ${file.name}`;
    fileNameDisplay.style.fontWeight = "bold";
    fileNameDisplay.style.marginBottom = "1rem";
    validTableSection.appendChild(fileNameDisplay);
>>>>>>> 7b7d31b904ce526f066ad22c69a1b2840b40ecc4:frontend/scripts/index.js
  }

  if (validatelist.length === 0 && errorlist.length === 0) {
    const noIssuesMsg = document.createElement("p");
    noIssuesMsg.textContent = "No issues found in the code!";
    noIssuesMsg.style.textAlign = "center";
    noIssuesMsg.style.fontWeight = "bold";
    noIssuesMsg.style.color = "green";
    validTableSection.appendChild(noIssuesMsg);
  } else {
    if (validatelist.length > 0) {
      createtable(validatelist, ["Severity", "Issue", "Suggestion"], false);
    }

    if (errorlist.length > 0) {
      createtable(errorlist, ["Errors"], true);
    }
  }

}

<<<<<<< HEAD:frontend/script/index.js
function createtable(datalist, headlist) {
=======
function createtable(datalist, headlist, iserror) {

>>>>>>> 7b7d31b904ce526f066ad22c69a1b2840b40ecc4:frontend/scripts/index.js
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

  datalist.forEach(data => {
    const row = document.createElement("tr");

    const cells = iserror ? [data.errors] : [data.severity, data.issue, data.suggestion];
    cells.forEach(value => {
      const td = document.createElement("td");
      td.textContent = value || "";
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  validTableSection.appendChild(table);

  const comparisonButton = document.createElement("button");
  comparisonButton.id = "comparisonButton";
  comparisonButton.className = "btn";
  comparisonButton.style.marginTop = "3rem";
  comparisonButton.textContent = "Compare Response to Human";

  validTableSection.appendChild(comparisonButton);
}

validTableSection.addEventListener("click", async (event) => {
  const target = event.target;

    if (target && target.id === "comparisonButton") {// compare button is clicked
      try{
        if(currentCode === ""){// doesn't support files yet
          alert("Please enter your code in the text box");
          return;
        }
        const result = await axios.post(`${BASE_URL}/humanToAiComparison.php` , {
          code : currentCode,
        });
        const data = result.data;
        const reviews = Array.isArray(data) ? data : data.reviews || [];
      if (!reviews || reviews.length === 0) {
        alert("No human reviews found for this code.");
        return;
      }

        let html = `<h1> Human Response </h1>
          <table class="table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Issue</th>
                <th>Suggestion</th>
              </tr>
            </thead>
            <tbody>
        `;
      reviews.forEach(hr => {
        html += `
          <tr>
            <td>${hr.sevirity || hr.severity || "N/A"}</td>
            <td>${hr.issue || "N/A"}</td>
            <td>${hr.suggestion || "N/A"}</td>
          </tr>
        `;
      });

        html += `
            </tbody>
          </table>
        `;
        humanReviewTable.innerHTML = html;
      }catch(err){
        console.log(err);
        alert("Server error, please try again");
      }
      
    }
  });

txtInputCodeElem.addEventListener("input", () => {
  fileInput.disabled = txtInputCodeElem.value.trim().length > 0;
});

fileInput.addEventListener("change", () => {
  txtInputCodeElem.disabled = fileInput.files.length > 0;
})

btngo.addEventListener("click", handleclickbutton);

clearBtn.addEventListener("click", () => {
  txtInputCodeElem.value = "";
  fileInput.value = "";
  validTableSection.innerHTML = "";
  humanReviewTable.innerHTML = "";
  fileInput.disabled = false;
  txtInputCodeElem.disabled = false;
});

async function initilCall(code, file, istext) {
  try {
    let result = null;
    let isCorrectResponse = true;
    let errorList = [];
    let validateList = [];

    if (istext) {
      result = await PostText(code);
    } else {
      result = await PostFile(file);
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

async function PostText(code) {
  try {
    const result = await axios.post(`${BASE_URL}/review.php`, { code });
    return result;
  } catch (error) {
    return { error: error.message };
  }
}

async function PostFile(file) {
  try {
    const formdata = new FormData();
    formdata.append("file", file);
    const response = await axios.post(`${BASE_URL}/review.php`, formdata, {
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

