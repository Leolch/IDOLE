// index.js


// 获取应用实例
const app = getApp()
import {requestUrls} from '../component/requestUrl'
Page({
  data: {
    text:'',
    handleVal:'',
    detailObj: [],
    currentCode: '',
    isLoading: '',
    currentAllCount: '',
    loginShow: true,
    currentUserPhone: '',
    whiteList: [], // 白名单
    otherWhite: '921235215',
    priceShow: false,
    proc: '',
    eleUn: '',
    widthUn: '',
    weightUn: '',
    itemcodeDrop: [
      'ID000022',
      'ID0000223',
      'ID0000223',
      'ID000022322',
      'ID0000223',
    ],
    dropdownShow: false,
    userPhoneStorage: false,
    contactLoginShow: true
  },
  getPhone(info){
    this.setData({
      currentUserPhone: '13025849595'
    })
    // wx.request({
    //   url: requestUrls.detailWX,
    //   method: 'GET',
    //   data: {
    //     phone: info.detail
    //   },
    //   success: (res)=> {
    //     const userControlPhone = res.data.result;
    //     const allowlogin = userControlPhone && (userControlPhone.phone == info.detail) && (userControlPhone.accessStatusWx == 0) && (userControlPhone.accessStatusWx == 0);
    //     console.log('allowlogin', allowlogin)
    //     const otherAllow = info.detail.indexOf(this.data.otherWhite) > -1;
    //     if(allowlogin || otherAllow){
    //       info.detail && this.setData({
    //         loginShow: false
    //       })
    //     } else {
    //       wx.showModal({
    //         title: '提示',
    //         content: '对不起，非公司内部人员无进入权限，退出请点击右上角按钮。',
    //         icon: 'error'
    //       }) 
    //     }
    //   },
    // })
    info.detail && this.setData({
      loginShow: false
    })
     
  },
  handleSelect(e){
    const selectVal = e.currentTarget.dataset.itemcode || '';
    if(selectVal.indexOf(this.data.handleVal) > -1){
      this.setData({
        handleVal: selectVal,
        dropdownShow: false
      })
    }
  },
  hideTab(){
    wx.hideTabBar();
  },
  handleSearch(){
    if(!this.data.handleVal) return;
    this.setData({
      currentCode: this.data.handleVal
    })
    this.getDetail(this.data.handleVal)
  },
  handleBlur(){
    this.setData({
      dropdownShow: false
    })
  },
  handleFocus(){
    // 获取焦点时 查询下拉接口
  },
  handleChange(e){
    console.log(e)
    this.setData({
      dropdownShow: true
    })
  },
  handleLinkCheck(){
    wx.navigateTo({
      url: '../searchCode/searchCode?itemcode='+JSON.stringify(this.data.currentCode),
    })
  },
  getDetail(code){
    if(!code) return;
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      isLoading: false
    })
    this.setData({
      detailObj: [],
      widthUn: '' ,
      weightUn: '',
      eleUn: ''
    })
    wx.request({
      url: requestUrls.getItemInfos,
      method: "POST",
      data:{
        itemCode: code,
      },
      success:(res)=>{
        console.log(res);
        const { fukuan = '', kezhong = '', chengfen = '' } = res.data.result;
        this.setData({
          detailObj: res.data.result.data.length ? res.data.result.data : [],
          widthUn: fukuan ,
          weightUn: kezhong,
          eleUn: chengfen
        })
        this.setData({
          isLoading: false
        })
      },
      fail:(err)=>{
        wx.showToast({
          title: '查询失败',
          icon: 'error'
        })
      },
      complete:()=>{
        wx.hideLoading()
      }
    })
    wx.hideLoading()
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
  onLoad(option){
    wx.showTabBar()
    // 初始化
    if(option.q&&option.q!="undefined"){
      // 获取到二维码原始链接内容
      const qrUrl = decodeURIComponent(option.q) 
      let jsonUrl = this.GetwxUrlParam(qrUrl);
      let itemcode = jsonUrl.itemcode;
      let proc = jsonUrl.proc
      let exhibitionPlace = jsonUrl.exhibitionPlace || '';
      // 链接后有proc 非本页面查询
      if(proc){
        this.setData({
          currentCode: itemcode,
          proc
        })
      } else {
        this.setData({
          text: itemcode,
          currentCode: itemcode,
        })
        this.getDetail(itemcode);
      }
    }
    // 查缓存 有号码
    const userPhone = wx.getStorageSync('userPhone') || '';
    if(userPhone){
      this.getPhone({
        detail: userPhone,
      })
    }
  }
})