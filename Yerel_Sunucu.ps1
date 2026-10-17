# Aytek Bilisim tanitim sitesini bu bilgisayarda acar: http://localhost:8080
# Kullanim: bu dosyaya sag tik > PowerShell ile calistir  (ya da: powershell -ExecutionPolicy Bypass -File .\Yerel_Sunucu.ps1)
# Durdurmak icin bu pencerede Ctrl+C'ye basin ya da pencereyi kapatin.
param([int]$Port = 8080)

$kok = Split-Path -Parent $MyInvocation.MyCommand.Path
$turler = @{
    ".html" = "text/html; charset=utf-8"; ".css" = "text/css; charset=utf-8"; ".js" = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"; ".png" = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"; ".svg" = "image/svg+xml"; ".ico" = "image/x-icon"; ".mp4" = "video/mp4"; ".webm" = "video/webm"
    ".txt" = "text/plain; charset=utf-8"; ".pdf" = "application/pdf"
}

$dinleyici = New-Object System.Net.HttpListener
$dinleyici.Prefixes.Add("http://localhost:$Port/")
try { $dinleyici.Start() }
catch {
    Write-Host "Port $Port kullanilamiyor. Baska bir port deneyin:  .\Yerel_Sunucu.ps1 -Port 8090" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  Site acildi:  http://localhost:$Port" -ForegroundColor Green
Write-Host "  Panel:        http://localhost:$Port/panel/" -ForegroundColor Green
Write-Host "  Durdurmak icin Ctrl+C" -ForegroundColor Gray
Write-Host ""
Start-Process "http://localhost:$Port/"

try {
    while ($dinleyici.IsListening) {
        $baglam = $dinleyici.GetContext()
        $yanit = $baglam.Response
        try {
            $yol = [Uri]::UnescapeDataString($baglam.Request.Url.AbsolutePath).TrimStart("/")
            if ($yol -eq "" -or $yol.EndsWith("/")) { $yol = $yol + "index.html" }
            $tam = [System.IO.Path]::GetFullPath((Join-Path $kok $yol))
            # Site klasorunun disina cikilmasin
            if (-not $tam.StartsWith($kok, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $tam -PathType Leaf)) {
                $yanit.StatusCode = 404
                $b = [System.Text.Encoding]::UTF8.GetBytes("Bulunamadi: /" + $yol)
                $yanit.ContentType = "text/plain; charset=utf-8"
                $yanit.OutputStream.Write($b, 0, $b.Length)
            }
            else {
                $uzanti = [System.IO.Path]::GetExtension($tam).ToLowerInvariant()
                $tur = $turler[$uzanti]
                if (-not $tur) { $tur = "application/octet-stream" }
                $yanit.ContentType = $tur
                $yanit.AddHeader("Cache-Control", "no-cache")
                $veri = [System.IO.File]::ReadAllBytes($tam)
                $yanit.ContentLength64 = $veri.Length
                $yanit.OutputStream.Write($veri, 0, $veri.Length)
            }
        }
        catch { $yanit.StatusCode = 500 }
        finally { $yanit.OutputStream.Close() }
    }
}
finally { $dinleyici.Stop(); $dinleyici.Close() }
