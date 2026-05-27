$ErrorActionPreference = 'Stop'
$base = 'http://localhost:3000/api/v1'
$results = @()

function Add-Result($name, $status, $detail) {
  $script:results += [PSCustomObject]@{ name = $name; status = $status; detail = $detail }
}

try {
  $loginBody = @{ email = 'admin@empresa.com'; password = 'admin123' } | ConvertTo-Json
  $login = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body $loginBody
  $token = $login.accessToken
  $headers = @{ Authorization = "Bearer $token" }
  if ($token) { Add-Result 'Login admin' 'PASS' 'token obtenido' } else { Add-Result 'Login admin' 'FAIL' 'sin token' }
} catch {
  Add-Result 'Login admin' 'FAIL' $_.Exception.Message
  $results | ConvertTo-Json -Depth 5
  exit 0
}

# users sin token
try {
  Invoke-RestMethod -Method Get -Uri "$base/users" -ErrorAction Stop | Out-Null
  Add-Result 'Users sin token' 'FAIL' 'respondio sin 401'
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 401) { Add-Result 'Users sin token' 'PASS' '401 correcto' } else { Add-Result 'Users sin token' 'FAIL' "status $code" }
}

# listar productos
try {
  $prods = Invoke-RestMethod -Method Get -Uri "$base/products?limit=5" -Headers $headers
  Add-Result 'Listar productos' 'PASS' "items: $($prods.items.Count)"
} catch { Add-Result 'Listar productos' 'FAIL' $_.Exception.Message }

# listar categorias
try {
  $cats = Invoke-RestMethod -Method Get -Uri "$base/products/categories/all" -Headers $headers
  $cnt = if ($cats -is [System.Array]) { $cats.Count } else { 0 }
  Add-Result 'Listar categorias' 'PASS' "categorias: $cnt"
} catch { Add-Result 'Listar categorias' 'FAIL' $_.Exception.Message }

# crear cliente completo
try {
  $suffix = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $doc = "99$suffix"
  if ($doc.Length -gt 20) { $doc = $doc.Substring(0, 20) }
  $email = "qa.cliente.$suffix@example.com"
  $customerBody = @{
    firstName='QA'; lastName='Cliente'; documentType='CI'; document=$doc;
    birthDate='1990-01-01'; phone='0981111111'; alternativePhone='0981222222';
    email=$email; address='Calle QA'; city='Asuncion';
    businessName=''; taxDocument=''; notes='creado por test'; creditLimit=500000
  } | ConvertTo-Json
  $newCustomer = Invoke-RestMethod -Method Post -Uri "$base/customers" -Headers $headers -ContentType 'application/json' -Body $customerBody
  Add-Result 'Crear cliente completo' 'PASS' "id: $($newCustomer.id)"
} catch { Add-Result 'Crear cliente completo' 'FAIL' $_.Exception.Message }

# producto negativo
try {
  $badProd = @{ name='Bad'; salePrice=-1; costPrice=0; stock=1; stockMin=0; taxRate=10; unit='unidad'; trackStock=$true; isBulk=$false } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "$base/products" -Headers $headers -ContentType 'application/json' -Body $badProd | Out-Null
  Add-Result 'Crear producto precio negativo' 'FAIL' 'permitido'
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -ge 400) { Add-Result 'Crear producto precio negativo' 'PASS' "status $code" } else { Add-Result 'Crear producto precio negativo' 'FAIL' "status $code" }
}

# credit pending shape
try {
  $pending = Invoke-RestMethod -Method Get -Uri "$base/credit-accounts/pending" -Headers $headers
  if ($pending -is [System.Array]) { Add-Result 'Creditos pending devuelve array' 'PASS' "count: $($pending.Count)" }
  else { Add-Result 'Creditos pending devuelve array' 'FAIL' "tipo: $($pending.GetType().Name)" }
} catch { Add-Result 'Creditos pending devuelve array' 'FAIL' $_.Exception.Message }

# stats endpoints
$today = (Get-Date).ToString('yyyy-MM-dd')
try {
  $hourly = Invoke-RestMethod -Method Get -Uri "$base/sales/stats/hourly?date=$today" -Headers $headers
  Add-Result 'Sales stats hourly' 'PASS' "rows: $($hourly.Count)"
} catch { Add-Result 'Sales stats hourly' 'FAIL' $_.Exception.Message }

try {
  $top = Invoke-RestMethod -Method Get -Uri "$base/sales/stats/top-products?date=$today" -Headers $headers
  Add-Result 'Sales stats top-products' 'PASS' "rows: $($top.Count)"
} catch { Add-Result 'Sales stats top-products' 'FAIL' $_.Exception.Message }

# expenses create/list
try {
  $expBody = @{ category='alquiler'; description='QA rent'; amount=10000; date=$today } | ConvertTo-Json
  $exp = Invoke-RestMethod -Method Post -Uri "$base/expenses" -Headers $headers -ContentType 'application/json' -Body $expBody
  $expList = Invoke-RestMethod -Method Get -Uri "$base/expenses?dateFrom=$today&dateTo=$today" -Headers $headers
  $ok = $exp.id -and (($expList -is [System.Array] -and $expList.Count -ge 1) -or ($expList.items.Count -ge 1))
  if ($ok) { Add-Result 'Expenses create/list' 'PASS' "created: $($exp.id)" } else { Add-Result 'Expenses create/list' 'FAIL' 'sin datos listados' }
} catch { Add-Result 'Expenses create/list' 'FAIL' $_.Exception.Message }

$results | ConvertTo-Json -Depth 5
