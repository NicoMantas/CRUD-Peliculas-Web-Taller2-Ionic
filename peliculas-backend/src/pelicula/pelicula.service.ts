import { Injectable } from '@nestjs/common';
import { CreatePeliculaDto } from './dto/create-pelicula.dto.js';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';


@Injectable()
export class PeliculaService {

  constructor (private readonly prisma: PrismaService){}



  create(createPeliculaDto: CreatePeliculaDto) {
    return this.prisma.pelicula.create({
      data: createPeliculaDto
    });
  }

  async findAll(nombre?: string, pagina = 1, limite = 5) {

    const skip = (pagina -1) * limite;

    const where = nombre ? { nombre: { contains: nombre, }, } : {};

    const [peliculas, total] = await Promise.all([this.prisma.pelicula.findMany({ where, skip, take: limite, orderBy: { id: 'asc', },}),
      this.prisma.pelicula.count({ where,}),
    ]);


    return { data: peliculas, meta: { pagina, limite, total, totalPaginas: Math.ceil(total / limite),},};
  }

  findOne(id: number) {
    return this.prisma.pelicula.findUnique({
      where: { id }
    });
  }

  update(id: number, updatePeliculaDto: UpdatePeliculaDto) {
    return this.prisma.pelicula.update({
      where: { id },
      data: updatePeliculaDto
    });
  }

  remove(id: number) {
    return this.prisma.pelicula.delete({
      where: { id }
    });
  }
}
