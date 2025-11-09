<?php 
include '../../config.php';
include_once "../../utils/logMessage.php";
function requestOpenAi($instruction){// call the openAI
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
                "temperature" => 0.3,// controls the model's randomness , since we are using it for code review we want it to be deterministic so set to 0.3, the .3 is to make it think of cleaner code suggestions(a bit creative)
                "max_tokens" => MAX_Tokens,// number of tokens openai is allowed to use
                "frequency_penalty" => 0.3,// this discourages the ai from repeating words, we don't need to worry about it here though 0.3 should suffice
                "presence_penalty" => 0// this option allows openai to talk about new things, opening it for novelty. I don't want it to be a philosopher so 0 is perfect here 
            ),JSON_UNESCAPED_UNICODE// optional(makes it so json encode accepts emojis and symbols) though we don't need it, I'm scared to touch this code
        );
    // call open AI
    $authorization = "Authorization: Bearer " . OPEN_AI_KEY;
    $ch = curl_init();
    curl_setopt($ch , CURLOPT_URL , "https://api.openai.com/v1/chat/completions");
    curl_setopt($ch,CURLOPT_POST , true);// can be removed since we are setting POSTFIELDS which emplies POST method usage
    curl_setopt($ch,CURLOPT_POSTFIELDS,$req);
    curl_setopt($ch,CURLOPT_SSL_VERIFYHOST , 2);// optional , used for security (verifying my SSL) but we don't need it since we are not deploying (2 means strict check)
    curl_setopt($ch,CURLOPT_SSL_VERIFYPEER , 1);// optional , same idea (verifying the SSL certificate)
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);// makes curl return res. as a string instead of printing it directly
    curl_setopt($ch , CURLOPT_HTTPHEADER , [
        'Content-Type: application/json',
        $authorization
    ]);
    $res = curl_exec($ch);
    if(!$res){
        $error = curl_error($ch);
        logMessage("CURL ERROR: $error");
    }
    curl_close($ch);
    if($res){
        logMessage("RAW RESPONSE: $res");
        return $res;
    } 
    else{
        return json_encode(["error" => "HTTP ERROR" . $error]);
    } 
}


?>