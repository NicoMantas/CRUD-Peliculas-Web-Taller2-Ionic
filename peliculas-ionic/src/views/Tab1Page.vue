<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Películas</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="busqueda" placeholder="Buscar por nombre..." @ionInput="onBuscar" />
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item-sliding v-for="pelicula in peliculas" :key="pelicula.id">
          <ion-item @click="abrirModalEditar(pelicula)">
            <ion-thumbnail slot="start">
              <img :src="pelicula.imagen" :alt="pelicula.nombre" />
            </ion-thumbnail>
            <ion-label>
              <h2>{{ pelicula.nombre }}</h2>
              <p>{{ pelicula.sinopsis }}</p>
            </ion-label>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="danger" @click="confirmarEliminar(pelicula)">
              Eliminar
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <ion-infinite-scroll @ionInfinite="cargarMas" :disabled="pagina >= totalPaginas">
        <ion-infinite-scroll-content loading-text="Cargando más películas..." />
      </ion-infinite-scroll>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="abrirModalCrear">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <pelicula-form-modal
      :is-open="modalAbierto"
      :pelicula="peliculaSeleccionada"
      @close="modalAbierto = false"
      @save="guardar"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonList, IonItemSliding, IonItem, IonItemOptions, IonItemOption,
  IonThumbnail, IonLabel, IonInfiniteScroll, IonInfiniteScrollContent,
  IonFab, IonFabButton, IonIcon, alertController,
} from '@ionic/vue';
import { add } from 'ionicons/icons';
import PeliculaFormModal from '@/components/PeliculaFormModal.vue';
import { fetchPeliculas, createPelicula, updatePelicula, deletePelicula } from '@/services/pelicula.service';
import type { CreatePeliculaInput, Pelicula } from '@/types/pelicula';

const LIMITE = 10;

const peliculas = ref<Pelicula[]>([]);
const busqueda = ref('');
const pagina = ref(1);
const totalPaginas = ref(1);
let debounceTimer: ReturnType<typeof setTimeout>;

const modalAbierto = ref(false);
const peliculaSeleccionada = ref<Pelicula | null>(null);

async function cargarPagina(nuevaPagina: number, reemplazar: boolean) {
  const respuesta = await fetchPeliculas(busqueda.value, nuevaPagina, LIMITE);
  peliculas.value = reemplazar ? respuesta.data : [...peliculas.value, ...respuesta.data];
  pagina.value = respuesta.meta.pagina;
  totalPaginas.value = respuesta.meta.totalPaginas;
}

onMounted(() => cargarPagina(1, true));

function onBuscar() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => cargarPagina(1, true), 400);
}

async function cargarMas(event: CustomEvent) {
  if (pagina.value < totalPaginas.value) {
    await cargarPagina(pagina.value + 1, false);
  }
  (event.target as HTMLIonInfiniteScrollElement).complete();
}

function abrirModalCrear() {
  peliculaSeleccionada.value = null;
  modalAbierto.value = true;
}

function abrirModalEditar(pelicula: Pelicula) {
  peliculaSeleccionada.value = pelicula;
  modalAbierto.value = true;
}

async function recargarListaActual(elementosNuevos = 0) {
  const cantidadCargada = Math.max(peliculas.value.length + elementosNuevos, LIMITE);
  const respuesta = await fetchPeliculas(busqueda.value, 1, cantidadCargada);
  peliculas.value = respuesta.data;
  totalPaginas.value = Math.ceil(respuesta.meta.total / LIMITE);
}

async function guardar(data: CreatePeliculaInput) {
  const esNueva = !peliculaSeleccionada.value;

  if (peliculaSeleccionada.value) {
    await updatePelicula(peliculaSeleccionada.value.id, data);
  } else {
    await createPelicula(data);
  }

  modalAbierto.value = false;
  await recargarListaActual(esNueva ? 1 : 0);
}

async function confirmarEliminar(pelicula: Pelicula) {
  const alert = await alertController.create({
    header: 'Eliminar película',
    message: `¿Seguro que quieres eliminar "${pelicula.nombre}"?`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          await deletePelicula(pelicula.id);
          peliculas.value = peliculas.value.filter((p) => p.id !== pelicula.id);
        },
      },
    ],
  });
  await alert.present();
}
</script>