<?php
// include error handling file
include "../services/handleRequestError.php";
include "../services/callOpenAI.php";

// reveive data from client
$data = json_decode(file_get_contents('php://input'), true);

if(!isset($data["code"]) && !isset($_FILES["file"])){
    handleRequestError("You must atleast include either the file or the code snippet" , 401);
}else if(isset($data["code"]) && isset($_FILES["file"])){
    handleRequestError("Both code snippet and code file can't be included, choose one at a time to review" , 401);
}else if(isset($_FILES["file"]) && $_FILES["file"]["error"] === UPLOAD_ERR_OK){
    $tmp_file = $_FILES["file"]["tmp_name"];
    $fileCode = file_get_contents($tmp_file); 
    $response = reviewCode( $fileCode, $_FILES["file"]["name"]);
}else if(isset($data["code"])){
    $code = $data["code"];
    $response = reviewCode($code);
}

header('Content-Type: application/json');

if(isset($response["error"])){
    echo json_encode(["error" => "FAILED TO REVIEW CODE : ". $response["error"]]);
}else{
    echo json_encode($response);
}
?>