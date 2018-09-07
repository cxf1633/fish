// 锁定技能
wls.namespace.SKLock = wls.SKBase.extend
({
    initSkill: function() 
    {
        cc.log("+++++++++++++++initSkill SKHourglass");
        this.setVisible(false);
        this.initChain();
        this.targetFish = null;
        this.cannonPos = cc.p(0, 0);
        this.violentRate = 1;
    },
    // 技能icon
    initIcon: function(icon)
    {
        var go = this.wrapGameObject(icon, "UISkillIcon", this);
        go.updateIcon();
        this.icon = go;

        var nodeLight = wls.LoadStudioNode(this.fullPath("battle/skill/uiskilllight2.json"));
        go.addChild(nodeLight,102);
        nodeLight.setScale(0.9)
        nodeLight.runAction(nodeLight.inner_action);   
        nodeLight.inner_action.play("doplay",true)
        this.useLight = nodeLight
        this.useLight.setVisible(false)

    },

    isViolent: function()
    {
        return false
    },

    isBlock: function()
    {
        var s = this.find("SKViolent");
        return (s && s.isUsingSkill());
    },

    initChain: function()
    {
        var ccnode = wls.LoadStudioNode(this.fullPath("battle/uilockchain_1.json"), this);
        this.addChild(ccnode);
        this.schedule(this.update.bind(this), 0.0);
        this.loop.runAction(cc.repeatForever(cc.rotateBy(4, 360)));
        this.arrow.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.ScaleTo.create(0.13,0.8),cc.ScaleTo.create(0.87,1))))
    },

    changeAct: function()
    {
        var seq = cc.Sequence.create(cc.ScaleTo.create(0,1.2),cc.ScaleTo.create(0.13,0.8),cc.ScaleTo.create(0.03,1))
        var tb = [            
            cc.ScaleTo.create(0.01,1.8),
            cc.ScaleTo.create(0.13,0.9),
            cc.ScaleTo.create(0.03,1)
        ]
        var spawnAct = cc.Spawn.create(cc.Sequence.create(tb),cc.RotateBy.create(0.17,80))
        this.loop.runAction(seq);
        this.arrow.runAction(spawnAct)
    },

    selectFish: function(pos)
    {
        if (pos)
        {
            var fish = this.find("SCGameLoop").findFishByPos(pos);
            if (fish)
            {
                this.targetFish = fish;
            }
        }
        else
        {
            this.targetFish = this.find("SCGameLoop").findFishByScore();
        }
        this.find("SCGameLoop").setFollowFish(FG.SelfViewID, this.targetFish);
        this.changeAct()
    },

    onTouchBegan: function(pos)
    {
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        var self = this
        if (cannon.isBankrupt) {
            self.find("SCLayerMgr").setCurShowList(2,{shopType:1})
            return 
        }
        this.selectFish(pos);
    },

    update: function()
    {
        if (!this.bUse) return;
        if (this.isBlock())
        {
            this.setVisible(false);
            return;
        }
        if (this.targetFish == null || !this.targetFish.isCanSelect())
        {
            this.selectFish();
            if (this.targetFish == null)
            {
                this.setVisible(false);
                return;
            }
        }
        this.setVisible(true);
        this.updateChain();
    },

    updateChain: function()
    {
        if (this.targetFish == null) return;
        var pos = this.targetFish.getPosition();
        this.loop.setPosition(pos);

        var offset = cc.pSub(pos, this.cannonPos)
        var addx = offset.x / 9;
        var addy = offset.y / 9;
        var orgin = cc.p(this.cannonPos.x, this.cannonPos.y)
        for (var i = 1; i < 9; i++)
        {
            orgin.x = orgin.x + addx
            orgin.y = orgin.y + addy
            this["dot" +  i].setPosition(orgin);
        }
        this.find("GOCannon" + FG.SelfViewID).updateAngleByPos(pos);
    },

    activeSkill: function()
    {
        this.find("SCTouch").stopFire();
        this.selectFish();
        var useType = this.calcUseType();
        this.icon.setTouchEnable(false)
        if (this.targetFish == null)
        {
            FG.SendMsg("sendlockFish", 0, 0, useType);
            return;
        }   
        FG.SendMsg("sendlockFish", this.targetFish.timelineid, this.targetFish.arrayid, useType);
    },

    releaseSkill: function(skillPlus)
    {
        var duration = this.duration * skillPlus / 100;
        this.usingTime = duration
        this.stopTimer(101);
        //wls.warn(duration);
        this.startTimer("onTimeOut", duration, 101, 1);
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        this.cannonPos = cannon.getCannonWorldPos();
        this.selectFish();
        this.stopTimer(102);
        this.startTimer("onTimer", FG.FIRE_INTERVAL, 102, -1);
        this.doUseSkill();
        this.updateChain();
    },

    updateUseTime: function () {
        var duration = this.usingTime + this.icon.beganFrame - wls.GetCurTimeFrame() - wls.serverTimeDis
        if (duration <= 0) {
            this.onTimeOut()
            return 
        }
        this.stopTimer(101);
        this.startTimer("onTimeOut", duration, 101, 1);
    },

    //使用标志
    doUseSkill: function()
    {
        this.bUse = true;
        this.useLight.setVisible(true)
    },

    onTimeOut: function()
    {
        this.stopSkill();
    },

    stopSkill: function()
    {
        this.stopTimer(102);
        this.setVisible(false);
        this.bUse = false;
        this.useLight.setVisible(false)
    },

    onTimer: function()
    {
        if (this.isBlock())
        {
            return;
        }
        if (this.targetFish == null)
        {
            return;
        }
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        var bullet = cannon.laucherBullet(this.violentRate);
        if (bullet == null)
        {
            this.find("SCTouch").handlerFireError();
            return;
        }
        var rate = cannon.getGunRate()
        this.getScene().shootCost(cannon,rate * this.violentRate)
        bullet.follow(this.targetFish, this.isViolent());
        FG.SendMsg("sendBullet", bullet.id, cannon.pointAngle, true, this.violentRate,rate);
    },
});


