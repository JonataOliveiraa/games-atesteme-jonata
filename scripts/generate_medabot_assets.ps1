Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "public/assets/medabot"
$srcDir = Join-Path $root "src/assets/games/EF01CO02"
$referencePath = "C:\Projetos\Imagens Games EF01CO02\ChatGPT Image 4_06_2026, 16_58_14.png"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function New-Color {
    param([int]$R, [int]$G, [int]$B, [int]$A = 255)
    [System.Drawing.Color]::FromArgb($A, $R, $G, $B)
}

function New-RoundedRectPath {
    param([float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Radius)
    $diameter = $Radius * 2
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
    $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
    $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    $path
}

function Save-Bitmap {
    param([System.Drawing.Bitmap]$Bitmap, [string]$Path)
    $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $Bitmap.Dispose()
}

function New-CropBitmap {
    param(
        [System.Drawing.Bitmap]$Source,
        [int]$X,
        [int]$Y,
        [int]$Width,
        [int]$Height
    )

    $bmp = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($Source, [System.Drawing.Rectangle]::new(0, 0, $Width, $Height), [System.Drawing.Rectangle]::new($X, $Y, $Width, $Height), [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $bmp
}

function Paint-RoundedRect {
    param(
        [System.Drawing.Graphics]$Graphics,
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height,
        [float]$Radius,
        [System.Drawing.Color]$Fill,
        [System.Drawing.Color]$Stroke,
        [float]$StrokeWidth = 2
    )

    $path = New-RoundedRectPath $X $Y $Width $Height $Radius
    $brush = New-Object System.Drawing.SolidBrush($Fill)
    $pen = New-Object System.Drawing.Pen($Stroke, $StrokeWidth)
    $Graphics.FillPath($brush, $path)
    $Graphics.DrawPath($pen, $path)
    $brush.Dispose()
    $pen.Dispose()
    $path.Dispose()
}

$reference = [System.Drawing.Bitmap]::FromFile($referencePath)

Copy-Item $referencePath (Join-Path $outDir "background_scene.png") -Force

$topTimer = New-CropBitmap -Source $reference -X 120 -Y 38 -Width 1392 -Height 116
$gTimer = [System.Drawing.Graphics]::FromImage($topTimer)
$gTimer.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
Paint-RoundedRect -Graphics $gTimer -X 333 -Y 42 -Width 757 -Height 50 -Radius 24 `
    -Fill (New-Color 251 252 255) -Stroke (New-Color 50 86 165) -StrokeWidth 4
$gTimer.Dispose()
Save-Bitmap -Bitmap $topTimer -Path (Join-Path $outDir "top_timer_panel.png")

$instruction = New-CropBitmap -Source $reference -X 267 -Y 162 -Width 1142 -Height 90
Save-Bitmap -Bitmap $instruction -Path (Join-Path $outDir "instruction_panel.png")

$leftPanel = New-CropBitmap -Source $reference -X 193 -Y 273 -Width 632 -Height 563
$gLeft = [System.Drawing.Graphics]::FromImage($leftPanel)
$gLeft.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$fillLeft = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.RectangleF]::new(38, 108, 556, 422),
    (New-Color 255 252 231),
    (New-Color 255 221 144),
    [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
)
$innerLeft = New-RoundedRectPath 40 110 552 418 24
$gLeft.FillPath($fillLeft, $innerLeft)
$gLeft.DrawPath((New-Object System.Drawing.Pen((New-Color 255 241 199), 2)), $innerLeft)
$fillLeft.Dispose()
$innerLeft.Dispose()
$gLeft.Dispose()
Save-Bitmap -Bitmap $leftPanel -Path (Join-Path $outDir "left_panel.png")

$rightPanel = New-CropBitmap -Source $reference -X 837 -Y 273 -Width 644 -Height 564
$gRight = [System.Drawing.Graphics]::FromImage($rightPanel)
$gRight.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$fillRight = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.RectangleF]::new(44, 108, 558, 422),
    (New-Color 235 249 255),
    (New-Color 176 225 255),
    [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
)
$innerRight = New-RoundedRectPath 46 110 554 418 24
$gRight.FillPath($fillRight, $innerRight)
$gRight.DrawPath((New-Object System.Drawing.Pen((New-Color 214 244 255), 2)), $innerRight)
$fillRight.Dispose()
$innerRight.Dispose()
$gRight.Dispose()
Save-Bitmap -Bitmap $rightPanel -Path (Join-Path $outDir "right_panel.png")

$partCard = New-CropBitmap -Source $reference -X 266 -Y 385 -Width 500 -Height 124
$gPart = [System.Drawing.Graphics]::FromImage($partCard)
$gPart.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
Paint-RoundedRect -Graphics $gPart -X 175 -Y 17 -Width 128 -Height 86 -Radius 14 `
    -Fill (New-Color 255 255 255) -Stroke (New-Color 255 255 255) -StrokeWidth 1
$gPart.Dispose()
Save-Bitmap -Bitmap $partCard -Path (Join-Path $outDir "card_part.png")

$slotCard = New-CropBitmap -Source $reference -X 935 -Y 385 -Width 469 -Height 124
$gSlot = [System.Drawing.Graphics]::FromImage($slotCard)
$gSlot.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
Paint-RoundedRect -Graphics $gSlot -X 26 -Y 18 -Width 418 -Height 86 -Radius 18 `
    -Fill (New-Color 255 255 255) -Stroke (New-Color 255 255 255) -StrokeWidth 1
$gSlot.Dispose()
Save-Bitmap -Bitmap $slotCard -Path (Join-Path $outDir "assembly_slot.png")

Copy-Item (Join-Path $srcDir "MetabeeCompleto.png") (Join-Path $outDir "robot_full.png") -Force
Copy-Item (Join-Path $srcDir "CabecaMetabee.png") (Join-Path $outDir "robot_head.png") -Force
Copy-Item (Join-Path $srcDir "TroncoMetabee.png") (Join-Path $outDir "robot_torso.png") -Force
Copy-Item (Join-Path $srcDir "PernasMetabee.png") (Join-Path $outDir "robot_legs.png") -Force

$reference.Dispose()
