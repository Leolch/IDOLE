/**
 * 自动埋点系统
 * 通过AOP方式拦截Page和Component的生命周期函数，自动注入埋点代码
 */

// 埋点事件类型
const EVENT_TYPES = {
  PAGE_VIEW: 'page_view',       // 页面浏览
  BUTTON_CLICK: 'button_click', // 按钮点击
  FORM_SUBMIT: 'form_submit',   // 表单提交
  CUSTOM: 'custom'              // 自定义事件
};

// 埋点数据缓存
let eventCache = [];

// 最大缓存事件数量，达到此数量自动上报
let MAX_CACHE_SIZE = 10;

// 埋点数据上报地址，实际项目中需要替换为真实接口
let reportUrl = '';

/**
 * 初始化埋点系统
 * @param {Object} options 配置项
 * @param {String} options.reportUrl 上报地址
 * @param {Number} options.maxCacheSize 最大缓存数量
 */
const init = (options = {}) => {
  if (options.reportUrl) {
    reportUrl = options.reportUrl;
  }
  
  if (options.maxCacheSize && typeof options.maxCacheSize === 'number') {
    MAX_CACHE_SIZE = options.maxCacheSize;
  }
  
  // 重写Page方法，注入埋点代码
  const originalPage = Page;
  Page = function(config) {
    // 拦截页面生命周期
    injectToPageLifecycle(config);
    return originalPage(config);
  };
  
  // 重写Component方法，注入埋点代码
  const originalComponent = Component;
  Component = function(config) {
    // 拦截组件生命周期
    injectToComponentLifecycle(config);
    return originalComponent(config);
  };
  
  // 监听小程序错误
  wx.onError(function(error) {
    trackEvent({
      type: 'error',
      message: error
    });
  });
  
  console.log('自动埋点系统初始化完成');
};

/**
 * 注入页面生命周期埋点
 * @param {Object} pageConfig 页面配置
 */
const injectToPageLifecycle = (pageConfig) => {
  // 拦截onLoad
  const originalOnLoad = pageConfig.onLoad;
  pageConfig.onLoad = function(options) {
    // 页面加载埋点
    const pagePath = getCurrentPagePath();
    trackEvent({
      type: EVENT_TYPES.PAGE_VIEW,
      page: pagePath,
      options: options
    });
    
    // 调用原始onLoad
    if (originalOnLoad) {
      originalOnLoad.call(this, options);
    }
  };
  
  // 拦截onShow
  const originalOnShow = pageConfig.onShow;
  pageConfig.onShow = function() {
    // 页面显示埋点
    const pagePath = getCurrentPagePath();
    trackEvent({
      type: 'page_show',
      page: pagePath
    });
    
    // 调用原始onShow
    if (originalOnShow) {
      originalOnShow.call(this);
    }
  };
  
  // 拦截onHide
  const originalOnHide = pageConfig.onHide;
  pageConfig.onHide = function() {
    // 页面隐藏埋点
    const pagePath = getCurrentPagePath();
    trackEvent({
      type: 'page_hide',
      page: pagePath
    });
    
    // 调用原始onHide
    if (originalOnHide) {
      originalOnHide.call(this);
    }
  };
  
  // 拦截onUnload
  const originalOnUnload = pageConfig.onUnload;
  pageConfig.onUnload = function() {
    // 页面卸载埋点
    const pagePath = getCurrentPagePath();
    trackEvent({
      type: 'page_unload',
      page: pagePath
    });
    
    // 调用原始onUnload
    if (originalOnUnload) {
      originalOnUnload.call(this);
    }
  };
  
  // 拦截页面中的事件处理函数
  injectToPageEvents(pageConfig);
};

/**
 * 注入组件生命周期埋点
 * @param {Object} componentConfig 组件配置
 */
const injectToComponentLifecycle = (componentConfig) => {
  if (!componentConfig.methods) {
    componentConfig.methods = {};
  }
  
  // 拦截组件中的事件处理函数
  injectToComponentEvents(componentConfig);
  
  // 拦截组件生命周期
  const originalAttached = componentConfig.attached || componentConfig.lifetimes?.attached;
  if (componentConfig.lifetimes) {
    componentConfig.lifetimes.attached = function() {
      // 组件挂载埋点
      trackEvent({
        type: 'component_attached',
        component: this.is
      });
      
      // 调用原始attached
      if (originalAttached) {
        originalAttached.call(this);
      }
    };
  } else {
    componentConfig.attached = function() {
      // 组件挂载埋点
      trackEvent({
        type: 'component_attached',
        component: this.is
      });
      
      // 调用原始attached
      if (originalAttached) {
        originalAttached.call(this);
      }
    };
  }
};

