<?php
function handleRequestError($message , $code = 500){
    http_response_code($code);// BAD request 
    $response["success"] = false;
    $response["message"] = $message;
    echo json_encode($response);
    exit();
}
?>