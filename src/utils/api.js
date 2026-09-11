const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const apiBase = (import.meta.env.VITE_API_BASE_URL || `${baseUrl}/api`).replace(/\/+$/, '');

export function apiUrl(path) {
  return `${apiBase}/${path.replace(/^\/+/, '')}`;
}

let configRequest;
export function getPublicConfig() {
  configRequest ||= fetch(apiUrl('config'), { signal: AbortSignal.timeout(10000) })
    .then((response) => {
      if (!response.ok) throw new Error('No se pudo cargar la configuración.');
      return response.json();
    }).catch((error) => {
      configRequest = undefined;
      throw error;
    });
  return configRequest;
}
