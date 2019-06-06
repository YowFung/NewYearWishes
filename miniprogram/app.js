//app.js

const bgm = wx.getBackgroundAudioManager();
const login = require('./handle/login.js');

App({
    /**
     * 生命周期函数--监听小程序启动
     */
    onLaunch: function () {
        // 检查是否部署云函数环境
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力');
            wx.redirectTo({
                url: '../error/error',
            });
            return;
        } else {
            wx.cloud.init({
                traceUser: true,
            });
        }

        // 定义全局变量
        this.globalData = {
            bgmOpen: false, 
            logined: false,
            user: {
                openid: null,
                avatarUrl: null,
                nickName: null
            }
        }
    },

    /**
     * 生命周期函数--监听小程序显示
     */
    onShow: function () {
        if (this.globalData.bgmOpen)
            bgm.play();
    },
    
    /**
     * 生命周期函数--监听小程序隐藏
     */
    onHide: function () {
        if (this.globalData.bgmOpen)
            bgm.pause();
    }
})
