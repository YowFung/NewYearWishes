// pages/help/help.js
Page({

    data: {
        openid: ''
    },

    onLoad: function (options) {
        this.setData({
            openid: getApp().globalData.openid
        })
    }
})