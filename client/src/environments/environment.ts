const isPort4200 = typeof window !== 'undefined' && window.location.port === '4200';

export const environment = {
  production: false,
  apiUrl: isPort4200 ? 'http://localhost:5000/api' : '/api',
};
