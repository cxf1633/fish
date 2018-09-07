"use strict";
// 8人免费赛(战斗场景)
wls.namespace.GSZArena = wls.namespace.GSBattle.extend
({
    onCreate: function() 
    {
        this._super();
        var str = wls.Config.get("config", 990000130).data
        var tb = wls.SplitArray(str)
        var map = {}
        var list = []
        for (var i = 0; i < tb.length; i++) {
            map[parseInt(tb[i])] = parseInt(tb[i + 1])
            list.push({count:parseInt(tb[i]),rate:parseInt(tb[i + 1])})
            i++
        }
        this.countMap = map
        this.countlist = list
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
        //title.setTitlePicById(500002000)
        go.title = title
        this.createGameObject("UIArenaRank").updateView()
        this.createGameObject("UIArenaBulletCount")
        this.setGameObjectRoot(null);
        this.find("UIArenaTitle").startTime( wls.GetCurTimeFrame() + 30)
    },

    sendReady: function() {
        FG.SendMsg("sendArenaReady");
    },
    doReChargeSucceed: function(bSuccess)
    {
        cc.log("--------GSZArean------sendArenaRechargeSuccess----------------")
        this.find("SCSend").sendArenaRechargeSuccess()
    },
    //初始化特殊界面
    initViewAfterReady: function()
    {
        var cannon = this.find("GOCannon"+FG.SelfViewID)
        var newRate = this.getRateByCount(cannon.getCount())
        if (newRate) {
            cannon.setGunRate(newRate);
            cannon.playGunRateChangeAni();
            cannon.requestNewGunRate(newRate)
        }
    },

    getRateByCount: function(count)
    {
        count = count || this.find("GOCannon"+FG.SelfViewID).getCount()
        for (var i = this.countlist.length-1; i >= 0; i--) {
            var element = this.countlist[i];
            if (count <= element.count) {
                return element.rate
            }
        }
    },

    //发射扣钱
    shootCost: function(cannon,cost)
    {
        cannon.opCount(-1);
        if (!cannon.is_self) { return }
        var newRate = this.countMap[cannon.getCount()]
        if (newRate) {
            cannon.setGunRate(newRate);
            cannon.playGunRateChangeAni();
        }
    },
    //无效子弹回复
    shootRevert: function(cannon,cost)
    {
        cannon.opCount(1);
        if (!cannon.is_self) { return }
        var newRate = this.getRateByCount(cannon.getCount())
        if (newRate) {
            cannon.setGunRate(newRate);
            cannon.playGunRateChangeAni();
        }
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
        if (cannon.fnt_count.cur <=0) {
            return 4
        }
        var go = this.DABattle;
        // 子弹数达到上限
        if (go.isMaxBullet())
        {
            return 1
        }
        return 0
    },

    countOver: function()
    {
        this.createGameObject("UIArenaWaitEnd").startTime(this.find("UIArenaTitle").getEndTime())
    },

    gameOver: function(resp)
    {
        FG.AutoFire = false 
        this.find("SCTouch").stopFire()
        if (resp.players.length == 0) { this.toast("比赛结束"); return}
        this.createGameObject("UIArenaResult", resp.players)
        if (this.find("UIArenaWaitEnd")) {
            this.find("UIArenaWaitEnd").removeFromScene()
        }
    },

});