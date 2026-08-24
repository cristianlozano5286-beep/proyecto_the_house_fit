import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContenidoService } from '../../services/contenido';
import { Rutina } from '../../models/contenido.models';

@Component({
  selector: 'app-detalle-rutinas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-rutinas.html',
  styleUrl: './detalle-rutinas.css',
})
export class DetalleRutinasComponent implements OnInit {
  rutina?: Rutina;

  constructor(
    private route: ActivatedRoute,
    private contenidoService: ContenidoService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      const rutinas = this.contenidoService.listarRutinas();
      this.rutina = rutinas.find((r) => r.id === id);
    }
  }
}