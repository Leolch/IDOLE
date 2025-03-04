// pages/scanPage/index.js
import { requestUrls } from '../component/requestUrl'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    calendarShow: false,
    selectedDate: '',
    scanDetailArr: [],
    isLoading: false
  },
  
  handleShowCalendar() {
    this.setData({
      calendarShow: true
    });
  },

  handleCloseCalendar() {
    this.setData({
      calendarShow: false
    });
  },
  // handleDateChange(e) {
  //   const date = e.detail;
  //   // 格式化日期为YYYY-MM-DD
  //   const formattedDate = date ? date.replace(/\//g, '-') : '';
  //   this.setData({
  //     selectedDate: formattedDate,
  //     calendarShow: false
  //   });
  //   this.filterDataByDate(formattedDate);
  // },
  // formatDate(date) {
  //   if (!date) return '';
  //   const parts = date.split('/');
  //   if (parts.length !== 3) return date;
  //   const [year, month, day] = parts;
  //   return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  // },
  // // 根据日期筛选数据
  // filterDataByDate(date) {
  //   if (!date) {
  //     // 如果没有选择日期，显示所有数据
  //     this.setData({
  //       scanDetailArr: this.data.filteredDetailArr
  //     });
  //     return;
  //   }
  //   const filteredData = this.data.filteredDetailArr.filter(item => {
  //     return item.updateTime === date;
  //   });
  //   this.setData({
  //     scanDetailArr: filteredData
  //   });
  // },
  // 获取物品详情函数
  getDetail(phone) {
    const that = this;
    that.setData({
      isLoading: true
    });
    wx.request({
      url: requestUrls.queryListByPhone,
      method: 'GET',
      data: {
        phone
      },
      success: (res) => {
        that.setData({
          isLoading: false
        });
        if (res.data.success) {
          let result = res.data.result || [];

          if (result && result.length) {
            let resultData = result.map(item => {
              item.updateTime = item.updateTime.split(' ')[0];
              return item;
            });
            that.setData({
              scanDetailArr: resultData,
              filteredDetailArr: resultData
            });
          }
        } else {
          that.setData({
            toastShow: true,
            toastTitle: '请求有误，请重试！'
          });
        }
      },
      error: () => {
        that.setData({
          isLoading: false
        });
        reject();  // 请求失败
      }
    });
  },
  forMartDate(val){
    return val
  },
  onLoad(options){
    const { wxPhone = ''} = options;
    this.setData({
      wxPhone
    })
    wxPhone && this.getDetail(wxPhone);
  }
})