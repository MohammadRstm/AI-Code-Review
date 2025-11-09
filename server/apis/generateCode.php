<?php
    include "../utils/headers.php";
    include "../services/aiServices/autoCodeGeneration.php";
    include_once "../config.php";

    $currentLanguage = mt_rand(0,count(LANGAUGES) - 1); 
    $code = generateCode(LANGAUGES[$currentLanguage]);
    if($code){
        echo json_encode($code);
    }else{
        echo json_encode(["error" => "Failed to generate code"]);
    }
?>