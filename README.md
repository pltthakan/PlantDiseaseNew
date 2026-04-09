# PlantDiseaseNew – Setup & Run Documentation

This project consists of 2 parts:

* **Backend (Flask + TensorFlow):** Loads the model, receives images, predicts plant diseases, and stores prediction history in SQLite.
* **Mobile (React Native):** Handles user registration/login, selecting photos from gallery/camera, getting predictions, and viewing history.

## 0) Requirements

### Backend

* Python 3.10+ (recommended: 3.10)
* Works on macOS/Linux/Windows

### Mobile

* Node.js (LTS recommended)
* React Native CLI environment
* For iOS: Xcode + CocoaPods
* For Android: Android Studio + emulator or physical device

---

# 1) Clone the Repository

```bash
git clone https://github.com/pltthakan/PlantDiseaseNew.git
cd PlantDiseaseNew
```

---

# 2) Backend Setup (Flask)

Go into the backend folder:

```bash
cd backend
```

## 2.1) Create and activate a virtual environment (.venv)

```bash
python3 -m venv .venv
source .venv/bin/activate
```

> You should see `(.venv)` at the beginning of your terminal prompt.

## 2.2) Install dependencies

```bash
pip install -r requirements.txt
```

## 2.3) Run the backend

```bash
python app.py
```

Expected output example:

* “Loading model…”
* “Model loaded.”
* Flask server running on `0.0.0.0:5000`

## 2.4) Test the backend

In your browser:

* `http://localhost:5000/`

Expected response:

```json
{"message":"Plant disease API is running"}
```

---

# 3) Mobile Setup (React Native)

From the project root, go into the mobile directory:

```bash
cd BitkiHastalikMobile
```

## 3.1) Install Node packages

```bash
npm install
```

## 3.2) Install iOS pods (iOS only)

```bash
npx pod-install ios
```

## 3.3) Start Metro

```bash
npx react-native start
```

> Metro usually runs at `http://localhost:8081`.

---

# 4) Running the Application

## 4.1) iOS Simulator

Open a new terminal tab:

```bash
cd BitkiHastalikMobile
npx react-native run-ios
```

> If you need to open Xcode, use **`.xcworkspace`** instead of `.xcodeproj`:
> `BitkiHastalikMobile/ios/BitkiHastalikMobile.xcworkspace`

## 4.2) Android Emulator / Device

While the Android emulator is running:

```bash
cd BitkiHastalikMobile
npx react-native run-android
```

---

# 5) Backend – Mobile Connection (BASE_URL)

On the mobile side, `BASE_URL` is used inside `BitkiHastalikMobile/src/api.ts`.

### iOS Simulator

* Backend: `http://localhost:5000`

### Android Emulator

* Backend: `http://10.0.2.2:5000`

### Testing with a Real Phone (same Wi-Fi)

Find your Mac’s IP address:

```bash
ipconfig getifaddr en0
```

For example, if it returns `192.168.1.50`:

* BASE_URL: `http://192.168.1.50:5000`

> The backend should already be accessible from devices if it runs with:
> `app.run(host="0.0.0.0", port=5000)`

---

# 6) Application Flow

1. Create a user with **Register**
2. Log in with **Login**
3. Select a photo from the gallery or take one with the camera
4. Tap **Predict** → backend `/api/predict`
5. Previous predictions are listed on the **History** screen (with image if available)

---

# 7) API Endpoints

Backend base URL: `http://localhost:5000`

### Register

`POST /api/register`
Request body (JSON):

```json
{"email":"test@test.com","password":"123456"}
```

### Login

`POST /api/login`
Request body (JSON):

```json
{"email":"test@test.com","password":"123456"}
```

### Predict

`POST /api/predict` (`multipart/form-data`)

* `user_id`: (string/int)
* `image`: file

Response:

* `class_name`
* `confidence`
* `created_at`
* `prediction_id`

### History

`GET /api/history?user_id=1`

Response list:

* `class_name`
* `confidence`
* `created_at`
* `image_url` (if available)

---

# 8) Common Errors & Solutions

## 8.1) Metro: `EADDRINUSE 8081`

This means port 8081 is already in use:

```bash
kill -9 $(lsof -t -i :8081)
npx react-native start --reset-cache
```

## 8.2) iOS Pod error

```bash
cd BitkiHastalikMobile
npx pod-install ios
```

If that does not work:

```bash
brew install cocoapods
cd ios && pod install
```

## 8.3) Backend not running / package not found

Make sure `.venv` is activated:

```bash
source backend/.venv/bin/activate
```

## 8.4) Cannot connect to backend on a real phone

* Are the phone and Mac connected to the same Wi-Fi?
* Is `BASE_URL` set to the Mac’s IP address?
* Is the backend running?
