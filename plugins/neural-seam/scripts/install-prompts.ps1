[CmdletBinding()]
param(
    [switch]$Force
)

$source = Join-Path $PSScriptRoot '..\prompts'
$destination = Join-Path $HOME '.codex\prompts'

if (-not (Test-Path -LiteralPath $source -PathType Container)) {
    throw "Templates de prompts nao encontrados em $source"
}

New-Item -ItemType Directory -Path $destination -Force | Out-Null

Get-ChildItem -LiteralPath $source -Filter '*.md' -File | ForEach-Object {
    $target = Join-Path $destination $_.Name
    if ((Test-Path -LiteralPath $target) -and -not $Force) {
        Write-Warning "Mantido (ja existe): $target. Use -Force para substituir."
        return
    }

    Copy-Item -LiteralPath $_.FullName -Destination $target -Force:$Force
    Write-Host "Instalado: $target"
}

Write-Host 'Reinicie o Codex ou abra uma nova conversa; use /prompts:ns-start.'
