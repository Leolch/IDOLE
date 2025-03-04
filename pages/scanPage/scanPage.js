// pages/scanPage/index.js
import { requestUrls } from '../component/requestUrl'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    scanDetailArr: [],
    toastShow: false,
    toastTitle: '提示',
    dialogShow: false,
    message: '确定提交所选样品？',
    close: true,
    isLoading: false,
    wxPhone: '',
    clearDialogShow: false,
    touchStartY: 0,
    buttonY: 100,  // 初始位置，距离顶部的 100px
    isDan: true,
    isProxy: false,
    proxyContent: ''
  },
  handleSetting(){
    this.setData({
      isDan: !this.data.isDan
    })
  },
  handleToMine(){
    wx.navigateTo({
      url: `../scanPageList/scanPageList?wxPhone=${this.data.wxPhone}`
    })
  },
  handleDelete(e){
    let filterDetail = this.data.scanDetailArr.filter(item => {
      return item["客户原始查询编号/货号"] !== e.currentTarget.dataset.code
    })
    this.setData({
      scanDetailArr: filterDetail,
    })
    console.log('e',e)
  },
  handleToDscan(){
    this.setData({
      isProxy: !this.data.isProxy
    })
  },
  handleProxyIn(e){
    this.setData({
      proxyContent: e.detail.value
    })
  },
handleScan() {
  let that = this;
  const scanInterval = 900;  // 设置扫码间隔时间，单位：毫秒

  wx.scanCode({
    success (res) {
      that.handleScanSuccess(res, scanInterval);
    },
    fail() {
      that.setData({
        toastShow: true,
        toastTitle: '扫码失败，请重试！'
      });
    }
  });
},

// 处理扫码成功的逻辑
handleScanSuccess(res, scanInterval) {
  const pageUrl = decodeURIComponent(res.result);
  
  if (!this.validateScanResult(pageUrl)) {
    return;
  }

  const urlString = this.extractItemCode(pageUrl);
  
  if (this.data.isDan) {
    this.handleSingleScan(urlString);
  } else {
    this.handleContinuousScan(urlString, scanInterval);
  }
},

// 验证扫码结果
validateScanResult(pageUrl) {
  if (pageUrl.indexOf('itemCode=') < 0) {
    this.setData({
      toastShow: true,
      toastTitle: '扫码有误，请重试！'
    });
    return false;
  }
  return true;
},

// 提取itemCode
extractItemCode(pageUrl) {
  return pageUrl.split('itemCode=')[1].split('#')[0] || '';
},

// 处理单扫模式
handleSingleScan(itemCode) {
  this.getDetail(itemCode);
},

// 处理连扫模式
handleContinuousScan(itemCode, scanInterval) {
  this.getDetail(itemCode)
    .then(() => {
      setTimeout(() => {
        this.handleScan();  // 延迟后继续扫码
      }, scanInterval);
    })
    .catch(() => {
      this.setData({
        toastShow: true,
        toastTitle: '获取数据失败，请稍后重试！'
      });
    });
},
handleClear(){
  if(this.data.scanDetailArr.length){
    this.setData({
      clearDialogShow: true
    })
  }
},
handleClearConfirm(){
  this.setData({
    scanDetailArr: []
  })
},
handleClearCancel(){
  this.setData({
    clearDialogShow: false
  })
},
// 获取物品详情函数
getDetail(code) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.setData({
        isLoading: true
      });
      wx.request({
        url: requestUrls.getMainDataByItemCode,
        method: 'GET',
        data: {
          ItemCode: code,
          username: 'admin'
        },
        success: (res) => {
          that.setData({
            isLoading: false
          });
          if (res.data.success) {
            let scanDetailArr = that.data.scanDetailArr || [];
            let result = res.data.result || [];
            if (result && result.length) {
              if (that.data.scanDetailArr.length) {
                let filterArr = that.data.scanDetailArr.filter(item => {
                  return item["客户原始查询编号/货号"] === code;
                });
                if (filterArr.length) {
                  that.setData({
                    toastShow: true,
                    toastTitle: `样品${code}已在当前列表中！`
                  });
                  resolve();  // 请求成功，继续执行
                  return;
                }
              }
              result = result.map(item => {
                return {
                  ...item,
                  latest: true
                };
              });

              if (scanDetailArr.length) {
                scanDetailArr = scanDetailArr.map(item => {
                  item.latest = false;
                  return item;
                });
              }
            }

            scanDetailArr = result.length ? [...result, ...scanDetailArr] : result;
            that.setData({
              scanDetailArr
            });

            console.log(that.data.scanDetailArr);
            resolve();  // 请求完成，继续执行
          } else {
            that.setData({
              toastShow: true,
              toastTitle: '扫码有误，请重试！'
            });
            reject();  // 请求失败
          }
        },
        error: () => {
          that.setData({
            isLoading: false
          });
          reject();  // 请求失败
        }
      });
    });
  },
  handleSub(){
    if(!this.data.scanDetailArr.length) {
      this.setData({
        toastShow: true,
        toastTitle: '当前无样品，请扫码！'
      })
      return false;
    } else if(this.data.isProxy && !this.data.proxyContent){
      this.setData({
        toastShow: true,
        toastTitle: '请输入代扫信息！'
      })
      return false;
    } 
    this.setData({
      dialogShow: true
    })
  },
  handleConfirm(){
    let dataList = [];
    const { wxPhone = '', isProxy = false, proxyContent = '' } = this.data;
    console.log('this.data.scanDetailArr',this.data.scanDetailArr)
    dataList = this.data.scanDetailArr.map(item => {
      return {
        cardName: item["供应商全称"] || '',
        cardCode: item["首选供应商编号"] || '',
        productType: item['布种类型'] || '',
        sourceType: item.sourceType || '',
        colorC: item.colorC || '',
        color: item.color || '' ,
        itemCodeConnection: item["货号"] || '',
        itemCodeSearch: item["客户原始查询编号/货号"] || '',
        kz: item["平方米重"] || '',
        kf: item["全幅宽"] || '',
        cf: item["成份"] || ''
      };
    })
    wx.request({
      url: requestUrls.addConnectionMsg,
      method: 'POST',
      data: { 
        wxPhone: wxPhone,
        formList: dataList,
        proxyContent: isProxy ? proxyContent : '',
        isProxy: isProxy ? "是":"否",
      },
      success: res=> {
        if(res.data.success){
          this.setData({
            toastShow: true,
            toastTitle: '提交成功！',
            scanDetailArr: []
          })
        } else {
          this.setData({
            toastShow: true,
            toastTitle: res.data.message || '网络有误，请重试！'
          })
        }
      }
    })
  },
  handleCancel(){
    this.setData({
      dialogShow: false
    })
  },
  onLoad(options){
    const { wxPhone = '', itemCode = '' } = options;
    console.log(wxPhone, itemCode)
    this.setData({
      wxPhone
    })
    itemCode && this.getDetail(itemCode);
    
  },
})