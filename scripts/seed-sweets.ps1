Param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$AdminUser = "admin",
    [string]$AdminPass = "admin123"
)

function Invoke-Json {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers,
        [object]$Body
    )
    $json = $null
    if ($null -ne $Body) { $json = ($Body | ConvertTo-Json -Depth 10) }
    try {
        $resp = Invoke-WebRequest -Method $Method -Uri $Url -Headers $Headers -Body $json -ContentType 'application/json' -UseBasicParsing
        return @{ StatusCode = $resp.StatusCode; Body = if ($resp.Content) { $resp.Content | ConvertFrom-Json } else { $null } }
    } catch {
        $errResp = $_.Exception.Response
        if ($null -ne $errResp) {
            $sr = New-Object System.IO.StreamReader($errResp.GetResponseStream())
            $content = $sr.ReadToEnd()
            $obj = $null
            try { $obj = $content | ConvertFrom-Json } catch { $obj = $content }
            return @{ StatusCode = [int]$errResp.StatusCode; Body = $obj }
        }
        throw
    }
}

# Login as admin
$r = Invoke-Json -Method Post -Url "$BaseUrl/api/auth/login" -Headers @{} -Body @{ username=$AdminUser; password=$AdminPass }
if ($r.StatusCode -ne 200) { throw "Admin login failed: $($r.StatusCode)" }
$headers = @{ Authorization = "Bearer $($r.Body.token)" }

# Create a few sweets if list is empty
$list = Invoke-Json -Method Get -Url "$BaseUrl/api/sweets" -Headers @{} -Body $null
$items = if ($list.Body -is [System.Array]) { $list.Body } elseif ($list.Body.content) { $list.Body.content } else { @() }
if ($items.Count -gt 0) { Write-Host "Sweets already present: $($items.Count)"; exit 0 }

$seed = @(
    @{ name='Ladoo'; category='Indian'; price=12.50; quantity=25 },
    @{ name='Gulab Jamun'; category='Indian'; price=15.00; quantity=30 },
    @{ name='Barfi'; category='Indian'; price=10.00; quantity=20 }
)

foreach ($s in $seed) {
    $resp = Invoke-Json -Method Post -Url "$BaseUrl/api/sweets" -Headers $headers -Body $s
    if ($resp.StatusCode -eq 201) {
        Write-Host "Seeded: $($resp.Body.name)"
    } elseif ($resp.StatusCode -eq 400) {
        Write-Host "Skipped (exists/invalid): $($s.name)"
    } else {
        Write-Host "Unexpected: $($resp.StatusCode) for $($s.name)"
    }
}
