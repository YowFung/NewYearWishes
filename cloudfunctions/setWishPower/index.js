// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();

/**
 * 云函数--向愿望添加power值，并设置日志提醒
 */
exports.main = async (event, context) => {
    const newPower = event.power;
    const wishid = event.wishid;

    try {
        // 获取原有的power值
        var wishes = await db.collection('wishes').doc(wishid).get();
        var nowPower = wishes.data.power;
        console.log(wishes);
        console.log(wishes.data.power);

        // 更新power值及logEvent
        return await db.collection('wishes').doc(wishid).update({
            data: {
                power: nowPower + newPower,
                logEvent: 1
            }
        });
    } catch (e) {
        console.error(e);
    }
}