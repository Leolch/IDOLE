// index.js


// 获取应用实例
const app = getApp()
import { requestUrls } from '../component/requestUrl'
Page({
  data: {
   userInfo: {
    contactorRules: {
      required: true
     },
     contactNumRules: {
      required: true
     },
     userTypeRules: {
        required: true
      },
    companyNameRules: {
      required: true
    },
    companyAddressRules: {
      required: true
    }
   },
   userType: '',
   contactNum: '',
   contactor: '',
   exhibitionArr: [],
   companyName: '',
   toastTitle: '',
   toastShow: false,
   isLoading: true,
   loading: false,
   currentUserPhone: '',
   exhibitionPlace: '',
   mainShow: false,
   uploadExhibitionPlace: '',
   itemCode: '',
   companyAddress: ''
  },
  handleChoose(e){
    console.log(e)
    this.setData({
      exhibitionPlace: e.currentTarget.dataset.exhibitionplace,
    })
  },
  getSelectArr(wxPhone){
    // wx.request({
    //   url: requestUrls.dictItemList,
    //   method: 'GET',
    //   data: {
    //     dictId: requestUrls.dictId,
    //     pageNo: 1,
    //     pageSize: 100
    //   },
    //   success:res=>{
    //     let resData = res.data;
    //     if (resData.success) {
    //       if(resData.result && resData.result.records && resData.result.records.length) {
    //         let exhibitionArr = resData.result.records.map(item => {
    //           return item.itemText || ''
    //         })
    //         this.setData({
    //           exhibitionArr
    //         })
    //         if(resData.result.records.length === 1) {
    //           this.setData({
    //             exhibitionPlace: resData.result.records[0].itemText
    //           })
    //         }
    //         this.checkExist(wxPhone || '', resData.result.records.length === 1)
    //       }
    //     }
    //   }
    // })
    this.setData({
      exhibitionArr: ['2026欧洲展', '2026科技展'],
      isLoading: false
    })
  },
  handleEnter(e,data){
    const { exhibitionPlace = '', uploadExhibitionPlace = '', currentUserPhone = '', itemCode = '' } = this.data;
    if(!exhibitionPlace){
      this.setData({
        toastShow: true,
        toastTitle: '请选择展区'
      })
      return false;
    }
    const needUploadDate = data || uploadExhibitionPlace;
    // 比较展会字段是否需要更新
    if(!needUploadDate){
      this.setData({
        mainShow: true
      })
    } else if(needUploadDate && Object.keys(needUploadDate) && Object.keys(needUploadDate).length && needUploadDate.exhibitionPlace && needUploadDate.exhibitionPlace.indexOf(exhibitionPlace) < 0) {
      let connectPlace = needUploadDate.exhibitionPlace + ',' + exhibitionPlace;
      needUploadDate.exhibitionPlace = connectPlace;
      this.updateExhibitionPlace(needUploadDate)
    } else {
      this.goToScan();
    }
    
  },
  contactNumChange(e){
    this.setData({
      contactNum: e.detail.value
    })
  },
  companyChange(e){
    console.log(e.detail.value)
    this.setData({
      companyName: e.detail.value
    })
  },
  companyAddressChange(e){
    this.setData({
      companyAddress: e.detail.value
    })
  },
  contactorChange(e){
    this.setData({
      contactor: e.detail.value
    })
  },
  countryNameChange(e){
    this.setData({
      countryName: e.detail.value
    })
  },
  radioChange(e){
    this.setData({
      userType: e.detail.key
    })
  },
  getPhone(info){
    console.log("phone",info);
    this.setData({
      currentUserPhone: info.detail
    })
    this.getSelectArr(info.detail || '');
  },
  isValidPhoneNumber(phoneNumber) {
    var pattern = /^1[3-9]\d{9}$/;
    return pattern.test(phoneNumber);
  },
  submit(){
    const { exhibitionPlace, userType = 'new', companyName = '', contactNum = '', contactor = '', currentUserPhone = '', companyAddress = '' } = this.data;
    if(!exhibitionPlace) {
      this.setData({
        toastShow: true,
        toastTitle: '请选择展区'
      })
      return false;
    } else if(!userType){
      this.setData({
        toastShow: true,
        toastTitle: '请选择用户类型！'
      })
      return false;
    } else if(userType === "new" && !companyAddress){
      this.setData({
        toastShow: true,
        toastTitle: '请填写所在城市！'
      })
      return false;
    }else if(!this.data.companyName) {
      this.setData({
        toastShow: true,
        toastTitle: '请填写公司名称！'
      })
      return false;
    }else if(!contactNum) {
      this.setData({
        toastShow: true,
        toastTitle: '请填写联系电话！'
      })
      return false;
    } else if(contactNum && !this.isValidPhoneNumber(contactNum)) {
      this.setData({
        toastShow: true,
        toastTitle: '请填写正确的手机号！'
      })
      return false;
    } else if(!contactor){
      this.setData({
        toastShow: true,
        toastTitle: '请填写联系人！'
      })
      return false;
    }
    const params = {
      companyName,
      exhibitionPlace,
      userType,
      contactor,
      contactPhone: contactNum,
      wxPhone: currentUserPhone,
      companyAddress
    }
    console.log(params)
    // this.setData({
    //   loading: true
    // })
    // wx.request({
    //   url: requestUrls.addIntoExhPlace,
    //   method: 'POST',
    //   data: params,
    //   success: (res)=> {
    //     this.setData({
    //       loading: false
    //     })
    //     if(res.data.success){
    //       this.goToScan();
    //     } else {
    //       wx.showModal({
    //         title: '提示',
    //         content: res.data.message || '接口发生错误，请重试！',
    //         icon: 'error'
    //       }) 
    //     }
    //   },
    //   error: (e)=> {
    //     console.log('e',e)
    //     this.setData({
    //       loading: false
    //     })
    //     wx.showModal({
    //       title: '提示',
    //       content: '接口发生错误，请重试！',
    //       icon: 'error'
    //     }) 
    //   }
    // })
    this.goToScan();
  },
  hideTab(){
    wx.hideTabBar();
  },
  goToScan(){
    const { itemCode = '', currentUserPhone = '' } = this.data;
    const itemCodeString = itemCode ? `&itemCode=${itemCode}`:''
    wx.redirectTo({
      url: `../scanPage/scanPage?wxPhone=${currentUserPhone}` + itemCodeString
    })
  },
  checkExist(wxPhone, isOneTag){
    this.setData({
      loading: true
    })
    wx.request({
      url: requestUrls.getIntoExhPlaceByPhone,
      method: 'GET',
      data: {
        wxPhone
      },
      success: (res)=> {
        this.setData({
          loading: false
        })
        if(res.data.success){
          console.log('res.data.succes:'+res)
          if(res.data.result && Object.keys(res.data.result) && Object.keys(res.data.result).length) {
            this.setData({
              uploadExhibitionPlace: res.data.result,
              isLoading: false
            })
            if(isOneTag) {
              this.handleEnter('',res.data.result)
            }
          } else {
            this.setData({
              isLoading: false
            })
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
  updateExhibitionPlace(uploadData){
    const { wxPhone = '', exhibitionPlace = '' } = uploadData;
    this.setData({
      loading: true
    })
    wx.request({
      url: requestUrls.updExhPlaceMsg,
      method: 'POST',
      data: {
        wxPhone,
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
          this.goToScan();
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
    this.hideTab();
    // 重置uploadExhibitionPlace
    this.setData({
      uploadExhibitionPlace: '',
      itemCode: ''
    })
    // 初始化
    if(option.q&&option.q!="undefined"){
      // 获取到二维码原始链接内容
      const qrUrl = decodeURIComponent(option.q) 
      let jsonUrl = this.GetwxUrlParam(qrUrl);
      let itemCode = jsonUrl.itemCode || '';
      console.log('itemCode',itemCode)
      // 链接后有proc 非本页面查询
      if(itemCode){
        this.setData({
          itemCode
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
      this.getSelectArr(userPhone);
    }
  },
})