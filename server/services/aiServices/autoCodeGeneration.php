<?php
include_once __DIR__."/callOpenAI.php";

function validateCodeGeneration($content){
    if(!is_array($content)){
        return false;
    }
    if(!isset($content["code"])){
        return false;
    }
    if(!is_string($content["code"])){
        return false;
    }

    return true;
}

function generateCode($language , $retry = 0){
    $instruction = <<<EOD
    Generate a code snippet in the $language programming language.
    The code must contain at least one error, which can be:

    A syntax error

    A logical error

    Messy or poorly structured code (could be cleaner)

    Output only a JSON object with a single attribute:
    
    {
        "code" : "...actual code..."
    }
    
    Do not include any explanations, text, comments, or formatting outside this JSON.
    Do not add comments in the code indicating where the errors are.
    Each generated code snippet must be new, unique, and contain at least one error.
    The JSON must be valid and parseable.
    If you cannot generate the code, still return a JSON object with a "code" key and an empty string as the value:
    {
        "code" : ""
    }
    Important: Do not return anything except this JSON object, under any circumstances.
    EOD;

    $results = requestOpenAi($instruction);
    $decodedResults = json_decode($results, true);
    $contentString = $decodedResults["choices"][0]["message"]["content"];
    // Decode the content string (which is JSON)
    $content = json_decode($contentString, true);
    logMessage("RAW CODE GENERATION CONTENT : " . print_r($content, true));
    if(validateCodeGeneration($content)){
        return $content["code"];
    }else if($retry < 4){
        return generateCode($language, $retry + 1);
    }else{
        return null;
    }
}

?>