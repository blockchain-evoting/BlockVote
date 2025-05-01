# Start the server in mock mode
Write-Host "Starting BlockVote API server in MOCK MODE..." -ForegroundColor Yellow

# Set the environment variable for mock mode
$env:MOCK_MODE = "true"
$env:API_PORT = "3001"  # Use a consistent port

# Kill any existing node processes that might be using the port
Get-Process -Name "node" -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*server.ts*" } | 
    Stop-Process -Force

# Start the server
Write-Host "Starting server on port $env:API_PORT with mock data..." -ForegroundColor Cyan
npm run dev
