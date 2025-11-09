<?php
include "../database/connection.php";
include "../utils/handleRequestError.php";
include "../services/aiServices/matchHumanReviews.php";

// I have to get current ai response , and current code
// first try to match current code, if found we then try to match responses 
// or once we find a code match we return the reviews immediatly

$data = json_decode(file_get_contents('php://input') , true);
if(!isset($data["code"]) || !isset($data["aiReview"])){
    handleRequestError("Missing arguments" , 401);
}

// we are going to ask openai if the code given by the user matches any of our cases saved in the db
// for now we'll give the ai all the codes we currently have in out db
// the open ai must return the id of the code it thinks matches this case , then we join to get human reviews
$sql = 'SELECT * FROM codes';
$query = $conn->prepare($sql);
$results = $query->get_result();

$codeCases = [];
while($row = $results->fetch_assoc()){
    $codeCases[] = $row;
}

$result_id = matchCodeToCase($data["code"] , $codeCases);

// fetch human reviews
$sql = "SELECT issue , suggestion , sevirity
        FROM humanReviews
        WHERE code_id = ?";
$query = $conn->prepare($sql);query: 
$query->bind_param("s",$result_id);
$humanReviewResults = $query->get_result();
$humanReviews = [];
while($row = $humanReviewResults->fetch_assoc()){
    $humanReviews[] = $row;
}

echo json_encode($humanReviews);

?>