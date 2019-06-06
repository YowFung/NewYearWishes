// pages/help/help.js

const app = getApp();
const login = require('../../handle/login.js');
const location = require('../../handle/location.js');
const datetime = require('../../handle/datetime.js');
const bgm = wx.getBackgroundAudioManager();

Page({

    data: {
        showLoginBox: false,
        isLogining: false,
        isHelped: false,
        isExists: true,
        wish: {
            id: null,
            content: '',
            power: 0,
            location: '-',
            status: 0
        },
        user: {
            openid: null,
            nickName: '',
            avatarUrl: ""
        },
        logs: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.OnGetWishInfo(options);
        var obj = this;

        // 获取用户登录状态和信息
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
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        // 助力页面不播放背景音乐
        bgm.pause();

        // 重新提取日志列表
        this.OnGetLogs();
    },

    /**
     *  点击右上角菜单的“分享”选项
     */
    onShareAppMessage(res) {
        if (res.from == 'button') {
            return {
                title: "救救有梦想的孩子吧，TA需要你的祝福和鼓励！",
                path: "/pages/help/help?wish_id=" + this.data.wish.id,
                imageUrl: "https://7769-wish-e872ae-1252926300.tcb.qcloud.la/img/bg.png?sign=062b4a475f944c754f1b4179170afab5&t=1549552453"
            }
        } else {
            return {
                title: "新年刚过，一起来许个愿吧！",
                path: "/pages/index/index",
                imageUrl: "https://7769-wish-e872ae-1252926300.tcb.qcloud.la/img/bg.png?sign=062b4a475f944c754f1b4179170afab5&t=1549552453"
            }
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

            if (success)
                obj.Operation();
        });
    },

    /**
     * 给TA祝福
     */
    OnWish() {
        const db = wx.cloud.database();
        var obj = this;
        var power = Math.floor(Math.random() * 20) + 1;

        // 添加日志
        db.collection('logs').add({
            data: {
                wishid: obj.data.wish.id,
                createdAt: db.serverDate(),
                type: 0,
                power: power,
                nickName: app.globalData.user.nickName
            }, 
            success(res) {
                // 更新愿望的动力值并提醒愿望的主人
                wx.cloud.callFunction({
                    name: 'setWishPower',
                    data: {
                        wishid: obj.data.wish.id,
                        power: power
                    },
                    success(res) {
                        console.log(res);
                        wx.showToast({
                            title: '助力成功！',
                            icon: 'success',
                            mask: true,
                            duration: 1000,
                            complete(res) {
                                setTimeout(function () {
                                    wx.showToast({
                                        title: '感谢您的鼓励，增加 ' + power + ' 点动力！',
                                        icon: 'none',
                                        mask: true,
                                        duration: 3000
                                    });
                                }, 1000);
                            }
                        });

                        obj.setData({
                            ["wish.power"]: obj.data.wish.power + power,
                            isHelped: true
                        })
                    }
                })

                // 更新日志列表
                obj.OnGetLogs();
                
            },
            fail(res) {
                wx.showToast({
                    title: '网络异常，请稍后再试！',
                    icon: 'none',
                    mask: true
                })
            }
        });
    },

    /**
     * 去主页，我也要许愿
     */
    OnToMake() {
        wx.navigateTo({
            url: '../index/index',
        })
    },

    /**
     * 事件函数--获取日志列表
     */
    OnGetLogs() {
        var obj = this;
        const db = wx.cloud.database();
        db.collection('logs').where({
            wishid: obj.data.wish.id
        }).orderBy('createdAt', 'desc').get({
            success(res) {
                // 处理日志
                var items = [];
                var text = "";
                for (var index in res.data) {
                    if (res.data[index].type == 0) {
                        // 助力事件
                        text = res.data[index].nickName + " 过来助力，增加" + res.data[index].power + "点动力。";
                        items.push(text);
                    } else if (res.data[index].type == 1) {
                        // 初次放飞愿望事件
                        text = datetime.toDateString(res.data[index].createdAt) + "，主人放飞了愿望，获得" + res.data[index].power + "点初始动力。";
                        items.push(text);
                    } else if (res.data[index].type == 2) {
                        // 签到事件
                        text = datetime.toDateString(res.data[index].createdAt) + "主人签到，增加" + res.data[index].power + "点动力。";
                        items.push(text);
                    } else if (res.data[index].type == 3) {
                        // 愿望标记实现事件
                        text = datetime.toDateString(res.data[index].createdAt) + "，主人宣布该愿望已实现！";
                        items.push(text);
                    } else if (res.data[index].type == 4) {
                        // 愿望被沉入海底事件
                        text = datetime.toDateString(res.data[index].createdAt) + "，主人将该愿望沉入了海底！";
                        items.push(text);
                    }
                }

                obj.setData({
                    logs: items
                });
            },
            fail(res) {
                // 没有愿望日志记录
                obj.setData({
                    logs: {}
                });
            }
        });
    },

    /**
     * 事件函数--提取愿望详细信息
     */
    OnGetWishInfo(options) {
        var obj = this;
        const db = wx.cloud.database();
        db.collection('wishes').doc(options.wishid).get({
            success(res) {
                // 渲染愿望信息
                obj.setData({
                    wish: {
                        id: res.data._id,
                        content: res.data.content,
                        power: res.data.power,
                        status: res.data.status,
                        location: location.getAddr(res.data.power)
                    },
                    user: {
                        openid: res.data._openid,
                    }
                });

                // 提取愿望放飞者的用户信息
                db.collection('users').doc(res.data._openid).get({
                    success(res) {
                        obj.setData({
                            user: {
                                openid: obj.data.user.openid,
                                nickName: res.data.nickName,
                                avatarUrl: res.data.avatarUrl
                            }
                        });

                        obj.Operation();
                    },
                    fail(res) {
                        obj.setData({
                            isExists: false
                        });
                    }
                });
            },
            fail(res) {
                obj.setData({
                    isExists: false
                })
            }
        });
    },

    /**
     * 事件函数--用户登录后的一些操作
     */
    Operation() {
        var obj = this;

        // 判断该愿望是否存在
        if (!this.data.isExists) {
            wx.showToast({
                title: '该愿望不存在或已被删除！',
                icon: 'none',
                duration: 2000,
                complete() {
                    setTimeout(function () {
                        wx.navigateBack({
                            detal: 1
                        });
                    }, 2000);
                }
            });
        } else {
            // 判断是不是自己放飞的愿望
            if (app.globalData.user.openid == obj.data.user.openid) {
                wx.navigateTo({
                    url: '../wish/wish?wishid=' + obj.data.wish.id + '&from=helpPage',
                });
                return;
            }
            
            if (obj.data.wish.status == 1) {
                // 判断该愿望是否已实现
                wx.showToast({
                    title: '该愿望已经实现啦，不需要再给它助力了哦！',
                    icon: 'none',
                    duration: 3000,
                    mask: true
                });
            } else if (obj.data.wish.status == 2) {
                // 判断该愿望是否已被沉入海底了
                wx.showToast({
                    title: '该愿望已被沉入海底了哦，以后都不用再给它助力了啦！',
                    icon: 'none',
                    duration: 3000,
                    mask: true
                })
            } else{
                // 判断今天是否已帮该愿望助力过
                const db = wx.cloud.database();
                db.collection('logs').where({
                    _openid: app.globalData.user.openid,
                    wishid: obj.data.wish.id
                }).get({
                    success(res) {
                        for (var index in res.data) {
                            if (datetime.isOnDay(res.data[index].createdAt, new Date())) {
                                // 今天已助力过
                                console.log('已助力过');
                                obj.setData({
                                    isHelped: true
                                });

                                if (!obj.data.wish.status) {
                                    wx.showToast({
                                        title: '今天你已助力过了哦，明天再来吧！',
                                        mask: true,
                                        icon: 'none',
                                        duration: 3000
                                    });
                                }

                                break;
                            }
                        }
                    }
                });
            } 
        }

        // 重新提取日志列表
        this.OnGetLogs();
    }
})