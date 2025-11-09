<?php

include_once "./callOpenAI.php";

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