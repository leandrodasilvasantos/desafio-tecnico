const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Fundos
  async getFundos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/fundos/?${queryString}` : '/api/fundos/';
    return this.request(endpoint);
  }

  async getFundo(id) {
    return this.request(`/api/fundos/${id}/`);
  }

  async createFundo(data) {
    return this.request('/api/fundos/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFundo(id, data) {
    return this.request(`/api/fundos/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFundo(id) {
    return this.request(`/api/fundos/${id}/`, {
      method: 'DELETE',
    });
  }

  async getFundoClasses() {
    return this.request('/api/fundos/classes/');
  }

  async getFundoEstrategias() {
    return this.request('/api/fundos/estrategias/');
  }

  // Relatórios
  async getRelatorios(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/relatorios/?${queryString}` : '/api/relatorios/';
    return this.request(endpoint);
  }

  async getRelatorio(id) {
    return this.request(`/api/relatorios/${id}/`);
  }
}

export default new ApiService();

