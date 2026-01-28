import axios from 'axios';

const API_BASE_URL = '/api/dat_phong';

class DatPhongService {
  constructor(dbname) {
    this.dbname = dbname;
  }

  /**
   * Lấy danh sách đặt phòng
   * @param {Object} filters - Các filter: phong_hop_id, nhan_vien_id, trang_thai, tu_ngay, den_ngay, ten_dat_phong, order
   * @returns {Promise}
   */
  async getList(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.phong_hop_id) params.append('phong_hop_id', filters.phong_hop_id);
      if (filters.nhan_vien_id) params.append('nhan_vien_id', filters.nhan_vien_id);
      if (filters.trang_thai) params.append('trang_thai', filters.trang_thai);
      if (filters.tu_ngay) params.append('tu_ngay', filters.tu_ngay);
      if (filters.den_ngay) params.append('den_ngay', filters.den_ngay);
      if (filters.ten_dat_phong) params.append('ten_dat_phong', filters.ten_dat_phong);
      if (filters.order) params.append('order', filters.order);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/${this.dbname}${queryString ? '?' + queryString : ''}`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Lấy chi tiết một đặt phòng theo ID
   * @param {number} id - ID của đặt phòng
   * @returns {Promise}
   */
  async getById(id) {
    try {
      // Nếu API có endpoint riêng cho get by id, thêm vào đây
      // Hiện tại có thể dùng getList với filter id
      const response = await axios.get(`${API_BASE_URL}/${this.dbname}?id=${id}`);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Tạo mới đặt phòng
   * @param {Object} data - Dữ liệu đặt phòng
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
   * Cập nhật đặt phòng
   * @param {number} id - ID của đặt phòng
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise}
   */
  async update(id, data) {
    try {
      // Giả sử có endpoint PUT /api/dat_phong/<dbname>/<id>
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
   * Xóa đặt phòng
   * @param {number} id - ID của đặt phòng
   * @returns {Promise}
   */
  async delete(id) {
    try {
      // Giả sử có endpoint DELETE /api/dat_phong/<dbname>/<id>
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

export default DatPhongService;
