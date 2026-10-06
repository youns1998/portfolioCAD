param()
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$docs = Join-Path $root 'docs'
$data = Get-Content (Join-Path $docs 'data/projects.js') -Raw -Encoding UTF8
$ids = [regex]::Matches($data, '\bid:\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
$duplicateIds = $ids | Group-Object | Where-Object Count -gt 1
if ($duplicateIds) { throw "Duplicate IDs: $($duplicateIds.Name -join ', ')" }
$paths = [regex]::Matches($data, '\b(?:file|thumbnail):\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
if (-not $paths) { throw 'No result files are registered.' }
foreach ($relative in $paths) {
    if ($relative -match '(^[./\\]|\.\.|://)') { throw "Unsafe asset path: $relative" }
    $file = Join-Path $docs $relative
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Missing asset: $relative" }
    if ($relative -match '\.pdf$') {
        $stream = [IO.File]::OpenRead($file)
        try {
            $header = New-Object byte[] 5
            if ($stream.Read($header, 0, 5) -ne 5 -or [Text.Encoding]::ASCII.GetString($header) -ne '%PDF-') {
                throw "Invalid PDF header: $relative"
            }
        } finally { $stream.Dispose() }
    }
}
$hashes = $paths | Where-Object { $_ -match '\.pdf$' } | ForEach-Object { Get-FileHash -LiteralPath (Join-Path $docs $_) -Algorithm SHA256 }
$duplicates = $hashes | Group-Object Hash | Where-Object Count -gt 1
if ($duplicates) { throw 'Duplicate PDF contents found.' }
Write-Host "Validated $($ids.Count) IDs and $($paths.Count) assets."
