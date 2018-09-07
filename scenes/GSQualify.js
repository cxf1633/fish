"use strict";
// 限时排位赛赛(战斗场景)
wls.namespace.GSQualify = wls.namespace.GSBattle.extend
({
    onCreate: function() 
    {
        this._super();
        var str = wls.Config.get("config", 990000134).data
        var tb = wls.SplitArray(str);
        var rateMap = {}
        this.rateList = []
        for (var i = 0; i < tb.length; i++) {
            var val = parseInt(tb[i])
            rateMap[val] = {}
            rateMap[val].cur = parseInt(tb[i])
            rateMap[val].next = parseInt(tb[i+1]?tb[i+1]:tb[0])
            rateMap[val].last = parseInt(tb[i-1]?tb[i-1]:tb[tb.length-1])
            this.rateList.push(parseInt(tb[i]))
        }
        this.rateMap = rateMap
    },

    onAfterLoadRes: function()
    {
        this._super()
        wls.FishHallInst.find("UIHallMain").switchPage(-1)
        if (wls.FishHallInst.find("UIFreeMasterQueue")) {wls.FishHallInst.find("UIFreeMasterQueue").removeFromScene()}
       
        // todo
        var go = this.find("UIMainPanel")
        var parNode = go.Node_Master
        this.setGameObjectRoot(parNode);
        wls.CostType = 1

        var title = this.createGameObject("UIArenaTitle")
        title.setTitlePic("battle/images/compic/title_8rmfc.png")
        go.title = title

        this.createGameObject("UIArenaBulletCount")
        this.setGameObjectRoot(null);
        this.find("UIArenaTitle").startTime( wls.GetCurTimeFrame() + 30)

    },

    sendReady: function() {
        FG.SendMsg("sendArenaReady");
    },
    doReChargeSucceed: function(bSuccess)
    {
        cc.log("--------GSQualify------sendArenaRechargeSuccess----------------")
        this.find("SCSend").sendArenaRechargeSuccess()
    },
    //初始化特殊界面
    initViewAfterReady: function()
    {
        var cannon = this.find("GOCannon"+FG.SelfViewID)
        var newRate = this.rateList[0]
        if (newRate) {
            cannon.setGunRate(newRate);
            cannon.playGunRateChangeAni();
            cannon.requestNewGunRate(newRate)
        }
    },

    //发射扣钱
    shootCost: function(cannon,cost)
    {
        cannon.opCount(-cost);
    },
    //无效子弹回复
    shootRevert: function(cannon,cost)
    {
        cannon.opCount(cost);
    },

    //击中加钱
    hitGet: function(cannon,gunRate,fish,fishScore,isViolent)
    {
        fishScore = fishScore*gunRate
        cannon.willOpScore(fishScore);
        return {showScore : fishScore,fishScore : fishScore}
    },

    // 发射子弹 (错误码：1 子弹数达到上限, 2 炮倍未解锁, 3 金钱不够, 4子弹不够)
    laucherBullet: function(cannon,rate)
    {
        if (cannon.fnt_count.cur <= 0) { return 4 }

        // 子弹数达到上限
        if (this.DABattle.isMaxBullet()){ return 1 }

        var curRate = cannon.getGunRate()
        //超过房间最高炮倍
        if (curRate > this.rateList[this.rateList.length-1] ) {
            var gunRate = this.rateList[this.rateList.length-1]
            if (gunRate) 
            {
                cannon.requestNewGunRate(gunRate);
            }
            return 3
        }

        //子弹数不足，帮忙切换
        if (curRate > cannon.getCount() ) {
            var gunRate = this.getNextRateByCount(cannon.getCount());
            if (gunRate) 
            {
                cannon.requestNewGunRate(gunRate);
            }
            return 3
        }
        return 0
    },

    //自动切换炮倍
    getNextRateByCount: function(count)
    {
        for (var i = this.rateList.length-1; i >= 0; i--) {
            if (count >= this.rateList[i]) {
                return this.rateList[i]
            }
        }
        return 1
    },

    //点击手动切换炮倍
    doChangeGunRate: function(bNext,max,gunRate)
    {
        if (this.rateMap[gunRate]) {
            return bNext?this.rateMap[gunRate].next:this.rateMap[gunRate].last
        }
        return 1
    },

    gameOver: function(resp)
    {
        FG.AutoFire = false 
        this.find("SCTouch").stopFire()
        this.find("SKLock").stopSkill()
        var go = this.createGameObject("UIMasterResult")
        go.updateView(resp.rank,resp.score,resp.maxScore,this.getMatchId())
    },

    //0.免费挑战   1.继续挑战  2.花钱挑战  3.未开放
    getMatchjoinState: function()
    {
        var matchId = this.getMatchId()
        var matchData = wls.Config.get("match", matchId);
        var joinCount = this.find("DAPlayer").getArenaSignUpTimes(parseInt(matchId))
        var shareData = wls.Config.getShareDataById(matchData.share_id)
        var curCount = this.find("DAPlayer").getShareTimes(shareData.type)
        if (matchData.freetime > joinCount) {
            return 0
        }
        if (joinCount >= matchData.maxnum + curCount) {
            return 3
        }
        return 2
    },

});