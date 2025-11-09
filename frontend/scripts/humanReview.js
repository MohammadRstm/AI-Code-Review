const BASE_URL = "http://localhost/AI-Code-Review/server/apis";
let currentCode = "";
document.addEventListener("DOMContentLoaded", async () => {
try {
const res = await axios.get(`${BASE_URL}/generateCode.php`);
const data = res.data;
currentCode = data.code;// set state
const html = `
    <div class="code-block">
        <p class="code-line">${data.code}</p>
    </div>
`;

document.getElementById("codeListContainer").innerHTML = html;

}catch(err){
console.error(err);
alert("Server error : Failed to load code, please reload and try again.");
}
});
// Submit review
document.getElementById("submitReviewBtn").addEventListener("click", async () => {

const issue = document.getElementById("issueText").value.trim();
const suggestion = document.getElementById("suggestionText").value.trim();
const severity = document.getElementById("severitySelect").value;

if (!issue || !suggestion) {
alert("Please fill in all fields.");
return;
}

try {
await axios.post("http://localhost/AI-Code-Review/server/apis/saveHumanReview.php", {
code : currentCode,
humanReview :{
    issue: issue,
    suggestion: suggestion,
    severity: severity
}
});
alert("Review submitted successfully!");
} catch (err) {
console.error(err);
alert("Error submitting review.");
}
});
