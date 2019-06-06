//index.js

const app = getApp();
const login = require('../../handle/login.js');
const bgm = wx.getBackgroundAudioManager();

Page({
    data: {
        showLoginBox: false,
        isLogining: false,
        bgmOpenIcon: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        // 判断是否显示登录框
        this.setData({ 
            showLoginBox: !app.globalData.logined 
        });

        // 获取用户登录状态和信息
        var obj = this;
        if (!app.globalData.logined) {
            login.getUserInfo(function (success, userInfo) {
                app.globalData.user = userInfo;
                app.globalData.logined = success;

                obj.setData({
                    showLoginBox: !success
                });

                if(success)
                    obj.OnPlayMusic();
            });
        }
    },

    /**
     * 生命周期函数--监听小程序显示
     */
    onShow: function () {
        if (app.globalData.bgmOpen && app.globalData.logined)
            bgm.play();
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

            if (success)
                obj.OnPlayMusic();
        });
    },

    /**
     * 去许愿
     */
    OnToMakeWish(event) {
        wx.navigateTo({
            url: '../make/make',
        });
    },

    /**
     * 去看愿望清单
     */
    OnToGetLists(event) {
        wx.navigateTo({
            url: '../list/list',
        });
    },

    /**
     * 去随便看看
     */
    OnToLookOthers(event) {
        wx.navigateTo({
            url: '../look/look',
        });
    },

    /**
     * 打开/关闭背景音乐
     */
    OnMusic(event) {
        // 播放状态取反
        app.globalData.bgmOpen = !app.globalData.bgmOpen;
        this.setData({ 
            bgmOpenIcon: app.globalData.bgmOpen 
        });

        if (app.globalData.bgmOpen) {
            // 允许播放
            bgm.play();
        } else {
            // 禁止播放
            bgm.pause();
        }

        // 更新本地缓存信息
        wx.setStorageSync('bgm', app.globalData.bgmOpen)
    },

    OnPlayMusic() {
        // 读本地缓存信息，判断是否允许播放背景音乐
        const allow = wx.getStorageSync('bgm');

        if (allow === true || allow === false) {
            app.globalData.bgmOpen = allow
        }
        else {
            // 设置本地缓存信息
            wx.setStorage({
                key: 'bgm',
                data: true,
            });

            // 默认允许播放
            app.globalData.bgmOpen = true;
        }

        // 播放背景音乐
        if (app.globalData.bgmOpen) {
            playMusic();
        }

        function playMusic() {
            bgm.src = "https://7769-wish-e872ae-1252926300.tcb.qcloud.la/music/一百万个可能.mp3?sign=e5e761f2f06daf64c5eca383db23301a&t=1549513576";
            bgm.title = "Background Music";
            bgm.onEnded(() => {
                playMusic();
            });
        }

        this.setData({
            bgmOpenIcon: app.globalData.bgmOpen
        });
    }
})
