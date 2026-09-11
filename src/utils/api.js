const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function apiUrl(path) {
  return `${baseUrl}/api/${path.replace(/^\/+/, '')}`;
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
