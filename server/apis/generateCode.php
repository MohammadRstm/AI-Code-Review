<?php
    include "../utils/headers.php";
    include "../services/aiServices/autoCodeGeneration.php";
    include_once "../config.php";

    $currentLanguageIndex = mt_rand(0,count(LANGAUGES) - 1); 
    $currentLanguage = LANGAUGES[$currentLanguageIndex];
    $code = generateCode($currentLanguage);
    if($code != null){
        echo json_encode([
            "code" => $code,
            "language" => $currentLanguage
        ]);
    }else{
        echo json_encode(["error" => "Failed to generate code"]);
    }
?>