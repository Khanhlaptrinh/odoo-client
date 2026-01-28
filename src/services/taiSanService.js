import axios from 'axios';

const API_BASE_URL = '/api/tai_san';
const LICH_SU_CAP_PHAT_URL = '/api/lich_su_cap_phat';

class TaiSanService {
  constructor(dbname) {
    this.dbname = dbname;
  }

  /**
   * Lấy danh sách tất cả tài sản
   * @param {Object} filters - Các filter: loai_tai_san, tinh_trang, nhan_vien_id, ma_tai_san, ten_tai_san, vi_tri, tu_ngay_mua, den_ngay_mua, tu_gia_tri, den_gia_tri, order
   * @returns {Promise}
   */
  async getList(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.loai_tai_san) params.append('loai_tai_san', filters.loai_tai_san);
      if (filters.tinh_trang) params.append('tinh_trang', filters.tinh_trang);
      if (filters.nhan_vien_id) params.append('nhan_vien_id', filters.nhan_vien_id);
      if (filters.ma_tai_san) params.append('ma_tai_san', filters.ma_tai_san);
      if (filters.ten_tai_san) params.append('ten_tai_san', filters.ten_tai_san);
      if (filters.vi_tri) params.append('vi_tri', filters.vi_tri);
      if (filters.tu_ngay_mua) params.append('tu_ngay_mua', filters.tu_ngay_mua);
      if (filters.den_ngay_mua) params.append('den_ngay_mua', filters.den_ngay_mua);
      if (filters.tu_gia_tri) params.append('tu_gia_tri', filters.tu_gia_tri);
      if (filters.den_gia_tri) params.append('den_gia_tri', filters.den_gia_tri);
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
   * Lấy chi tiết một tài sản theo ID
   * @param {number} id - ID của tài sản
   * @returns {Promise}
   */
  async getById(id) {
    try {
      // Sử dụng getList với filter id
      const response = await axios.get(`${API_BASE_URL}/${this.dbname}?id=${id}`);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Tạo mới tài sản
   * @param {Object} data - Dữ liệu tài sản
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
   * Cập nhật tài sản
   * @param {number} id - ID của tài sản
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
   * Xóa tài sản
   * @param {number} id - ID của tài sản
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
   * Lấy lịch sử cấp phát
   * @param {Object} filters - Các filter: tai_san_id, nhan_vien_id, tu_ngay_cap, den_ngay_cap, chua_thu_hoi, da_thu_hoi, order
   * @returns {Promise}
   */
  async getLichSuCapPhat(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.tai_san_id) params.append('tai_san_id', filters.tai_san_id);
      if (filters.nhan_vien_id) params.append('nhan_vien_id', filters.nhan_vien_id);
      if (filters.tu_ngay_cap) params.append('tu_ngay_cap', filters.tu_ngay_cap);
      if (filters.den_ngay_cap) params.append('den_ngay_cap', filters.den_ngay_cap);
      if (filters.chua_thu_hoi) params.append('chua_thu_hoi', filters.chua_thu_hoi);
      if (filters.da_thu_hoi) params.append('da_thu_hoi', filters.da_thu_hoi);
      if (filters.order) params.append('order', filters.order);

      const queryString = params.toString();
      const url = `${LICH_SU_CAP_PHAT_URL}/${this.dbname}${queryString ? '?' + queryString : ''}`;
      
      const response = await axios.get(url);
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

export default TaiSanService;
