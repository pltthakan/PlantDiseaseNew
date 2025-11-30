# PlantDiseaseNew – Kurulum & Çalıştırma Dokümantasyonu

Bu proje 2 parçadan oluşur:

* **Backend (Flask + TensorFlow)**: Model yükler, resim alır ve hastalık tahmini yapar, geçmişi SQLite’ta tutar.
* **Mobile (React Native)**: Kullanıcı giriş/kayıt, galeriden/kameradan foto seçme, tahmin alma ve history görüntüleme.

## 0) Gereksinimler

### Backend

* Python 3.10+ (öneri: 3.10)
* macOS/Linux/Windows fark etmez

### Mobile

* Node.js (LTS önerilir)
* React Native CLI ortamı
* iOS için: Xcode + CocoaPods
* Android için: Android Studio + emulator veya cihaz

---

# 1) Repo Klonlama

```bash
git clone https://github.com/pltthakan/PlantDiseaseNew.git
cd PlantDiseaseNew
```

---

# 2) Backend Kurulum (Flask)

Backend klasörüne gir:

```bash
cd backend
```

## 2.1) Sanal ortam (.venv) oluştur ve aktif et

```bash
python3 -m venv .venv
source .venv/bin/activate
```

> Terminalde başta `(.venv)` görmelisin.

## 2.2) Paketleri yükle

```bash
pip install -r requirements.txt
```

## 2.3) Backend’i çalıştır

```bash
python app.py
```

Beklenen çıktı örneği:

* “Model yükleniyor…”
* “Model yüklendi.”
* Flask server 0.0.0.0:5000

## 2.4) Backend test

Tarayıcı:

* `http://localhost:5000/`
  Beklenen:

```json
{"message":"Plant disease API çalışıyor"}
```

---

# 3) Mobile Kurulum (React Native)

Proje kökünden mobile dizinine gir:

```bash
cd BitkiHastalikMobile
```

## 3.1) Node paketleri

```bash
npm install
```

## 3.2) iOS Pod kurulumu (sadece iOS için)

```bash
npx pod-install ios
```

## 3.3) Metro’yu başlat

```bash
npx react-native start
```

> Metro genelde `http://localhost:8081` ile açılır.

---

# 4) Uygulamayı Çalıştırma

## 4.1) iOS Simulator

Yeni terminal sekmesi:

```bash
cd BitkiHastalikMobile
npx react-native run-ios
```

> Xcode açman gerekirse `.xcodeproj` değil **`.xcworkspace`** kullan:
> `BitkiHastalikMobile/ios/BitkiHastalikMobile.xcworkspace`

## 4.2) Android Emulator / Cihaz

Android emulator açıkken:

```bash
cd BitkiHastalikMobile
npx react-native run-android
```

---

# 5) Backend – Mobile Bağlantı (BASE_URL)

Mobile tarafında `BitkiHastalikMobile/src/api.ts` içinde BASE_URL kullanılır.

### iOS Simulator

* Backend: `http://localhost:5000`

### Android Emulator

* Backend: `http://10.0.2.2:5000`

### Gerçek Telefon ile test (aynı Wi-Fi)

Mac IP’ni bul:

```bash
ipconfig getifaddr en0
```

Örn `192.168.1.50` geldiyse:

* BASE_URL: `http://192.168.1.50:5000`

> Backend’in çalışırken `app.run(host="0.0.0.0", port=5000)` olması zaten cihazdan erişime uygundur.

---

# 6) Uygulama Akışı

1. **Register** ile kullanıcı oluştur
2. **Login** ile giriş yap
3. Galeriden foto seç veya kameradan çek
4. **Tahmin Et** -> backend `/api/predict`
5. **History** ekranında geçmiş tahminler listelenir (ve resim gösterilir)

---

# 7) API Endpointleri

Backend base: `http://localhost:5000`

### Register

`POST /api/register`
Body (JSON):

```json
{"email":"test@test.com","password":"123456"}
```

### Login

`POST /api/login`
Body (JSON):

```json
{"email":"test@test.com","password":"123456"}
```

### Predict

`POST /api/predict` (multipart/form-data)

* `user_id`: (string/int)
* `image`: file

Response:

* `class_name`, `confidence`, `created_at`, `prediction_id`

### History

`GET /api/history?user_id=1`
Response list:

* `class_name`, `confidence`, `created_at`, (image_url varsa o da)

---

# 8) Sık Hatalar ve Çözümler

## 8.1) Metro: `EADDRINUSE 8081`

8081 dolu demektir:

```bash
kill -9 $(lsof -t -i :8081)
npx react-native start --reset-cache
```

## 8.2) iOS Pod hatası

```bash
cd BitkiHastalikMobile
npx pod-install ios
```

Olmazsa:

```bash
brew install cocoapods
cd ios && pod install
```

## 8.3) Backend çalışmıyor / paket bulunamadı

`.venv` aktif mi kontrol et:

```bash
source backend/.venv/bin/activate
```

## 8.4) Gerçek telefonda backend’e bağlanmıyor

* Telefon ve Mac aynı Wi-Fi’da mı?
* BASE_URL Mac IP’ye ayarlı mı?
* Backend açık mı?

