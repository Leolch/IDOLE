// 接口
const baseUrl = '';

// 请求拦截器
const requestInterceptor = (config) => {
  // 这里可以添加通用的请求头等配置
  return config;
};

// 响应拦截器
const responseInterceptor = (response) => {
  if (!response.data.success) {
    wx.showToast({
      title: response.data.message || '请求失败',
      icon: 'none',
      duration: 2000
    });
    return Promise.reject(response.data);
  }
  return response.data;
};

// 统一的请求方法
const request = (url, options = {}) => {
  const config = requestInterceptor(options);
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      ...config,
      success: (res) => {
        try {
          const result = responseInterceptor(res);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        getApp().globalData.handleRequestError(error);
        reject(error);
      }
    });
  });
};

const requestURL = {
  getUserPhone: '/jeecg-boot/form/p3/getUserPhone',
  getItemInfos: '/jeecg-boot//getItemInfos',
  getItemExistInfos: '/jeecg-boot/wx/getItemExistInfos',
  detailWX: '/jeecg-boot/cus/user/access/detail/wx',
  userInfoSave: '/jeecg-boot/wx/info/insertWxUserInfo',
  checkExist: '/jeecg-boot/wx/info/checkWxUserExist',
  updateExhibitionPlace: '/jeecg-boot/user/info/updateExhibitionPlace',
  registration: '/jeecg-boot/cus/registration',
  getMainDataByItemCode: '/jeecg-boot/report/garment/getMainDataByItemCode',
  dictItemList: '/jeecg-boot/dictItem/list',
  addConnectionMsg: '/jeecg-boot/scan/product/addConnectionMsg',
  addIntoExhPlace: '/jeecg-boot/wx/user/addIntoExhPlace',
  getIntoExhPlaceByPhone: '/jeecg-boot/wx/intoExhPlace/getIntoExhPlaceByPhone',
  updExhPlaceMsg: '/jeecg-boot/wx/user/updExhPlaceMsg',
  queryListByPhone: '/jeecg-boot/wx/product/queryListByPhone',
  dictId: ''
};

export const requestUrls = requestURL;
export const requestUtil = request;