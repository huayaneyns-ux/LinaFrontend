export interface SlideImagen {
  id: string;
  nombre: string;
  descripcion: string;
  rutaImagen: string;
}

export const imagenesCarrusel: SlideImagen[] = [
  {
    id: '1',
    nombre: 'Útiles Escolares 2026',
    descripcion: 'Encuentra todo lo necesario para el regreso a clases con los mejores precios.',
    rutaImagen: '/imagenes/ImagenCarrusel/Carrusel1.png'
  },
  {
    id: '2',
    nombre: 'Artículos de Oficina',
    descripcion: 'Equipa tu oficina con nuestra gran variedad de productos de alta calidad.',
    rutaImagen: '/imagenes/ImagenCarrusel/Carrusel2.png'
  },
  {
    id: '3',
    nombre: 'Novedades y Regalos',
    descripcion: 'Descubre los detalles perfectos para sorprender en cualquier ocasión especial.',
    rutaImagen: '/imagenes/ImagenCarrusel/Carrusel3.png'
  }
];
