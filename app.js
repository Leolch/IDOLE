import compV from "./utils/util"

const handleRequestError = (error) => {
  console.error('请求错误:', error);
  wx.showToast({
    title: '网络异常，请稍后重试',
    icon: 'none',
    duration: 2000
  });
};

App({
  globalData: {
    handleRequestError,
    baseUrl: '',
    userInfo: null
  },
  onLoad(options){
    
  },
  getUerPhone(){

  },
  onLaunch: function () {
    // 通过对比版本号兼容基础库
    try {
      let userV = wx.getSystemInfoSync().SDKVersion;
      console.log('userv',userV)
      let openV = "2.23.4"
      const res = compV(userV, openV)
      console.log('res',res)
      if(res == -1) {
        wx.showModal({
          title: '温馨提示',
          content: '请先更新微信！',
          confirmText: '确定',
          cancelText: '取消',
          success: res=> {
            if(res.confirm) {
              wx.updateWeChatApp()
            } else {
              wx.showToast({
                title: '功能不可用',
                icon: 'error'
              })
            }
          }
        })
      }
    } catch (error) {
      console.error('版本检查错误:', error);
      wx.showToast({
        title: '系统异常，请稍后重试',
        icon: 'none'
      });
    }
  },

  onShow: function (options) {
    // 检查网络状态
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          wx.showToast({
            title: '当前无网络连接',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  onHide: function () {
    
  },

  onError: function (error) {
    console.error('应用错误:', error);
  }
});
