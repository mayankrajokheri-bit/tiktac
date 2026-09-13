$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class ImageProcessor {
    public static void MakeTransparent(string srcPath, string destPath, byte tol) {
        using (Bitmap src = (Bitmap)Image.FromFile(srcPath)) {
            Bitmap bmp = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(bmp)) {
                g.DrawImage(src, 0, 0);
            }

            BitmapData data = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            int bytes = Math.Abs(data.Stride) * bmp.Height;
            byte[] rgb = new byte[bytes];
            Marshal.Copy(data.Scan0, rgb, 0, bytes);

            // Sample background color near (2, 2)
            int sampleIdx = (2 * data.Stride) + (2 * 4);
            byte bgB = rgb[sampleIdx];
            byte bgG = rgb[sampleIdx + 1];
            byte bgR = rgb[sampleIdx + 2];

            // 4 bytes per pixel: B, G, R, A
            for (int i = 0; i < bytes; i += 4) {
                int b = rgb[i];
                int gCol = rgb[i + 1];
                int r = rgb[i + 2];

                int diff = Math.Abs(r - bgR) + Math.Abs(gCol - bgG) + Math.Abs(b - bgB);
                // Also remove if pixel is bright neutral grey/white (r > 195 && g > 195 && b > 195 && diff neutral)
                bool isGreyBg = (r > 190 && gCol > 185 && b > 185 && Math.Abs(r - gCol) < 15 && Math.Abs(gCol - b) < 15);
                if (diff < tol || isGreyBg) {
                    rgb[i + 3] = 0; // Alpha = 0 (transparent)
                }
            }

            Marshal.Copy(rgb, 0, data.Scan0, bytes);
            bmp.UnlockBits(data);
            bmp.Save(destPath, ImageFormat.Png);
            bmp.Dispose();
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$dir = "C:\Users\Admin\Desktop\tic tak game\reality-quest-ai\assets\characters_3d"
$chars = @("alex", "ben", "chloe", "dev", "esha", "felix", "grace", "henry")

foreach ($id in $chars) {
    $src = Join-Path $dir "$($id)_3d.png"
    $dest = Join-Path $dir "$($id)_sprite.png"
    if (Test-Path $src) {
        [ImageProcessor]::MakeTransparent($src, $dest, 32)
        Write-Host "Created transparent sprite: $($id)_sprite.png"
    }
}
Write-Host "All sprites processed!"
