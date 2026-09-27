export interface Pelicula {
  id: number;
  nombre: string;
  sinopsis: string;
  imagen: string;
}

export interface PeliculaMeta {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface PeliculaListResponse {
  data: Pelicula[];
  meta: PeliculaMeta;
}

export type CreatePeliculaInput = Omit<Pelicula, 'id'>;