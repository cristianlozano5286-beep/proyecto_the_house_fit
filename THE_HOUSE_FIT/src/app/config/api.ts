// Dirección inteligente del MID:
// 1. En el servidor web Angular (puerto 4200 en PC o celular por Wi-Fi), usa '/api/v1' (proxy automático).
// 2. En la App nativa Android empaquetada con Capacitor (donde no hay puerto 4200), conecta directo a la IP local del PC.
function resolverUrlMid(): string {
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:8080/api/v1';
  }
  const urlPersonalizada = localStorage.getItem('thf_api_url');
  if (urlPersonalizada) {
    return urlPersonalizada;
  }
  const esServidorDevAngular = window.location.port === '4200';
  const esTunelODominioWeb =
    window.location.hostname !== '' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    (window.location.protocol === 'https:' || window.location.port === '');
  if (esServidorDevAngular || esTunelODominioWeb) {
    return '/api/v1';
  }
  // App nativa Android (Capacitor) o servidor estático empaquetado:
  // Usa el puerto 4200 con su proxy /api/v1 que ya está abierto en la red Wi-Fi local.
  const host =
    window.location.hostname && window.location.hostname !== 'localhost'
      ? window.location.hostname
      : '192.168.1.50';
  return `http://${host}:4200/api/v1`;
}

export const URL_MID = resolverUrlMid();
