param(
    [switch]$AutoConfirm
)

# Resolve repository root (script location)
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Kill-ProcessOnPort($port) {
    try {
        $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($conn) {
            $pid = $conn.OwningProcess
            Write-Host "Port $port in use by PID $pid. Stopping process..."
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
    } catch {
        Write-Host "Could not check port $port: $_"
    }
}

function Get-NgrokPublicUrl {
    for ($i=0; $i -lt 30; $i++) {
        try {
            $resp = Invoke-RestMethod -Uri http://127.0.0.1:4040/api/tunnels -ErrorAction SilentlyContinue
            if ($resp.tunnels -and $resp.tunnels.Count -gt 0) {
                foreach ($t in $resp.tunnels) {
                    if ($t.public_url -like "https*") {
                        return $t.public_url
                    }
                }
                return $resp.tunnels[0].public_url
            }
        } catch {}
        Start-Sleep -Seconds 1
    }
    return $null
}

Write-Host "Repository root: $RepoRoot"

# Free common ports
Kill-ProcessOnPort 5000
Kill-ProcessOnPort 5173

# Start backend
Write-Host "Starting backend in new window..."
Start-Process powershell -ArgumentList "-NoExit","-Command","cd `"$RepoRoot\backend`"; npm run dev" -WorkingDirectory "$RepoRoot\backend"

Start-Sleep -Seconds 1

# Ensure no existing ngrok is running
Get-Process -Name ngrok -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.Id -Force }

# Start ngrok in new window
Write-Host "Starting ngrok tunnel on port 5173..."
Start-Process powershell -ArgumentList "-NoExit","-Command","ngrok http 5173" -WorkingDirectory $RepoRoot

# Wait and fetch public URL
Write-Host "Waiting for ngrok to provide a public URL..."
$public = Get-NgrokPublicUrl
if (-not $public) {
    Write-Host "Failed to get ngrok public URL. Check ngrok window for errors."
    exit 1
}
Write-Host "ngrok public URL: $public"

# Extract hostname for HMR
try {
    $uri = [uri]$public
    $host = $uri.Host
} catch {
    Write-Host "Failed to parse ngrok URL: $public"
    exit 1
}

# Start frontend with HMR host set
Write-Host "Starting frontend with HMR host $host..."
Start-Process powershell -ArgumentList "-NoExit","-Command","cd `"$RepoRoot`"; `$env:VITE_NGROK_HOST='$host'; npm run dev" -WorkingDirectory $RepoRoot

Write-Host "All started. Frontend available at: $public"
Write-Host "If you want to stop everything later, close the windows or kill the processes for ngrok, node, and vite."