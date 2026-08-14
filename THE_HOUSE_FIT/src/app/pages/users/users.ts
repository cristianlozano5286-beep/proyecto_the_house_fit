import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';



interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  estado: boolean;
}


const STORAGE_KEY='usuariosSistema';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, NgForOf, NgIf],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
