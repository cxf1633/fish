"use strict";
// 大师赛(战斗场景)
wls.namespace.GSMaster = wls.namespace.GSBattle.extend
({
    onCreate: function() 
    {
        this._super();
    },

    onAfterLoadRes: function()
    {
        this._super();
        wls.CostType = 2
        this.cannon_min = 1000
        this.setMatchId(500002000)
        // todo
        this.createGameObject("DAMaster");
        var go = this.find("UIMainPanel")
        var parNode = go.Node_Master
        this.setGameObjectRoot(parNode);

        this.createGameObject("UIMasterBtn");
        this.createGameObject("UIMasterBar");

        var title = cc.Sprite.create()
        title.setSpriteFrame(go.fullPath("battle/images/compic/title_dss.png"))
        parNode.addChild(title)
        title.pos = cc.p(display.width/2,display.height-title.getContentSize().height/2)
        title.setPosition(title.pos)
        go.title = title
        
        this.setGameObjectRoot(null);
        this.find("SCSend").sendGetMasterStatus()
        this.find("SCSend").sendGetAllTaskInfo()
        
    },

    //发射扣钱
    shootCost: function(cannon,cost)
    {
        cannon.opCoin(-cost);
        cannon.opCount(-1);
    },
    //无效子弹回复
    shootRevert: function(cannon,cost)
    {
        cannon.opCoin(cost);
        cannon.opCount(1);
    },

    //击中加钱
    hitGet: function(cannon,gunRate,fish,fishScore,isViolent)
    {
        var t = fish.config.trace_type;
        var showScore = this.calcFishScore(t, fishScore, gunRate);
        fishScore = Math.round(fishScore*(isViolent?0.8:1))
        cannon.willOpCoin(showScore);
        cannon.willOpScore(fishScore);
        return {showScore : showScore,fishScore : fishScore}
    },

    // 发射子弹 (错误码：1 子弹数达到上限, 2 炮倍未解锁, 3 金钱不够, 4子弹不够)
    laucherBullet: function(cannon,rate)
    {
        if (cannon.fnt_count.cur <=0) return 4
        
        var go = this.DABattle;
        // 子弹数达到上限
        if (go.isMaxBullet())return 1
        // 炮倍未解锁
        if (cannon.spr_gun_lock.isVisible())return 2

        rate = rate || 1;
        var curRate = cannon.getGunRate()

        // 金钱不够
        if ( cannon.getCoin() < curRate * rate)
        {
            var gunRate = go.getGunRateByCoin(cannon.getCoin(), curRate, rate);
            if (cannon.getCoin() >= gunRate*rate) 
            {
                cannon.requestNewGunRate(gunRate);
            }
            return 3
        }

        var minLimit = cannon.getMaxGunRate()
        minLimit = minLimit < this.cannon_min ? minLimit : this.cannon_min
        //钱够了房间最低限制 就切换到房间最低炮倍
        if (curRate < minLimit && cannon.getCoin()/rate >= minLimit) 
        {
            var gunRate = go.getGunRateByCoin(cannon.getCoin(), curRate, rate);
            gunRate = (gunRate>cannon.maxGunRate?cannon.maxGunRate:gunRate)
            if (cannon.getCoin() >= gunRate*rate) 
            {
                cannon.requestNewGunRate(gunRate);
            }
            return 3
        }
        return 0
    },

    //点击手动切换炮倍
    doChangeGunRate: function(bNext,max,gunRate)
    {
        if (max < 1000) { 
            this.toast(wls.Config.getLanguage(800000467))
            return 
        }
        return this._super(bNext,max,gunRate);
    },

    gameOver: function(resp)
    {
        cc.log("---------------MSGS2CMasterResult-----1--------")
        FG.AutoFire = false 
        this.find("SCTouch").stopFire()
        this.find("SKLock").stopSkill()
        this.find("SKViolent").stopSkill()
        var go = this.createGameObject("UIMasterResult")
        go.updateView(resp.rank,resp.score,resp.maxScore,this.getMatchId())
    },

    //0.免费挑战   1.继续挑战  2.花钱挑战  3.未开放
    getMatchjoinState: function()
    {
        var state = this.find("DAMaster").getCurMasterType()
        if ( state == 3 ||state == 4 ||state == 5 ) {
            state = 3
        }
        return state
    },

});