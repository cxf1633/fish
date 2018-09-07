// 核弹1
wls.SKBombBase = wls.SKBase.extend
({
    initSkill: function() 
    {
        var tips = cc.Sprite.create();
        this.addChild(tips);
        var act1 = cc.sequence(cc.fadeIn(0.32), cc.fadeTo(0.32, 204), cc.delayTime(0.32));
        tips.runAction(cc.repeatForever(act1)); 
        tips.setVisible(false);
        this.tips = tips;
        this.range = parseInt(wls.Config.get("bomb", 200000000 + this.id).range);
    },

    cancelSkill: function()
    {
        this.showTips(false);
        this.bUse = false;
    },

    doActiveSkill: function()
    {
        if (this.bUse)
        {
            this.cancelSkill();
            return;
        }

        if (this.find("UIRewardTask")) {
            this.toast(wls.Config.getLanguage(800000423));
            return 
        }

        if (!this.isCanUse())
        {
            return;
        }
        this.find("UISkillPanel").cancalBombSkill();
        // wls.CostBombTips = true;
        // if (!wls.CostBombTips)
        // {
        //     var self = this;
        //     this.dialog(4, wls.Config.getLanguage(800000110), function(ret, ishook){
        //         if (ret == 2) return;
        //         wls.CostBombTips = !ishook;
        //         self.showTips(true);
        //         self.doUseSkill();
        //     });
        //     return;
        // }
        this.showTips(true);
        this.doUseSkill();
    },

    // 自己炮台上的文字提示
    showTips: function(bVisible)
    {
        this.icon.showUseState(bVisible);
        this.tips.setVisible(bVisible);
        if (bVisible)
        {
            var pos = FG.GetCannonPos(FG.SelfViewID);
            var filename = this.fullPath("battle/images/nuclear/nuclear_tips_" + this.id + ".png");
            this.tips.setSpriteFrame(filename);
            pos.y += 240;
            this.tips.setPosition(pos);
        }
    },

    onTouchBegan: function(pos)
    {
        FG.PlayEffect("lock_01.mp3");
        pos.x = pos.x / display.width * 10000;
        pos.y = pos.y / display.height * 10000;
        var useType = this.calcUseType();
        FG.SendMsg("sendNBomb", pos.x, pos.y, useType, this.id);
        this.startCoolDown();
        this.find("UISkillPanel").doCost(this.id, FG.SelfViewID, this.calcUseType());
        this.showTips(false);
        this.bUse = false;
    },

    releaseSkill: function(viewid, resp)
    {
        cc.log(resp);
        var pos = cc.p(resp.pointX / 10000 * display.width, resp.pointY / 10000 * display.height);
        if (viewid > 2)
        {
            pos.x = display.width - pos.x;
            pos.y = display.height - pos.y;
        }
        this.playEffect(pos);
        var self = this;
        if (viewid == FG.SelfViewID)
        {
            wls.CallAfter(this, this.getHitDuration(), function(){
                self.sendHitFish(pos, resp.nBombId);
            });
        }
    },

    playEffect: function(pos) {},
    getHitDuration: function() { return 1},

    // 发送击中鱼
    sendHitFish: function(pos, bombid)
    {
        var tb = this.find("SCGameLoop").calcBombFish(pos, this.range);
        FG.SendMsg("sendNBombBalst", bombid, tb);
    },
});

// 核弹1
wls.namespace.SKBomb15 = wls.SKBombBase.extend
({
    initSkill: function() 
    {
        this._super();
        cc.log("+++++++++++++++initSkill SKBomb15");
    },

    playEffect: function(pos)
    {
        var node = wls.LoadStudioNode(this.fullPath("battle/EffectBomb15.json"));
        this.addChild(node);
        wls.BindUI(node, node);
        node.effect1.setPosition(pos);
        node.effect3.setPosition(pos);
        node.effect1.setVisible(false);
        node.effect3.setVisible(false);

        node.effect1.setVisible(true);
        wls.PlayTimelineAction(node.effect1);
        wls.CallAfter(this, 100 / 60, function(){
            FG.PlayEffect("bomb_01.mp3");
            node.effect3.setVisible(true);
            node.effect1.setVisible(false);
            wls.PlayTimelineAction(node.effect3);
        });

        wls.CallAfter(this, 149 / 60, function(){
            node.removeFromParent(true);
        });
    },

    getHitDuration: function()
    {
        return 100 / 60;
    },  
});


