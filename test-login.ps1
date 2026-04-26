$body = @{
    email = "jean@kfh.rw"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -UseBasicParsing -Method "POST" -Body $body -ContentType "application/json"
$response.Content