// pages/scanPage/index.js
import { requestUrls, requestUtil } from '../component/requestUrl'

Page({
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
    buttonY: 100,
    isDan: true,
    isProxy: false,
    proxyContent: '',
    storageArrData: []
  },

  handleSetting() {
    this.setData({
      isDan: !this.data.isDan
    })
  },

  handleToMine() {
    wx.navigateTo({
      url: `../scanPageList/scanPageList?wxPhone=${this.data.wxPhone}`
    })
  },

  handleDelete(e) {
    const filterDetail = this.data.scanDetailArr.filter(item => 
      item["客户原始查询编号/货号"] !== e.currentTarget.dataset.code
    )
    this.setData({
      scanDetailArr: filterDetail,
    })
  },

  handleToDscan() {
    this.setData({
      isProxy: !this.data.isProxy
    })
  },

  handleProxyIn(e) {
    this.setData({
      proxyContent: e.detail.value
    })
  },

  handleScan() {
    const that = this;
    const scanInterval = 900;

    wx.scanCode({
      success(res) {
        try {
          const pageUrl = decodeURIComponent(res.result);
          
          if (pageUrl.indexOf('itemCode=') < 0) {
            that.setData({
              toastShow: true,
              toastTitle: '扫码有误，请重试！'
            });
            return;
          }

          const urlString = pageUrl.split('itemCode=')[1].split('#')[0];
          
          if (that.data.isDan) {
            that.getDetail(urlString || '');
          } else {
            that.getDetail(urlString || '')
              .then(() => {
                setTimeout(() => {
                  that.handleScan();
                }, scanInterval);
              })
              .catch(() => {
                that.setData({
                  toastShow: true,
                  toastTitle: '获取数据失败，请稍后重试！'
                });
              });
          }
        } catch (error) {
          console.error('扫码处理错误:', error);
          that.setData({
            toastShow: true,
            toastTitle: '扫码处理异常，请重试！'
          });
        }
      },
      fail(error) {
        console.error('扫码失败:', error);
        that.setData({
          toastShow: true,
          toastTitle: '扫码失败，请重试！'
        });
      }
    });
  },

  handleClear() {
    if (this.data.scanDetailArr.length) {
      this.setData({
        clearDialogShow: true
      })
    }
  },

  handleClearConfirm() {
    this.setData({
      scanDetailArr: []
    })
    wx.removeStorageSync('scanDetailArr')
  },

  handleClearCancel() {
    this.setData({
      clearDialogShow: false
    })
  },

  getDetail(code) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.setData({
        isLoading: true
      });

      requestUtil(requestUrls.getMainDataByItemCode, {
        method: 'GET',
        data: {
          ItemCode: code,
          username: 'admin'
        }
      })
        .then(res => {
          that.setData({
            isLoading: false
          });

          let scanDetailArr = that.data.scanDetailArr || [];
          let result = res.result || [];

          if (result && result.length) {
            if (that.data.scanDetailArr.length) {
              const filterArr = that.data.scanDetailArr.filter(item => 
                item["客户原始查询编号/货号"] === code
              );
              if (filterArr.length) {
                that.setData({
                  toastShow: true,
                  toastTitle: `样品${code}已在当前列表中！`
                });
                resolve();
                return;
              }
            }

            result = result.map(item => ({
              ...item,
              latest: true
            }));

            if (scanDetailArr.length) {
              scanDetailArr = scanDetailArr.map(item => ({
                ...item,
                latest: false
              }));
            }
          } else {
            that.setData({
              toastShow: true,
              toastTitle: '此吊牌信息为空，请联系工作人员！'
            });
            reject();
            return;
          }

          scanDetailArr = result.length ? [...result, ...scanDetailArr] : scanDetailArr;
          that.setData({ scanDetailArr });
          resolve();
        })
        .catch(error => {
          console.error('获取详情失败:', error);
          that.setData({
            isLoading: false,
            toastShow: true,
            toastTitle: '获取详情失败，请重试！'
          });
          reject(error);
        });
    });
  },

  handleSub() {
    if (!this.data.scanDetailArr.length) {
      this.setData({
        toastShow: true,
        toastTitle: '当前无样品，请扫码！'
      })
      return;
    }
    
    if (this.data.isProxy && !this.data.proxyContent) {
      this.setData({
        toastShow: true,
        toastTitle: '请输入代扫信息！'
      })
      return;
    }

    this.setData({
      dialogShow: true
    })
  },

  handleConfirm() {
    const { wxPhone = '', isProxy = false, proxyContent = '' } = this.data;
    const dataList = this.data.scanDetailArr.map(item => ({
      cardName: item["供应商全称"] || '',
      cardCode: item["首选供应商编号"] || '',
      productType: item['布种类型'] || '',
      sourceType: item.sourceType || '',
      colorC: item.colorC || '',
      color: item.color || '',
      itemCodeConnection: item["货号"] || '',
      itemCodeSearch: item["客户原始查询编号/货号"] || '',
      kz: item["平方米重"] || '',
      kf: item["全幅宽"] || '',
      cf: item["成份"] || ''
    }));

    requestUtil(requestUrls.addConnectionMsg, {
      method: 'POST',
      data: {
        wxPhone,
        formList: dataList,
        proxyContent: isProxy ? proxyContent : '',
        isProxy: isProxy ? "是" : "否"
      }
    })
      .then(() => {
        this.setData({
          toastShow: true,
          toastTitle: '提交成功！',
          scanDetailArr: []
        });
        wx.removeStorageSync('scanDetailArr');
      })
      .catch(error => {
        console.error('提交失败:', error);
        this.setData({
          toastShow: true,
          toastTitle: error.message || '网络有误，请重试！'
        });
      });
  },

  handleCancel() {
    this.setData({
      dialogShow: false
    })
  },

  onLoad(options) {
    const { wxPhone = '', itemCode = '' } = options;
    this.setData({ wxPhone });

    const storageArr = wx.getStorageSync('scanDetailArr') || [];
    if (storageArr.length > 0) {
      this.setData({
        scanDetailArr: storageArr
      })
    }
    
    if (itemCode) {
      this.getDetail(itemCode);
    }
  },

  onHide() {
    if (this.data.scanDetailArr.length > 0) {
      wx.setStorageSync('scanDetailArr', this.data.scanDetailArr)
    }
  },

  onUnload() {
    if (this.data.scanDetailArr.length > 0) {
      wx.setStorageSync('scanDetailArr', this.data.scanDetailArr)
    }
  }
});