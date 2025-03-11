import { requestUrls, requestUtil } from '../component/requestUrl'

Page({
  data: {
    currentCode: '',
    detailObj: [],
    toastShow: false,
    toastTitle: '提示',
    isLoading: false
  },
  handleScan() {
    const that = this;
    wx.scanCode({
      success(res) {
        try {
          const pageUrl = decodeURIComponent(res.result);
          if (pageUrl.indexOf('itemcode=') < 0 || pageUrl.indexOf('proc=') < 0) {
            wx.showToast({
              title: '扫码有误',
              icon: 'none',
              duration: 2000
            });
            return;
          }

          const urlString = pageUrl.split('itemcode=')[1];
          that.setData({
            currentCode: urlString
          });
          that.getDetail(urlString || '');
        } catch (error) {
          console.error('扫码处理错误:', error);
          wx.showToast({
            title: '扫码处理异常，请重试',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail(error) {
        console.error('扫码失败:', error);
        wx.showToast({
          title: '扫码失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  handleSearchList(){
    // 点击货号时查询列表 清空色名
    this.setData({
      handleColorVal: ''
    })
    this.handleSearch()
  },
  handleSearch(){
    // 初始化
    this.setData({
      codeContainer: false,
      codeAndClolorContainer: false
    })
    if(!this.data.handleVal && !this.data.handleColorVal) return;
    if(this.data.handleVal && !this.data.handleColorVal) {
      this.setData({
        codeContainer: true
      })
    } else if(this.data.handleVal && this.data.handleColorVal) {
      this.setData({
        codeAndClolorContainer: true
      })
    }
    this.setData({
      currentCode: this.data.handleVal,
      handleColorVal: this.data.handleColorVal
    })
    this.getDetail(this.data.handleVal, this.data.handleColorVal)
  },
  getDetail(code) {
    const that = this;
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
          isLoading: false,
          detailObj: res.result || []
        });
      })
      .catch(error => {
        console.error('获取详情失败:', error);
        that.setData({
          isLoading: false,
          toastShow: true,
          toastTitle: '获取详情失败，请重试！'
        });
      });
  sumFn(arr){
    var s = 0;
    arr.forEach((val, idx)=> {
        s += val;
    })
    return s;
  },
  handleCodeAnd(e){
    console.log(e)
    let colorCode = e.target.dataset.codecolor || '';
    if(colorCode) {
      this.setData({
        handleColorVal: colorCode,
        codeAndClolorContainer: true,
        codeContainer: false
      })
      this.getDetail(this.data.handleVal, this.data.handleColorVal)
    }
  },
  onLoad(options) {
    const { itemCode = '' } = options;
    if (itemCode) {
      this.setData({
        currentCode: itemCode
      });
      this.getDetail(itemCode);
    }
  }
})