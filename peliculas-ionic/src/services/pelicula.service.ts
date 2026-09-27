import { apiFetch } from './http';
import type { Pelicula, PeliculaListResponse } from '@/types/pelicula';

type CreatePeliculaInput = Omit<Pelicula, 'id'>;

export function fetchPeliculas(nombre: string, pagina: number, limite = 10) {
  const params = new URLSearchParams();
  if (nombre.trim()) params.set('nombre', nombre.trim());
  params.set('pagina', String(pagina));
  params.set('limite', String(limite));

  return apiFetch<PeliculaListResponse>(`/pelicula?${params.toString()}`);
}

export function createPelicula(data: CreatePeliculaInput) {
  return apiFetch<Pelicula>('/pelicula', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updatePelicula(id: number, data: Partial<CreatePeliculaInput>) {
  return apiFetch<Pelicula>(`/pelicula/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deletePelicula(id: number) {
  return apiFetch<void>(`/pelicula/${id}`, {
    method: 'DELETE',
  });
}