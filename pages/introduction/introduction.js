//index.js
// var overdue = require('../../overdue/overdue.js');
//获取应用实例
const app = getApp()
var mask = true
var lower = true
var loadct = true
var kzq = true    //走马灯控制器
var timer = null;
var num = 0;
var dsqload = null;   //加载页面的定时器
const innerAudioContext = wx.createInnerAudioContext();
innerAudioContext.autoplay = true;
Page({
  data: {
    auth: false,
    userInfo: {},   // 用户信息
    hasUserInfo: false,  // 用户授权
    canIUse: true,   //  检测小程序版本兼容
    rule: false,
    share_text: "",
    share_bg: "",
    frequency: 0,//次数
    show_share: false,
    percent: 0,   // 加载进度值
    show: true,
    loadct: false,
    // 消息变更控制器
    newchange: false,
  },
  //事件处理函数
  // 滚轮
  scrollTop: function () {
    wx.pageScrollTo({
      scrollTop: 500,
      duration: 300
    })
  },

  //查看攻略 客服
  toStrategy: function () {

  },

  clearpop: function () {
    clearTimeout(dsqload)
  },

  // 请求超时
  overdue_btn: function () {
    this.toload(0);
    if (this.reloadFn && !app.globalData.token) {
      app.userLogin(this);
      // this.reloadFn()
    } else {
      this.reloadFn();
    }
    this.setData({
      overdue: false,
      percent: 0
    });
  },

  // 第一次加载页面才执行
  onLoad: function () {
    var that = this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          that.setData({
            auth: true
          });
        }
      }
    });
    app.userLogin(this);
  },

  reloadInit: function () {
    wx.reLaunch({
      url: '/pages/introduction/introduction'
    })
  },

  onShow: function () {
    // if (this.data.hasUserInfo){
    //   return false
    // }

    mask = true;
    if (loadct) {
      this.setData({
        loadct: true
      })
      var percent = this.data.percent
      this.toload(percent);
    }
    // if (overdue) {
    //   this.setData({
    //     overdue: true
    //   })
    // }
    if (app.globalData.token) {
      this.ifHasUserInfo();
      wx.hideLoading()
    }
    else {
      var that = this
      app.tokenReadyCallback = function () {
        that.ifHasUserInfo();
        wx.hideLoading()
      }
    }

  },

  ifHasUserInfo: function () {
    var info = app.globalData.userInfo,
      tok = app.globalData.token,
      postData = {},
      // pid = app.globalData.pid || pid,
      postUrl = '';
    // console.log(info)
    this.setData({
      token: tok,
      userInfo: info,
      hasUserInfo: true
    })
    postUrl = app.setConfig.url + '/index.php?g=Api&m=Enve&a=getGlobalInfo';
    postData = {
      token: tok,
      page: 1
    };
    // app.postLogin(postUrl, postData, this.initial);
    app.request(postUrl, postData, this.initial, this)
  },

  initial: function (res) {
    if (res.data.code == 20000) {
      var data = res.data.data;
      // console.log(data)
      var ruleText = data.rule_text;
      var money = data.money;
      var more = parseInt(data.moreFlag);
      // 无挑战机会弹框按钮开关
      app.globalData.flag = data.flag || 0;
      // 复活开关
      app.globalData.flag2 = data.flag2 || 0;
      //群内智力开关
      app.globalData.flag3 = data.flag3 || 1;
      //个人中心炫耀战绩开关
      app.globalData.flag4 = data.flag4 || 1;
      //挑战完成"获得更多挑战机会"开关
      app.globalData.flag5 = data.flag5 || 1;
      //"分享到群立即复活"按钮开关
      app.globalData.flag6 = data.flag6 || 1;
      // app.globalData.flag = 1;
      // app.globalData.rule_text = data.ruleText;
      app.globalData.frequency = data.ctime || 0;
      app.globalData.title = !data.title ? '究竟谁是答题王, 等你来挑战! !' : data.title;
      // 游戏中可以转发多少次
      app.globalData.nowfrequency = data.share_revive_time || 3;
      // 复活可以几次
      app.globalData.buy_revive_time = data.buy_revive_time || 3;

      // 一天最大挑战次数
      app.globalData.max_challenge_time = data.max_challenge_time || 10;
      // 最大领奖品
      app.globalData.max_get_prize_time = data.max_get_prize_time || 3;
      // 复活卡金额
      app.globalData.revive_money = data.revive_money;
      // 复活卡数量
      app.globalData.life = parseInt(data.life);
      // 转发的标题
      app.globalData.title = data.title;
      // 说明
      app.globalData.ruleText = data.game_text;
      // 可兑换的挑战次数
      app.globalData.excAmount = data.excAmount ? data.excAmount : 3;
      //分享块的文字
      var share_text = data.guide_txt ? data.guide_txt : "邀请好友，帮忙答题";
      // 分享块的背景图
      var share_bg = data.share_bg ? data.share_bg : "/images/db/index/share.png"
      // console.log(data.excAmount, app.globalData.excAmount)
      wx.hideLoading()
      this.setData({
        ruleText,
        money,
        more,
        // share_text,
        frequency: app.globalData.frequency,
        flag: app.globalData.flag,
        prize: data.prize,
        right: data.right,
        total: data.total,
        sildeTxt: data.sildeTxt,
        newchange: false,
        share_text: share_text,
        share_bg: share_bg,
      })
      // console.log(data.sildeTxt)
      var that = this;
      if (timer) { clearTimeout(timer); }
      timer = setTimeout(function () {
        that.changenews(0);
      }, 2000)


    }
    var that = this;
    this.setData({
      percent: 100
    })
    // console.log(this.data.hasUserInfo)
    loadct = false;   //全局的
    setTimeout(function () {
      that.setData({
        show: false,
        loadct: false
      })
    }, 600)
  },
  colseShare: function () {
    this.setData({
      show_share: false
    })
  },

  // 屏幕关闭事件
  onHide: function () {
    clearTimeout(dsqload);
  },
  toload: function (num) {
    var that = this;
    var time_interval;
    var hasinfo = this.data.hasUserInfo;
    if (this.data.percent > 98 || hasinfo) {
      return false;
    }
    if (num < 80 && !hasinfo) {
      time_interval = 60;

    }
    else if (80 <= num < 97 && !hasinfo) {
      time_interval = 100;

    }
    else if (97 <= num < 100 && !hasinfo) {
      time_interval = 1000;

    }

    dsqload = setTimeout(function () {
      num++;
      that.setData({
        percent: num
      })
      that.toload(num)
    }, time_interval)
    // console.log(time_interval)
  },

  changenews: function (num) {
    var that = this;
    var sildeTxt = that.data.sildeTxt;
    var news = sildeTxt[num];
    timer = setTimeout(function () {
      // console.log(num)
      that.setData({
        news: news,
        newchange: true,
      })
      timer = setTimeout(function () {
        that.setData({
          newchange: false
        })
        if (num >= sildeTxt.length - 1) {
          that.changenews(0)
          return false
        } else {
          num++;
          that.changenews(num)
        }
      }, 6100)
    }, 300)
  },
})
