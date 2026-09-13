Add-Type -AssemblyName System.Drawing

$file = "C:\Users\Admin\Desktop\tic tak game\reality-quest-ai\assets\characters_3d\alex_3d.png"
$bmp = [System.Drawing.Bitmap]::FromFile($file)

# Clone to 32bppArgb
$transBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($transBmp)
$g.DrawImage($bmp, 0, 0)
$g.Dispose()
$bmp.Dispose()

# Sample background color at (2, 2)
$bgCol = $transBmp.GetPixel(2, 2)
Write-Host "Sampled BG color: R=$($bgCol.R), G=$($bgCol.G), B=$($bgCol.B)"

# Simple flood-fill transparency or edge-inward transparency
$visited = New-Object 'bool[,]' $transBmp.Width, $transBmp.Height
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

# Seed edges
for ($x = 0; $x -lt $transBmp.Width; $x++) {
    $queue.Enqueue((New-Object System.Drawing.Point($x, 0)))
    $queue.Enqueue((New-Object System.Drawing.Point($x, $transBmp.Height - 1)))
}
for ($y = 0; $y -lt $transBmp.Height; $y++) {
    $queue.Enqueue((New-Object System.Drawing.Point(0, $y)))
    $queue.Enqueue((New-Object System.Drawing.Point($transBmp.Width - 1, $y)))
}

$tol = 28 # Color distance tolerance for light grey studio background

while ($queue.Count -gt 0) {
    $pt = $queue.Dequeue()
    $px = $pt.X
    $py = $pt.Y

    if ($px -lt 0 -or $px -ge $transBmp.Width -or $py -lt 0 -or $py -ge $transBmp.Height) { continue }
    if ($visited[$px, $py]) { continue }
    $visited[$px, $py] = $true

    $c = $transBmp.GetPixel($px, $py)
    $dist = [Math]::Abs([int]$c.R - [int]$bgCol.R) + [Math]::Abs([int]$c.G - [int]$bgCol.G) + [Math]::Abs([int]$c.B - [int]$bgCol.B)

    if ($dist -lt $tol) {
        $transBmp.SetPixel($px, $py, [System.Drawing.Color]::Transparent)
        # Enqueue 4 neighbors
        if ($px -gt 0) { $queue.Enqueue((New-Object System.Drawing.Point($px - 1, $py))) }
        if ($px -lt $transBmp.Width - 1) { $queue.Enqueue((New-Object System.Drawing.Point($px + 1, $py))) }
        if ($py -gt 0) { $queue.Enqueue((New-Object System.Drawing.Point($px, $py - 1))) }
        if ($py -lt $transBmp.Height - 1) { $queue.Enqueue((New-Object System.Drawing.Point($px, $py + 1))) }
    }
}

$outFile = "C:\Users\Admin\Desktop\tic tak game\reality-quest-ai\assets\characters_3d\alex_transparent.png"
$transBmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
$transBmp.Dispose()
Write-Host "Saved transparent: $outFile"
