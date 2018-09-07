//-----------------------------------------------------
// 抽奖数据
//-----------------------------------------------------
wls.namespace.DALottery = cc.Node.extend
({
    onCreate: function()
    {
        this.rewardList = []
        this.money = 0
    },
    pushPoolReward: function (data) {
        this.rewardList.push(data)
    },

    delPoolReward: function () {
        this.rewardList.shift()
    },

    getPoolReward: function (data) {
        return this.rewardList
    },

    setPoolNum: function (val) {
        this.money = val
    },

    getPoolNum: function () {
        return this.money
    },
});