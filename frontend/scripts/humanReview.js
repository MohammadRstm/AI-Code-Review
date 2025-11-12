const BASE_URL = "http://localhost/AI-Code-Review/server/apis";
let currentCode = "";
let currentLanguage = "";
const callGenerateCodeApi = async()=>{
    try {
        document.getElementById("codeListContainer").innerHTML = `<p>Generating Code...</p>`;
        const res = await axios.get(`${BASE_URL}/generateCode.php`);
        const data = res.data;
        if(data.error){
            alert("Failed to generate code, please try again(reload the page)");
            return;
        }
        currentCode = data.code;// set state
        currentLanguage = data.language;

        if(currentLanguage){
            const languageTitle = document.getElementById("languageTitle");
            languageTitle.textContent = `Review Code (${currentLanguage})`;
        }
       
        const html = `
            <div class="code-block">
                <p class="code-line">${data.code == "" ? "Please reload the page to try again" : data.code}</p>
            </div>
        `;

        document.getElementById("codeListContainer").innerHTML = html;

    }catch(err){
        console.error(err);
        alert("Server error : Failed to load code, please reload and try again.");
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    await callGenerateCodeApi();
});
// Submit review
document.getElementById("submitReviewBtn").addEventListener("click", async () => {

const issue = document.getElementById("issueText").value.trim();
const suggestion = document.getElementById("suggestionText").value.trim();
const severity = document.getElementById("severitySelect").value;

if (!suggestion) {// issue field can be empty (incase no errors)
alert("Please fill in required fields.");
return;
}

try {
await axios.post(`${BASE_URL}/saveHumanReview.php`, {
code : currentCode,
humanReview :[
{
    issue: issue ? issue : null,
    suggestion: suggestion,
    sevirity: severity
}
]

});
// reset
document.getElementById("issueText").value = "";
document.getElementById("suggestionText").value = "";
// regenerate code
await callGenerateCodeApi();
alert("Review submitted successfully!");
} catch (err) {
console.error(err);
alert("Error submitting review.");
}
});
