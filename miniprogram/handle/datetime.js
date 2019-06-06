// 日期时间转中文字符串，返回 xxxx年xx月xx日xx时xx分
function toString(datetime) {
    var dt = {
        year: datetime.getFullYear(),
        month: datetime.getMonth() + 1,
        day: datetime.getDate(),
        hour: datetime.getHours(),
        minute: datetime.getMinutes()
    };

    return dt.year + "年" + dt.month + "月" + dt.day + "日" + dt.hour + "时" + dt.minute + "分";
}

// 日期时间转中文字符串，返回 xx月xx日
function toDateString(dt) {
    var month = dt.getMonth() + 1;
    var day = dt.getDate();
    var res = month + "月" + day + "日";
    return res;
}

// 判断某时间是否在某天内
function isOnDay(dt, day) {
    dt = Date.parse(dt);
    day = day.toDateString();
    day = Date.parse(day);
    var tomorrow = day + 24*60*60*1000;
    if (dt >= day && dt < tomorrow)
        return true;
    else 
        return false;
}

module.exports.toString = toString;
module.exports.toDateString = toDateString;
module.exports.isOnDay = isOnDay;