Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    isLoading: {
      type: Boolean,
      value: true,
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {}
  },
})