// 核弹2
wls.namespace.SKBomb6 = wls.SKBombBase.extend
({
    initSkill: function() 
    {
        this._super();
        cc.log("+++++++++++++++initSkill SKBomb2");
    },

    playEffect: function(pos)
    {
        var node = wls.LoadStudioNode(this.fullPath("battle/EffectBomb6.json"));
        this.addChild(node);
        wls.BindUI(node, node);

        node.effect1_1.setPosition(pos);
        node.effect1_2.setPosition(pos);
        node.effect2.setPosition(pos);
        node.effect3.setPosition(pos);

        node.effect2.setVisible(false);
        node.effect3.setVisible(false);

        wls.PlayTimelineAction(node.effect1_1, null, false);
        wls.PlayTimelineAction(node.effect1_2, null, false);
        var t = 100;
        wls.CallAfter(this, 50 / 60, function(){
            FG.PlayEffect("bombdown_01.mp3");
            node.effect2.setVisible(true);
            wls.PlayTimelineAction(node.effect2, null, false);
        });

        wls.CallAfter(this, 165 / 60, function(){
            node.effect1_1.setVisible(false);
            node.effect1_2.setVisible(false);
        });

        wls.CallAfter(this, (50 + 165) / 60, function(){
            node.effect2.setVisible(false);
        });

        wls.CallAfter(this, (50 + 165) / 60, function(){
            FG.PlayEffect("bomb_01.mp3");
            node.effect3.setVisible(true);
            wls.PlayTimelineAction(node.effect3, null, false);
        });

        wls.CallAfter(this, (50 + 165 + 40) / 60, function(){
            node.effect3.setVisible(false);
            node.removeFromParent(true);
        });
    },

    getHitDuration: function()
    {
        return (50 + 165) / 60;
    }, 
});


// 核弹1
wls.namespace.SKBomb16 = wls.SKBombBase.extend
({
    initSkill: function() 
    {
        this._super();
        cc.log("+++++++++++++++initSkill SKBomb3");
    },

    playEffect: function(pos)
    {
        var node = wls.LoadStudioNode(this.fullPath("battle/EffectBomb16.json"));
        this.addChild(node);
        wls.BindUI(node, node);
        var self = this
        node.effect1.setPosition(pos);
        node.effect2.setPosition(pos);
        node.effect3.setPosition(pos);

        node.effect1.setVisible(true);
        wls.PlayTimelineAction(node.effect1, null, false);
        FG.PlayEffect("bomb_02.mp3");
        wls.CallAfter(this, 95 / 60, function(){
            wls.PlayTimelineAction(node.effect2, null, false);
        });

        wls.CallAfter(this, (95 + 145) / 60, function(){
            self.find("UIBackGround").shake(1 / 15, 20);
            FG.PlayEffect("bomb_03.mp3");
            wls.PlayTimelineAction(node.effect3, null, false);
        });

        wls.CallAfter(this, (95 + 145 + 130) / 60, function(){
            node.removeFromParent(true);
        });
    },

    getHitDuration: function()
    {
        return (95 + 145 + 15) / 60;
    },  
});


// 核弹21
wls.namespace.SKBomb21 = wls.namespace.SKBomb15.extend
({
});


// 核弹22
wls.namespace.SKBomb22 = wls.namespace.SKBomb15.extend
({
 
});

// 核弹23
wls.namespace.SKBomb23 = wls.namespace.SKBomb15.extend
({
 
});