// pages/look/look.js

const app = getApp();

Page({
    /**
     * 返回首页
     */
    OnBack(event) {
        wx.navigateBack({
            delta: 1
        })
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
    }
})