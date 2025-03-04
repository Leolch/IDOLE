export default (v1, v2) =>{
  v1 = v1.split('.').map((item,index) => Number(item))
  v2 = v2.split('.').map(Number)

  for (var i = 0; i < v1.length; i++) {
    if(v2[i]> v1[i]){
      // 用户基础库版本低
      return -1
    } else if(v2[i] < v1[i]){
      // 用户基础版本号高
      return 1
    }
    return 0
  }
}