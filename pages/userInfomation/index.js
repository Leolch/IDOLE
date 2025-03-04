// index.js


// 获取应用实例
const app = getApp()
import { requestUrls } from '../component/requestUrl'
Page({
  data: {
   userInfo: {
      nameRules: {
      required: true
     },
      country: {
        required: true
      },
      regionRules: {
        required: true
      },
      companyNameRules: {
        required: true
      },
      businessTypeRules: {
        required: true
      },
      countryName: {
        required: true
      },
      businessOhtherRules: {
        required: true
      }
   },
   country: 'china',
   countryCell: {
     china: '中国',
     other: '其他'
   },
   userName: '',
   businessOther: '',
   region: ['','', ''],
   multiArray: [['服装公司', '面料公司', '其他'], ['品牌', '电商', '批发','制服', '代工']],
   multiIndex: [0, 0, 0],
   toastTitle: '',
   toastShow: false,
   isLoading: true,
   loading: false,
   currentUserPhone: '',
   exhibitionPlace: ''
  },
  nameChange(e){
    console.log(e.detail.value)
    this.setData({
      userName: e.detail.value
    })
  },
  companyChange(e){
    console.log(e.detail.value)
    this.setData({
      companyName: e.detail.value
    })
  },
  businessOtherChange(e){
    this.setData({
      businessOther: e.detail.value
    })
  },
  countryNameChange(e){
    this.setData({
      countryName: e.detail.value
    })
  },
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = ['品牌', '电商', '批发', '制服', '代工'];
            break;
          case 1:
            data.multiArray[1] = ['工厂', '贸易'];
            break;
          case 2:
            data.multiArray[1] = [''];
            break;
        }
        data.multiIndex[1] = 0;
        break;
    }
    console.log(data.multiIndex);
    this.setData(data);
  },
  radioChange(e, val){
    console.log('key',e.detail.key)
    this.setData({
      country: e.detail.key
    })
    if(e.detail.key === 'china'){
      this.setData({
        countryName: ''
      })
    }
  },
  handleTranslate(){
    const url = `../userInfomationEn/userInfomationEn?phone=${this.data.currentUserPhone}&&exhibitionPlace=${this.data.exhibitionPlace}`
    wx.redirectTo({
      url
    })
  },
  getPhone(info){
    console.log("phone",info);
    this.setData({
      currentUserPhone: info.detail
    })
    wx.request({
      url: requestUrls.checkExist,
      method: 'GET',
      data: {
        phoneNum: info.detail
      },
      success: (res)=> {
        if(res.data.success){
          const hasRegistration = res.data.result.isExist || '';
          if(hasRegistration) {
            if(res.data.result.exhibitionPlace && this.data.exhibitionPlace && res.data.result.exhibitionPlace.indexOf(this.data.exhibitionPlace)<0){
              const exhibitionPlace = `${res.data.result.exhibitionPlace}/${this.data.exhibitionPlace}`
              this.updateExhibitionPlace(info.detail, exhibitionPlace)
            } else {
              wx.redirectTo({
                url: '../welcomPage/welcomPage'
              })
            }
          } else if(!hasRegistration){
            info.detail && this.setData({
              isLoading: false
            })
          }
        }
      }
    })
  },
  submit(){
    if(!this.data.userName) {
      this.setData({
        toastShow: true,
        toastTitle: '请填写姓名！'
      })
      return false;
    } else if(!this.data.country){
      this.setData({
        toastShow: true,
        toastTitle: '请选择国家！'
      })
      return false;
    } else if(!this.data.companyName) {
      this.setData({
        toastShow: true,
        toastTitle: '请填写公司名称！'
      })
      return false;
    }else if(!this.data.region[0] && this.data.country === 'china') {
      this.setData({
        toastShow: true,
        toastTitle: '请选择地区！'
      })
      return false;
    } else if(this.data.country === 'other' && !this.data.countryName){
      this.setData({
        toastShow: true,
        toastTitle: '请填写国家名！'
      })
      return false;
    } else if(this.data.multiArray[0][this.data.multiIndex[0]]==='其他' && !this.data.businessOther){
      this.setData({
        toastShow: true,
        toastTitle: '请填写业务类型！'
      })
      return false;
    }
    const { userName = '', companyName = '', country = '', countryName = '', region = [], multiArray = '', multiIndex = '', businessOther = '', currentUserPhone = '', exhibitionPlace = '' } = this.data;
    const params = {
      userName,
      companyName,
      country,
      countryName,
      businessOther,
      exhibitionPlace,
      phoneNum: currentUserPhone,
      region: `${region[0]}-${region[1]}-${region[2]}`,
      businessType: `${multiArray[0][multiIndex[0]]}${multiArray[0][multiIndex[0]] === '其他'? '': '-'}${multiArray[1][multiIndex[1]]}`
    }
    console.log(params)
    this.setData({
      loading: true
    })
    wx.request({
      url: requestUrls.userInfoSave,
      method: 'POST',
      data: params,
      success: (res)=> {
        this.setData({
          loading: false
        })
        if(res.data.success){
          wx.redirectTo({
            url: '../welcomPage/welcomPage'
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message || '接口发生错误，请重试！',
            icon: 'error'
          }) 
        }
      },
      error: (e)=> {
        console.log('e',e)
        this.setData({
          loading: false
        })
        wx.showModal({
          title: '提示',
          content: '接口发生错误，请重试！',
          icon: 'error'
        }) 
      }
    })
  },
  checkExist(phoneNum){
    this.setData({
      loading: true
    })
    wx.request({
      url: requestUrls.checkExist,
      method: 'GET',
      data: {
        phoneNum
      },
      success: (res)=> {
        this.setData({
          loading: false
        })
        if(res.data.success){
          if(res.data.result) {
            if(res.data.result.isExist){
              if(res.data.result.exhibitionPlace && this.data.exhibitionPlace && res.data.result.exhibitionPlace.indexOf(this.data.exhibitionPlace)<0){
                const exhibitionPlace = `${res.data.result.exhibitionPlace}/${this.data.exhibitionPlace}`
                this.updateExhibitionPlace(phoneNum, exhibitionPlace)
              } else {
                wx.redirectTo({
                  url: '../welcomPage/welcomPage'
                })
              }
            } else {
              this.setData({
                isLoading: false
              })
            }
          }
        } else {
          wx.showModal({
            title: '提示',
            content: res.message || '接口发生错误，请重试！',
            icon: 'error'
          }) 
        }
      },
      error: (e)=> {
        console.log('e',e)
        this.setData({
          loading: false
        })
        wx.showModal({
          title: '提示',
          content: '接口发生错误，请重试！',
          icon: 'error'
        }) 
      }
    })
  },
  updateExhibitionPlace(phoneNum, exhibitionPlace){
    this.setData({
      loading: true
    })
    wx.request({
      url: requestUrls.updateExhibitionPlace,
      method: 'POST',
      data: {
        phoneNum,
        exhibitionPlace
      },
      success: (res)=> {
        this.setData({
          loading: false
        })
        wx.showToast({
          title: '欢迎再次光临SICILY！',
          duration: 1200
        })
        setTimeout(()=> {
          wx.redirectTo({
            url: '../welcomPage/welcomPage'
          })
        }, 1400)
      }
    })
  },
  GetwxUrlParam(url) {
	  let theRequest = {};
	  if(url.indexOf("#") != -1){
		  const str=url.split("#")[1];
		  const strs=str.split("&");
		  for (let i = 0; i < strs.length; i++) {
		  	theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
		  }
	  }else if(url.indexOf("?") != -1){
		  const str=url.split("?")[1];
		  const strs=str.split("&");
		  for (let i = 0; i < strs.length; i++) {
		  	theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
		  }
	  }
	  return theRequest;
	},
  onLoad: function (option) {
    const { phone = '', exhibitionPlace= ''} = option;
    if(option && exhibitionPlace){
      this.setData({
        exhibitionPlace
      })
    }
    if(phone){
      this.setData({
        currentUserPhone: phone
      })
    }
    // 初始化
    if(option.q&&option.q!="undefined"){
      // 获取到二维码原始链接内容
      const qrUrl = decodeURIComponent(option.q) 
      let jsonUrl = this.GetwxUrlParam(qrUrl);
      let exhibitionPlace = jsonUrl.exhibitionPlace || '';
      console.log('exhibitionPlace',exhibitionPlace)
      // 链接后有proc 非本页面查询
      if(exhibitionPlace){
        this.setData({
          exhibitionPlace
        })
      }
    }
    // 查缓存 有号码
    const userPhone = wx.getStorageSync('userPhone') || '';
    if(userPhone){
      this.setData({
        currentUserPhone: userPhone
      })
      console.log(userPhone)
      this.checkExist(userPhone);
    }
  },
})