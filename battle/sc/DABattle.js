// 战斗中数据
wls.namespace.DABattle = cc.Node.extend
({
    onCreate: function() 
    {
        this.bulletIdx = 0;
        this.bulletCnt = 0;

        this.jackpot = {};
        this.jackpot.killRewardFishInDay = 0;
        this.jackpot.drawRequireRewardFishCount = 0;
        this.jackpot.rewardRate = 0;
    },

    // 初始化奖池数据
    initJackpot: function(p1, p2, p3)
    {
        this.jackpot.killRewardFishInDay = p1;
        this.jackpot.drawRequireRewardFishCount = p2;
        this.jackpot.rewardRate = p3;
    },

    getJackpot: function()
    {
        return this.jackpot;
    },

    // 创建子弹id
    createBulletID: function()
    {
        if (this.bulletID == null)
        {
            this.bulletID = FG.GetSelfPlayer().playerId + "";
        }
        var id = this.bulletID + this.bulletIdx;
        this.bulletIdx++;
        if (this.bulletIdx > 100)
        {
            this.bulletIdx = 0;
        }
        return id;
    },

    // 修改子弹数
    modifyBulletCnt: function(viewid, val)
    {
        //cc.log(viewid, val, this.bulletCnt + val);
        if (viewid != FG.SelfViewID) return;
        this.bulletCnt += val;
    },

    // 是否达到最大子弹数
    isMaxBullet: function()
    {
        return this.bulletCnt >= 25;
    },

    //选择适合的炮倍 当前金币 当前炮倍 当前子弹倍率
    getGunRateByCoin: function(coin, curGunRate, rate) {
        var list = wls.Config.getAll("cannon").rates
        var beginIndex = 0
        var endIndex = list.length
        for (var i = 0; i < list.length/2; i++) {
            var midIndex = Math.floor((beginIndex+endIndex)/2)
            if (curGunRate < list[midIndex]) {
                endIndex = midIndex
            } else if (curGunRate > list[midIndex]) {
                beginIndex = midIndex
            } else {
                endIndex = midIndex
                break
            }
        }

        var needCostCoin = curGunRate*rate
        if (coin > needCostCoin) {
            //升炮
            for (var i = list.length-1; i >= endIndex; i--) {
                if (coin >= list[i]*rate) {
                    return list[i]
                }
            }
        } else if (coin < needCostCoin) {
            //降炮
            for (var i = endIndex; i >= 0; i--) {
                if (coin >= list[i]*rate) {
                    return list[i]
                }
            }
        } else {
            return curGunRate
        }
    },

    // 计算前后切换炮倍
    calcChangeRate: function(rate, max, bNext,room_min)
    {
        var ret = 0;
        var min = room_min || wls.roomData.cannon_min
        if (bNext)
        {
            if (rate == max)
            {
                return min;
            }
            ret = wls.Config.getNextGunRate(rate);
            if (ret == null)
            {
                return min;
            }
            return ret;
        }
        else
        {
            if (rate == min)
            {
                return max;
            }
            ret = wls.Config.getPreGunRate(rate);
            if (ret == null)
            {
                return max;
            }
            return ret;
        }
    },

    // 计算升级炮的开销与奖励
    calcUpgradeGunInfo: function(rate)
    {
        var config = wls.Config.get("cannon", rate);
        if (!config) return;
        var ret = {};
        var unlock_award = config.unlock_award
        // TODO: 这里因为配置表的修改，unlock_award是number类型，使用split方法报错
        ret.rewardId = 1;
        ret.rewardId = unlock_award;
        ret.cost = config.unlock_gem;
        return ret;
    },
});