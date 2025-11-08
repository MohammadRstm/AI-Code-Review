<?php 
include '../config.php';
include_once "../utils/logMessage.php";
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

function validateStructure($response) {
    /*
        we expect this output from the AI: 
        [
            {"severity":"sevirity 1","issue":"issue 1","suggestion":"suggestion 1"},
            {"severity":"sevirty 2","issue":"issue 2","suggestion":"suggestion 2"},
            ...,
            (optional)
            "file" : "file name"
        ]
        In this function it should be decoded into an associtive array
    */
    
    if($response == null){
        return "Response not parsable to JSON";
    }

    // must be an array/object 
    if (!is_array($response)) {
        return "Response is not an array or object";
    }

    // if response is empty array, allow --> no errors
    if (count($response) === 0) {
        return null;
    }

    // incase ai returns only one object wrap it in array for uniform processing
    if (isset($response['severity'])) {
        $response = [$response];
    }

    foreach ($response as $index => $item) {
        // must be an object
        if (!is_array($item)) {
            return "Item at index $index is not an object";
        }

        // check required fields
        if (!isset($item['severity'], $item['issue'], $item['suggestion'])) {
            return "Missing required fields in item at index $index , remember each item must contain severity , issue and suggestion fields";
        }

        // validate severity
        if (!in_array(strtolower($item['severity']), ALLOWED_SEVERITIES)) {
            return "Invalid severity in item at index $index , remember sevirty can be one of these (high , medium , low)";
        }

        // type checks
        if (!is_string($item['issue']) || !is_string($item['suggestion'])) {
            return "Issue or suggestion is not a string in item at index $index";
        }
    }

    return null;// no errors
}


function reviewCode($code , $retry = 0 , $error = null , $previousResponse = null){
    // to avoid infinite recursion
    if($retry > 4) return ["error" => "Failed to receive correct structure from AI"];
    // generate instruction
    if($retry == 0){// if on first try, give initial prompt
        $instruction = <<<EOD
        You are strictly a code reviewer. I'm going to give you a code snippet. 
        Read it carefully, find issues, and return an array of JSON object(s) with these exact fields:
        severity, issue, suggestion.
    
        Constraints:
        - The issue and suggestion fields must not be too detailed, just an overall idea.
        - The severity must be one of: 'high', 'medium', or 'low'.
    
        Code:
        $code
        Return only the array of JSON object(s), with no explanation or formatting.
        EOD;
    }else{// modify the instruction guiding the AI to the right output
        $instruction = <<<EOD
        I previously asked you to review my code and find issues in it, then return 
        an array of JSON object(s) with these exact fields:
        severity, issue , suggestion.

        Constraints:
        - The issue and suggestion fields must not be too detailed, just an overall idea.
        - The severity must be one of: 'high', 'medium', or 'low'.

        Code :
        $code
        Only return the array of JSON object(s), with no explanation or formatting.

        But you faild to deliver the right struture.
        Your response was :
        $previousResponse
        The mistake you did was : 
        $error
        Please take your time, obey the rules I gave you and retry.
        EOD;
    }

    // call api
    $response = requestOpenAi($instruction);
    $responseData = json_decode($response , true);
    
    $content = $responseData['choices'][0]['message']['content'];
    $parsedContent = json_decode($content , true);
    logMessage("RAW CONTENT: $content"); 

    // validate response
    $error = validateStructure($parsedContent);
    if($error != null){
        logMessage("VALIDATION ERROR: $error \n RESPONSE: " . json_encode($parsedContent));
        $previousEncodedResponse = json_encode($parsedContent , JSON_UNESCAPED_UNICODE);// return to json so AI can see response clearly
        return reviewCode($code ,  $retry + 1 , $error , $previousEncodedResponse);
    }else{// success
        logMessage("SUCCESSFUL REVIEW: " . json_encode($parsedContent));
        return $parsedContent;         
    }
}




?>