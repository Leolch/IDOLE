import compV from "./utils/util"
App({
  onLoad(options){
    
  },
  getUerPhone(){

  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    // 通过对比版本号兼容基础库
    let userV = wx.getSystemInfoSync().SDKVersion;
    console.log('userv',userV)
    let openV = "2.23.4"
    const res = compV(userV, openV)
    console.log('res',res)
    if(res == -1)
      wx.showModal({
        title: '温馨提示',
        content: '请先更新微信！',
        confirmText: '确定',
        cancelText: '取消',
        success: res=> {
          if(res.confirm) {
            wx.updateWeChatApp()
          }else {
            wx.showToast({
              title: '功能不可用',
              icon: 'error'
            })
          }
        }
      })
      // 用户授权 获取手机号
      // wx.getSetting
      // wx.authorize 引导授权
      // wx.openSetting() 打开设置页面
      // wx.getUserProfile({
      //   success: res=> {
      //     console.log("info",info)
      //   }
      // })
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    // 只在scanPage页面时缓存scanDetailArr数据
    if (currentPage && currentPage.route === 'pages/scanPage/scanPage' && currentPage.data && currentPage.data.scanDetailArr && currentPage.data.scanDetailArr.length > 0) {
      wx.setStorageSync('scanDetailArr', currentPage.data.scanDetailArr);
    }
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  }
})
