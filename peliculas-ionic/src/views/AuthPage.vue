<template>
  <ion-page>
    <ion-content class="auth-page ion-padding">
      <div class="auth-shell">
        <div class="auth-header">
          <p class="eyebrow">Mi colección</p>
          <h1>{{ isRegister ? 'Crear cuenta' : 'Iniciar sesión' }}</h1>
          <p>
            {{ isRegister ? 'Regístrate para guardar tu colección favorita.' : 'Inicia sesión para seguir disfrutando tus películas.' }}
          </p>
        </div>

        <div class="auth-card">
          <ion-segment :value="mode" @ionChange="handleModeChange" class="auth-segment">
            <ion-segment-button value="login">
              <ion-label>Login</ion-label>
            </ion-segment-button>
            <ion-segment-button value="register">
              <ion-label>Registro</ion-label>
            </ion-segment-button>
          </ion-segment>

          <form v-if="isRegister" @submit.prevent="submitRegister">
            <ion-item>
              <ion-input v-model="registerForm.nombre" label="Nombre" label-placement="stacked" required />
            </ion-item>
            <ion-item>
              <ion-input v-model="registerForm.email" type="email" label="Correo" label-placement="stacked" required />
            </ion-item>
            <ion-item class="password-item">
              <ion-input
                v-model="registerForm.password"
                :type="showRegisterPassword ? 'text' : 'password'"
                label="Contraseña"
                label-placement="stacked"
                required
              />
              <ion-button type="button" fill="clear" slot="end" @click="showRegisterPassword = !showRegisterPassword" aria-label="Mostrar u ocultar contraseña">
                <ion-icon :icon="showRegisterPassword ? eyeOffOutline : eyeOutline" />
              </ion-button>
            </ion-item>

            <ion-button expand="block" type="submit" class="submit-button" :disabled="loading">
              {{ loading ? 'Registrando...' : 'Registrarme' }}
            </ion-button>
          </form>

          <form v-else @submit.prevent="submitLogin">
            <ion-item>
              <ion-input v-model="loginForm.email" type="email" label="Correo" label-placement="stacked" required />
            </ion-item>
            <ion-item class="password-item">
              <ion-input
                v-model="loginForm.password"
                :type="showLoginPassword ? 'text' : 'password'"
                label="Contraseña"
                label-placement="stacked"
                required
              />
              <ion-button type="button" fill="clear" slot="end" @click="showLoginPassword = !showLoginPassword" aria-label="Mostrar u ocultar contraseña">
                <ion-icon :icon="showLoginPassword ? eyeOffOutline : eyeOutline" />
              </ion-button>
            </ion-item>

            <ion-button expand="block" type="submit" class="submit-button" :disabled="loading">
              {{ loading ? 'Ingresando...' : 'Ingresar' }}
            </ion-button>
          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  alertController,
} from '@ionic/vue';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { loginUser, registerUser } from '@/services/auth.service';

const router = useRouter();
const mode = ref<'login' | 'register'>('login');
const loading = ref(false);
const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);

const loginForm = reactive({ email: '', password: '' });
const registerForm = reactive({ nombre: '', email: '', password: '' });

const isRegister = computed(() => mode.value === 'register');

function releaseFocus() {
  const activeElement = document.activeElement as HTMLElement | null;
  if (activeElement && typeof activeElement.blur === 'function') {
    activeElement.blur();
  }
}

function handleModeChange(event: CustomEvent) {
  const value = event.detail.value as 'login' | 'register';
  mode.value = value;
}

async function submitLogin() {
  loading.value = true;

  try {
    await loginUser({
      email: loginForm.email,
      password: loginForm.password,
    });

    releaseFocus();
    await router.push('/peliculas');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión.';
    const alert = await alertController.create({
      header: 'Error de sesión',
      message,
      buttons: ['Aceptar'],
    });
    await alert.present();
  } finally {
    loading.value = false;
  }
}

async function submitRegister() {
  loading.value = true;

  try {
    await registerUser({
      nombre: registerForm.nombre,
      email: registerForm.email,
      password: registerForm.password,
    });

    releaseFocus();
    await router.push('/peliculas');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo registrar el usuario.';
    const alert = await alertController.create({
      header: 'Error de registro',
      message,
      buttons: ['Aceptar'],
    });
    await alert.present();
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  --background: #0b1220;
}

.auth-shell {
  max-width: 520px;
  margin: 0 auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
}

.auth-header {
  text-align: left;
  padding: 8px 6px 0;
}

.eyebrow {
  margin: 0;
  color: #8c8ca1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.72rem;
}

h1 {
  margin: 8px 0 0;
  font-size: 2rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.15;
}

p {
  margin: 10px 0 0;
  max-width: 360px;
  color: #c8d0e0;
  line-height: 1.5;
  font-size: 0.98rem;
}

.auth-card {
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
}

.auth-segment {
  margin-bottom: 16px;
  --background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

ion-item {
  --background: rgba(255, 255, 255, 0.04);
  --border-radius: 16px;
  --inner-border-width: 0;
  --highlight-color-focused: #a855f7;
  border-radius: 16px;
  margin-bottom: 4px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.password-item {
  --padding-end: 0;
}

.password-item ion-button {
  --padding-start: 8px;
  --padding-end: 8px;
  color: #c4b5fd;
}

.submit-button {
  margin-top: 12px;
  --background: linear-gradient(135deg, #7c3aed, #a855f7);
  --background-hover: linear-gradient(135deg, #6d28d9, #9333ea);
  --box-shadow: none;
  border-radius: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

ion-segment-button {
  --indicator-color: rgba(168, 85, 247, 0.18);
  --color: #a9b4c9;
  --color-checked: #f8fafc;
  --background-checked: rgba(168, 85, 247, 0.12);
  border-radius: 12px;
}
</style>