/**
 * 注入页面事件处理函数埋点
 * @param {Object} pageConfig 页面配置
 */
const injectToPageEvents = (pageConfig) => {
  // 遍历页面配置，查找事件处理函数
  Object.keys(pageConfig).forEach(key => {
    const item = pageConfig[key];
    if (typeof item === 'function' && key.startsWith('on') && key !== 'onLoad' && key !== 'onShow' && key !== 'onHide' && key !== 'onUnload') {
      // 拦截事件处理函数
      const originalMethod = item;
      pageConfig[key] = function(e) {
        // 事件触发埋点
        const pagePath = getCurrentPagePath();
        trackEvent({
          type: EVENT_TYPES.BUTTON_CLICK,
          page: pagePath,
          event: key,
          element: e?.target?.id || e?.currentTarget?.id || ''
        });
        
        // 调用原始事件处理函数
        return originalMethod.call(this, e);
      };
    }
  });
};

/**
 * 注入组件事件处理函数埋点
 * @param {Object} componentConfig 组件配置
 */
const injectToComponentEvents = (componentConfig) => {
  if (!componentConfig.methods) return;
  
  // 遍历组件方法，查找事件处理函数
  Object.keys(componentConfig.methods).forEach(key => {
    const item = componentConfig.methods[key];
    if (typeof item === 'function' && key.startsWith('on')) {
      // 拦截事件处理函数
      const originalMethod = item;
      componentConfig.methods[key] = function(e) {
        // 事件触发埋点
        trackEvent({
          type: EVENT_TYPES.BUTTON_CLICK,
          component: this.is,
          event: key,
          element: e?.target?.id || e?.currentTarget?.id || ''
        });
        
        // 调用原始事件处理函数
        return originalMethod.call(this, e);
      };
    }
  });
};

/**
 * 获取当前页面路径
 * @returns {String} 页面路径
 */
const getCurrentPagePath = () => {
  const pages = getCurrentPages();
  if (pages.length) {
    return pages[pages.length - 1].route;
  }
  return '';
};

/**
 * 记录埋点事件
 * @param {Object} eventData 事件数据
 */
const trackEvent = (eventData) => {
  // 添加公共数据
  const commonData = getCommonData();
  const event = {
    ...eventData,
    ...commonData,
    timestamp: Date.now()
  };
  
  // 添加到缓存
  eventCache.push(event);
  
  // 判断是否需要上报
  if (eventCache.length >= MAX_CACHE_SIZE) {
    reportEvents();
  }
};

/**
 * 获取公共数据
 * @returns {Object} 公共数据
 */
const getCommonData = () => {
  try {
    const systemInfo = wx.getSystemInfoSync();
    return {
      device: systemInfo.model,
      platform: systemInfo.platform,
      system: systemInfo.system,
      version: systemInfo.version,
      SDKVersion: systemInfo.SDKVersion
    };
  } catch (error) {
    console.error('获取系统信息失败', error);
    return {};
  }
};

/**
 * 上报埋点事件
 * @param {Boolean} force 是否强制上报
 */
const reportEvents = (force = false) => {
  // 没有事件或没有上报地址，不上报
  if (eventCache.length === 0 || !reportUrl) {
    return;
  }
  
  // 复制当前缓存并清空
  const events = [...eventCache];
  eventCache = [];
  
  // 上报数据
  wx.request({
    url: reportUrl,
    method: 'POST',
    data: {
      events: events
    },
    success: () => {
      console.log('埋点数据上报成功', events.length);
    },
    fail: (error) => {
      console.error('埋点数据上报失败', error);
      // 上报失败，重新加入缓存
      eventCache = [...eventCache, ...events];
    }
  });
};

/**
 * 手动触发自定义埋点事件
 * @param {String} eventName 事件名称
 * @param {Object} eventData 事件数据
 */
const trackCustomEvent = (eventName, eventData = {}) => {
  trackEvent({
    type: EVENT_TYPES.CUSTOM,
    event: eventName,
    data: eventData
  });
};

/**
 * 手动上报所有缓存的埋点事件
 */
const flush = () => {
  reportEvents(true);
};

export default {
  init,
  trackCustomEvent,
  flush,
  EVENT_TYPES
};