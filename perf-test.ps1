Write-Host 'Running SafeSteps performance tests...'

for ( = 1;  -le 100; ++) {
    Invoke-WebRequest -Uri 'http://localhost:3000/messages' 
        -Method POST 
        -Body '{\"channelId\":\"chan-001\",\"fromUserId\":\"child-123\",\"toUserId\":\"parent-456\",\"body\":\"test message \"}' 
        -ContentType 'application/json'
}

Write-Host 'Performance test complete.'
