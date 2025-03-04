// index.js


// 获取应用实例
const app = getApp()
import { url } from 'inspector';
import { requestUrls } from '../component/requestUrl'

Page({
  data: {
    text:'',
    handleVal:'',
    handleColorVal:'',
    detailObj: [],
    currentCode: '',
    isLoading: '',
    currentUserPhone: '',
    allWh: 60,
    Rainfallheadtitle: [
      { title: "部门" },
      { title: "库存量" },
      { title: "仓库" },
      { title: "客户名称" },
    ],
    RainfallheadtitleCode: [
      { title: "色名" },
      { title: "库存量" },
    ],
    RainfallItemdata: [],
    RainfallItemdataCode: [],
    codeContainer: false,
    codeAndClolorContainer:false,
    searchCount: 0
  },
  handleScan(){
    let that = this;
    wx.scanCode({
      success (res) {
        const pageUrl = decodeURIComponent(res.result);
        if(pageUrl.indexOf('itemcode=') < 0 || pageUrl.indexOf('proc=') < 0) {
          wx.showToast({
            title: '扫码有误',
            icon: 'fail',
            duration: 2000
          })
          return false;
        }
        const urlString = pageUrl.split('itemcode=')[1];
        that.setData({
          currentCode: urlString
        })
        that.getDetail(urlString || '');
      }
    })
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
  getDetail(code, color){
    const that = this;
    if(!code) return;
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      isLoading: true
    }) 
    wx.hideLoading()
    if(code && color){
      this.setData({
        RainfallItemdata: [],
        searchCount: '',
        allWh: ''
      })
      wx.request({
        url: requestUrls.getItemExistInfos,
        // header: {
        //   Cookie: wx.getStorageSync('cookie') || ''
        // },
        data:{
          itemCode: code,
          color,
        },
        method: 'POST',
        success:(res)=>{
          console.log(res);
          if(res.data.result && Object.keys(res.data.result).length){
            const countArr = res.data.result.data.map(item => {
              return item['库存量']
            })
            let allWh = that.sumFn(countArr).toFixed(4);
            res.data.result.data.sort((a,b)=>{return b['库存量'] - a['库存量']})
            this.setData({
              RainfallItemdata: res.data.result.data.length ? res.data.result.data : [],
              searchCount: res.data.result.data.length,
              allWh
            })
          }
          
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
    } else if(code && !color){
      this.setData({
        RainfallItemdataCode: [],
        searchCount: '',
        allWh: ''
      })
      wx.request({
        url: requestUrls.getItemExistInfos,
        // header: {
        //   Cookie: wx.getStorageSync('cookie') || ''
        // },
        method: "POST",
        data:{
          itemCode: code,
        },
        success:(res)=>{
          console.log(res);
          if(res.data.result && Object.keys(res.data.result).length){
            const countArr = res.data.result.data.map(item => {
              return item['库存量']
            })
            let allWh = that.sumFn(countArr).toFixed(4);
            res.data.result.data.sort((a,b)=>{return b['库存量'] - a['库存量']})
            this.setData({
              RainfallItemdataCode: res.data.result.data.length ? res.data.result.data : [],
              searchCount: res.data.result.data.length,
              allWh
            })
          }
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
    }
  },
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
  onLoad(option){
    // 初始化
    console.log('option',option)
    this.setData({
      allWh: ''
    })
    if(option && option.itemcode){
      let itemcode = JSON.parse(option.itemcode);
      this.setData({
        text: itemcode,
        currentCode: itemcode,
        handleVal: itemcode
      })
      if(itemcode) {
        this.setData({
          codeContainer: true,
        })
        this.getDetail(itemcode)
      }
    }
  }
})