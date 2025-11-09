<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type");

include "../services/handleRequestError.php";
include "../services/callOpenAI.php";
include_once "../utils/logMessage.php";

// what we need to do next : 
// create Human to AI comparison -- 


$data = json_decode(file_get_contents('php://input'), true);// code snippet

if(!isset($data["code"]) && !isset($_FILES["file"])){
    logMessage("INVALID REQUEST | NO ARGUMENTS");
    handleRequestError("You must atleast include either the file or the code snippet" , 401);
}else if(isset($data["code"]) && isset($_FILES["file"])){
    logMessage("INVALID REQUEST | TOO MANY ARGUMENTS");
    handleRequestError("Both code snippet and code file can't be included, choose one at a time to review" , 401);
}else if(isset($_FILES["file"]) && $_FILES["file"]["error"] === UPLOAD_ERR_OK){
    $fileCode = file_get_contents($_FILES["file"]["tmp_name"]); 
    $response = reviewCode( $fileCode);
    $fileName = $_FILES["file"]["name"];
}else if(isset($data["code"])){
    $code = $data["code"];
    $response = reviewCode($code);
}

header('Content-Type: application/json');
if(isset($response["error"])){
    logMessage("FAILED TO GET A CORRECT AI RESPONSE, ABORTING...");
    echo json_encode(["error" => "FAILED TO REVIEW CODE : ". $response["error"]]);
}else{
    echo json_encode([
        "issues" => $response,
        "file" => (isset($fileName) ? $fileName : null)
    ]);
}
?>