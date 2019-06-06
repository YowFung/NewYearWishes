// pages/list/list.js

const app = getApp();
const login = require('../../handle/login.js');
const calc = require('../../handle/calc.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showLoginBox: false,
        isLogining: false,
        tipText: "",
        filtrateArr: [
            '全部', '放飞中的', '已实现的', '沉入海底的'
        ],
        filtrateInx: 0,
        total: {
            power: 0,
            all: 0,
            passing: 0,
            finished: 0,
            deleted: 0,
            location: "海底"
        },
        current_item: null,
        iconUrls: [
            "https://7769-wish-e872ae-1252926300.tcb.qcloud.la/img/logo-heart.png?sign=6bce8d62029e36e687642637f12a2d2b&t=1549533031",
            "https://7769-wish-e872ae-1252926300.tcb.qcloud.la/img/logo-finished.png?sign=b1749313f3fad043390dfe4c9e2c136c&t=1549533050",
            "https://7769-wish-e872ae-1252926300.tcb.qcloud.la/img/logo-del.png?sign=ef98a95367eef4d401541a177a240e58&t=1549533075"
        ],
        itemClass: [
            "item", "item item-finished", "item item-deleted"
        ],
        items: []
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
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        // 获取用户的所有愿望
        const db = wx.cloud.database();
        var obj = this;
        db.collection('wishes').where({
            _openid: app.globalData.user.openid
        }).orderBy('createdAt', 'desc').get({
            success(res) {
                obj.setData({
                    items: res.data,
                    total: calc.getTotal(res.data),
                });

                // 判断是否显示提示文字
                if (obj.data.filtrateInx == 0 && obj.data.total.all == 0) {
                    obj.setData({
                        tipText: "你还没有放飞过任何愿望哦，快去放飞一个吧！"
                    });
                } else if (obj.data.filtrateInx == 1 && obj.data.total.passing == 0) {
                    obj.setData({
                        tipText: "没有正在放飞中的愿望，快去放飞一个吧！"
                    });
                } else if (obj.data.filtrateInx == 2 && obj.data.total.finished == 0) {
                    obj.setData({
                        tipText: "你还没有已实现的愿望哦！加油努力，成功在向你靠近！"
                    });
                } else if (obj.data.filtrateInx == 3 && obj.data.total.deleted == 0) {
                    obj.setData({
                        tipText: "你的愿望都没有沉入海底哦，棒棒哒！"
                    });
                } else {
                    obj.setData({
                        tipText: ""
                    });
                }
            },
            fail(res) {
                wx.showToast({
                    title: '网络异常，无法获取愿望清单，请稍后重试！',
                    mask: true,
                    icon: 'none'
                })
            }
        });
    },

    /**
     *  点击右上角菜单的“分享”选项
     */
    onShareAppMessage(res) {
        return {
            title: "新年刚过，一起来许个愿吧，说不定一不小心就实现了呢！",
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
     * 筛选器改变
     */
    OnChangeFiltrate(event) {
        var i = event.detail.value;
        this.setData({ 
            filtrateInx: i,
        });

        if (i == 0 && this.data.total.all == 0) {
            this.setData({
                tipText: "你还没有放飞过任何愿望哦，快去放飞一个吧！"
            });
        } else if (i == 1 && this.data.total.passing == 0) {
            this.setData({
                tipText: "没有正在放飞中的愿望，快去放飞一个吧！"
            });
        } else if (i == 2 && this.data.total.finished == 0) {
            this.setData({
                tipText: "你还没有已实现的愿望哦！加油努力，成功在向你靠近！"
            });
        } else if (i == 3 && this.data.total.deleted == 0) {
            this.setData({
                tipText: "你的愿望都没有沉入海底哦，棒棒哒！"
            });
        } else {
            this.setData({
                tipText: ""
            })
        }
    },

    /**
     * 选中 item
     */
    OnSelect(event) {
        var id = event.currentTarget.dataset.id;
        if (this.data.current_item == id) {
            this.setData({ current_item: null});
        } else {
            this.setData({ current_item: id });
        }
    },

    /**
     * 不选中 item
     */
    OnNoSelect(event) {
        this.setData({ current_item: null });
    },

    /**
     * 去查看愿望
     */
    OnShow(event) {
        wx.navigateTo({
            url: '../wish/wish?wishid=' + this.data.current_item,
        })
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
                    // 删除所有相关的日志
                    wx.cloud.callFunction({
                        name: 'delLogs',
                        data: {
                            wishid: obj.data.current_item
                        },
                        success(res) {
                            console.log('已删除所有相关日志');
                        }
                    })

                    // 从数据库中删除愿望
                    const db = wx.cloud.database();
                    db.collection('wishes').doc(obj.data.current_item).remove({
                        success(res) {
                            wx.showToast({
                                title: '已彻底删除！',
                                mask: true,
                            });

                            for (var index in obj.data.items) {
                                if (obj.data.items[index]._id == obj.data.current_item) {
                                    obj.data.items.splice(index, 1);
                                    obj.setData({
                                        items: obj.data.items
                                    });
                                    break;
                                }
                            }

                            obj.setData({
                                current_item: null,
                                total: calc.getTotal(obj.data.items)
                            });

                            if (obj.data.filtrateInx == 0 && obj.data.total.all == 0) {
                                obj.setData({
                                    tipText: "你还没有放飞过任何愿望哦，快去放飞一个吧！"
                                });
                            } else if (obj.data.filtrateInx == 1 && obj.data.total.passing == 0) {
                                obj.setData({
                                    tipText: "没有正在放飞中的愿望，快去放飞一个吧！"
                                });
                            } else if (obj.data.filtrateInx == 2 && obj.data.total.finished == 0) {
                                obj.setData({
                                    tipText: "你还没有已实现的愿望哦！加油努力，成功在向你靠近！"
                                });
                            } else if (obj.data.filtrateInx == 3 && obj.data.total.deleted == 0) {
                                obj.setData({
                                    tipText: "你的愿望都没有沉入海底哦，棒棒哒！"
                                });
                            }
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
                    db.collection('wishes').doc(obj.data.current_item).update({
                        data: {
                            status: 1
                        },
                        success(res) {
                            wx.showToast({
                                title: '已实现该愿望！',
                                mask: true,
                            });

                            // 添加日志
                            db.collection('logs').add({
                                data: {
                                    wishid: obj.data.current_item,
                                    createdAt: db.serverDate(),
                                    type: 3
                                },
                                success() {
                                    console.log('愿望已被实现！');
                                }
                            });

                            for (var index in obj.data.items) {
                                if (obj.data.items[index]._id == obj.data.current_item) {
                                    obj.setData({
                                        ["items[" + index + "].status"]: 1
                                    })
                                    break;
                                }
                            }

                            obj.setData({
                                total: calc.getTotal(obj.data.items)
                            });

                            if (obj.data.filtrateInx == 1 && obj.data.total.passing == 0) {
                                obj.setData({
                                    tipText: "没有正在放飞中的愿望，快去放飞一个吧！"
                                });
                            }
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
                    const db = wx.cloud.database();
                    db.collection('wishes').doc(obj.data.current_item).update({
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
                                    wishid: obj.data.current_item,
                                    createdAt: db.serverDate(),
                                    type: 4
                                },
                                success() {
                                    console.log('愿望已被沉入海底');
                                }
                            });

                            for (var index in obj.data.items) {
                                if (obj.data.items[index]._id == obj.data.current_item) {
                                    obj.setData({
                                        ["items[" + index + "].status"]: 2
                                    })
                                    break;
                                }
                            }

                            obj.setData({
                                total: calc.getTotal(obj.data.items)
                            });
                            
                            if (obj.data.filtrateInx == 1 && obj.data.total.passing == 0) {
                                obj.setData({
                                    tipText: "没有正在放飞中的愿望，快去放飞一个吧！"
                                });
                            }
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
     * 去放飞愿望
     */
    OnToMake(event) {
        wx.navigateTo({
            url: '../make/make',
        })
    }
})