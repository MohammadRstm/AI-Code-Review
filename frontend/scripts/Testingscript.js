const testCodes = [
  {
    title: "Small Python code with many syntax and logic errors",
    code: `
def add_numbers(a, b)
    result = a + b
    print("Result is " result)
    return reslt
  `,
    expectedResults: [
      { severity: "high", issue: "Missing colon after function definition", suggestion: "Add ':' after function signature." },
      { severity: "high", issue: "String concatenation syntax error", suggestion: "Use commas or f-strings to combine text and variables." },
      { severity: "high", issue: "Undefined variable 'reslt'", suggestion: "Fix variable name or define it before use." }
    ]
  },
  {
    title: "Small Python code - clean and perfect",
    code: `
def add_numbers(a, b):
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise ValueError("Both inputs must be numbers")
    return a + b
  `,
    expectedResults: []
  },
  {
    title: "Large JavaScript code - many issues (no semicolons, unused vars, etc.)",
    code: `
function processUsers(users){
    for(let i=0; i<users.length; i++){
        if(users[i].age > 18){
            console.log(users[i].name)
        }
    }
    let temp = 5
    if(temp = 10){
        console.log('wrong comparison')
    }
    function helper(){
        console.log("nested function never called")
    }
  `,
    expectedResults: [
      { severity: "medium", issue: "Missing semicolons", suggestion: "Add semicolons to the end of statements." },
      { severity: "high", issue: "Assignment used instead of comparison", suggestion: "Use '===' or '==' instead of '='." },
      { severity: "low", issue: "Unused function 'helper'", suggestion: "Remove unused code or call it if needed." },
      { severity: "high", issue: "Missing closing bracket for function", suggestion: "Ensure all functions and braces are properly closed." }
    ]
  },
  {
    title: "Large JavaScript code - clean and structured",
    code: `
function processUsers(users) {
    if (!Array.isArray(users)) throw new Error("Expected array");
    
    users
      .filter(u => u.age > 18)
      .forEach(u => console.log(u.name));
}

processUsers([{ name: "Alice", age: 21 }, { name: "Bob", age: 16 }]);
  `,
    expectedResults: []
  },
  {
    title: "C code with syntax and memory errors",
    code: `
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *arr = malloc(5 * sizeof(int));
    for(int i = 0; i <= 5; i++) { // Off-by-one error
        arr[i] = i;
    }
    printf("Done");
    return 0; // memory leak
  }
  `,
    expectedResults: [
      { severity: "high", issue: "Off-by-one array index", suggestion: "Loop should use i < 5, not i <= 5." },
      { severity: "medium", issue: "Memory leak", suggestion: "Use free(arr) before returning." },
      { severity: "high", issue: "Missing closing brace", suggestion: "Ensure all braces are properly closed." }
    ]
  },
  {
    title: "C code - clean and correct",
    code: `
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *arr = malloc(5 * sizeof(int));
    if (!arr) {
        fprintf(stderr, "Memory allocation failed");
        return 1;
    }

    for (int i = 0; i < 5; i++) {
        arr[i] = i;
    }

    for (int i = 0; i < 5; i++) {
        printf("%d ", arr[i]);
    }

    free(arr);
    return 0;
}
  `,
    expectedResults: []
  },
  {
    title: "Java code - logic and naming issues",
    code: `
public class Calculator {
    public static void main(String[] args) {
        int result = add(5, "ten");
        System.out.println("Result: " + result);
    }

    static int add(int a, int b) {
        return a + b;
    }
  }
  `,
    expectedResults: [
      { severity: "high", issue: "Type mismatch - passing string to int parameter", suggestion: "Convert 'ten' to an integer or change parameter type." },
      { severity: "low", issue: "Class braces indentation issue", suggestion: "Maintain consistent indentation for readability." }
    ]
  },
  {
    title: "Java code - clean and correct",
    code: `
public class Calculator {
    public static void main(String[] args) {
        int result = add(5, 10);
        System.out.println("Result: " + result);
    }

    static int add(int a, int b) {
        return a + b;
    }
}
  `,
    expectedResults: []
  },
  {
    title: "HTML code with missing tags and inline styles",
    code: `
<html>
  <head><title>Test</title></head>
  <body>
    <h1 style="color:red">Hello World
    <p>This is missing closing tags
  </body>
</html>
  `,
    expectedResults: [
      { severity: "high", issue: "Missing closing tags", suggestion: "Add </h1> and </p>." },
      { severity: "medium", issue: "Inline styles", suggestion: "Use CSS instead of inline styles for maintainability." }
    ]
  },
  {
    title: "PHP code - vulnerable and error-prone",
    code: `
<?php
  $user = $_GET['user'];
  echo "Welcome $user"; // XSS vulnerability
  include("config.php"); // unnecessary include
  ?>
  `,
    expectedResults: [
      { severity: "high", issue: "Cross-site scripting (XSS)", suggestion: "Sanitize user input with htmlspecialchars." },
      { severity: "medium", issue: "Unnecessary file inclusion", suggestion: "Include only required files." }
    ]
  },
  {
    title: "SQL code - unsafe query",
    code: `
  SELECT * FROM users WHERE username = 'admin' OR '1'='1';
  `,
    expectedResults: [
      { severity: "high", issue: "SQL Injection vulnerability", suggestion: "Use parameterized queries instead of string concatenation." }
    ]
  },
  {
    title: "SQL code - secure parameterized version",
    code: `
  SELECT * FROM users WHERE username = ?;
  `,
    expectedResults: []
  }
];

