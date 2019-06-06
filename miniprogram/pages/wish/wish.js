// pages/wish/wish.js

const app = getApp();
const login = require('../../handle/login.js');
const location = require('../../handle/location.js');
const datetime = require('../../handle/datetime.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        backToHome: false,
        showLoginBox: false,
        isLogining: false,
        avatarUrl: "https://7769-wish-e872ae-1252926300.tcb.qcloud.la/img/avar-default.png?sign=a728e180f94a4b9d4ce804f88de8aff4&t=1549544255",
        iconUrl: [
            "https://7769-wish-e872ae-1252926300.tcb.qcloud.la/img/logo-heart.png?sign=43bc434d985b5d96b9ffd0a23538619c&t=1549547499",
            "https://7769-wish-e872ae-1252926300.tcb.qcloud.la/img/logo-finished.png?sign=1eef6603d6d67dc4f32311e612c4f485&t=1549547511",
            "https://7769-wish-e872ae-1252926300.tcb.qcloud.la/img/logo-del.png?sign=c3b1d3ed7b8025dcf5363ff37e0c865f&t=1549547532"
        ],
        wish: {
            id: null,
            content: '-',
            power: 0,
            startPower: 0,
            status: 0,
            location: "-",
            createdAt: null
        },
        logs: []
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

                if (success) {
                    obj.setData({
                        avatarUrl: userInfo.avatarUrl
                    })
                }
            });
        } else {
            this.setData({
                avatarUrl: app.globalData.user.avatarUrl
            })
        }

        // 判断是否从助力页面跳转过来这里的
        if (options && options.from == 'helpPage') {
            this.setData({
                backToHome: true
            });
        }

        // 提取愿望信息
        const db = wx.cloud.database();
        var obj = this;
        db.collection('wishes').doc(options.wishid).get({
            success(res) {
                obj.setData({
                    wish: {
                        'id': res.data._id,
                        'content': res.data.content,
                        'power': res.data.power,
                        'startPower': res.data.startPower,
                        'status': res.data.status,
                        'createdAt': datetime.toString(res.data.createdAt),
                        'location': location.getAddr(res.data.power)
                    }
                });

                // 提取愿望日志
                obj.OnGetLogs();

                // 消除红点提醒
                db.collection('wishes').doc(obj.data.wish.id).update({
                    data: {
                        logEvent: 0
                    },
                    success(res) {
                        console.log('已消除提醒！');
                    }
                });

                // 是否为今天第一次查看该愿望
                lastVisited = res.data.lastVisited;
                today = today.toLocaleDateString();
                if (!datetime.isOnDay(lastVisited, new Date())) {
                    // 今天第一次查看该愿望，获得签到奖励
                    db.collection('wishes').doc(res.data._id).update({
                        data: {
                            power: res.data.power + 20
                        },
                        success() {
                            // 添加日志记录
                            db.collection('logs').add({
                                data: {
                                    createdAt: db.serverDate(),
                                    power: 20,
                                    type: 2,
                                    wishid: res.data._id
                                },
                                success(){
                                    obj.data.logs.unshift(datetime.toDateString(new Date()) + "签到，增加20点动力。");
                                    obj.setData({
                                        ["wish.power"]: res.data.power + 20,
                                        location: location.getAddr(res.data.power + 20),
                                        logs: obj.data.logs
                                    });
                                }
                            })
                        }
                    })
                }
            },
            fail(res) {
                wx.showToast({
                    title: '该愿望不存在或已被删除！',
                    icon: 'none',
                    complete() {
                        setTimeout(function () {
                            wx.navigateBack({
                                detal: 1
                            })
                        }, 2000);
                    }
                })
            }
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow(event) {
        this.OnGetLogs();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage(res) {
        if (res.from == 'button') {
            return {
                title: "我放飞了一个愿望，快来帮我增加动力吧！",
                path: "/pages/help/help?wishid=" + this.data.wish.id,
                imageUrl: "https://7769-wish-e872ae-1252926300.tcb.qcloud.la/img/bg.png?sign=062b4a475f944c754f1b4179170afab5&t=1549552453"
            }
        } else {
            return {
                title: "新年刚过，一起来许个愿吧，说不定一不小心就实现了呢！",
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
        });
    },

    /**
     * 返回上一页
     */
    OnBack() {
        if (this.data.backToHome) {
            wx.navigateTo({
                url: '../index/index',
            });
        } else {
            wx.navigateBack({
                delta: 1
            });
        }
    },

    /**
     * 彻底删除愿望
     */
    OnDel(event) {
        var obj = this;
        wx.showModal({
            title: "确定要彻底删除该愿望？",
            content: "删除后它就从这个世界上永远的消失了哦！",
            success(res) {
                if (res.confirm) {
                    // 确认
                    const db = wx.cloud.database();

                    // 删除所有相关的日志
                    db.collection('logs').where({
                        wishid: obj.data.current_item
                    }).get({
                        success(res) {
                            for (var index in res.data) {
                                db.collection('logs').doc(res.data[index]._id).remove();
                            }
                        }
                    });

                    // 从数据库中删除该愿望
                    db.collection('wishes').doc(obj.data.wish.id).remove({
                        success(res) {
                            wx.showToast({
                                title: '已彻底删除！',
                                mask: true,
                                duration: 2000
                            });

                            setTimeout(function () {
                                wx.navigateBack({
                                    detal: 1
                                });
                            }, 2000);
                        },
                        fail(res) {
                            wx.showToast({
                                title: '网络异常，请稍后再试！',
                                mask: true,
                                icon: 'none'
                            })
                        }
                    });
                }
            },
        });
    },

    /**
     * 标记美梦成真
     */
    OnCometrue(event) {
        var obj = this;
        wx.showModal({
            title: "将该愿望标记为已实现？",
            content: "如果你的这个愿望已经实现了，请点击确定吧！",
            success(res) {
                if (res.confirm) {
                    // 确认
                    const db = wx.cloud.database();
                    db.collection('wishes').doc(obj.data.wish.id).update({
                        data: {
                            status: 1
                        },
                        success(res) {
                            wx.showToast({
                                title: '已实现愿望！',
                                mask: true,
                            });

                            // 添加日志
                            db.collection('logs').add({
                                data: {
                                    wishid: obj.data.wish.id,
                                    createdAt: db.serverDate(),
                                    type: 3
                                }, 
                                success() {
                                    obj.data.logs.unshift(datetime.toDateString(new Date()) + "，你宣布该愿望已实现！");
                                    obj.setData({
                                        logs: obj.data.logs
                                    });
                                }
                            });

                            obj.setData({
                                ["wish.status"]: 1
                            });
                        },
                        fail(res) {
                            wx.showToast({
                                title: '网络异常，请稍后重试！',
                                icon: 'none',
                                mask: true
                            })
                        }
                    });
                }
            },
        });
    },

    /**
     * 沉入海底
     */
    OnQuit(event) {
        var obj = this;
        wx.showModal({
            title: "确定要将该愿望沉入海底？",
            content: "沉入海底意味着你选择了放弃，放弃后该愿望的动力将会清零哦！并且其他人也不会再看得到你的这个愿望了哦！",
            success(res) {
                if (res.confirm) {
                    // 确认
                    const db = wx.cloud.database();
                    db.collection('wishes').doc(obj.data.wish.id).update({
                        data: {
                            status: 2
                        },
                        success(res) {
                            wx.showToast({
                                title: '已沉入海底！',
                                mask: true,
                            });

                            // 添加日志
                            db.collection('logs').add({
                                data: {
                                    wishid: obj.data.wish.id,
                                    createdAt: db.serverDate(),
                                    type: 4
                                },
                                success() {
                                    obj.data.logs.unshift(datetime.toDateString(new Date()) + "，你将该愿望沉入了海底！");
                                    obj.setData({
                                        logs: obj.data.logs
                                    });

                                    console.log('愿望已被沉入海底');
                                }
                            });

                            obj.setData({
                                ["wish.status"]: 2
                            });
                        },
                        fail(res) {
                            wx.showToast({
                                title: '网络异常，请稍后重试！',
                                icon: 'none',
                                mask: true
                            })
                        }
                    });
                }
            },
        });
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
                        text = datetime.toDateString(res.data[index].createdAt) + "，你放飞了愿望，获得" + res.data[index].power + "点初始动力。";
                        items.push(text);
                    } else if (res.data[index].type == 2) {
                        // 签到事件
                        text = datetime.toDateString(res.data[index].createdAt) + "签到，增加" + res.data[index].power + "点动力。";
                        items.push(text);
                    } else if (res.data[index].type == 3) {
                        // 愿望标记实现事件
                        text = datetime.toDateString(res.data[index].createdAt) + "，你宣布该愿望已实现！";
                        items.push(text);
                    } else if (res.data[index].type == 4) {
                        // 愿望被沉入海底事件
                        text = datetime.toDateString(res.data[index].createdAt) + "，你将该愿望沉入了海底！";
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
    }
})
