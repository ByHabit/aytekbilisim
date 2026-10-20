# Aytek Bilişim tanıtım sitesi

TYS ve TYS SQL'i tanıtan site. Ana sayfa, iki ürün sayfası, indirme merkezi, iletişim ve içerikleri değiştirebileceğiniz bir panel içerir. Sunucu tarafı kod yoktur; GitHub Pages'te ücretsiz yayınlanır, istenirse her hostinge olduğu gibi yüklenebilir.

## Klasörler

| Klasör / dosya | Ne işe yarar |
|---|---|
| `index.html`, `tys.html`, `tys-sql.html`, `indir.html`, `iletisim.html` | Sayfalar |
| `urun.html` | Panelden eklediğiniz yeni ürünlerin sayfası (`urun.html?kod=…`) |
| `veri/site.json` | Bütün metinler, listeler, bağlantılar. Panel bu dosyayı düzenler |
| `assets/` | Stil, betik, logo; `assets/yuklemeler/` panelden yüklenen görsel ve videolar |
| `indir/` | Kurulum kılavuzu |
| `panel/` | Yönetim paneli |
| `Yerel_Sunucu.ps1` | Siteyi bilgisayarınızda açar |

## 1. Bilgisayarınızda açmak

`Yerel_Sunucu.ps1` dosyasına sağ tıklayıp **PowerShell ile çalıştır** deyin. Tarayıcıda `http://localhost:8080` açılır; panel `http://localhost:8080/panel/` adresindedir. Durdurmak için PowerShell penceresini kapatın.

`index.html` dosyasına çift tıklayarak açmayın: tarayıcılar o şekilde içerik dosyasını okumaya izin vermez, sayfa "İçerik yüklenemedi" der.

## 2. GitHub Pages'te yayınlamak

1. GitHub'da yeni bir depo oluşturun, örneğin **ByHabit/aytekbilisim**. Görünürlük **Public** olmalı; ücretsiz hesapta GitHub Pages yalnızca herkese açık depolarda çalışır.
2. Bu klasörün **içindekileri** depoya yükleyin: GitHub'da **Add file › Upload files** ile sürükleyip bırakın ya da GitHub Desktop kullanın.
3. Depoda **Settings › Pages › Build and deployment › Source: Deploy from a branch**, dal **main**, klasör **/ (root)** seçip **Save** deyin.
4. Bir iki dakika sonra site `https://byhabit.github.io/aytekbilisim/` adresinde açılır.

## 3. Panel için erişim anahtarı

Panel değişiklikleri doğrudan depoya yazar. Bunun için yalnızca bu depoya yazabilen bir anahtar oluşturun:

1. GitHub › sağ üstte profil resmi › **Settings** › en altta **Developer settings** › **Personal access tokens** › **Fine-grained tokens** › **Generate new token**.
2. Ad: "Site paneli". Süre: örneğin 1 yıl.
3. **Repository access › Only select repositories** › yalnızca site deposu.
4. **Permissions › Repository permissions › Contents › Read and write**.
5. **Generate token** › çıkan anahtarı kopyalayın.

Sitenin `/panel/` adresini açın; depo adı kendiliğinden dolar. Anahtarı yapıştırıp **Bağlan** deyin. "Bu bilgisayarda hatırla" işaretliyse bir dahaki sefere sormaz.

Anahtarı kimseyle paylaşmayın ve hiçbir dosyaya yazmayın. Süresi dolunca ya da şüphelenirseniz GitHub'dan silip yenisini oluşturun.

## 4. Panelde neler yapılır