// 狂暴技能
wls.namespace.SKViolent = wls.namespace.SKLock.extend
({
    initChain: function()
    {
        var ccnode = wls.LoadStudioNode(this.fullPath("battle/uilockchain_2.json"), this);
        this.addChild(ccnode);
        this.schedule(this.update.bind(this), 0.0);
        this.loop.runAction(cc.repeatForever(cc.rotateBy(15, 360)));

        var tb = [
            cc.FadeTo.create(0, 0),
            cc.FadeTo.create(0.5, 255),
            cc.FadeTo.create(1, 0),
            cc.DelayTime.create(1)
        ]
        this.arrow.runAction(cc.RepeatForever.create(cc.Sequence.create(tb)));
    }, 

    changeAct: function()
    {
        var seq = cc.Sequence.create(cc.ScaleTo.create(0.2, 1.3), cc.ScaleTo.create(0.05, 1))
        var spawnAct = cc.Sequence.create(cc.ScaleTo.create(0.2, 1.3), cc.ScaleTo.create(0.05, 1))
        this.loop.runAction(seq);
        this.arrow.runAction(spawnAct)
    },

    // 技能icon
    initIcon: function(icon)
    {
        var go = this.wrapGameObject(icon, "UISkillIcon", this);
        go.updateIcon();
        this.icon = go;

        var nodeLight = wls.LoadStudioNode(this.fullPath("battle/skill/uiskilllight3.json"));
        go.addChild(nodeLight,102);
        nodeLight.setScale(0.85)
        nodeLight.runAction(nodeLight.inner_action);   
        nodeLight.inner_action.play("use",false)
        nodeLight.setVisible(false)
        this.relieveLight = nodeLight

        var nodeLight = wls.LoadStudioNode(this.fullPath("battle/skill/uiskilllight2.json"));
        go.addChild(nodeLight,102);
        nodeLight.setScale(0.9)
        nodeLight.runAction(nodeLight.inner_action);   
        nodeLight.inner_action.play("doplay",true)
        this.useLight = nodeLight
        this.useLight.setVisible(false)
        
    },

    relieveSkill: function() //永久解锁特效
    {
        this.relieveLight.setVisible(true)
        this.relieveLight.inner_action.play("activation2",false)
        var self = this
        wls.CallAfter(this,150/60,function () {
            self.relieveLight.setVisible(false)
            self.updateIcon()
        })
    },

    isBlock: function()
    {
        return false;
    },

    isViolent: function()
    {
        return true;
    },

    activeSkill: function()
    {
        this.find("SCTouch").stopFire();
        var useType = this.calcUseType();
        FG.SendMsg("sendUseViolent", useType);
    },

    releaseSkill: function()
    {
        this._super();
        this.find("UISkillPanel").showViolentBar(true);
    },

    stopSkill: function()
    {
        this._super();
        this.find("UISkillPanel").showViolentBar(false);
        this.find("UISkillPanel").pro.stopAllActions();
    },

    onTimeOut: function()
    {

    },

    setViolentRate: function(rate)
    {
        this.violentRate = rate;
    },

    startCoolDown: function()
    {
        this.icon.startCD(this.cd);
        this.find("UISkillPanel").runCountdownAct(this.duration);
    },
});