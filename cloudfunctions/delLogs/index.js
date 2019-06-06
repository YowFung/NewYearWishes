// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();

/**
 * 云函数--批量删除某愿望相关的所有日志记录
 */
exports.main = async (event, context) => {
    const wishid = event.wishid;
    try {
        return await db.collection('logs').where({
            wishid: wishid
        }).remove();
    } catch (e) {
        console.error(e);
    }
}