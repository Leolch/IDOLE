# 埋点系统使用文档

## 1. 系统概述

通过AOP（面向切面编程）方式拦截小程序的Page和Component生命周期函数，自动注入埋点代码，实现用户行为的无感知跟踪与分析。

### 主要功能

- **自动埋点**：自动捕获页面浏览、按钮点击等用户行为
- **手动埋点**：支持开发者手动触发自定义埋点事件
- **数据缓存**：支持埋点数据本地缓存，批量上报
- **错误监控**：自动捕获并上报小程序运行错误

## 2. 实现原理

埋点系统通过重写小程序的Page和Component方法，在页面和组件的生命周期函数中注入埋点代码，实现自动埋点。

### 核心实现机制

1. **重写Page方法**：拦截页面的onLoad、onShow、onHide、onUnload等生命周期函数
2. **重写Component方法**：拦截组件的attached等生命周期函数
3. **事件拦截**：自动拦截以"on"开头的事件处理函数，注入埋点代码
4. **数据缓存与上报**：将埋点数据缓存在内存中，达到一定数量后批量上报

## 3. 使用方法

### 初始化埋点系统

在小程序的app.js中引入埋点系统并初始化：

```javascript
import analytics from './utils/analytics';

App({
  onLaunch() {
    // 初始化埋点系统
    analytics.init({
      reportUrl: 'https://your-report-server.com/report', // 埋点数据上报地址
      maxCacheSize: 10 // 最大缓存事件数量，达到此数量自动上报
    });
  },
  // 其他配置...
});
```

### 自动埋点

初始化埋点系统后，以下用户行为将被自动捕获：

- 页面浏览（onLoad、onShow）
- 页面离开（onHide、onUnload）
- 按钮点击（以on开头的事件处理函数）
- 组件挂载（attached）
- 小程序错误（wx.onError）

### 手动埋点

对于需要特别关注的业务行为，可以使用手动埋点：

```javascript
import analytics from '../../utils/analytics';

Page({
  // 用户完成某项操作
  onCompleteTask(taskInfo) {
    // 记录自定义埋点事件
    analytics.trackCustomEvent('task_completed', {
      taskId: taskInfo.id,
      taskType: taskInfo.type,
      duration: taskInfo.duration
    });
    
    // 业务逻辑...
  }
});
```

### 强制上报埋点数据

在某些关键节点（如用户即将退出小程序时），可以强制上报所有缓存的埋点数据：

```javascript
import analytics from '../../utils/analytics';

Page({
  onUnload() {
    // 强制上报所有缓存的埋点数据
    analytics.flush();
  }
});
```

## 4. API 说明

### analytics.init(options)

初始化埋点系统。

**参数**：

- `options.reportUrl` {String} 埋点数据上报地址
- `options.maxCacheSize` {Number} 最大缓存事件数量，达到此数量自动上报

### analytics.trackCustomEvent(eventName, eventData)

手动触发自定义埋点事件。

**参数**：

- `eventName` {String} 事件名称
- `eventData` {Object} 事件数据

### analytics.flush()

手动上报所有缓存的埋点事件。

### analytics.EVENT_TYPES

埋点事件类型常量。

- `PAGE_VIEW`: 页面浏览
- `BUTTON_CLICK`: 按钮点击
- `FORM_SUBMIT`: 表单提交
- `CUSTOM`: 自定义事件

## 5. 埋点数据格式

### 公共数据字段

所有埋点事件都会包含以下公共数据：

- `timestamp`: 事件发生时间戳
- `device`: 设备型号
- `platform`: 平台（android/ios）
- `system`: 操作系统版本
- `version`: 微信版本号
- `SDKVersion`: 小程序基础库版本

### 页面浏览事件

```json
{
  "type": "page_view",
  "page": "pages/index/index",
  "options": { /* 页面参数 */ },
  "timestamp": 1623123456789,
  /* 公共数据字段 */
}
```

### 按钮点击事件 点击事件以 handle开头命名 可在analytics.js中定义
```json
{
  "type": "button_click",
  "page": "pages/index/index",
  "event": "onTapButton",
  "element": "submit-btn",
  "timestamp": 1623123456789,
  /* 公共数据字段 */
}
```

### 自定义事件

```json
{
  "type": "custom",
  "event": "login_success",
  "data": { /* 自定义数据 */ },
  "timestamp": 1623123456789,
  /* 公共数据字段 */
}
```

## 6. 最佳实践

### 埋点命名规范

- 使用下划线命名法，如：`button_click`、`page_view`
- 事件名称应具有描述性，如：`login_success`、`order_submit`
- 避免使用过于笼统的名称，如：`click`、`view`

### 埋点粒度控制

- 不要埋点过多，避免数据冗余
- 关注核心业务流程和关键节点
- 对于高频操作，考虑采样上报

---