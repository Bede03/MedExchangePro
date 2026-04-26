$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtbm5sMHFpaDAwMHZpbXk3aXB1cmo5d3EiLCJlbWFpbCI6ImplYW5Aa2ZoLnJ3Iiwicm9sZSI6ImFkbWluIiwiaG9zcGl0YWxJZCI6ImNtbm5sMHFmZjAwMDFpbXk3OXFubmszcmgiLCJpYXQiOjE3NzcwNjc1ODksImV4cCI6MTc3NzY3MjM4OX0.pwzvvBNznUC16ip2NNusT3zDRgdH6q8ak4bzdgjqC9s"

# Test getting patient by ID (KFH patient)
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/patients/1/combined" -UseBasicParsing -Headers @{"Authorization"="Bearer $token"}
$response.Content