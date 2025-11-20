# AppIcons Kullanım Kılavuzu

Bu klasör, uygulamanın tüm platformlar için icon dosyalarını içerir.

## Klasör Yapısı

```
AppIcons/
├── android/                    # Android platform icon'ları
│   ├── mipmap-hdpi/
│   ├── mipmap-mdpi/
│   ├── mipmap-xhdpi/
│   ├── mipmap-xxhdpi/
│   └── mipmap-xxxhdpi/
├── Assets.xcassets/            # iOS platform icon'ları
│   └── AppIcon.appiconset/
│       ├── 1024.png           # Ana iOS icon (1024x1024)
│       └── ...                # Diğer boyutlar
├── appstore.png               # App Store listing icon (1024x1024)
└── playstore.png              # Play Store listing icon (512x512)
```

## Expo Yapılandırması

Icon'lar `app.config.ts` dosyasında yapılandırılmıştır:

- **Ana App Icon**: `./assets/AppIcons/Assets.xcassets/AppIcon.appiconset/1024.png`
  - Hem iOS hem Android için kullanılır
  - Boyut: 1024x1024 px
  - Format: PNG (transparent background desteklenir)

- **Android Adaptive Icon**: `./assets/AppIcons/playstore.png`
  - Android adaptive icon için foreground image
  - Boyut: 512x512 px (1024x1024 önerilir, ancak 512x512 de çalışır)
  - Format: PNG
  - Arka plan rengi: `#ffffff` (app.config.ts'de tanımlı)

## Store Listing Icon'ları

### App Store (iOS)

**Dosya**: `appstore.png`
- **Boyut**: 1024x1024 px
- **Format**: PNG
- **Kullanım**: App Store Connect'te uygulama yükleme sırasında kullanılır

**EAS Build ile Kullanım**:
1. `eas.json` dosyasında build profili oluşturun
2. App Store Connect'e build yükledikten sonra, App Store Connect dashboard'unda icon'u manuel olarak yükleyin
3. Alternatif olarak, `app.config.ts`'de `ios.icon` field'ını kullanabilirsiniz (otomatik olarak kullanılır)

### Play Store (Android)

**Dosya**: `playstore.png`
- **Boyut**: 512x512 px (512x512 minimum, 1024x1024 önerilir)
- **Format**: PNG
- **Kullanım**: Google Play Console'da uygulama yükleme sırasında kullanılır

**EAS Build ile Kullanım**:
1. `eas.json` dosyasında build profili oluşturun
2. Google Play Console'a build yükledikten sonra, Play Console dashboard'unda icon'u manuel olarak yükleyin
3. Alternatif olarak, `app.config.ts`'de `android.adaptiveIcon.foregroundImage` field'ı otomatik olarak kullanılır

## Icon Gereksinimleri

### iOS Icon Gereksinimleri
- **Ana Icon**: 1024x1024 px (PNG, transparent background)
- **App Store Listing**: 1024x1024 px (PNG)
- **Tüm Boyutlar**: `Assets.xcassets/AppIcon.appiconset/` klasöründe mevcut

### Android Icon Gereksinimleri
- **Adaptive Icon Foreground**: 1024x1024 px önerilir (minimum 512x512 px)
- **Adaptive Icon Background**: Renk veya gradient (app.config.ts'de tanımlı)
- **Play Store Listing**: 512x512 px minimum (1024x1024 px önerilir)
- **Tüm DPI Boyutları**: `android/mipmap-*/` klasörlerinde mevcut

## Icon Güncelleme

Icon'ları güncellediğinizde:

1. **Ana Icon Güncelleme**:
   - `Assets.xcassets/AppIcon.appiconset/1024.png` dosyasını güncelleyin
   - Tüm boyutları yeniden oluşturun (gerekirse)

2. **Android Icon Güncelleme**:
   - `playstore.png` dosyasını güncelleyin
   - `android/mipmap-*/ic_launcher.png` dosyalarını güncelleyin

3. **Store Listing Icon Güncelleme**:
   - `appstore.png` ve `playstore.png` dosyalarını güncelleyin
   - Store dashboard'larında manuel olarak yükleyin

## Build Sonrası Kontrol

Icon'ların doğru yüklendiğini kontrol etmek için:

1. **iOS**: Xcode'da `ios/` klasörünü açın ve `Assets.xcassets/AppIcon.appiconset/` kontrol edin
2. **Android**: Android Studio'da `android/app/src/main/res/` klasörünü kontrol edin
3. **EAS Build**: Build log'larında icon işleme mesajlarını kontrol edin

## Notlar

- Icon'lar Expo managed workflow'da otomatik olarak işlenir
- `expo prebuild` komutu çalıştırıldığında icon'lar native projelere kopyalanır
- EAS Build kullanıyorsanız, icon'lar build sırasında otomatik olarak işlenir
- Store listing icon'ları genellikle build sonrası manuel olarak yüklenir

