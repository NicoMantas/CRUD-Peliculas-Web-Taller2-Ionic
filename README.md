# 🎬 Taller 2 - Aplicación de Películas (Ionic + NestJS)

Este proyecto consta de dos partes principales:
1. **`peliculas-backend`**: API REST desarrollada con **NestJS**, **Prisma ORM** y SQLite.
2. **`peliculas-ionic`**: Frontend multiplataforma desarrollado con **Ionic Framework (Vue 3)** y **Capacitor** para despliegue nativo en Android.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- **Node.js** (v18 o superior) y **npm**.
- **Android Studio** (si vas a ejecutar la aplicación en Android o emuladores).
- **Android SDK** y **JDK 21** (incluido en Android Studio en `/opt/android-studio/jbr` o en tus herramientas del sistema).

---

## 🛠️ Variables de Entorno del Sistema (Linux/macOS)

Para compilar y ejecutar la app Android sin errores de SDK ni de versión de Java, agrega estas líneas a tu archivo `~/.bashrc` (o `~/.zshrc`):

```bash
# Variables del Android SDK
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$HOME/Android/Sdk

# JDK 21 (Requerido por Gradle y Capacitor)
export JAVA_HOME=/opt/android-studio/jbr

# PATH
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$JAVA_HOME/bin
```

Aplica los cambios ejecutando:
```bash
source ~/.bashrc
```

---

## 🖥️ 1. Levantar el Backend (NestJS)

El backend corre por defecto en **`http://localhost:3000`**.

1. Ingresa a la carpeta del backend:
   ```bash
   cd peliculas-backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Prepara la base de datos (Prisma):
   ```bash
   npx prisma db push
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run start:dev
   ```

5. Verifica que responda en tu navegador o cliente HTTP ingresando a:
   `http://localhost:3000`

---

## 🌐 2. Levantar el Frontend en Modo Web (Ionic)

1. Abre una nueva terminal e ingresa a la carpeta del frontend:
   ```bash
   cd peliculas-ionic
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre la aplicación en tu navegador en:
   `http://localhost:5173`

---

## 📱 3. Apuntar la Aplicación al Backend y Ejecutar en Celular Android

La aplicación está configurada para conectarse por defecto a la API en **`http://localhost:3000`**.

### 🔌 Opción A: Conexión por Cable USB (Recomendado)

Si tienes tu teléfono celular conectado por USB con la **Depuración USB activada**, utiliza la redirección de puertos ADB para que `localhost:3000` en el teléfono apunte directamente al PC:

1. Ejecuta el comando de redirección de puertos:
   ```bash
   adb reverse tcp:3000 tcp:3000
   ```

2. Compila y despliega la app en el dispositivo:
   ```bash
   cd peliculas-ionic
   npx cap run android
   ```

---

### 📶 Opción B: Conexión por Red Wi-Fi

Si prefieres probar la app por Wi-Fi sin usar el cable USB:

1. Obtén la IP local de tu PC en la red (ejemplo: `192.168.1.24`):
   ```bash
   hostname -I
   ```

2. Inicia la aplicación Ionic definiendo la variable `VITE_API_URL`:
   ```bash
   VITE_API_URL=http://192.168.1.24:3000 npx cap run android
   ```

---

## 📁 Estructura del Proyecto

```text
taller2/
├── peliculas-backend/    # Servidor NestJS + Prisma
│   ├── src/              # Controladores, módulos y servicios REST
│   └── prisma/           # Esquema de la base de datos SQLite
└── peliculas-ionic/      # Cliente Ionic Vue 3 + Capacitor
    ├── src/              # Vistas Vue, servicios HTTP y componentes
    └── android/          # Proyecto nativo Android generado por Capacitor
```

---

## ❓ Solución de Problemas Frecuentes

### 1. Error `ERR_SDK_NOT_FOUND` al ejecutar `npx cap run android`
- **Causa**: La variable `ANDROID_HOME` no está cargada en la terminal.
- **Solución**: Ejecuta `source ~/.bashrc` antes de correr el comando o asegúrate de haber exportado `ANDROID_HOME`.

### 2. Error `invalid source release: 21` en Gradle
- **Causa**: Gradle está intentando compilar con una versión de Java anterior a la 21.
- **Solución**: Define `JAVA_HOME=/opt/android-studio/jbr` en tu entorno o en `android/gradle.properties`:
  ```properties
  org.gradle.java.home=/opt/android-studio/jbr
  ```

### 3. Error `Failed to fetch` en el celular
- **Causa**: El celular no puede encontrar la dirección `http://localhost:3000` si no se ha configurado la redirección USB.
- **Solución**: Corre en la terminal `adb reverse tcp:3000 tcp:3000` mientras el teléfono esté conectado por USB.