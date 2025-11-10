<?php
include "../database/connection.php";
include "../utils/handleRequestError.php";
include "../services/aiServices/matchHumanReviews.php";

$data = json_decode(file_get_contents('php://input') , true);
if(!isset($data["code"])){
    handleRequestError("Missing arguments" , 401);
}

// we are going to ask openai if the code given by the user matches any of our cases saved in the db
// for now we'll give the ai all the codes we currently have in our db -> incredibly insecure & inefficient
// the open ai must return the id of the code it thinks matches this case , then we join to get human reviews
$sql = 'SELECT * FROM codes';
$query = $conn->prepare($sql);
$query->execute();
$results = $query->get_result();

$codeCases = [];
while($row = $results->fetch_assoc()){
    $codeCases[] = $row;
}


$result_id = matchCodeToCase($data["code"] , $codeCases);
logMessage("Resultant ID $result_id");

// fetch human reviews
if($result_id != null){
    $casted_result_id = (int)$result_id;
    $sql = "SELECT issue , suggestion , sevirity
            FROM humanReviews
            WHERE code_id = ?";
    
    $query = $conn->prepare($sql);query: 
    $query->bind_param("i",$casted_result_id);
    $query->execute();
    
    $humanReviewResults = $query->get_result();
    $humanReviews = [];
    while($row = $humanReviewResults->fetch_assoc()){
        $humanReviews[] = $row;
    }
    
    echo json_encode($humanReviews);
}else{
    echo json_encode(["error" => "Failed to find a match"]);
}

?>