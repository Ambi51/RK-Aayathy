# RK ஆயாதி கணிதம் – Android app

Offline Android app (Capacitor) wrapping the calculator in `www/`.

## Option A – build the APK in the cloud (no installs)
1. Create a free GitHub account and a new repository.
2. Upload all files of this folder (keep `.github/workflows/build-apk.yml`).
3. Open the repo's **Actions** tab -> **Build Android APK** -> **Run workflow**.
4. After ~5 minutes, open the finished run and download the **ayadi-apk** artifact (a zip containing `app-debug.apk`).
5. Copy the APK to your phone and install it (allow "install unknown apps" when asked).

## Option B – build on your own computer
Needs Node 18+, JDK 17 and Android Studio.
    npm install
    npx cap add android
    npx cap sync android
    npx cap open android      # then Build > Build APK(s)

## Editing the app
Change `www/index.html`, then run `npx cap sync android` and rebuild.

## Play Store
The debug APK is for personal use. For the Play Store you need a signed release
build (Android Studio > Build > Generate Signed Bundle) and a Play developer account.
