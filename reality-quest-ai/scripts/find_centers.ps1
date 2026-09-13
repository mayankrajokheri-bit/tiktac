Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Admin\.gemini\antigravity-ide\brain\71ffbeba-494a-4132-8746-bf3409837e67\.user_uploaded\media_1789230877068.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Let's find horizontal boundaries by examining pixel brightness or manual calibration:
# 1. Alex: 0 to 215
# 2. Ben: 205 to 355
# 3. Chloe: 355 to 480
# 4. Dev: 480 to 595
# 5. Esha: 585 to 695
# 6. Felix: 690 to 795
# 7. Grace: 785 to 885
# 8. Henry: 875 to 1024

$chars = @(
    @{ id="alex";   name="Alex";  major="Mech Eng";     x=0;   w=215; headX=65;  headY=40;  headW=95;  headH=100 },
    @{ id="ben";    name="Ben";   major="Elec Eng";     x=205; w=150; headX=230; headY=85;  headW=90;  headH=95 },
    @{ id="chloe";  name="Chloe"; major="Civil Eng";    x=355; w=130; headX=375; headY=105; headW=85;  headH=90 },
    @{ id="dev";    name="Dev";   major="Comp Sci";     x=480; w=115; headX=495; headY=120; headW=85;  headH=90 },
    @{ id="esha";   name="Esha";  major="Biotech";      x=585; w=110; headX=605; headY=160; headW=75;  headH=80 },
    @{ id="felix";  name="Felix"; major="Chem Eng";     x=690; w=105; headX=705; headY=155; headW=75;  headH=80 },
    @{ id="grace";  name="Grace"; major="Software Eng"; x=785; w=100; headX=800; headY=185; headW=75;  headH=80 },
    @{ id="henry";  name="Henry"; major="IT";           x=875; w=149; headX=905; headY=185; headW=80;  headH=85 }
)

$outDir = "C:\Users\Admin\Desktop\tic tak game\reality-quest-ai\assets\characters_3d"
foreach ($c in $chars) {
    $rect = New-Object System.Drawing.Rectangle($c.x, 0, [Math]::Min($c.w, $bmp.Width - $c.x), $bmp.Height)
    $cropped = $bmp.Clone($rect, $bmp.PixelFormat)
    $destFile = Join-Path $outDir "$($c.id)_3d.png"
    $cropped.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()

    $headRect = New-Object System.Drawing.Rectangle($c.headX, $c.headY, [Math]::Min($c.headW, $bmp.Width - $c.headX), [Math]::Min($c.headH, $bmp.Height - $c.headY))
    $headCrop = $bmp.Clone($headRect, $bmp.PixelFormat)
    $headDest = Join-Path $outDir "$($c.id)_avatar.png"
    $headCrop.Save($headDest, [System.Drawing.Imaging.ImageFormat]::Png)
    $headCrop.Dispose()

    Write-Host "Re-cropped: $($c.id) at X=$($c.x), W=$($c.w)"
}

$bmp.Dispose()
Write-Host "Done!"
