<?php
include_once __DIR__."/callOpenAI.php";
function validIdResult($content){
    if(!is_array($content)){
        return false;
    }
    if(!isset($content["id"])){
        return false;
    }
    // can be null
    if(!$content["id"]){
        return true;
    }
    if(!is_string($content["id"])){
        return false;
    }

    return true;
}

function matchCodeToCase($code , $savedCases){
    $instruction = <<<EOD
    I want you to checkout this code:
    $code
    I want you to find in the following list of codes, one that matches the same case as the code above.
    The code above may contain an error or may not.
    You have to try and find a code in the following list that containes the same idea of the error and give me 
    its corresponding id in the list.
    I don't want any extra explanation just give me the resultent id if you find it. if you don't then return null.
    It's very important that you either return the id or null and nothing else.
    The list of codes & their ids:
    $savedCases
    The result I'm expecting from you is a json object like this:
    {
        "id" : "id value || null"
    }
    EOD;

    $results = requestOpenAi($instruction);
    $decodedResults = json_decode($results, true);
    $contentString = $decodedResults["choices"][0]["message"]["content"];
    // Decode the content string (which is JSON)
    $content = json_decode($contentString, true);
    logMessage("RAW Human Review CONTENT : " . print_r($content, true));
    if($content && validIdResult($content)){
        return $content;
    }else{
        return null;// ai failed to find a match
    }
}


?>