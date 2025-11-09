<?php
include_once "./callOpenAI.php";

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
    just the block of code
    EOD;

    $results = requestOpenAi($instruction);
    $content = json_decode((json_decode($results , true))["choices"][0]["message"]["content"] , true);
    logMessage("RAW CONTENT : $content");
    if(validateCodeGeneration(json_decode($content))){
        return $content;
    }else{
        return null;
    }
}

?>