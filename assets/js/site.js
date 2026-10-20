// Aytek Bilişim - Ana Site JavaScript Motoru (Esnek Hata Korumalı)
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("veri/site.json?t=" + Date.now());
    if (!response.ok) throw new Error("site.json yüklenemedi");
    const VERI = await response.json();

    // 1. Firma ve İletişim Bilgilerini Yerleştir
    if (VERI.firma) {
      document.querySelectorAll(".firma-ad").forEach(el => el.textContent = VERI.firma.ad || "");
      document.querySelectorAll(".firma-telefon").forEach(el => {
        el.textContent = VERI.firma.telefon || "";
        if (VERI.firma.telefonLink) el.href = "tel:" + VERI.firma.telefonLink;
      });
      document.querySelectorAll(".firma-adres").forEach(el => el.textContent = VERI.firma.adres || "");
    }

    // 2. Ana Sayfa Vitrin Alanı
    if (VERI.anasayfa && document.getElementById("ana-baslik")) {
      document.getElementById("ana-baslik").textContent = VERI.anasayfa.baslik || "";
      document.getElementById("ana-aciklama").textContent = VERI.anasayfa.altBaslik || "";
    }

    // 3. Ürünler Listesi (Dizi veya Nesne Formatı Koruma Katmanı)
    let urunListesi = [];
    if (Array.isArray(VERI.urunler)) {
      urunListesi = VERI.urunler;
    } else if (VERI.urunler && typeof VERI.urunler === "object") {
      urunListesi = Object.values(VERI.urunler);
    }

    const urunContainer = document.getElementById("urunler-listesi");
    if (urunContainer && urunListesi.length > 0) {
      urunContainer.innerHTML = urunListesi.map(u => `
        <div class="urun-kart">
          <h3>${u.ad || u.kod}</h3>
          <p>${u.ozet || u.altBaslik || ""}</p>
          <a href="${u.sayfa || 'urun.html'}" class="btn">İncele</a>
        </div>
      `).join("");
    }

  } catch (hata) {
    console.error("Site veri yükleme hatası:", hata);
    const hataKutusu = document.getElementById("icerik-hata");
    if (hataKutusu) {
      hataKutusu.style.display = "block";
      hataKutusu.innerHTML = `<h3>İçerik Yüklenemedi</h3><p>${hata.message}. Sitenizi bilgisayarınızda açıyorsanız lütfen Yerel_Sunucu.ps1 ile çalıştırın.</p>`;
    }
  }
});
