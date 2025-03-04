import { requestUrls } from '../requestUrl'

Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    isShow: {
      type: Boolean,
      value: true,
    }
  },
  data: {
    // 这里是一些组件内部数据
    code: ''
  },
  methods: {
    getUserPhone(info){
      console.log('info',info)
      const userPhone = wx.getStorageSync('userPhone') || '';
      if(!userPhone) {
        let { code } = info.detail
        wx.request({
          url: requestUrls.getUserPhone,
          data: {
            code
          },
          success: res=>{
            if(res.data.code==200){
              console.log('res',res)
              const phoneNumber = res.data.result.phone_info.phoneNumber || ''
              if(res.data && res.data.result && res.data.result.phone_info && phoneNumber) {
                wx.setStorageSync('userPhone', phoneNumber || '');
                this.triggerEvent('getphone', phoneNumber)
              } else {
                wx.showModal({
                  title: '提示',
                  content: '获取手机号失败，请重新再试!',
                })
              }
            }
          },
          fail: ()=> {
            wx.showModal({
              title: '提示',
              content: '获取手机号失败，请重新再试!',
            })
          }
        })
      } else {
        this.triggerEvent('getphone', userPhone)
      }
    }
  },
  created(){
    // 实例创建完成
  },
  attached(){
    // 组件挂载完成
     // bug  wx.login需要在获取手机号之前
     const userPhone = wx.getStorageSync('userPhone') || '';
  },
  detached(){
    // 销毁
  }
})