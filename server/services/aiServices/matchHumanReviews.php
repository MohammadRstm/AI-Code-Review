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
     if ($content["id"] === null) {
        return true;
    }
    if(!is_string($content["id"]) &&  !is_int($content["id"])){
        return false;
    }

    return true;
}

function matchCodeToCase($code , $savedCases , $retry = 0){
    $parsedCodeCases = json_encode($savedCases);
    $instruction = <<<EOD
        You are a strict code matching assistant. Follow these rules exactly:
        1. First, check if the code below matches **exactly** any code in the given list. If you find an exact match, return its corresponding id immediately.
        2. If no exact match is found, try to find a code that has a **similar error or idea** and return its id.
        3. If no code matches even by similarity, return null.
        4. Do NOT add any explanation, commentary, or formatting. Only return the JSON object exactly as specified.

        Here is the code to check:
        $code

        The list of codes with their ids:
        $parsedCodeCases

        Return only a JSON object in this format:
        {
            "id": "id value if a match is found, or null if no match is found"
        }
    EOD;

    $results = requestOpenAi($instruction);
    $decodedResults = json_decode($results, true);
    $contentString = $decodedResults["choices"][0]["message"]["content"];
    // Decode the content string (which is JSON)
    $content = json_decode($contentString, true);
    logMessage("RAW Human Review CONTENT : " . print_r($content, true));
    if($content && validIdResult($content)){
        return $content["id"];
    }else if($retry < 4){
        return matchCodeToCase($code , $savedCases, $retry + 1);
    }else{
        return null;// ai failed to find a match
    }
}


?>