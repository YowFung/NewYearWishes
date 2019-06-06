const location = {
    '地平线': 0,
    '比萨斜塔': 56,
    '英国大本钟': 96,
    '胡夫金字塔': 146,
    '普陀山': 288,
    '埃菲尔铁塔': 300,
    '琅琊山': 317,
    '丹霞山': 408,
    '长城山海关': 519,
    '广州塔': 595,
    '上海塔': 632,
    '长城雁门关': 899,
    '雁荡山': 1056,
    '井冈山': 1179,
    '长城嘉峪关': 1248,
    '骊山': 1302,
    '庐山': 1474,
    '泰山': 1524,
    '武当山': 1612,
    '黄山': 1864,
    '恒山': 2016,
    '武夷山': 2158,
    '华山': 2154,
    '大娄山': 2251,
    '梵净山': 2572,
    '峨眉山': 3099,
    '昆仑山': 4767,
    '珠穆朗玛峰': 8844
};

// 根据power值获取愿望当前所在的位置
function getAddr(power) {
    var currAddr = "";
    var maxPower = 0;
    for (var addr in location) {
        if (location[addr] >= maxPower && location[addr] <= power) {
            maxPower = location[addr];
            currAddr = addr;
        }
    }
    return currAddr;
}

// 根据power值获取愿望经历过的所有位置
function getPassingAddrs(power) {
    var addrs = [];
    for (var addr in location) {
        if (location[addr] <= power)
            addrs.push({addr: location[addr]});
    }

    return addrs;
}

module.exports.getAddr = getAddr;
module.exports.getPassingAddrs = getPassingAddrs;
