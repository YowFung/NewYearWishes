// pages/make/make.js

const app = getApp();
const login = require('../../handle/login.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showLoginBox: false,
        isLogining: false,
        inputContent: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 获取用户登录状态和信息
        var obj = this;
        if (!app.globalData.logined) {
            login.getUserInfo(function (success, userInfo) {
                app.globalData.user = userInfo;
                app.globalData.logined = success;

                obj.setData({
                    showLoginBox: !success
                });
            });
        }
    },

    /**
     *  点击右上角菜单的“分享”选项
     */
    onShareAppMessage(res) {
        return {
            title: "新年刚过，一起来许个愿吧！",
            path: "/pages/index/index",
            imageUrl: "https://7769-wish-e872ae-1252926300.tcb.qcloud.la/img/bg.png?sign=062b4a475f944c754f1b4179170afab5&t=1549552453"
        }
    },

    /**
     *  登录授权
     */
    OnLogin(event) {
        this.setData({
            isLogining: true
        });

        var obj = this;
        login.auth(event, function (success, userInfo) {
            app.globalData.logined = success;
            app.globalData.user = userInfo;
            obj.setData({
                showLoginBox: !success,
                isLogining: false
            });
        });
    },

    /**
     * 返回上一页
     */
    OnBack(event) {
        wx.navigateBack({
            delta: 1
        })
    },

    /**
     * 监听输入框内容输入
     */
    OnInput(event) {
        this.setData({
            inputContent: event.detail.value
        });
    },

    /**
     * 放飞愿望
     */
    OnSend(event) {
        if (this.data.inputContent == "") {
            wx.showToast({
                title: '请不要放飞空白愿望哦！',
                icon: 'none',
                duration: 2000
            });

            return;
        }

        const db = wx.cloud.database();
        var startPower = Math.floor(Math.random() * 40) + 15;
        db.collection('wishes').add({
            data: {
                content: this.data.inputContent,
                status: 0,
                logEvent: 0,
                power: startPower,
                startPower: startPower,
                createdAt: db.serverDate(),
                lastVisited: db.serverDate()
            },
            success(res) {
                wx.showToast({
                    title: '已成功放飞',
                    mask: true,
                    duration: 2000,
                    complete() {
                        // 添加日志
                        db.collection('logs').add({
                            data: {
                                wishid: res._id,
                                createdAt: db.serverDate(),
                                type: 1,
                                power: startPower
                            },
                            success(res) {
                                console.log('放飞愿望！');
                            }
                        });

                        // 延时跳转
                        setTimeout(function () {
                            wx.navigateTo({
                                url: '../wish/wish?wishid=' + res._id,
                            })
                        }, 2000);
                    }
                })
            },
            fail (res) {
                wx.showToast({
                    title: '网络掉链了！请稍后重新放飞你的愿望吧！',
                    icon: 'none',
                    duration: 2000,
                    mask: true
                })
            }
        });
    },
})