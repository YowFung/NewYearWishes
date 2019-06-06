// 登录
function getUserInfo(callback) {
    var user = {};

    // 判断是否已授权
    wx.getSetting({
        success(res) {
            if (res.authSetting['scope.userInfo']) {
                // 已授权，判断是否有本地缓存的用户信息
                const localData = wx.getStorageSync('user');

                if (localData) {
                    // 有本地缓存的用户信息
                    user = localData;
                    callback && callback(true, user);
                } else {
                    // 没有本地缓存的用户信息，调用云函数进行登录
                    wx.cloud.callFunction({
                        name: 'login',
                        success(res) {
                            // 提取 OpenID
                            user.openid = res.result.openid;

                            // 已经授权的时候可以直接获取用户信息，不会弹窗
                            wx.getUserInfo({
                                success(res) {
                                    // 提取用户信息
                                    user.avatarUrl = res.userInfo.avatarUrl;
                                    user.nickName = res.userInfo.nickName;

                                    // 设置本地缓存
                                    wx.setStorageSync('user', user);

                                    // 更新数据库的用户信息
                                    const db = wx.cloud.database();
                                    db.collection('users').doc(user.openid).update({
                                        data: {
                                            nickName: res.userInfo.nickName,
                                            avatarUrl: res.userInfo.avatarUrl,
                                            city: res.userInfo.city,
                                            country: res.userInfo.country,
                                            gender: res.userInfo.gender,
                                            language: res.userInfo.language,
                                            province: res.userInfo.province
                                        }
                                    });

                                    // 调用回调函数
                                    callback && callback(true, user);
                                },
                                fail() {
                                    callback && callback(false, user);
                                }
                            })
                        },
                        fail() {
                            callback && callback(false, user);
                        }
                    })
                }
            } else {
                // 未授权，获取用户信息失败
                callback && callback(false, user);
            }
        }, 
        fail() {
            callback && callback(false, user);
        }
    })
}

// 授权
function auth(event, callback) {
    var user = {};

    // 调用云函数获取 OpenID
    wx.cloud.callFunction({
        name: 'login',
        success(res) {
            user.openid = res.result.openid;

            // 获取用户信息
            if (event.detail.userInfo) {
                // 授权成功，提取用户信息
                user.avatarUrl = event.detail.userInfo.avatarUrl;
                user.nickName = event.detail.userInfo.nickName;

                // 用户添加或更新到数据库
                const db = wx.cloud.database();
                db.collection('users').doc(user.openid).get({
                    success() {
                        // 更新用户信息
                        db.collection('users').doc(user.openid).update({
                            data: {
                                nickName: event.detail.userInfo.nickName,
                                avatarUrl: event.detail.userInfo.avatarUrl,
                                city: event.detail.userInfo.city,
                                country: event.detail.userInfo.country,
                                gender: event.detail.userInfo.gender,
                                language: event.detail.userInfo.language,
                                province: event.detail.userInfo.province
                            }
                        });
                    },
                    fail() {
                        // 插入用户信息
                        db.collection('users').add({
                            data: {
                                _id: user.openid,
                                nickName: event.detail.userInfo.nickName,
                                avatarUrl: event.detail.userInfo.avatarUrl,
                                city: event.detail.userInfo.city,
                                country: event.detail.userInfo.country,
                                gender: event.detail.userInfo.gender,
                                language: event.detail.userInfo.language,
                                province: event.detail.userInfo.province,
                                rigesteredAt: db.serverDate(),
                            }
                        });
                    }
                });

                // 设置本地缓存
                wx.setStorageSync('user', user);

                // 调用回调函数
                callback && callback(true, user);
            } else {
                // 获取用户信息失败
                callback && callback(false, {});
            }
        },
        fail() {
            // 云函数接口调用失败
            callback && callback(false, {});
        }
    })
}

module.exports.getUserInfo = getUserInfo;
module.exports.auth = auth;