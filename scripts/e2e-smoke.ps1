Param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$AdminUser = "admin",
    [string]$AdminPass = "admin123",
    [string]$UserName = "alice",
    [string]$UserEmail = "alice@example.com",
    [string]$UserPass = "P@ssw0rd1"
)

# Randomize user to avoid duplicates across runs
$rand = Get-Random -Minimum 1000 -Maximum 999999
$UserName = "$UserName$rand"
$UserEmail = "alice+$rand@example.com"

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

function Step([string]$msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Expect([int]$actual, [int[]]$expected) {
    if ($expected -notcontains $actual) {
        throw "Expected status in [$($expected -join ',')], got $actual"
    }
}

Step "Register user $UserName"
$r = Invoke-Json -Method Post -Url "$BaseUrl/api/auth/register" -Headers @{} -Body @{ username=$UserName; email=$UserEmail; password=$UserPass }
Expect $r.StatusCode 201
Write-Host "Registered: $($r.Body | ConvertTo-Json -Depth 5)"

Step "Register duplicate should 400"
$r = Invoke-Json -Method Post -Url "$BaseUrl/api/auth/register" -Headers @{} -Body @{ username=$UserName; email=$UserEmail; password=$UserPass }
Expect $r.StatusCode 400

Step "Login invalid should 404"
$r = Invoke-Json -Method Post -Url "$BaseUrl/api/auth/login" -Headers @{} -Body @{ username=$UserName; password="wrong" }
Expect $r.StatusCode 404

Step "Login user"
$r = Invoke-Json -Method Post -Url "$BaseUrl/api/auth/login" -Headers @{} -Body @{ username=$UserName; password=$UserPass }
Expect $r.StatusCode 200
$tokenUser = $r.Body.token
Write-Host "User token acquired"

Step "Public list sweets"
$r = Invoke-Json -Method Get -Url "$BaseUrl/api/sweets" -Headers @{} -Body $null
Expect $r.StatusCode 200

Step "Admin login"
$r = Invoke-Json -Method Post -Url "$BaseUrl/api/auth/login" -Headers @{} -Body @{ username=$AdminUser; password=$AdminPass }
Expect $r.StatusCode 200
$tokenAdmin = $r.Body.token
Write-Host "Admin token acquired"

$authUser = @{ Authorization = "Bearer $tokenUser" }
$authAdmin = @{ Authorization = "Bearer $tokenAdmin" }

Step "Create sweet as user (allowed)"
$r = Invoke-Json -Method Post -Url "$BaseUrl/api/sweets" -Headers $authUser -Body @{ name="Ladoo"; category="Indian"; price=12.50; quantity=10 }
Expect $r.StatusCode 201
$sweetId = $r.Body.id
Write-Host "Created sweet id=$sweetId"

Step "Update sweet as user (allowed)"
$r = Invoke-Json -Method Put -Url "$BaseUrl/api/sweets/$sweetId" -Headers $authUser -Body @{ name="Ladoo"; category="Indian"; price=13.00; quantity=8 }
Expect $r.StatusCode 200

Step "Purchase sweet quantity=3"
$r = Invoke-Json -Method Post -Url "$BaseUrl/api/sweets/$sweetId/purchase?quantity=3" -Headers $authUser -Body $null
Expect $r.StatusCode 200

Step "Purchase too many should 400"
$r = Invoke-Json -Method Post -Url "$BaseUrl/api/sweets/$sweetId/purchase?quantity=999" -Headers $authUser -Body $null
Expect $r.StatusCode 400

Step "Restock as user should be 403"
$r = Invoke-Json -Method Post -Url "$BaseUrl/api/sweets/$sweetId/restock?quantity=5" -Headers $authUser -Body $null
Expect $r.StatusCode 403

Step "Restock as admin"
$r = Invoke-Json -Method Post -Url "$BaseUrl/api/sweets/$sweetId/restock?quantity=5" -Headers $authAdmin -Body $null
Expect $r.StatusCode 200

Step "Delete as user should be 403"
$r = Invoke-Json -Method Delete -Url "$BaseUrl/api/sweets/$sweetId" -Headers $authUser -Body $null
Expect $r.StatusCode 403

Step "Delete as admin"
$r = Invoke-Json -Method Delete -Url "$BaseUrl/api/sweets/$sweetId" -Headers $authAdmin -Body $null
Expect $r.StatusCode 204

Step "Get deleted sweet should 404"
$r = Invoke-Json -Method Get -Url "$BaseUrl/api/sweets/$sweetId" -Headers $authAdmin -Body $null
Expect $r.StatusCode 404

Write-Host "`nAll steps passed ✅" -ForegroundColor Green