<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Películas</ion-title>
        <ion-button slot="end" fill="clear" color="medium" @click="cerrarSesion">
          Salir
        </ion-button>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="topbar">
        <div>
          <p class="eyebrow">Mi colección</p>
          <h2>Películas</h2>
        </div>
        <ion-button shape="round" @click="abrirModalCrear">
          <ion-icon slot="start" :icon="add" />
          Nueva
        </ion-button>
      </div>

      <ion-searchbar
        v-model="busqueda"
        placeholder="Buscar por nombre..."
        @ionInput="onBuscar"
        class="searchbar-custom"
      />

      <ion-list class="movie-list" lines="none">
        <ion-item-sliding v-for="pelicula in peliculas" :key="pelicula.id">
          <ion-item class="movie-item" :button="true" :detail="false" @click="abrirModalEditar(pelicula)">
            <ion-thumbnail slot="start" class="movie-thumb">
              <img :src="pelicula.imagen" :alt="pelicula.nombre" />
            </ion-thumbnail>
            <ion-label>
              <h3>{{ pelicula.nombre }}</h3>
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
  IonFab, IonFabButton, IonIcon, alertController, IonButton,
} from '@ionic/vue';
import { add } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import PeliculaFormModal from '@/components/PeliculaFormModal.vue';
import { fetchPeliculas, createPelicula, updatePelicula, deletePelicula } from '@/services/pelicula.service';
import { clearToken } from '@/services/http';
import type { CreatePeliculaInput, Pelicula } from '@/types/pelicula';

const router = useRouter();

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

async function cerrarSesion() {
  const activeElement = document.activeElement as HTMLElement | null;
  if (activeElement && typeof activeElement.blur === 'function') {
    activeElement.blur();
  }

  await clearToken();
  await router.push('/auth');
}
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 16px;
}

.eyebrow {
  margin: 0;
  color: #8c8ca1;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h2 {
  margin: 6px 0 0;
  font-size: 2rem;
  font-weight: 700;
}

.searchbar-custom {
  --background: rgba(255, 255, 255, 0.06);
  --border-radius: 18px;
  --box-shadow: none;
  margin-bottom: 12px;
}

.movie-list {
  background: transparent;
}

.movie-item {
  --background: rgba(255, 255, 255, 0.04);
  --border-radius: 18px;
  margin-bottom: 12px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

.movie-thumb {
  --size: 72px;
  border-radius: 14px;
  overflow: hidden;
}

.movie-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

ion-label h3 {
  font-weight: 700;
  margin-bottom: 4px;
}

ion-label p {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #a7a7bf;
}
</style>