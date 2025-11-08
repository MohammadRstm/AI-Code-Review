<?php 
include './config.php';
function requestOpenAi($instruction){
    // generate request
    $req = json_encode(
        array(
            "model" => GPT_VER,
            "messages" => array(
                array(
                    "role" => "system",
                    "content" => $instruction
                )
                ),
                "temperature" => 1,
                "max_tokens" => MAX_Tokens,
                "top_p" => 1,
                "frequency_penalty" => 0,
                "presence_penalty" => 0
            ),JSON_UNESCAPED_UNICODE
        );
    // call open AI
    $authorization = "Authorization: Bearer " . OPEN_AI_KEY;
    $ch = curl_init();
    curl_setopt($ch , CURLOPT_URL , "https://api.openai.com/v1/chat/completions");
    curl_setopt($ch,CURLOPT_POST , true);
    curl_setopt($ch,CURLOPT_POSTFIELDS,$req);
    curl_setopt($ch,CURLOPT_SSL_VERIFYHOST , 2);
    curl_setopt($ch,CURLOPT_SSL_VERIFYPEER , 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch , CURLOPT_HTTPHEADER , [
        'Content-Type: application/json',
        $authorization
    ]);
    $res = curl_exec($ch);
    if(!$res){
        $error =  "HTTP ERROR" . curl_error($ch);
    }
    curl_close($ch);
    if($res) return $res;
    else echo $error;
}

function validateStructure($response) {

    /*
        we expect this output : 
        [
            {"severity":"sevirity 1","issue":"issue 1","suggestion":"suggestion 1"},
            {"severity":"sevirty 2","issue":"issue 2","suggestion":"suggestion 2"},
            ...,
            (optional)
            "file" : "file name"
        ]
    */

    // If response not an array, reject
    if (!is_array($response)) {
        return false;
    }

    // allow empty array as their maybe no issues
    if (count($response) === 0) {
        return true;
    }

    $allowedSeverities = ["high", "medium", "low"];

    // Check each item in the array
    foreach ($response as $item) {
        // check if its an array/object
        if (!is_array($item)) {
            return false;
        }

        // check required fields
        if (!isset($item['severity'], $item['issue'], $item['suggestion'])) {
            return false;
        }

        // validate severity value
        if (!in_array(strtolower($item['severity']), $allowedSeverities)) {
            return false;
        }

        // Extras : check types
        if (!is_string($item['issue']) || !is_string($item['suggestion'])) {
            return false;
        }
    }
    // type check for file
    if((isset($item['file']) && !is_string($item['file']))){
        return false;
    }
    return true;
}


function reviewCode($code , $fileName = "no file" , $retry = 0){
    // to avoid infinite recursion
    if($retry > 10) return ["error" => "Failed to receive correct structure from AI"];
    // generate instruction
    $instruction = "You are strictly a code reviewer. I'm going to give you a code snippet. 
    Read it carefully, find issues, and return an array of JSON object(s) with these exact fields:
    severity, issue, suggestion.

    Constraints:
    - The issue and suggestion fields must not be too detailed, just an overall idea.
    - The severity must be one of: 'high', 'medium', or 'low'.

    Code:
    $code
    Return only the array of JSOn object(s), with no explanation or formatting.
    ";
    // call api
    $response = requestOpenAi($instruction);
    $responseData = json_decode($response , true);

    if($responseData == null || !validateStructure($responseData)){
        return reviewCode($code , $fileName , $retry + 1);
    }else{// success
        // add file name if it exists
        if(strcmp($fileName , "no file") != 0){
            $responseData["file"] = $fileName;  
        }
        return $responseData;         
    }
}




?>