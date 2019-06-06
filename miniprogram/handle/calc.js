const location = require('location.js');

// 计算所有愿望的总power值、进行中愿望的数量、已实现愿望的数量和已沉入海底的愿望数量
function getTotal(wishItems) {
    var maxPower = 0;
    var res = {
        power: 0,
        all: 0,
        passing: 0,
        finished: 0,
        deleted: 0,
        location: "海底"
    };

    wishItems.forEach(function (e) {
        switch(e.status) {
            case 0: {
                if (e.power >= maxPower)
                    maxPower = e.power;

                res.power += e.power;
                res.passing++;
                res.all++;
            }; break;
            case 1: {
                if (e.power >= maxPower)
                    maxPower = e.power;

                res.power += e.power;
                res.finished++;
                res.all++;
            }; break;
            case 2: {
                res.deleted++;
                res.all++;
            }; break
        }
    });

    if (maxPower > 0)
        res.location = location.getAddr(maxPower);

    return res;
}

module.exports.getTotal = getTotal;