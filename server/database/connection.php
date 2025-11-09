<?php

$db_user = "root";
$db_password = "";
$db_server = "localhost";
$db_name = "Ai-Code_Reviewer";

$conn = new mysqli($db_server,$db_user,$db_password,$db_name,3307);
if(!$conn || $conn ->error){
    die("DB CONNECTION FIALED |" . $conn->error);
}

?>