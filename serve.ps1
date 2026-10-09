$ErrorActionPreference = 'Continue'
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, 4173)
try {
    $listener.Start()
} catch {
    Write-Host "FitOS could not start on port 4173: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'Close any previous FitOS server window, then try again.'
    Read-Host 'Press Enter to close'
    exit 1
}
Write-Host 'FitOS is running at http://localhost:4173/' -ForegroundColor Green
try {
    Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
        Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.AddressState -eq 'Preferred' } |
        ForEach-Object { Write-Host "Phone on the same Wi-Fi: http://$($_.IPAddress):4173/" -ForegroundColor Cyan }
} catch {
    Write-Host 'To find this PC IP, run: ipconfig'
}
Write-Host 'Keep this window open while using FitOS. Press Ctrl+C to stop.'
$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.js' = 'text/javascript; charset=utf-8'
    '.mjs' = 'text/javascript; charset=utf-8'
    '.css' = 'text/css; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.webmanifest' = 'application/manifest+json; charset=utf-8'
    '.svg' = 'image/svg+xml'
}
while ($listener.Server.IsBound) {
    $client = $null
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
        $requestLine = $reader.ReadLine()
        while ($null -ne ($header = $reader.ReadLine()) -and $header.Length -gt 0) { }
        $status = '200 OK'
        $body = [byte[]]@()
        try {
            $pathPart = if ($requestLine) { ($requestLine.Split(' ')[1] -split '\?', 2)[0] } else { '/' }
            $relative = [System.Uri]::UnescapeDataString($pathPart.TrimStart('/')).Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
            $filePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relative))
            if (-not $filePath.StartsWith($root + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
                $status = '403 Forbidden'
                $body = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
            } else {
                $body = [System.IO.File]::ReadAllBytes($filePath)
            }
        } catch {
            $status = '404 Not Found'
            $body = [System.Text.Encoding]::UTF8.GetBytes('Not found')
        }
        $contentType = if ($status.StartsWith('200')) { $mime[[System.IO.Path]::GetExtension($filePath).ToLowerInvariant()] } else { 'text/plain; charset=utf-8' }
        if (-not $contentType) { $contentType = 'application/octet-stream' }
        $head = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
        $headBytes = [System.Text.Encoding]::ASCII.GetBytes($head)
        $stream.Write($headBytes, 0, $headBytes.Length)
        if ($body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
        $stream.Flush()
        Write-Host "$(Get-Date -Format 'HH:mm:ss') $requestLine -> $status"
    } catch {
        Write-Host "Request error: $($_.Exception.Message)" -ForegroundColor Yellow
    } finally {
        if ($client) { $client.Close() }
    }
}

