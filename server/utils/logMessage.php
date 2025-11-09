<?php

$LOG_FILE = __DIR__ . '/../logs/openai_responses.log';

function logMessage($message) {
    global $LOG_FILE;// tells the function to use the $LOG_FILE in the global scope declared above
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($LOG_FILE, "[$timestamp] $message\n", FILE_APPEND);
}

?>