- **Firma ve iletişim:** telefon, e-postalar, fiyat kutusu metni, alt bilgi.
- **Ana sayfa:** başlıklar, fişteki satırlar, modüller (ekle, sil, sırala).
- **Ürünler:** yeni ürün ekleyin, silin ya da sırasını değiştirin. Yeni ürünün sayfası, menüdeki yeri ve indirme merkezindeki bölümü kendiliğinden oluşur.
- **Her ürün:** tanım, özellik grupları, gereksinimler, sık sorulanlar, **ekran görüntüleri** ve **videolar**.
- **İndirme merkezi:** dosya adı, açıklama, sürüm ve sabit bağlantı. Bağlantı boşsa sitede "Bağlantı yakında eklenecek" görünür. **TYS'nin indirme bağlantısını buradan girin.**
- **Sürüm notları:** her yeni sürümde bir kayıt ekleyin.
- **Eğitim merkezi:** kurulum ve kullanım anlatımlarınızın arşivi (sitede **Eğitim** sayfası). Her anlatımın başlığı, açıklaması, kategorisi, ürünü ve bir videosu ya da görseli olur. Yeni anlatım listenin başına eklenir; arşiv büyüyünce panel listesinde arama kutusu çıkar. Kategorileri aynı sekmeden değiştirebilirsiniz.

Değişiklikleri **Kaydet ve yayınla** (ya da Ctrl+S) ile kaydedin; site yaklaşık bir dakika içinde güncellenir. Kaydedilmemiş değişiklik varken sayfadan çıkmak isterseniz panel uyarır.

### Ekran görüntüleri

PNG, JPG ya da WEBP, en fazla 3 MB. **Demo verilerle** çekin: gerçek müşteri adları, telefonları ve tutarları sitede herkese açık görünür.

### Eğitim merkezi

Sitedeki **Eğitim** sayfasında ziyaretçiler anlatımlarda arayabilir, kategoriye ve ürüne göre süzebilir. Karta tıklayınca video oynar ya da görsel büyür; başlık ve açıklama altında görünür, önceki/sonraki ile gezilir. Her anlatımın kendi bağlantısı vardır: görüntüleyici açıkken adres çubuğundaki bağlantıyı müşterinize gönderirseniz doğrudan o anlatım açılır.

Ürüne bağlı anlatım varsa o ürünün sayfasında "Eğitim merkezinde N anlatım var" bağlantısı kendiliğinden çıkar.

Boyut: GitHub Pages siteleri için önerilen üst sınır yaklaşık 1 GB'tır. Panel ekran görüntülerini yüklemeden önce 1920 piksel genişliğe küçültüp WEBP'ye çevirir; bu sayede binlerce görsel sığar. Videolar için YouTube kullanın; depo boyutunu hiç etkilemez.

### Videolar

- **YouTube (önerilen):** videoyu YouTube'a yükleyin (herkese açık ya da liste dışı), bağlantısını panelde Video alanına yapıştırın. Site videoyu sayfada oynatır.
- **Video dosyası:** MP4 ya da WebM, en fazla 25 MB; kısa tanıtım klipleri için. Daha büyük videolar için YouTube kullanın.

Listeden silinen görsel ve videolar sitede görünmez; dosyaları depoda (`assets/yuklemeler/`) kalır, isterseniz GitHub'dan silebilirsiniz.

### Anahtarsız düzenleme

Panelde **Anahtarsız düzenle** derseniz içerik bilgisayarınızda düzenlenir; **Kaydet** yeni `site.json` dosyasını indirir. Bu dosyayı `veri` klasöründeki dosyanın yerine koyun. Görsel ve video yükleme bu modda çalışmaz; dosyaları `assets/yuklemeler` klasörüne kendiniz koyup yolunu yazın.

## 5. Kendi alan adınız (ileride)

Hosting satın almanız gerekmez: aldığınız alan adını (örneğin aytekbilisim.com) GitHub Pages'e yönlendirebilirsiniz. Depoda **Settings › Pages › Custom domain** alanına alan adını yazın ve alan adı firmanızın DNS panelinde GitHub'ın gösterdiği kayıtları ekleyin; ardından **Enforce HTTPS** işaretleyin. Panel aynı şekilde çalışmaya devam eder.

## 6. Başka bir hostinge taşımak

Klasörün tamamını FTP ya da hosting panelinizle yükleyin; site olduğu gibi çalışır. Panel ise içeriği GitHub deposuna yazdığı için, başka bir hostingde içerik değiştirmek isterseniz panelde **İçerik dosyasını indir** ile `site.json`'u alıp hostingdeki `veri` klasörüne yükleyin. Panelin doğrudan yayınlaması için GitHub Pages + kendi alan adı en kolay yoldur.
