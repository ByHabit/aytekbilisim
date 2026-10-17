/* Site paneli: veri/site.json dosyasını GitHub deposunda düzenler (GitHub REST API).
   Erişim anahtarı yalnızca bu tarayıcıda saklanır (hatırla seçiliyse localStorage, değilse sessionStorage). */
(function () {
  "use strict";

  var VERI_YOLU = "veri/site.json";
  var YUKLEME_KLASORU = "assets/yuklemeler/";
  var API = "https://api.github.com";

  var veri = null;          // düzenlenen içerik
  var sha = null;           // site.json'un depodaki sürümü (çakışma koruması)
  var baglanti = null;      // { depo, dal, anahtar } ya da null (yerel mod)
  var kirli = false;
  var etkinSekme = "genel";

  function $(s) { return document.querySelector(s); }
  function el(etiket, ozellik, cocuklar) {
    var e = document.createElement(etiket);
    if (ozellik) for (var k in ozellik) {
      if (k === "metin") e.textContent = ozellik[k];
      else if (k === "sinif") e.className = ozellik[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), ozellik[k]);
      else e.setAttribute(k, ozellik[k]);
    }
    (cocuklar || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function durum(metin, tur) { var d = $("#durum"); d.textContent = metin || ""; d.className = "p-durum " + (tur || ""); }
  function kirliYap(v) {
    kirli = v;
    var k = $("#kirliBilgi");
    k.textContent = v ? "Kaydedilmemiş değişiklikler var" : (baglanti ? "Değişiklik yok" : "Yerel mod: kaydedince içerik dosyası indirilir");
    k.className = v ? "kirli" : "";
  }
  window.addEventListener("beforeunload", function (e) { if (kirli) { e.preventDefault(); e.returnValue = ""; } });

  // ── UTF-8 güvenli base64 ──────────────────────────────
  function b64Yaz(metin) {
    var bayt = new TextEncoder().encode(metin), s = "";
    for (var i = 0; i < bayt.length; i += 0x8000) s += String.fromCharCode.apply(null, bayt.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function b64Oku(b64) {
    var s = atob(b64.replace(/\n/g, "")), bayt = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) bayt[i] = s.charCodeAt(i);
    return new TextDecoder().decode(bayt);
  }

  // ── GitHub API ────────────────────────────────────────
  function istek(yontem, yol, govde) {
    return fetch(API + "/repos/" + baglanti.depo + "/contents/" + yol + (yontem === "GET" ? "?ref=" + encodeURIComponent(baglanti.dal) : ""), {
      method: yontem,
      headers: { "Authorization": "Bearer " + baglanti.anahtar, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      body: govde ? JSON.stringify(govde) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.ok) return j;
        var m = r.status === 401 ? "Erişim anahtarı geçersiz ya da süresi dolmuş."
          : r.status === 403 ? "Anahtarın bu depoya yazma izni yok (Contents: Read and write gerekli)."
          : r.status === 404 ? "Depo, dal ya da " + yol + " bulunamadı. Depo adını, dalı ve anahtarın bu depoya erişimini kontrol edin."
          : r.status === 409 || r.status === 422 ? "Dosya bu arada başka bir yerden değiştirilmiş. Sayfayı yenileyip değişikliğinizi yeniden yapın."
          : "GitHub hatası " + r.status + (j.message ? ": " + j.message : "");
        throw new Error(m);
      });
    });
  }

  function yukle() {
    durum("İçerik alınıyor…");
    return istek("GET", VERI_YOLU).then(function (j) {
      sha = j.sha;
      veri = JSON.parse(b64Oku(j.content));
      durum("Bağlandı: " + baglanti.depo, "basari");
    });
  }

  function kaydet() {
    if (!veri) return;
    var metin = JSON.stringify(veri, null, 2) + "\n";
    if (!baglanti) { indir(metin); kirliYap(false); durum("İçerik dosyası indirildi; veri klasörüne koyun.", "basari"); return; }
    var d = $("#kaydet"); d.disabled = true; durum("Kaydediliyor…");
    istek("PUT", VERI_YOLU, { message: "Panel: içerik güncellendi", content: b64Yaz(metin), sha: sha, branch: baglanti.dal })
      .then(function (j) { sha = j.content.sha; kirliYap(false); durum("Kaydedildi. Site yaklaşık bir dakika içinde güncellenir.", "basari"); })
      .catch(function (e) { durum(e.message, "hata"); })
      .then(function () { d.disabled = false; });
  }

  function indir(metin) {
    var a = el("a", { href: URL.createObjectURL(new Blob([metin], { type: "application/json" })), download: "site.json" });
    document.body.appendChild(a); a.click(); a.remove();
  }

  // Görsel ve video yükleme: dosya depoya (assets/yuklemeler/) yazılır, site içi yolu döner.
  var YUKLEME = {
    gorsel: { turler: /^image\/(png|jpeg|webp)$/, mb: 3, ad: "PNG, JPG ya da WEBP", ne: "görsel" },
    video: { turler: /^video\/(mp4|webm)$/, mb: 25, ad: "MP4 ya da WebM", ne: "video" }
  };
  function dosyaYukle(dosya, cesit) {
    var k = YUKLEME[cesit];
    if (!baglanti) return Promise.reject(new Error("Dosya yüklemek için GitHub'a bağlanın (yerel modda dosyayı assets/yuklemeler klasörüne kendiniz koyup yolunu yazın)."));
    if (!k.turler.test(dosya.type)) return Promise.reject(new Error("Yalnızca " + k.ad + " yüklenebilir."));
    if (dosya.size > k.mb * 1024 * 1024)
      return Promise.reject(new Error("Bu " + k.ne + " " + (dosya.size / 1048576).toFixed(1) + " MB; en fazla " + k.mb + " MB yüklenebilir." +
        (cesit === "video" ? " Uzun videoları YouTube'a yükleyip bağlantısını yapıştırın." : " Görseli küçültüp tekrar deneyin.")));
    var ad = dosya.name.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9.\-]+/g, "-").replace(/-+/g, "-");
    var yol = YUKLEME_KLASORU + Date.now() + "-" + ad;
    return new Promise(function (tamam, hata) {
      var r = new FileReader();
      r.onload = function () { tamam(String(r.result).split(",")[1]); };
      r.onerror = function () { hata(new Error("Dosya okunamadı.")); };
      r.readAsDataURL(dosya);
    }).then(function (b64) {
      return istek("PUT", yol, { message: "Panel: " + k.ne + " yüklendi (" + ad + ")", content: b64, branch: baglanti.dal });
    }).then(function () { return yol; });
  }

  // ── Form tanımı ───────────────────────────────────────
  var IKONLAR = ["teklif", "cari", "kasa", "banka", "stok", "servis", "personel", "pos", "yz", "muhasebe", "yedek", "kullanici"];
  function urunSecenekleri() { return (veri.urunler || []).map(function (u) { return [u.kod, u.ad]; }); }

  function kodUret(ad) {
    var k = (ad || "urun").toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "urun";
    var aday = k, n = 2;
    while ((veri.urunler || []).some(function (u) { return u.kod === aday; })) aday = k + "-" + n++;
    return aday;
  }

  function urunYonetimi(f) {
    var l = veri.urunler || (veri.urunler = []);
    f.appendChild(el("p", { metin: "Ürünler menüde, ana sayfadaki “Hangisi size uygun?” bölümünde ve indirme merkezinde bu sırayla görünür. Yeni ürünün sayfası kendiliğinden oluşur; içeriğini soldaki sekmesinden doldurun." }));
    var kutu = el("div", { sinif: "p-liste" });
    kutu.appendChild(el("div", { sinif: "p-liste-baslik" }, [el("b", { metin: "Ürünler (" + l.length + ")" }),
      el("button", { type: "button", sinif: "p-dugme p-kucuk", metin: "+ Yeni ürün ekle", onclick: function () {
        var ad = prompt("Yeni ürünün kısa adı (örneğin TYS Lite):"); if (!ad || !ad.trim()) return;
        var kod = kodUret(ad);
        l.push({ kod: kod, ad: ad.trim(), tamAd: ad.trim(), slogan: "", kisa: "", kimeUygun: "", cizim: "tek", ozellikler: [], gereksinimler: [], sss: [], gorseller: [], videolar: [] });
        kirliYap(true); sekmeAc("urun-" + (l.length - 1));
        durum("“" + ad.trim() + "” eklendi; sayfa adresi urun.html?kod=" + kod, "basari");
      } })]));
    l.forEach(function (u, i) {
      var sabit = u.kod === "tys" || u.kod === "tys-sql";
      kutu.appendChild(el("div", { sinif: "p-oge" }, [el("div", { sinif: "p-oge-ust" }, [
        el("span", { sinif: "ad", metin: (i + 1) + ". " + u.ad + "  (sayfa: " + (sabit ? u.kod + ".html" : "urun.html?kod=" + u.kod) + ")" }),
        el("button", { type: "button", sinif: "p-dugme p-kucuk", "aria-label": "Yukarı taşı", metin: "↑", onclick: function () { if (i > 0) { l.splice(i - 1, 0, l.splice(i, 1)[0]); kirliYap(true); sekmeAc("urunler"); } } }),
        el("button", { type: "button", sinif: "p-dugme p-kucuk", "aria-label": "Aşağı taşı", metin: "↓", onclick: function () { if (i < l.length - 1) { l.splice(i + 1, 0, l.splice(i, 1)[0]); kirliYap(true); sekmeAc("urunler"); } } }),
        el("button", { type: "button", sinif: "p-dugme p-kucuk", metin: "Düzenle", onclick: function () { sekmeAc("urun-" + i); } }),
        el("button", { type: "button", sinif: "p-dugme p-kucuk p-sil", metin: "Sil", onclick: function () {
          var bagli = (veri.indirmeler || []).filter(function (d) { return d.urun === u.kod; }).length + (veri.surumNotlari || []).filter(function (d) { return d.urun === u.kod; }).length;
          if (!confirm("“" + u.ad + "” silinsin mi?" + (bagli ? "\nBu ürüne ait " + bagli + " indirme / sürüm notu da silinecek." : "") +
            (sabit ? "\n\nNot: " + u.kod + ".html sayfası sitede kalır ve “Ürün bulunamadı” gösterir; isterseniz dosyayı depodan silin." : ""))) return;
          l.splice(i, 1);
          veri.indirmeler = (veri.indirmeler || []).filter(function (d) { return d.urun !== u.kod; });
          veri.surumNotlari = (veri.surumNotlari || []).filter(function (d) { return d.urun !== u.kod; });
          kirliYap(true); sekmeAc("urunler");
        } })])]));
    });
    f.appendChild(kutu);
  }

  function sekmeler() {
    var l = [
      { id: "genel", ad: "Firma ve iletişim", nesne: function () { return veri.genel; }, alanlar: [
        { k: "firma", ad: "Firma adı" }, { k: "kisi", ad: "Yetkili kişi" },
        { k: "telefon", ad: "Telefon", ipucu: "Sitede görünen biçim, örneğin 0 530 788 71 94" },
        { k: "telefonLink", ad: "Telefon (arama bağlantısı)", ipucu: "Uluslararası biçim, örneğin +905307887194" },
        { k: "epostalar", ad: "E-posta adresleri", tur: "satirlar", ipucu: "Her satıra bir adres" },
        { k: "konum", ad: "Konum" },
        { k: "fiyatBaslik", ad: "Fiyat kutusu başlığı" }, { k: "fiyatMetni", ad: "Fiyat kutusu metni", tur: "uzun" },
        { k: "altBilgi", ad: "Alt bilgi metni", tur: "uzun" }] },
      { id: "ana", ad: "Ana sayfa", nesne: function () { return veri.anasayfa; }, alanlar: [
        { k: "baslik", ad: "Büyük başlık" }, { k: "altBaslik", ad: "Başlık altı metin", tur: "uzun" },
        { k: "fisBaslik", ad: "Fiş başlığı", ipucu: "Fişte firma adının altında, tarihin önünde görünür" },
        { k: "fisSatirlari", ad: "Fiş satırları", tur: "liste", ogeAd: "Satır", alanlar: [{ k: "ad", ad: "Sol yazı" }, { k: "deger", ad: "Sağ yazı" }] },
        { k: "fisToplam", ad: "Fiş toplam satırı" },
        { k: "secimBaslik", ad: "“Hangisi size uygun” başlığı" }, { k: "secimMetni", ad: "Seçim bölümü metni", tur: "uzun" },
        { k: "modullerBaslik", ad: "Modüller başlığı" },
        { k: "moduller", ad: "Modüller", tur: "liste", ogeAd: "Modül", alanlar: [
          { k: "ikon", ad: "Simge", tur: "secim", secenekler: function () { return IKONLAR.map(function (i) { return [i, i]; }); } },
          { k: "ad", ad: "Ad" }, { k: "aciklama", ad: "Açıklama", tur: "uzun" }] }] }
    ];
    l.push({ id: "urunler", ad: "Ürünler", ozel: urunYonetimi });
    (veri.urunler || []).forEach(function (u, i) {
      l.push({ id: "urun-" + i, alt: true, ad: (u.ad || ("Ürün " + (i + 1))), nesne: function () { return veri.urunler[i]; }, alanlar: [
        { k: "ad", ad: "Kısa ad" }, { k: "tamAd", ad: "Tam ad" }, { k: "slogan", ad: "Tek cümlelik tanım" },
        { k: "kisa", ad: "Kısa açıklama", tur: "uzun" }, { k: "kimeUygun", ad: "Kimler için" },
        { k: "cizim", ad: "Çizim", tur: "secim", secenekler: function () { return [["tek", "Tek bilgisayar"], ["cok", "Sunucu ve terminaller"]]; } },
        { k: "ozellikler", ad: "Özellik grupları", tur: "liste", ogeAd: "Grup", alanlar: [{ k: "baslik", ad: "Grup başlığı" }, { k: "maddeler", ad: "Maddeler", tur: "satirlar", ipucu: "Her satıra bir madde" }] },
        { k: "gereksinimler", ad: "Sistem gereksinimleri", tur: "satirlar", ipucu: "Her satıra bir madde" },
        { k: "sss", ad: "Sık sorulanlar", tur: "liste", ogeAd: "Soru", alanlar: [{ k: "soru", ad: "Soru" }, { k: "cevap", ad: "Cevap", tur: "uzun" }] },
        { k: "gorseller", ad: "Ekran görüntüleri", tur: "liste", ogeAd: "Görsel", alanlar: [{ k: "dosya", ad: "Görsel", tur: "gorsel" }, { k: "aciklama", ad: "Açıklama" }] },
        { k: "videolar", ad: "Videolar", tur: "liste", ogeAd: "Video", alanlar: [{ k: "baslik", ad: "Başlık" }, { k: "adres", ad: "Video", tur: "video" }] }] });
    });
    l.push({ id: "indir", ad: "İndirme merkezi", kok: "indirmeler", alanlar: [
      { k: "urun", ad: "Ürün", tur: "secim", secenekler: urunSecenekleri }, { k: "ad", ad: "Ad" },
      { k: "aciklama", ad: "Açıklama", tur: "uzun" }, { k: "surum", ad: "Sürüm", ipucu: "Örneğin 1.0.1 (boş bırakılabilir)" },
      { k: "url", ad: "Bağlantı", ipucu: "Sabit indirme bağlantısı; boşsa “Bağlantı yakında eklenecek” görünür" },
      { k: "tur", ad: "Tür", tur: "secim", secenekler: function () { return [["kurulum", "Kurulum dosyası"], ["kilavuz", "Kılavuz / belge"], ["diger", "Diğer"]]; } }], ogeAd: "İndirme" });
    l.push({ id: "surum", ad: "Sürüm notları", kok: "surumNotlari", ogeAd: "Sürüm", alanlar: [
      { k: "urun", ad: "Ürün", tur: "secim", secenekler: urunSecenekleri }, { k: "surum", ad: "Sürüm" },
      { k: "tarih", ad: "Tarih", ipucu: "Örneğin 2026-10" }, { k: "maddeler", ad: "Yenilikler", tur: "satirlar", ipucu: "Her satıra bir madde" }] });
    return l;
  }

  // ── Form çizimi ───────────────────────────────────────
  function bosOge(alanlar) {
    var o = {};
    alanlar.forEach(function (a) { o[a.k] = a.tur === "satirlar" ? [] : a.tur === "secim" ? ((a.secenekler()[0] || [""])[0]) : ""; });
    return o;
  }

  function alanCiz(a, nesne) {
    var etiket = el("label", null, [a.ad, a.ipucu ? el("span", { sinif: "ipucu", metin: a.ipucu }) : null]);
    var g;
    if (a.tur === "uzun") {
      g = el("textarea", { rows: "3" }); g.value = nesne[a.k] || "";
      g.addEventListener("input", function () { nesne[a.k] = g.value; kirliYap(true); });
    } else if (a.tur === "satirlar") {
      g = el("textarea", { rows: "4" }); g.value = (nesne[a.k] || []).join("\n");
      g.addEventListener("input", function () { nesne[a.k] = g.value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean); kirliYap(true); });
    } else if (a.tur === "secim") {
      g = el("select");
      a.secenekler().forEach(function (s) { var o = el("option", { value: s[0], metin: s[1] }); if (s[0] === nesne[a.k]) o.selected = true; g.appendChild(o); });
      g.addEventListener("change", function () { nesne[a.k] = g.value; kirliYap(true); });
    } else if (a.tur === "gorsel") {
      return gorselAlani(a, nesne);
    } else if (a.tur === "video") {
      return videoAlani(a, nesne);
    } else if (a.tur === "liste") {
      return listeCiz(a, nesne[a.k] || (nesne[a.k] = []));
    } else {
      g = el("input", { type: "text" }); g.value = nesne[a.k] || "";
      g.addEventListener("input", function () { nesne[a.k] = g.value; kirliYap(true); });
    }
    etiket.appendChild(g);
    return etiket;
  }

  function gorselAlani(a, nesne) {
    var on = el("img", { alt: "" });
    function onizle() { on.src = nesne[a.k] ? "../" + nesne[a.k] : ""; on.style.visibility = nesne[a.k] ? "visible" : "hidden"; }
    var yol = el("input", { type: "text", placeholder: "assets/yuklemeler/…" }); yol.value = nesne[a.k] || "";
    yol.addEventListener("input", function () { nesne[a.k] = yol.value.trim(); onizle(); kirliYap(true); });
    var dosya = el("input", { type: "file", accept: "image/png,image/jpeg,image/webp", hidden: "" });
    var dugme = el("button", { type: "button", sinif: "p-dugme p-kucuk", metin: "Görsel yükle", onclick: function () { dosya.click(); } });
    dosya.addEventListener("change", function () {
      if (!dosya.files[0]) return;
      dugme.disabled = true; durum("Görsel yükleniyor…");
      dosyaYukle(dosya.files[0], "gorsel").then(function (y) {
        nesne[a.k] = y; yol.value = y; kirliYap(true);
        on.src = URL.createObjectURL(dosya.files[0]); on.style.visibility = "visible";
        durum("Görsel yüklendi. Galeride görünmesi için “Kaydet ve yayınla”ya basın.", "basari");
      }).catch(function (e) { durum(e.message, "hata"); }).then(function () { dugme.disabled = false; dosya.value = ""; });
    });
    onizle();
    return el("div", { sinif: "p-gorsel" }, [on, el("div", null, [el("label", null, [a.ad, yol]), el("div", { sinif: "p-dugmeler", style: "margin-bottom:1rem" }, [dugme, dosya])])]);
  }

  function videoAlani(a, nesne) {
    var bilgi = el("span", { sinif: "ipucu" });
    function aciklama() {
      var v = nesne[a.k] || "";
      bilgi.textContent = !v ? "YouTube bağlantısı yapıştırın (önerilen) ya da en fazla 25 MB MP4/WebM yükleyin."
        : /youtu\.?be/.test(v) ? "YouTube videosu: sayfada oynatılır." : "Video dosyası: sayfada oynatılır.";
    }
    var yol = el("input", { type: "text", placeholder: "https://www.youtube.com/watch?v=…  ya da  assets/yuklemeler/….mp4" }); yol.value = nesne[a.k] || "";
    yol.addEventListener("input", function () { nesne[a.k] = yol.value.trim(); aciklama(); kirliYap(true); });
    var dosya = el("input", { type: "file", accept: "video/mp4,video/webm", hidden: "" });
    var dugme = el("button", { type: "button", sinif: "p-dugme p-kucuk", metin: "Video dosyası yükle", onclick: function () { dosya.click(); } });
    dosya.addEventListener("change", function () {
      if (!dosya.files[0]) return;
      dugme.disabled = true; durum("Video yükleniyor… (büyük dosyalarda birkaç dakika sürebilir)");
      dosyaYukle(dosya.files[0], "video").then(function (y) {
        nesne[a.k] = y; yol.value = y; aciklama(); kirliYap(true);
        durum("Video yüklendi. Sayfada görünmesi için “Kaydet ve yayınla”ya basın.", "basari");
      }).catch(function (e) { durum(e.message, "hata"); }).then(function () { dugme.disabled = false; dosya.value = ""; });
    });
    aciklama();
    return el("div", null, [el("label", null, [a.ad, bilgi, yol]), el("div", { sinif: "p-dugmeler", style: "margin-bottom:1rem" }, [dugme, dosya])]);
  }

  function listeCiz(a, dizi) {
    var kutu = el("div", { sinif: "p-liste" });
    function ciz() {
      kutu.innerHTML = "";
      kutu.appendChild(el("div", { sinif: "p-liste-baslik" }, [el("b", { metin: a.ad + " (" + dizi.length + ")" }),
        el("button", { type: "button", sinif: "p-dugme p-kucuk", metin: "+ " + (a.ogeAd || "Öğe") + " ekle", onclick: function () { dizi.push(bosOge(a.alanlar)); kirliYap(true); ciz(); } })]));
      if (!dizi.length) kutu.appendChild(el("p", { sinif: "p-bos", metin: "Henüz " + (a.ogeAd || "öğe").toLocaleLowerCase("tr") + " yok. “Ekle” ile başlayın." }));
      dizi.forEach(function (oge, i) {
        var ilkMetin = a.alanlar.filter(function (x) { return !x.tur || x.tur === "uzun"; })[0];
        var baslik = (ilkMetin && oge[ilkMetin.k]) || (a.ogeAd || "Öğe") + " " + (i + 1);
        var kart = el("div", { sinif: "p-oge" }, [el("div", { sinif: "p-oge-ust" }, [
          el("span", { sinif: "ad", metin: (i + 1) + ". " + baslik }),
          el("button", { type: "button", sinif: "p-dugme p-kucuk", "aria-label": "Yukarı taşı", metin: "↑", onclick: function () { if (i > 0) { dizi.splice(i - 1, 0, dizi.splice(i, 1)[0]); kirliYap(true); ciz(); } } }),
          el("button", { type: "button", sinif: "p-dugme p-kucuk", "aria-label": "Aşağı taşı", metin: "↓", onclick: function () { if (i < dizi.length - 1) { dizi.splice(i + 1, 0, dizi.splice(i, 1)[0]); kirliYap(true); ciz(); } } }),
          el("button", { type: "button", sinif: "p-dugme p-kucuk p-sil", metin: "Sil", onclick: function () { if (confirm("“" + baslik + "” silinsin mi?")) { dizi.splice(i, 1); kirliYap(true); ciz(); } } })])]);
        a.alanlar.forEach(function (alt) { kart.appendChild(alanCiz(alt, oge)); });
        kutu.appendChild(kart);
      });
    }
    ciz();
    return kutu;
  }

  function sekmeAc(id) {
    etkinSekme = id;
    var l = sekmeler(), s = l.filter(function (x) { return x.id === id; })[0] || l[0];
    var nav = $("#sekmeler"); nav.innerHTML = "";
    l.forEach(function (x) { nav.appendChild(el("button", { type: "button", sinif: x.alt ? "alt" : "", "aria-current": x.id === s.id ? "true" : "false", metin: x.ad, onclick: function () { sekmeAc(x.id); } })); });
    var f = $("#form"); f.innerHTML = "";
    f.appendChild(el("h2", { metin: s.ad }));
    if (s.ozel) s.ozel(f);
    else if (s.kok) f.appendChild(listeCiz({ ad: s.ad, ogeAd: s.ogeAd, alanlar: s.alanlar }, veri[s.kok] || (veri[s.kok] = [])));
    else s.alanlar.forEach(function (a) { f.appendChild(alanCiz(a, s.nesne())); });
  }

  function duzenleyiciyiAc() {
    $("#giris").hidden = true; $("#duzenleyici").hidden = false; $("#altCubuk").hidden = false;
    $("#kaydet").textContent = baglanti ? "Kaydet ve yayınla" : "Kaydet (dosyayı indir)";
    kirliYap(false); sekmeAc(etkinSekme);
  }

  // ── Bağlantı ekranı ───────────────────────────────────
  function depoTahmini() {
    var h = location.hostname, m = /^([^.]+)\.github\.io$/i.exec(h);
    if (!m) return "";
    var parca = location.pathname.split("/").filter(Boolean)[0];
    return m[1] + "/" + (parca && parca !== "panel" ? parca : m[1] + ".github.io");
  }
  var kayitli = {};
  try { kayitli = JSON.parse(localStorage.getItem("panelBaglanti") || sessionStorage.getItem("panelBaglanti") || "{}"); } catch (e) { kayitli = {}; }
  $("#gDepo").value = kayitli.depo || depoTahmini();
  $("#gDal").value = kayitli.dal || "main";
  $("#gAnahtar").value = kayitli.anahtar || "";
  $("#gHatirla").checked = !!localStorage.getItem("panelBaglanti");

  $("#girisForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var b = { depo: $("#gDepo").value.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/+$/, ""), dal: $("#gDal").value.trim(), anahtar: $("#gAnahtar").value.trim() };
    if (!/^[\w.-]+\/[\w.-]+$/.test(b.depo)) { $("#girisHata").textContent = "Depoyu kullanıcı/depo biçiminde yazın, örneğin ByHabit/aytekbilisim."; return; }
    $("#girisHata").textContent = ""; baglanti = b;
    yukle().then(function () {
      localStorage.removeItem("panelBaglanti"); sessionStorage.removeItem("panelBaglanti");
      ($("#gHatirla").checked ? localStorage : sessionStorage).setItem("panelBaglanti", JSON.stringify(b));
      duzenleyiciyiAc();
    }).catch(function (err) { baglanti = null; $("#girisHata").textContent = err.message; durum(""); });
  });

  $("#yerelMod").addEventListener("click", function () {
    baglanti = null; durum("Yerel içerik okunuyor…");
    fetch("../" + VERI_YOLU, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) { veri = j; durum("Yerel mod", ""); duzenleyiciyiAc(); })
      .catch(function (e) { $("#girisHata").textContent = "Yerel içerik okunamadı (" + e.message + "). Paneli Yerel_Sunucu.ps1 ile açın."; durum(""); });
  });

  // ── Alt çubuk ─────────────────────────────────────────
  $("#kaydet").addEventListener("click", kaydet);
  $("#jsonIndir").addEventListener("click", function () { indir(JSON.stringify(veri, null, 2) + "\n"); });
  $("#jsonYukle").addEventListener("change", function () {
    var f = this.files[0]; if (!f) return;
    f.text().then(function (t) {
      var j = JSON.parse(t);
      if (!j.genel || !j.urunler) throw new Error("Bu dosya bir site içerik dosyası değil.");
      veri = j; kirliYap(true); sekmeAc(etkinSekme); durum("Dosya yüklendi; yayınlamak için kaydedin.", "basari");
    }).catch(function (e) { durum("Dosya okunamadı: " + e.message, "hata"); });
    this.value = "";
  });
  document.addEventListener("keydown", function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && veri) { e.preventDefault(); kaydet(); } });
})();
