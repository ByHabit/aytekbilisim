/* Aytek Bilişim — TYS / TYS SQL tanıtım sitesi.
   Bütün içerik veri/site.json dosyasından gelir; panel (panel/) bu dosyayı düzenler. */
(function () {
  "use strict";

  var SAYFA = document.body.getAttribute("data-sayfa");
  var VERI = {};
  var URUN = document.body.getAttribute("data-urun") || new URLSearchParams(location.search).get("kod");

  // Panelden girilen metinler HTML olarak yorumlanmaz
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(s) { return document.querySelector(s); }

  // ── Simgeler (çizgi) ──────────────────────────────────
  var SIMGE = {
    teklif: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    cari: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5"/><path d="M16 5.5a3 3 0 0 1 0 5.6M18.5 19c-.3-1.9-1.1-3.4-2.3-4.3"/>',
    kasa: '<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M3 11h18M7 15h3"/><path d="M7 7V5h10v2"/>',
    banka: '<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    stok: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
    servis: '<path d="M14.5 5.5a4 4 0 0 0-5 5L4 16l4 4 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/>',
    personel: '<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 2v4M16 2v4M4 9h16M8 13h3M8 17h6"/>',
    pos: '<rect x="4" y="3" width="16" height="12" rx="2"/><path d="M8 19h8M12 15v4"/><path d="M8 8h3M8 11h5"/>',
    yz: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    muhasebe: '<path d="M4 4h10l6 6v10H4z"/><path d="M14 4v6h6"/><path d="M8 14h2M8 17h6M13 14h3"/>',
    yedek: '<path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z"/><path d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    kullanici: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2"/>',
    indir: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    kilavuz: '<path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h9M9 8h5"/>',
    tel: '<path d="M6 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2L21 15v3a3 3 0 0 1-3 3A16 16 0 0 1 3 6a3 3 0 0 1 3-3z"/>',
    eposta: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
    konum: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    ara: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    egitim: '<path d="M3 8l9-4 9 4-9 4z"/><path d="M7 10v5c1.5 1.4 3.2 2 5 2s3.5-.6 5-2v-5M21 8v6"/>'
  };
  function simge(ad) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (SIMGE[ad] || SIMGE.teklif) + "</svg>";
  }

  // ── Çizimler: tek bilgisayar / sunucu + terminaller ───
  function pc(x, y, etiket, ana) {
    var r = ana ? "#2F8CFF" : "#8A97AA";
    return '<g transform="translate(' + x + "," + y + ')">' +
      '<rect x="-34" y="-26" width="68" height="44" rx="5" fill="#fff" stroke="' + r + '" stroke-width="2.2"/>' +
      '<rect x="-27" y="-19" width="54" height="30" rx="2" fill="' + (ana ? "#E8F1FF" : "#EEF2F7") + '"/>' +
      '<path d="M-12 18v7h24v-7" fill="none" stroke="' + r + '" stroke-width="2.2"/><path d="M-20 26h40" stroke="' + r + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<text y="44" text-anchor="middle" font-family="IBM Plex Sans, sans-serif" font-size="12" fill="#5B6880">' + etiket + "</text></g>";
  }
  function vt(x, y, renk) {
    return '<g transform="translate(' + x + "," + y + ')" fill="none" stroke="' + renk + '" stroke-width="2">' +
      '<ellipse cx="0" cy="-9" rx="11" ry="4" fill="#fff"/><path d="M-11-9v16c0 2.2 4.9 4 11 4s11-1.8 11-4V-9"/><path d="M-11-1c0 2.2 4.9 4 11 4s11-1.8 11-4"/></g>';
  }
  function cizim(tur, koyu) {
    if (tur === "tek") {
      return '<svg viewBox="0 0 320 150" role="img" aria-label="Tek bilgisayar: program ve veriler aynı bilgisayarda">' +
        pc(130, 62, "Program ve veriler", true) + vt(196, 66, "#2F8CFF") + "</svg>";
    }
    var cizgi = koyu ? "rgba(201,214,234,.55)" : "#B9C4D4";
    return '<svg viewBox="0 0 320 150" role="img" aria-label="Sunucu ve terminaller: bütün bilgisayarlar aynı verilerle çalışır">' +
      '<path d="M160 52 L60 92 M160 52 L160 92 M160 52 L260 92" stroke="' + cizgi + '" stroke-width="2" stroke-dasharray="4 4" fill="none"/>' +
      '<g transform="translate(160,30)"><rect x="-20" y="-22" width="40" height="46" rx="5" fill="#fff" stroke="#2F8CFF" stroke-width="2.2"/>' +
      '<path d="M-12-12h24M-12-4h24M-12 4h24" stroke="#2F8CFF" stroke-width="2"/><circle cx="10" cy="14" r="2.5" fill="#17A673"/></g>' +
      '<text x="196" y="34" font-family="IBM Plex Sans, sans-serif" font-size="12" fill="' + (koyu ? "#C9D6EA" : "#5B6880") + '">Sunucu</text>' +
      pc(60, 104, "Kasa", false).replace('y="44"', 'y="40"') + pc(160, 104, "Ofis", false).replace('y="44"', 'y="40"') + pc(260, 104, "Depo", false).replace('y="44"', 'y="40"') +
      "</svg>";
  }

  // ── Ortak parçalar ────────────────────────────────────
  function ustMenu(g) {
    var sayfalar = [["index.html", "Ana sayfa", "ana"]]
      .concat((VERI.urunler || []).map(function (u) { return [urunAdres(u), u.ad, u.kod]; }))
      .concat([["indir.html", "İndirme merkezi", "indir"], ["egitim.html", "Eğitim", "egitim"], ["iletisim.html", "İletişim", "iletisim"]]);
    var etkin = SAYFA === "urun" ? URUN : SAYFA;
    var m = sayfalar.map(function (s) {
      return '<li><a href="' + esc(s[0]) + '"' + (s[2] === etkin ? ' aria-current="page"' : "") + ">" + esc(s[1]) + "</a></li>";
    }).join("");
    $("#ust").innerHTML =
      '<div class="kap"><a class="marka" href="index.html"><img src="assets/img/aytek-logo-64.webp" alt="" width="40" height="40">' + esc(g.firma) + "</a>" +
      '<button class="menu-ac" type="button" aria-expanded="false" aria-controls="menu">Menü</button>' +
      '<ul class="menu" id="menu">' + m + "</ul></div>";
    var b = $(".menu-ac"), l = $("#menu");
    b.addEventListener("click", function () { var a = l.classList.toggle("acik"); b.setAttribute("aria-expanded", a ? "true" : "false"); });
  }

  function altBilgi(g, v) {
    var ep = (g.epostalar || []).map(function (e) { return '<li><a href="mailto:' + esc(e) + '">' + esc(e) + "</a></li>"; }).join("");
    $("#alt").innerHTML =
      '<div class="kap"><div><h3>' + esc(g.firma) + "</h3><p>" + esc(g.altBilgi) + "</p></div>" +
      "<div><h3>Programlar</h3><ul>" + v.urunler.map(function (u) { return '<li><a href="' + esc(urunAdres(u)) + '">' + esc(u.tamAd) + "</a></li>"; }).join("") +
      '<li><a href="indir.html">İndirme merkezi</a></li><li><a href="egitim.html">Eğitim merkezi</a></li></ul></div>' +
      "<div><h3>İletişim</h3><ul><li>" + esc(g.kisi) + '</li><li><a href="tel:' + esc(g.telefonLink) + '">' + esc(g.telefon) + "</a></li>" + ep + "</ul></div>" +
      '<div class="telif">© ' + new Date().getFullYear() + " " + esc(g.firma) + "</div></div>";
  }

  function fiyatBandi(g) {
    return '<section class="bolum bolum-fiyat"><div class="kap"><div class="fiyat"><div><h2>' + esc(g.fiyatBaslik) + "</h2><p>" + esc(g.fiyatMetni) + "</p></div>" +
      '<a class="tel" href="tel:' + esc(g.telefonLink) + '">' + simge("tel") + esc(g.telefon) + "</a></div></div></section>";
  }

  function urunAdres(u) { return (u.kod === "tys" || u.kod === "tys-sql") ? u.kod + ".html" : "urun.html?kod=" + encodeURIComponent(u.kod); }

  // YouTube bağlantısından video kimliği (watch?v=, youtu.be/, shorts/, embed/)
  function youtubeKimlik(adres) {
    var m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(adres || "");
    return m ? m[1] : null;
  }

  function urunBul(v, kod) { for (var i = 0; i < v.urunler.length; i++) if (v.urunler[i].kod === kod) return v.urunler[i]; return null; }

  // ── Ana sayfa ─────────────────────────────────────────
  function anaSayfa(v) {
    var a = v.anasayfa, g = v.genel;
    var bugun = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
    var satirlar = (a.fisSatirlari || []).map(function (s) {
      return '<div class="fis-satir"><span class="ad">' + esc(s.ad) + '</span><span class="noktalar"></span><span class="deger">' + esc(s.deger) + "</span></div>";
    }).join("");
    var secim = v.urunler.map(function (u) {
      return '<article class="secenek"><div class="secenek-cizim">' + cizim(u.cizim) + "</div>" +
        '<h3 class="urun-ad">' + esc(u.ad) + "<small>" + esc(u.tamAd) + "</small></h3>" +
        "<p>" + esc(u.slogan) + " " + esc(u.kisa) + "</p>" +
        '<p class="uygun"><b>Kimler için:</b> ' + esc(u.kimeUygun) + "</p>" +
        '<div class="alt"><a class="dugme dugme-acik" href="' + esc(urunAdres(u)) + '">' + esc(u.ad) + ' hakkında</a><a class="dugme dugme-cizgi" href="indir.html#' + esc(u.kod) + '">İndir</a></div></article>';
    }).join("");
    var moduller = (a.moduller || []).map(function (m) {
      return '<div class="modul"><div class="modul-simge">' + simge(m.ikon) + "</div><div><h3>" + esc(m.ad) + "</h3><p>" + esc(m.aciklama) + "</p></div></div>";
    }).join("");

    $("#icerik").innerHTML =
      '<section class="giris"><div class="kap"><div><h1>' + esc(a.baslik) + "</h1><p>" + esc(a.altBaslik) + "</p>" +
      '<div class="dugmeler"><a class="dugme dugme-ana" href="#secim">Size uygun programı seçin</a><a class="dugme dugme-hayalet" href="indir.html">' + simge("indir") + "İndirme merkezi</a></div></div>" +
      '<div class="yazici" aria-label="Programdaki modüller"><div class="fis"><div class="fis-ust"><strong>' + esc(g.firma) + "</strong><span>" + esc(a.fisBaslik) + " " + bugun + "</span></div>" +
      satirlar + '<div class="fis-toplam"><span>Toplam</span><span>' + esc(a.fisToplam) + '</span></div><div class="barkod" aria-hidden="true"></div>' +
      '<div class="fis-alt">' + esc(g.telefon) + "</div></div></div></div></section>" +
      '<section class="bolum" id="secim"><div class="kap"><div class="bolum-baslik"><h2>' + esc(a.secimBaslik) + "</h2><p>" + esc(a.secimMetni) + '</p></div><div class="secim">' + secim + "</div></div></section>" +
      '<section class="bolum" style="padding-top:0"><div class="kap"><div class="bolum-baslik"><h2>' + esc(a.modullerBaslik) + '</h2></div><div class="moduller">' + moduller + "</div></div></section>" +
      fiyatBandi(g);
  }

  // ── Ürün sayfası ──────────────────────────────────────
  function urunSayfasi(v) {
    var u = urunBul(v, URUN), g = v.genel;
    if (!u) { $("#icerik").innerHTML = '<div class="kap durum-kutu">Ürün bulunamadı.</div>'; return; }
    document.title = u.ad + " · " + u.tamAd + " | " + g.firma;
    var oz = (u.ozellikler || []).map(function (o) {
      return '<div class="ozellik"><h3>' + esc(o.baslik) + "</h3><ul>" + (o.maddeler || []).map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ul></div>";
    }).join("");
    var sss = (u.sss || []).map(function (s) { return "<details><summary>" + esc(s.soru) + "</summary><p>" + esc(s.cevap) + "</p></details>"; }).join("");
    var vid = (u.videolar || []).filter(function (x) { return x && x.adres; });
    var videolar = vid.length ? '<section class="bolum" style="padding-top:0"><div class="kap"><h2>Videolar</h2><div class="videolar">' +
      vid.map(function (x) {
        var yt = youtubeKimlik(x.adres);
        var oynatici = yt
          ? '<iframe src="https://www.youtube-nocookie.com/embed/' + yt + '?rel=0" title="' + esc(x.baslik || u.ad) + '" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>'
          : '<video controls preload="metadata" src="' + esc(x.adres) + '"' + (x.kapak ? ' poster="' + esc(x.kapak) + '"' : "") + "></video>";
        return '<figure class="video"><div class="video-kutu">' + oynatici + "</div>" + (x.baslik ? "<figcaption>" + esc(x.baslik) + "</figcaption>" : "") + "</figure>";
      }).join("") + "</div></div></section>" : "";
    var gor = (u.gorseller || []).filter(function (x) { return x && x.dosya; });
    var galeri = gor.length ? '<section class="bolum" style="padding-top:0"><div class="kap"><h2>Ekran görüntüleri</h2><div class="galeri">' +
      gor.map(function (x) { return '<figure><img src="' + esc(x.dosya) + '" alt="' + esc(x.aciklama) + '" loading="lazy"><figcaption>' + esc(x.aciklama) + "</figcaption></figure>"; }).join("") +
      "</div></div></section>" : "";

    $("#icerik").innerHTML =
      '<section class="urun-giris"><div class="kap"><div><h1>' + esc(u.ad) + '</h1><div class="tam">' + esc(u.tamAd) + '</div><p class="slogan">' + esc(u.slogan) + "</p><p>" + esc(u.kisa) + "</p>" +
      '<div class="dugmeler"><a class="dugme dugme-ana" href="indir.html#' + esc(u.kod) + '">' + simge("indir") + esc(u.ad) + ' indir</a><a class="dugme dugme-hayalet" href="tel:' + esc(g.telefonLink) + '">' + simge("tel") + esc(g.telefon) + "</a></div></div>" +
      '<div class="secenek-cizim">' + cizim(u.cizim, true) + "</div></div></section>" +
      '<section class="bolum"><div class="kap"><div class="ozellikler">' + oz + "</div></div></section>" +
      egitimBandi(v, u) + videolar + galeri +
      '<section class="bolum" style="padding-top:0"><div class="kap iki-sutun"><div class="gereksinim"><h2 style="font-size:1.4rem">Sistem gereksinimleri</h2><ul>' +
      (u.gereksinimler || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul></div><div class="sss"><h2 style="font-size:1.4rem">Sık sorulanlar</h2>' + sss + "</div></div></section>" +
      fiyatBandi(g);

    // Ekran görüntüsünü büyüt
    Array.prototype.forEach.call(document.querySelectorAll(".galeri img"), function (img) {
      img.addEventListener("click", function () {
        var k = document.createElement("div"); k.className = "buyuk"; k.innerHTML = '<img src="' + img.src + '" alt="' + esc(img.alt) + '">';
        k.addEventListener("click", function () { k.remove(); }); document.body.appendChild(k);
      });
    });
  }

  // Başlığı olan her anlatım görünür; videosu ya da görseli olmayanlar yazılı anlatım olarak gösterilir
  function egitimIcerikleri(v) { return ((v.egitim && v.egitim.icerikler) || []).filter(function (x) { return x && x.baslik; }); }
  function surumYaz(s) { return String(s || "").trim().replace(/^v/i, ""); }

  function egitimBandi(v, u) {
    var n = egitimIcerikleri(v).filter(function (x) { return x.urun === u.kod || x.urun === "hepsi" || !x.urun; }).length;
    if (!n) return "";
    return '<section class="bolum" style="padding-top:0"><div class="kap"><a class="egitim-bant" href="egitim.html?urun=' + encodeURIComponent(u.kod) + '">' +
      '<span class="egitim-bant-simge">' + simge("egitim") + "</span><span><b>Kurulum ve kullanım anlatımları</b><br>Eğitim merkezinde " + esc(u.ad) + " için " + n + " anlatım var.</span>" +
      '<span class="dugme dugme-acik">Eğitim merkezine git</span></a></div></section>';
  }

  // ── Eğitim merkezi ────────────────────────────────────
  function egitimSayfasi(v) {
    var e = v.egitim || {}, hepsi = egitimIcerikleri(v);
    hepsi.forEach(function (x, i) { if (!x.id) x.id = "i" + (i + 1); });
    var q = new URLSearchParams(location.search);
    var secim = { kategori: q.get("kategori") || "", urun: q.get("urun") || "", ara: "" };
    var urunAdi = {}; v.urunler.forEach(function (u) { urunAdi[u.kod] = u.ad; });
    var kategoriler = (e.kategoriler || []).filter(function (k) { return hepsi.some(function (x) { return x.kategori === k; }); });

    function kapak(x) {
      if (!x.adres) return '<span class="kapak-yazi">' + simge("egitim") + "<span>Yazılı anlatım</span></span>";
      var yt = youtubeKimlik(x.adres);
      if (yt) return '<img src="https://i.ytimg.com/vi/' + yt + '/hqdefault.jpg" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'"><span class="oynat" aria-hidden="true"></span>';
      if (x.tur === "video") return '<video muted preload="metadata" src="' + esc(x.adres) + '#t=0.5"></video><span class="oynat" aria-hidden="true"></span>';
      return '<img src="' + esc(x.adres) + '" alt="" loading="lazy">';
    }
    function uygunMu(x) {
      if (secim.kategori && x.kategori !== secim.kategori) return false;
      if (secim.urun && !(x.urun === secim.urun || x.urun === "hepsi" || !x.urun)) return false;
      if (secim.ara) {
        var t = (x.baslik + " " + (x.aciklama || "") + " " + (x.kategori || "")).toLocaleLowerCase("tr");
        if (secim.ara.split(/\s+/).some(function (k) { return k && t.indexOf(k) < 0; })) return false;
      }
      return true;
    }
    var gorunen = [];
    function listele() {
      gorunen = hepsi.filter(uygunMu);
      var l = $("#egitimListe");
      $("#egitimSayi").textContent = gorunen.length === hepsi.length ? hepsi.length + " anlatım" : gorunen.length + " / " + hepsi.length + " anlatım";
      if (!hepsi.length) { l.innerHTML = '<p class="egitim-bos">Henüz anlatım eklenmedi. Kurulum ve kullanım videoları yakında burada olacak.</p>'; return; }
      if (!gorunen.length) { l.innerHTML = '<p class="egitim-bos">Bu seçimle eşleşen anlatım yok. Aramayı ya da kategoriyi değiştirin.</p>'; return; }
      l.innerHTML = gorunen.map(function (x, i) {
        var urunEt = x.urun && x.urun !== "hepsi" && urunAdi[x.urun] ? '<span class="etiket">' + esc(urunAdi[x.urun]) + "</span>" : "";
        return '<article class="egitim-kart"><button type="button" class="egitim-ac" data-i="' + i + '" aria-label="' + esc(x.baslik) + ' anlatımını aç">' +
          '<span class="egitim-kapak">' + kapak(x) + "</span></button>" +
          '<div class="egitim-metin"><div class="etiketler">' + (x.kategori ? '<span class="etiket etiket-kategori">' + esc(x.kategori) + "</span>" : "") + urunEt + "</div>" +
          '<h3><a href="#' + esc(x.id) + '" data-i="' + i + '" class="egitim-ac-baglanti">' + esc(x.baslik) + "</a></h3>" +
          (x.aciklama ? "<p>" + esc(x.aciklama) + "</p>" : "") + "</div></article>";
      }).join("");
      Array.prototype.forEach.call(l.querySelectorAll("[data-i]"), function (b) {
        b.addEventListener("click", function (ev) { ev.preventDefault(); ac(+b.getAttribute("data-i")); });
      });
    }

    // Görüntüleyici
    var dlg, simdiki = -1;
    function medya(x) {
      if (!x.adres) return "";
      var yt = youtubeKimlik(x.adres);
      if (yt) return '<iframe src="https://www.youtube-nocookie.com/embed/' + yt + '?rel=0&autoplay=1" title="' + esc(x.baslik) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      if (x.tur === "video") return '<video controls autoplay src="' + esc(x.adres) + '"></video>';
      return '<img src="' + esc(x.adres) + '" alt="' + esc(x.baslik) + '">';
    }
    function ac(i) {
      if (i < 0 || i >= gorunen.length) return;
      simdiki = i; var x = gorunen[i];
      $("#gMedya").innerHTML = medya(x);
      $("#gMedya").className = "g-medya" + (youtubeKimlik(x.adres) || (x.adres && x.tur === "video") ? " g-video" : "");
      $("#gMedya").hidden = !x.adres;
      $("#gBaslik").textContent = x.baslik;
      $("#gAciklama").textContent = x.aciklama || "";
      $("#gEtiket").textContent = [x.kategori, x.urun && x.urun !== "hepsi" ? urunAdi[x.urun] : ""].filter(Boolean).join("  |  ");
      $("#gOnceki").disabled = i === 0; $("#gSonraki").disabled = i === gorunen.length - 1;
      $("#gSira").textContent = (i + 1) + " / " + gorunen.length;
      if (!dlg.open) dlg.showModal();
      history.replaceState(null, "", "#" + x.id);
    }
    function kapat() { $("#gMedya").innerHTML = ""; if (dlg.open) dlg.close(); history.replaceState(null, "", location.pathname + location.search); }

    $("#icerik").innerHTML =
      '<section class="sayfa-baslik"><div class="kap"><h1>' + esc(e.baslik || "Eğitim merkezi") + "</h1><p>" + esc(e.aciklama || "") + "</p></div></section>" +
      '<section class="bolum egitim-bolum"><div class="kap">' +
      '<div class="egitim-arac"><label class="egitim-ara">' + simge("ara") + '<span class="gizli">Anlatımlarda ara</span><input type="search" id="egitimAra" placeholder="Anlatımlarda ara: kurulum, Z raporu, barkod…"></label>' +
      '<label class="egitim-urun"><span class="gizli">Ürün</span><select id="egitimUrun"><option value="">Bütün ürünler</option>' +
      v.urunler.map(function (u) { return '<option value="' + esc(u.kod) + '"' + (secim.urun === u.kod ? " selected" : "") + ">" + esc(u.ad) + "</option>"; }).join("") + "</select></label>" +
      '<span class="egitim-sayi" id="egitimSayi" role="status"></span></div>' +
      (kategoriler.length ? '<div class="egitim-kategoriler" role="group" aria-label="Kategori">' +
        ['<button type="button" data-k="" aria-pressed="' + (!secim.kategori) + '">Tümü</button>'].concat(kategoriler.map(function (k) {
          return '<button type="button" data-k="' + esc(k) + '" aria-pressed="' + (secim.kategori === k) + '">' + esc(k) + "</button>";
        })).join("") + "</div>" : "") +
      '<div class="egitim-liste" id="egitimListe"></div></div></section>' +
      '<dialog class="goruntuleyici" id="goruntuleyici" aria-labelledby="gBaslik"><div class="g-ic">' +
      '<button type="button" class="g-kapat" id="gKapat" aria-label="Kapat">&times;</button>' +
      '<div class="g-medya" id="gMedya"></div><div class="g-alt"><div class="g-etiket" id="gEtiket"></div><h2 id="gBaslik"></h2><p id="gAciklama"></p>' +
      '<div class="g-gezinti"><button type="button" class="dugme dugme-cizgi" id="gOnceki">Önceki</button><span id="gSira"></span><button type="button" class="dugme dugme-cizgi" id="gSonraki">Sonraki</button></div></div></div></dialog>';

    dlg = $("#goruntuleyici");
    $("#gKapat").addEventListener("click", kapat);
    dlg.addEventListener("cancel", function (ev) { ev.preventDefault(); kapat(); });
    dlg.addEventListener("click", function (ev) { if (ev.target === dlg) kapat(); });
    $("#gOnceki").addEventListener("click", function () { ac(simdiki - 1); });
    $("#gSonraki").addEventListener("click", function () { ac(simdiki + 1); });
    dlg.addEventListener("keydown", function (ev) { if (ev.key === "ArrowLeft") ac(simdiki - 1); else if (ev.key === "ArrowRight") ac(simdiki + 1); });
    $("#egitimAra").addEventListener("input", function () { secim.ara = this.value.trim().toLocaleLowerCase("tr"); listele(); });
    $("#egitimUrun").addEventListener("change", function () { secim.urun = this.value; listele(); });
    Array.prototype.forEach.call(document.querySelectorAll(".egitim-kategoriler button"), function (b) {
      b.addEventListener("click", function () {
        secim.kategori = b.getAttribute("data-k");
        Array.prototype.forEach.call(document.querySelectorAll(".egitim-kategoriler button"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        listele();
      });
    });
    listele();
    // Paylaşılan bağlantı: egitim.html#kimlik doğrudan o anlatımı açar
    if (location.hash) {
      var id = decodeURIComponent(location.hash.slice(1));
      secim.kategori = ""; secim.urun = ""; listele();
      for (var k = 0; k < gorunen.length; k++) if (gorunen[k].id === id) { ac(k); break; }
    }
  }

  // ── İndirme merkezi ───────────────────────────────────
  function indirSayfasi(v) {
    var gruplar = v.urunler.map(function (u) {
      var l = (v.indirmeler || []).filter(function (d) { return d.urun === u.kod; });
      var satir = l.map(function (d) {
        var dugme = d.url ? '<a class="dugme ' + (d.tur === "kurulum" ? "dugme-acik" : "dugme-cizgi") + '" href="' + esc(d.url) + '"' + (d.tur === "kurulum" ? "" : ' target="_blank" rel="noopener"') + ">" +
          (d.tur === "kurulum" ? "İndir" : "Aç") + "</a>" : '<span class="yakinda">Bağlantı yakında eklenecek</span>';
        return '<div class="indirme"><div class="indirme-simge">' + simge(d.tur === "kilavuz" ? "kilavuz" : "indir") + "</div><div><h3>" + esc(d.ad) +
          (d.surum ? '<span class="surum">v' + esc(surumYaz(d.surum)) + "</span>" : "") + "</h3><p>" + esc(d.aciklama) + "</p></div>" + dugme + "</div>";
      }).join("");
      return '<div class="indirme-grup" id="' + esc(u.kod) + '"><h2><img src="assets/img/tys-simge.webp" alt="">' + esc(u.ad) + ' <small style="font-weight:400;color:var(--soluk);font-size:1rem">' + esc(u.slogan) + "</small></h2>" +
        (satir || '<p class="yakinda">Bu ürün için henüz dosya eklenmedi.</p>') + "</div>";
    }).join("");
    var notlar = (v.surumNotlari || []).map(function (n) {
      var u = urunBul(v, n.urun);
      return "<li><h3>" + esc(u ? u.ad : n.urun) + " v" + esc(surumYaz(n.surum)) + '</h3><div class="tarih">' + esc(n.tarih) + "</div><ul>" +
        (n.maddeler || []).map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ul></li>";
    }).join("");
    $("#icerik").innerHTML =
      '<section class="sayfa-baslik"><div class="kap"><h1>İndirme merkezi</h1><p>Kurulum dosyaları her zaman en son sürümü indirir. Kurulumda yardım için ' + esc(v.genel.telefon) + " numarasını arayın.</p></div></section>" +
      '<section class="bolum"><div class="kap">' + gruplar + "</div></section>" +
      (notlar ? '<section class="bolum" style="padding-top:0"><div class="kap"><h2>Sürüm notları</h2><ol class="surumler">' + notlar + "</ol></div></section>" : "");
  }

  // ── İletişim ──────────────────────────────────────────
  function iletisimSayfasi(v) {
    var g = v.genel;
    var ep = (g.epostalar || []).map(function (e) { return '<li><a href="mailto:' + esc(e) + '">' + simge("eposta") + esc(e) + "</a></li>"; }).join("");
    $("#icerik").innerHTML =
      '<section class="sayfa-baslik"><div class="kap"><h1>İletişim</h1><p>Kurulum, eğitim, fiyat ve destek için arayın ya da e-posta gönderin.</p></div></section>' +
      '<section class="bolum"><div class="kap"><div class="iletisim"><img src="assets/img/aytek-logo.webp" alt="' + esc(g.firma) + ' logosu" width="150" height="150"><div><h2>' + esc(g.firma) + '</h2><div class="kisi">' + esc(g.kisi) + "</div><ul>" +
      '<li><a href="tel:' + esc(g.telefonLink) + '">' + simge("tel") + esc(g.telefon) + "</a></li>" + ep +
      (g.konum ? '<li><span style="display:inline-flex;align-items:center;gap:.7rem;font-size:1.1rem">' + simge("konum") + esc(g.konum) + "</span></li>" : "") +
      "</ul></div></div></div></section>";
  }

  // ── Yükle ve çiz ──────────────────────────────────────
  fetch("veri/site.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (v) {
      VERI = v;
      ustMenu(v.genel);
      altBilgi(v.genel, v);
      if (SAYFA === "ana") anaSayfa(v);
      else if (SAYFA === "urun") urunSayfasi(v);
      else if (SAYFA === "indir") indirSayfasi(v);
      else if (SAYFA === "iletisim") iletisimSayfasi(v);
      else if (SAYFA === "egitim") egitimSayfasi(v);
      if (location.hash && SAYFA !== "egitim") { var h = document.getElementById(location.hash.slice(1)); if (h) h.scrollIntoView(); }
    })
    .catch(function (e) {
      $("#icerik").innerHTML = '<div class="kap durum-kutu"><h2>İçerik yüklenemedi</h2><p>veri/site.json okunamadı (' + esc(e.message) +
        '). Siteyi bilgisayarınızda açıyorsanız dosyaya çift tıklamak yerine Yerel_Sunucu.ps1 ile açın.</p></div>';
    });
})();
