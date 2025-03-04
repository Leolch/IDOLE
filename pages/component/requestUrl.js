// 接口
const url = '';
const requestURL = {
  getUserPhone: url + '/jeecg-boot/form/p3/getUserPhone',
  getItemInfos: url + '/jeecg-boot//getItemInfos',
  getItemExistInfos: url + '/jeecg-boot/wx/getItemExistInfos',
  detailWX: url + '/jeecg-boot/cus/user/access/detail/wx',
  userInfoSave: url +'/jeecg-boot/wx/info/insertWxUserInfo',
  checkExist: url + '/jeecg-boot/wx/info/checkWxUserExist',
  updateExhibitionPlace: url + '/jeecg-boot/user/info/updateExhibitionPlace',
  registration: url + '/jeecg-boot/cus/registration',
  getMainDataByItemCode: url + '/jeecg-boot/report/garment/getMainDataByItemCode',
  dictItemList: url+ '/jeecg-boot/dictItem/list',
  addConnectionMsg: url + "/jeecg-boot/scan/product/addConnectionMsg",
  addIntoExhPlace: url+ '/jeecg-boot/wx/user/addIntoExhPlace',
  getIntoExhPlaceByPhone: url + '/jeecg-boot/wx/intoExhPlace/getIntoExhPlaceByPhone',
  updExhPlaceMsg: url + '/jeecg-boot/wx/user/updExhPlaceMsg',
  queryListByPhone: url + "/jeecg-boot/wx/product/queryListByPhone",
  dictId: '', 
}
export const requestUrls = requestURL;