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

function generateCode($language){
    $instruction = <<<EOD
    I want you to give me a code snippet of the $language language
    I want the code to contain some error(s)
    The errors can be:
    -logical ones
    -Syntax errors
    -messy code (could be cleaner)

    The structure you should give me is a json object with the code attribute only, its value is the actual code
    so something like this
    {
        "code" : "...actual code..."
    }
    I only want you to give me the json object directly with no extra explanation or formatting
    EOD;

    $results = requestOpenAi($instruction);
    $decodedResults = json_decode($results, true);
    $contentString = $decodedResults["choices"][0]["message"]["content"];
    // Decode the content string (which is JSON)
    $content = json_decode($contentString, true);
    logMessage("RAW CODE GENERATION CONTENT : " . print_r($content, true));
    if(validateCodeGeneration($content)){
        return $content["code"];
    }else{
        return null;
    }
}

?>