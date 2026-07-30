param(
  [Parameter(Mandatory = $true)]
  [string]$SourceDirectory,

  [string]$OutputDirectory = "",

  [int]$TargetTriangles = 180000,

  [switch]$Force
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
  $OutputDirectory = Join-Path $PSScriptRoot "..\assets\models\fashion-sculptures\web"
}

$sourceRoot = (Resolve-Path -LiteralPath $SourceDirectory).Path
$outputRoot = [System.IO.Path]::GetFullPath($OutputDirectory)
$reportRoot = Join-Path ([System.IO.Path]::GetTempPath()) "direction-fashion-optimization"

New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null
New-Item -ItemType Directory -Force -Path $reportRoot | Out-Null

$models = @(
  [pscustomobject]@{ Source = "1 - Copy (9)_Assembled Outfit_Complete_detail-sculpture.glb"; Triangles = 1029712; ProxyTriangles = 154640 }
  [pscustomobject]@{ Source = "1 (2)_Assembled Outfit + Pose_Incomplete_detail-sculpture.glb"; Triangles = 1987588; ProxyTriangles = 298117 }
  [pscustomobject]@{ Source = "1 (3)_Single Garment_Complete_detail-sculpture.glb"; Triangles = 937020; ProxyTriangles = 140531 }
  [pscustomobject]@{ Source = "1_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 22029280; ProxyTriangles = 3717879 }
  [pscustomobject]@{ Source = "11 - Copy (6)_Single Garment_Incomplete_detail-sculpture.glb"; Triangles = 23985724; ProxyTriangles = 4011333 }
  [pscustomobject]@{ Source = "11_Assembled Outfit_Suburban Propaganda_Incomplete_detail-sculpture.glb"; Triangles = 4931766; ProxyTriangles = 743074 }
  [pscustomobject]@{ Source = "12 - Copy (3)_Assembled Outfit + Pose_Incomplete_detail-sculpture.glb"; Triangles = 8210472; ProxyTriangles = 1246591 }
  [pscustomobject]@{ Source = "12_Assembled Outfit_Suburban Propaganda_Incomplete_detail-sculpture.glb"; Triangles = 4670118; ProxyTriangles = 700452 }
  [pscustomobject]@{ Source = "13_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 2204366; ProxyTriangles = 330619 }
  [pscustomobject]@{ Source = "14_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 11806156; ProxyTriangles = 1818933 }
  [pscustomobject]@{ Source = "15_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 4059204; ProxyTriangles = 609998 }
  [pscustomobject]@{ Source = "16_Assembled Outfit_Suburban Propaganda_Incomplete_detail-sculpture.glb"; Triangles = 10707486; ProxyTriangles = 1917855 }
  [pscustomobject]@{ Source = "17_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 8473315; ProxyTriangles = 1270816 }
  [pscustomobject]@{ Source = "18_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 1820372; ProxyTriangles = 273026 }
  [pscustomobject]@{ Source = "19_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 4425226; ProxyTriangles = 663625 }
  [pscustomobject]@{ Source = "2 (real rips) 2_Single Garment_Incomplete_detail-sculpture.glb"; Triangles = 2622547; ProxyTriangles = 393316 }
  [pscustomobject]@{ Source = "2 (real rips)_Single Garment_Incomplete_detail-sculpture.glb"; Triangles = 2622547; ProxyTriangles = 393323 }
  [pscustomobject]@{ Source = "2.5_Assembled Outfit_Complete_detail-sculpture.glb"; Triangles = 9892850; ProxyTriangles = 1483812 }
  [pscustomobject]@{ Source = "2_Assembled Outfit_Complete_detail-sculpture.glb"; Triangles = 3665688; ProxyTriangles = 549787 }
  [pscustomobject]@{ Source = "2_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 2218468; ProxyTriangles = 332678 }
  [pscustomobject]@{ Source = "3_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 8616886; ProxyTriangles = 1292506 }
  [pscustomobject]@{ Source = "34_Single Garment_Incomplete_detail-sculpture.glb"; Triangles = 5752673; ProxyTriangles = 862852 }
  [pscustomobject]@{ Source = "4 (2)_Assembled Outfit_Complete_detail-sculpture.glb"; Triangles = 3373884; ProxyTriangles = 684406 }
  [pscustomobject]@{ Source = "4 (3)_thick_unwelded_Colorway A Copy 1_Single Garment_Incomplete_detail-sculpture.glb"; Triangles = 10560392; ProxyTriangles = 1954429 }
  [pscustomobject]@{ Source = "4_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 7694157; ProxyTriangles = 1204069 }
  [pscustomobject]@{ Source = "5_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 10560392; ProxyTriangles = 1954429; AliasOf = 24 }
  [pscustomobject]@{ Source = "6_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 1957244; ProxyTriangles = 293554 }
  [pscustomobject]@{ Source = "8_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 2257748; ProxyTriangles = 338625 }
  [pscustomobject]@{ Source = "9_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 1742742; ProxyTriangles = 261370 }
  [pscustomobject]@{ Source = "hoodie_Assembled Outfit_Suburban Propaganda_Complete_detail-sculpture.glb"; Triangles = 5195673; ProxyTriangles = 779184 }
)

function Invoke-Gltfpack {
  param(
    [string]$InputPath,
    [string]$OutputPath,
    [double]$Ratio,
    [string]$ReportPath
  )

  $ratioText = $Ratio.ToString("0.000000", [System.Globalization.CultureInfo]::InvariantCulture)

  & npx.cmd --yes gltfpack `
    -i $InputPath `
    -o $OutputPath `
    -si $ratioText `
    -se 0.002 `
    -sp `
    -cc `
    -r $ReportPath |
    Out-Host

  return [int]$LASTEXITCODE
}

for ($index = 0; $index -lt $models.Count; $index += 1) {
  $model = $models[$index]
  $number = $index + 1

  if ($null -ne $model.AliasOf) {
    Write-Host (
      "[{0:D2}/{1}] alias of look-{2:D2}.glb - {3}" -f
        $number,
        $models.Count,
        $model.AliasOf,
        $model.Source
    )
    continue
  }

  $outputName = "look-{0:D2}.glb" -f $number
  $outputPath = Join-Path $outputRoot $outputName
  $reportPath = Join-Path $reportRoot ("look-{0:D2}.json" -f $number)

  if ((Test-Path -LiteralPath $outputPath) -and -not $Force) {
    Write-Host ("[{0:D2}/{1}] already optimized - {2}" -f $number, $models.Count, $outputName)
    continue
  }

  $detailPath = Join-Path $sourceRoot $model.Source
  if (-not (Test-Path -LiteralPath $detailPath)) {
    throw "Missing sculpture source: $detailPath"
  }

  $ratio = [math]::Min(1, $TargetTriangles / [double]$model.Triangles)
  Write-Host ("[{0:D2}/{1}] sculpture - {2}" -f $number, $models.Count, $model.Source)

  $exitCode = Invoke-Gltfpack `
    -InputPath $detailPath `
    -OutputPath $outputPath `
    -Ratio $ratio `
    -ReportPath $reportPath

  $variant = "detail-sculpture"

  if ($exitCode -ne 0) {
    $proxyName = $model.Source.Replace("_detail-sculpture.glb", "_grid-proxy.glb")
    $proxyPath = Join-Path $sourceRoot $proxyName

    if (-not (Test-Path -LiteralPath $proxyPath)) {
      throw "Sculpture optimization failed and no exporter proxy exists: $detailPath"
    }

    $proxyRatio = [math]::Min(1, $TargetTriangles / [double]$model.ProxyTriangles)
    Write-Host ("  retrying exporter proxy with sculpture material - {0}" -f $proxyName)

    $exitCode = Invoke-Gltfpack `
      -InputPath $proxyPath `
      -OutputPath $outputPath `
      -Ratio $proxyRatio `
      -ReportPath $reportPath

    $variant = "grid-proxy fallback"
  }

  if ($exitCode -ne 0 -or -not (Test-Path -LiteralPath $outputPath)) {
    throw "Optimization failed: $($model.Source)"
  }

  $report = Get-Content -LiteralPath $reportPath -Raw | ConvertFrom-Json
  $sizeMiB = [math]::Round((Get-Item -LiteralPath $outputPath).Length / 1MB, 2)

  Write-Host (
    "  {0} | {1:N0} triangles | {2:N2} MiB" -f
      $variant,
      $report.render.triangleCount,
      $sizeMiB
  )
}

Write-Host ("Optimization complete: {0}" -f $outputRoot)
