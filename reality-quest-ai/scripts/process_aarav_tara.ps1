Add-Type -AssemblyName System.Drawing

$aaravSrc = "C:\Users\Admin\.gemini\antigravity-ide\brain\71ffbeba-494a-4132-8746-bf3409837e67\aarav_3d_figurine_1789231556806.jpg"
$taraSrc = "C:\Users\Admin\.gemini\antigravity-ide\brain\71ffbeba-494a-4132-8746-bf3409837e67\tara_3d_figurine_1789231598047.jpg"
$dir = "C:\Users\Admin\Desktop\tic tak game\reality-quest-ai\assets\characters_3d"

# Copy full 3D images
Copy-Item $aaravSrc (Join-Path $dir "aarav_3d.png") -Force
Copy-Item $taraSrc (Join-Path $dir "tara_3d.png") -Force

# Process Aarav Avatar
$bmpA = [System.Drawing.Bitmap]::FromFile($aaravSrc)
# Aarav head rectangle (approx X: 350..650, Y: 100..400 on 9:16 aspect ratio)
$headA = New-Object System.Drawing.Rectangle(280, 80, 480, 480)
$cropA = $bmpA.Clone($headA, $bmpA.PixelFormat)
$cropA.Save((Join-Path $dir "aarav_avatar.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$cropA.Dispose()
$bmpA.Dispose()

# Process Tara Avatar
$bmpT = [System.Drawing.Bitmap]::FromFile($taraSrc)
$headT = New-Object System.Drawing.Rectangle(340, 150, 400, 400)
$cropT = $bmpT.Clone($headT, $bmpT.PixelFormat)
$cropT.Save((Join-Path $dir "tara_avatar.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$cropT.Dispose()
$bmpT.Dispose()

Write-Host "Aarav and Tara 3D and Avatars created!"
