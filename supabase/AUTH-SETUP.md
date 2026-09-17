# E-posta ile kullanıcı hesabı

Uygulamada kayıt, e-posta doğrulama dönüşü, giriş, çıkış, şifre sıfırlama isteği ve yeni şifre belirleme akışları hazırdır. Bu dosya, dış hizmetlerde tamamlanacak kurulumu açıklar. Yerel kod değişiklikleri Supabase yönetim ayarlarını kendiliğinden değiştirmez.

## Ücretsiz yayın: Cloudflare Pages

Statik dosyalar Cloudflare Pages üzerinde, kullanıcı hesapları ve kullanıcıya ait veriler mevcut Supabase projesinde tutulur. Ücretli bir paket veya özel alan adı gerekli değildir; kullanılan hizmetlerin ücretsiz plan kotaları geçerlidir.

1. Cloudflare hesabında Pages projesi oluştur veya `npx wrangler@4 login` ile hesabına giriş yap.
2. `wrangler.jsonc` içindeki `name` için hesabında kullanılabilir bir proje adı seç. `butcee` başlangıç adıdır, bu adresin rezerve edildiği anlamına gelmez.
3. `.env` içinde mevcut `EXPO_PUBLIC_SUPABASE_URL` ve `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` değerleri bulunmalı. Yönetici/service-role anahtarı kullanma.
4. `npm run deploy:pages` çalıştır. Bu komut önce web çıktısını yeniden oluşturur, sonra yayınlar. Git entegrasyonuyla yayınlanacaksa build komutu `npm run build:web`, çıktı klasörü `dist` ve aynı iki ortam değişkeni kullanılır.
5. Cloudflare'ın döndürdüğü gerçek `https://<proje>.pages.dev` adresini aşağıdaki Supabase ayarlarına yaz. Adres yayın tamamlanmadan kesinleşmez.

Uygulama artık alan adının kökünden yayınlanır; eski GitHub Pages `/butcee` alt yolu yeni yayında kullanılmaz. Eski `docs/` çıktısı güncellenmemiştir. Projede önceden bulunan Sites tanımı bu yayın için kullanılmaz.

## Supabase

1. Mevcut veritabanı için SQL Editor'da `email-auth-migration.sql` dosyasını çalıştır. Mevcut kullanıcıları, kartları ve bütçe verilerini silmez. Güvenlik sorusunu zorunlu olmaktan çıkarır ve eski cevap kontrolü RPC'lerinin dış erişimini kapatır. Sıfır veritabanında bunun yerine `schema.sql` kullan.
2. Authentication → Providers / Email: e-posta girişini, yeni kayıtları ve e-posta doğrulamasını açık tut. Uygulama en az 8 karakter ister; sunucudaki asgari uzunluğu da en az 8 yap.
3. Authentication → URL Configuration:
   - Site URL: gerçek Pages yayın adresi.
   - Redirect URLs: `https://<gerçek-proje>.pages.dev/auth` ve `https://<gerçek-proje>.pages.dev/reset-password`.
   - Yerel test gerekiyorsa `http://localhost:8081/auth`, `http://localhost:8081/reset-password`, `http://127.0.0.1:4173/auth` ve `http://127.0.0.1:4173/reset-password`.
   - Kurulu mobil uygulama için `butcee://auth` ve `butcee://reset-password`. Expo Go bağlantıları farklı olduğundan e-posta bağlantılarını geliştirme/üretim derlemesinde test et.
4. Authentication → Email Templates: Confirm signup için `templates/confirmation.html`, Reset password için `templates/recovery.html` kullan. Konular: “Bütçe hesabını doğrula” ve “Bütçe şifreni sıfırla”. `{{ .ConfirmationURL }}` korunmalı: doğrulama anahtarını Supabase üretir. İsteklerde uygulama doğru dönüş adresini gönderir.
5. Authentication → SMTP: genel kullanıcılara e-posta gönderebilen bir SMTP hizmetinin bağlı olduğunu doğrula. Supabase'in varsayılan e-posta hizmeti yalnızca proje ekibindeki adreslerle sınırlıdır; herkese açık kayıt için özel SMTP gerekir. SMTP parolaları yalnızca Supabase ayarlarında saklanmalı.

## Davranış ve kontroller

- “Beni hatırla” yalnızca normalize edilmiş e-posta adresini cihazda saklar. Seçim kaldırıldığında adres silinir. Şifre veya oturum anahtarı kalıcı depolamaya yazılmaz.
- Uygulama yeniden açıldığında / sayfa yenilendiğinde tekrar şifre gerekir. Aynı açık uygulamada ekranlar arasında gezinirken oturum devam eder.
- Eski sürümün sakladığı Supabase oturum anahtarları başlangıçta temizlenir; kullanıcı bütçe önbelleği korunur.
- E-posta doğrulama bağlantısı kendiliğinden bütçe ekranlarına giriş yaptırmaz.
- Sıfırlama bağlantısı doğrulanınca sadece yeni şifre formu açılır. Güncellemeden sonra yeniden şifreyle giriş gerekir. Sayfa yenilenirse bellekteki sıfırlama oturumu kaybolur; yeni bağlantı istenir.
- Tüm bütçe verileri kullanıcı kimliğiyle ayrılır; sunucudaki RLS kuralları zorunludur.

Otomatik kontroller: `npm run test:auth`, `npx tsc --noEmit`, `npm run build:web`.

Canlı kabul testi, kullanıcının kontrolündeki bir test e-postasıyla yapılmalı: kayıt → doğrulama e-postası → şifreyle giriş → çıkış → sıfırlama e-postası → yeni şifre → eski şifrenin reddedilmesi → yeni şifreyle giriş. İkinci hesapla veri ayrımı ve yenilemede şifre zorunluluğu da kontrol edilmeli. Otomatik testler sahte servis yanıtları kullanır; gerçek e-posta gönderimi ve canlı Supabase yapılandırmasının doğrulandığı anlamına gelmez.

Kaynaklar: [Cloudflare ücretsiz statik trafik](https://developers.cloudflare.com/pages/functions/pricing/), [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Şifre sıfırlama](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail).