const BASE_URL = "http://localhost/AI-Code-Review/server/apis";

class TestAiReviewer {
  async apiCall(code) {
    try {
      const response = await axios.post(`${BASE_URL}/review.php`, { code });
      this.response = response.data;
    } catch (err) {
      console.log(err.message);
    }
  }

  async initiateTesting() {
    const testList = [];

    for (let index = 0; index < testCodes.length; index++) {
      const t = testCodes[index];
      await this.apiCall(t.code); // wait for API to finish
      let message = "";

      let errorMessage = this.validateResponseStructure();
      if (errorMessage !== "") {
        message = "incorrect structure | " + errorMessage;
      } else {
        errorMessage = this.validateExpectedAnwer(t);
        if (errorMessage !== "") {
          message = "Unexpected answer | " + errorMessage;
        } else {
          message = "passed";
        }
      }

      testList.push({
        index,
        title: t.title,
        message,
      });
    }

    return testList;
  }


  validateResponseStructure() {
    const response = this.response;
    if (!response) return "Response is empty or undefined.";

    if (typeof response !== "object" || Array.isArray(response)) {
      return "Response is not a valid object.";
    }

    if (!response.hasOwnProperty("file")) {
      return "Missing 'file' field.";
    }

    if (response.file !== null && typeof response.file !== "string") {
      return "'file' must be null or a string.";
    }

    if (!response.hasOwnProperty("issues")) {
      return "Missing 'issues' field.";
    }

    if (!Array.isArray(response.issues)) {
      return "'issues' must be an array.";
    }

    for (let i = 0; i < response.issues.length; i++) {
      const issue = response.issues[i];
      if (typeof issue !== "object" || Array.isArray(issue)) {
        return `Issue #${i} is not a valid object.`;
      }

      const requiredFields = ["severity", "issue", "suggestion"];
      for (const field of requiredFields) {
        if (!issue.hasOwnProperty(field)) {
          return `Issue #${i} missing field '${field}'.`;
        }
        if (typeof issue[field] !== "string") {
          return `Field '${field}' in issue #${i} must be a string.`;
        }
      }
    }

    return "";
  }

  validateExpectedAnwer(testCase) {
    const { expectedResults } = testCase;
    const actual = this.response.issues;

    if (expectedResults.length === 0 && actual.length === 0) return "";

    if (expectedResults.length === 0 && actual.length > 0) {
      let checkLow = true;
      actual.forEach(i => {
        if (i.issue !== "low") checkLow = false;
      });
      if (!checkLow) return "Expected no issues but got some.";
    }

    if (expectedResults.length > 0 && actual.length === 0)
      return "Expected issues but got none.";

    const expectedHighs = expectedResults.filter(i => i.severity === "high").length;
    const actualHighs = actual.filter(i => i.severity === "high").length;

    if (Math.abs(expectedHighs - actualHighs) > 1)
      return "Mismatch in severity distribution (too few/many high-severity issues).";

    return "";
  }
}

const test = new TestAiReviewer();

async function createANdFillTable() {
  document.getElementById("tableContainer").innerHTML = "<p>Running tests...</p>";

  const testList = await test.initiateTesting();

  let tableHtml = `
    <table>
      <thead>
        <tr>
          <th>Test Number</th>
          <th>Title</th>
          <th>Comment</th>
        </tr>
      </thead>
      <tbody>
  `;

  testList.forEach(element => {
    tableHtml += `
      <tr>
        <td>${element.index}</td>
        <td>${element.title}</td>
        <td><pre>${element.message}</pre></td>
      </tr>
    `;
  });

  tableHtml += "</tbody></table>";
  document.getElementById("tableContainer").innerHTML = tableHtml;
}


const Testingbtn = document.getElementById("Testingbtn");
Testingbtn.addEventListener("click", () => {
  createANdFillTable();
});
