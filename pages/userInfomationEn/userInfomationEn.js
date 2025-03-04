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
   multiArray: [['Garment company', 'Fabric company', 'Other'], ['Brand', 'E-commerce', 'Wholesaler', 'Uniform', 'OEM']],
   multiIndex: [0, 0, 0],
   toastTitle: '',
   toastShow: false,
   loading: false,
   phone: '',
   exhibitionPlace: 'SICILY展区',
   currentUserPhone: ''
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
            data.multiArray[1] = ['Brand', 'E-commerce', 'Wholesaler','Uniform', 'OEM'];
            break;
          case 1:
            data.multiArray[1] = ['Manufacturer', 'Trading'];
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
    console.log('TETS')
    const url = `../userInfomation/index?phone=${this.data.currentUserPhone}&&exhibitionPlace=${this.data.exhibitionPlace}`
    wx.redirectTo({
      url
    })
  },
  submit(){
    if(!this.data.userName) {
      this.setData({
        toastShow: true,
        toastTitle: 'Please fill in your name!'
      })
      return false;
    } else if(!this.data.country){
      this.setData({
        toastShow: true,
        toastTitle: 'Please select a country!'
      })
      return false;
    } else if(!this.data.companyName) {
      this.setData({
        toastShow: true,
        toastTitle: 'Please enter your company name!'
      })
      return false;
    }else if(!this.data.region[0] && this.data.country === 'china') {
      this.setData({
        toastShow: true,
        toastTitle: 'please select the region!'
      })
      return false;
    } else if(this.data.country === 'other' && !this.data.countryName){
      this.setData({
        toastShow: true,
        toastTitle: 'Please fill in the country name!'
      })
      return false;
    } else if(this.data.multiArray[0][this.data.multiIndex[0]]==='Other' && !this.data.businessOther){
      this.setData({
        toastShow: true,
        toastTitle: 'Please fill in the Business category!'
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
      businessType: `${multiArray[0][multiIndex[0]]}${multiArray[0][multiIndex[0]] === 'Other'? '': '-'}${multiArray[1][multiIndex[1]]}`
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
            title: 'prompt',
            content: res.data.message || 'Interface error, please try again!',
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
          title: 'prompt',
          content: 'Interface error, please try again!',
          icon: 'error'
        }) 
      }
    })
  },
  onLoad: function (options) {
    const { phone = '', exhibitionPlace= ''} = options;
    this.setData({
      currentUserPhone: phone,
      exhibitionPlace
    })
  },
})