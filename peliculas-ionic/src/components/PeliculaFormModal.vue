<template>
  <ion-modal :is-open="isOpen" @did-dismiss="cerrarModal">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ titulo }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="cerrarModal">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="!modoEdicion && pelicula" class="movie-detail">
        <img :src="pelicula.imagen || 'https://placehold.co/600x400/1f1f2d/ffffff?text=Sin+imagen'" :alt="pelicula.nombre" />
        <h2>{{ pelicula.nombre }}</h2>
        <p>{{ pelicula.sinopsis }}</p>

        <ion-button expand="block" class="ion-margin-top" @click="modoEdicion = true">
          Editar película
        </ion-button>
      </div>

      <template v-else>
        <ion-item>
          <ion-input label="Nombre" label-placement="stacked" v-model="form.nombre" />
        </ion-item>
        <ion-item>
          <ion-textarea label="Sinopsis" label-placement="stacked" v-model="form.sinopsis" :auto-grow="true" />
        </ion-item>
        <ion-item>
          <ion-input label="URL de la imagen" label-placement="stacked" v-model="form.imagen" />
        </ion-item>

        <ion-button expand="block" class="ion-margin-top" :disabled="!esValido" @click="guardar">
          Guardar
        </ion-button>
      </template>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonTextarea,
} from '@ionic/vue';
import type { CreatePeliculaInput, Pelicula } from '@/types/pelicula';

const props = defineProps<{
  isOpen: boolean;
  pelicula: Pelicula | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: CreatePeliculaInput): void;
}>();

const form = reactive<CreatePeliculaInput>({ nombre: '', sinopsis: '', imagen: '' });
const modoEdicion = ref(false);

const titulo = computed(() => {
  if (!props.pelicula) return 'Nueva película';
  return modoEdicion.value ? 'Editar película' : 'Detalle de la película';
});

watch(
  () => [props.isOpen, props.pelicula],
  () => {
    if (props.isOpen) {
      form.nombre = props.pelicula?.nombre ?? '';
      form.sinopsis = props.pelicula?.sinopsis ?? '';
      form.imagen = props.pelicula?.imagen ?? '';
      modoEdicion.value = !props.pelicula;
    }
  },
);

const esValido = computed(() => form.nombre.trim() !== '' && form.sinopsis.trim() !== '');

function cerrarModal() {
  emit('close');
  modoEdicion.value = false;
}

function guardar() {
  emit('save', { ...form });
}
</script>

<style scoped>
.movie-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 12px;
}

.movie-detail img {
  width: 100%;
  height: min(42vh, 320px);
  object-fit: cover;
  border-radius: 22px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.22);
  background: rgba(255, 255, 255, 0.06);
}

.movie-detail h2 {
  margin: 0;
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1.2;
}

.movie-detail p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.7;
  font-size: 0.98rem;
}
</style>