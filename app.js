/*
 * @Author: 西西里的夏天 oncwnuKlEKwqguMTrBayg-NnQvvs@git.weixin.qq.com
 * @Date: 2025-03-04 16:04:13
 * @LastEditors: 西西里的夏天 oncwnuKlEKwqguMTrBayg-NnQvvs@git.weixin.qq.com
 * @LastEditTime: 2025-03-13 14:41:22
 * @FilePath: \益彩小程序\app.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import compV from "./utils/util"
import analytics from "./utils/analytics"

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
    // 初始化自动埋点系统
    analytics.init({
      // 实际项目中需要替换为真实接口
      reportUrl: 'https://test/analytics',
      maxCacheSize: 20
    });
    
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
    // 应用隐藏时上报所有缓存的埋点数据
    analytics.flush();
  },

  onError: function (error) {
    console.error('应用错误:', error);
  }
});
