Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Admin\.gemini\antigravity-ide\brain\71ffbeba-494a-4132-8746-bf3409837e67\.user_uploaded\media_1789230877068.png"
$outDir = "C:\Users\Admin\Desktop\tic tak game\reality-quest-ai\assets\characters_3d"

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Source image size: $($bmp.Width) x $($bmp.Height)"

# Copy master image to assets
Copy-Item $srcPath "C:\Users\Admin\Desktop\tic tak game\reality-quest-ai\assets\survivors_3d_all.png" -Force

$chars = @(
    @{ id="alex";   name="Alex";  major="Mech Eng";     x=0;   w=215; headX=65;  headY=40;  headW=95;  headH=100 },
    @{ id="ben";    name="Ben";   major="Elec Eng";     x=205; w=150; headX=230; headY=85;  headW=90;  headH=95 },
    @{ id="chloe";  name="Chloe"; major="Civil Eng";    x=350; w=130; headX=370; headY=105; headW=85;  headH=90 },
    @{ id="dev";    name="Dev";   major="Comp Sci";     x=470; w=130; headX=490; headY=120; headW=85;  headH=90 },
    @{ id="esha";   name="Esha";  major="Biotech";      x=580; w=115; headX=600; headY=160; headW=75;  headH=80 },
    @{ id="felix";  name="Felix"; major="Chem Eng";     x=680; w=115; headX=695; headY=155; headW=75;  headH=80 },
    @{ id="grace";  name="Grace"; major="Software Eng"; x=775; w=115; headX=795; headY=185; headW=75;  headH=80 },
    @{ id="henry";  name="Henry"; major="IT";           x=875; w=149; headX=900; headY=185; headW=80;  headH=85 }
)

foreach ($c in $chars) {
    # 1. Full 3D Model with Pedestal from top to bottom
    $rect = New-Object System.Drawing.Rectangle($c.x, 0, [Math]::Min($c.w, $bmp.Width - $c.x), $bmp.Height)
    $cropped = $bmp.Clone($rect, $bmp.PixelFormat)
    $destFile = Join-Path $outDir "$($c.id)_3d.png"
    $cropped.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()

    # 2. Avatar / Head Portrait
    $headRect = New-Object System.Drawing.Rectangle($c.headX, $c.headY, [Math]::Min($c.headW, $bmp.Width - $c.headX), [Math]::Min($c.headH, $bmp.Height - $c.headY))
    $headCrop = $bmp.Clone($headRect, $bmp.PixelFormat)
    $headDest = Join-Path $outDir "$($c.id)_avatar.png"
    $headCrop.Save($headDest, [System.Drawing.Imaging.ImageFormat]::Png)
    $headCrop.Dispose()

    Write-Host "Processed: $($c.id) -> Full: $($c.w)x$($bmp.Height), Avatar: $($c.headW)x$($c.headH)"
}

$bmp.Dispose()
Write-Host "All 8 characters re-cropped with full vertical height!"
