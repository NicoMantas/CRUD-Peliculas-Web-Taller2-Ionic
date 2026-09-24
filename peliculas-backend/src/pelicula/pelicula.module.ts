import { Module } from '@nestjs/common';
import { PeliculaService } from './pelicula.service.js';
import { PeliculaController } from './pelicula.controller.js';

@Module({
  controllers: [PeliculaController],
  providers: [PeliculaService],
})
export class PeliculaModule {}
