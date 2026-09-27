<template>
  <ion-modal :is-open="isOpen" @did-dismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ pelicula ? 'Editar película' : 'Nueva película' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
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
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
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

watch(
  () => [props.isOpen, props.pelicula],
  () => {
    if (props.isOpen) {
      form.nombre = props.pelicula?.nombre ?? '';
      form.sinopsis = props.pelicula?.sinopsis ?? '';
      form.imagen = props.pelicula?.imagen ?? '';
    }
  },
);

const esValido = computed(() => form.nombre.trim() !== '' && form.sinopsis.trim() !== '');

function guardar() {
  emit('save', { ...form });
}
</script>