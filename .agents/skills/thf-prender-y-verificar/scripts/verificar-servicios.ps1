$ErrorActionPreference = 'Stop'

$checks = @(
    @{ Name = 'CRUD + PostgreSQL'; Url = 'http://127.0.0.1:3000/gimnasios'; ExpectJson = $true },
    @{ Name = 'MID API';           Url = 'http://127.0.0.1:8080/api/v1/gimnasios'; ExpectJson = $true },
    @{ Name = 'Frontend Angular';  Url = 'http://localhost:4200/'; ExpectJson = $false }
)

$allOk = $true

foreach ($item in $checks) {
    try {
        $resp = Invoke-WebRequest -Uri $item.Url -UseBasicParsing -TimeoutSec 5
        $status = [int]$resp.StatusCode
        if ($status -ge 200 -and $status -lt 300) {
            if ($item.ExpectJson) {
                $null = $resp.Content | ConvertFrom-Json
            }
            Write-Host ("[OK] {0} -> {1} (HTTP {2})" -f $item.Name, $item.Url, $status)
        }
        else {
            $allOk = $false
            Write-Host ("[WARN] {0} -> {1} (HTTP {2})" -f $item.Name, $item.Url, $status)
        }
    }
    catch {
        $allOk = $false
        Write-Host ("[FAIL] {0} -> {1} :: {2}" -f $item.Name, $item.Url, $_.Exception.Message)
    }
}

if (-not $allOk) {
    exit 1
}

Write-Host "[OK] Todos los servicios respondieron correctamente."
exit 0
