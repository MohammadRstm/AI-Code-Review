<?php
include "../utils/headers.php";
include "../database/connection.php";
include "../utils/handleRequestError.php";

$data = json_decode(file_get_contents('php://input'), true);

if(!isset($data["code"]) || !isset($data["humanReview"])){
    handleRequestError("Missing arguments" , 401);
}

// save new code
$sql = "INSERT INTO codes(code) VALUES(?)";
$query = $conn->prepare($sql);
$query->bind_param("s" , $data["code"]);
$query->execute();

$code_id = $conn->insert_id;

// save human review(s) to that code 
foreach($data["humanReview"] as $review){
    $sql = "INSERT INTO humanReviews(code_id , sevirity , issue , suggestion) VALUES(?, ? , ? , ?)";
    $query = $conn->prepare($sql);
    $query->bind_param("isss" ,$code_id,$review["sevirity"],$review["issue"],$review["suggestion"]);
    $query->execute();
}

$query->close();
$conn->close();
?>