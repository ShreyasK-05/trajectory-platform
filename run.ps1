# 1. Environment Check & Loading
if (Test-Path ".env") {
    Write-Host "--- Loading secrets from .env ---" -ForegroundColor Cyan
    foreach ($line in Get-Content .env) {
        if ($line -and !$line.StartsWith("#")) {
            $name, $value = $line.Split('=', 2)
            if ($name -and $value) {
                [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), "Process")
            }
        }
    }
}

Write-Host "--- Booting TrajectoryAI Backend ---" -ForegroundColor Green

# 1/6: Discovery Server
Write-Host "Starting Discovery Server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title Discovery; cd discovery-server; ./mvnw spring-boot:run"
Start-Sleep -Seconds 15

# 2/6: Auth Service
Write-Host "Starting Auth Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title Auth; cd auth-service; ./mvnw spring-boot:run"
Start-Sleep -Seconds 8

# 3/6: User Profile Service
Write-Host "Starting User Profile Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title Profile; cd user-profile-service; ./mvnw spring-boot:run"
Start-Sleep -Seconds 8

# 4/6: Career Graph Service
Write-Host "Starting Career Graph Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title Graph; cd career-graph-service; ./mvnw spring-boot:run"
Start-Sleep -Seconds 8

# 5/6: API Gateway
Write-Host "Starting API Gateway..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title Gateway; cd api-gateway; ./mvnw spring-boot:run"
Start-Sleep -Seconds 5

# 6/6: AI Inference Worker
Write-Host "Starting AI Inference Worker..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title AI-Worker; cd ai-inference-worker; python -m uvicorn app:app --reload --port 8000"

Write-Host "All 6 services are spawning! Check the new windows for logs." -ForegroundColor Green