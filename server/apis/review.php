<?php
include "../utils/headers.php";
include "../utils/handleRequestError.php";
include "../services/aiServices/codeReview.php";
include_once "../utils/logMessage.php";

$contentType = $_SERVER["CONTENT_TYPE"] ?? '';// detect if JSON or multipart/form-data

if (strpos($contentType, "application/json") !== false) {
    $data = json_decode(file_get_contents("php://input"), true);
} else {
    $data = $_POST; // will be empty if only file is sent
}

if (empty($data["code"]) && empty($_FILES["file"])) {
    logMessage("INVALID REQUEST | NO ARGUMENTS");
    handleRequestError("You must at least include either the file or the code snippet", 401);
    exit;
}

if (!empty($data["code"]) && !empty($_FILES["file"])) {
    logMessage("INVALID REQUEST | TOO MANY ARGUMENTS");
    handleRequestError("Both code snippet and code file can't be included; choose one at a time", 401);
    exit;
}

if (!empty($_FILES["file"]) && $_FILES["file"]["error"] === UPLOAD_ERR_OK) {
    $fileCode = file_get_contents($_FILES["file"]["tmp_name"]);
    $response = reviewCode($fileCode);
    $fileName = $_FILES["file"]["name"];
}else if (!empty($data["code"])) {
    $response = reviewCode($data["code"]);
}

if (isset($response["error"])) {
    logMessage("FAILED TO GET A CORRECT AI RESPONSE, ABORTING...");
    echo json_encode(["error" => "FAILED TO REVIEW CODE: " . $response["error"]]);
} else {
    echo json_encode([
        "issues" => $response,
        "file" => $fileName ?? null
    ]);
}
?>