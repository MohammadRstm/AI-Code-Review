<?php
function handleRequestError($message , $code){
    http_response_code($code);// BAD request 
    $response["success"] = false;
    $response["message"] = $message;
    echo json_encode($response);
    exit();
}
?>