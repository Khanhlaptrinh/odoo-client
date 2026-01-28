import axios from 'axios';

const API_BASE_URL = '/api/phong_hop';

class PhongHopService {
  constructor(dbname) {
    this.dbname = dbname;
  }

  /**
   * Lấy danh sách tất cả phòng họp
   * @param {Object} filters - Các filter: don_vi_id, ten_phong_hop
   * @returns {Promise}
   */
  async getList(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.don_vi_id) params.append('don_vi_id', filters.don_vi_id);
      if (filters.ten_phong_hop) params.append('ten_phong_hop', filters.ten_phong_hop);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/${this.dbname}${queryString ? '?' + queryString : ''}`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Lấy chi tiết một phòng họp theo ID
   * @param {number} id - ID của phòng họp
   * @returns {Promise}
   */
  async getById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${this.dbname}/${id}`);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Tạo mới phòng họp
   * @param {Object} data - Dữ liệu phòng họp
   * @returns {Promise}
   */
  async create(data) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/${this.dbname}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Cập nhật phòng họp
   * @param {number} id - ID của phòng họp
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise}
   */
  async update(id, data) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${this.dbname}/${id}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Xóa phòng họp
   * @param {number} id - ID của phòng họp
   * @returns {Promise}
   */
  async delete(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${this.dbname}/${id}`);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Xử lý lỗi từ API
   * @private
   */
  _handleError(error) {
    if (error.response) {
      // Server trả về lỗi
      const message = error.response.data?.message || error.response.data?.error || 'Có lỗi xảy ra';
      return new Error(message);
    } else if (error.request) {
      // Request đã được gửi nhưng không nhận được response
      return new Error('Không thể kết nối đến server');
    } else {
      // Lỗi khi setup request
      return new Error(error.message || 'Có lỗi xảy ra');
    }
  }
}

export default PhongHopService;
