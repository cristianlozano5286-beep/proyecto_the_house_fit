import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ImcNutricionService {
    private datosImc: { peso: number; estatura: number; imc: number; clasificacion: string } | null = null;

    guardarDatos(peso: number, estatura: number, imc: number, clasificacion: string) {
    this.datosImc = { peso, estatura, imc, clasificacion };
    }

    obtenerDatos() {
    return this.datosImc;
    }
}