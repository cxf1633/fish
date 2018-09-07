// 冰冻技能
wls.namespace.SKFreeze = wls.SKBase.extend
({
    initSkill: function() 
    {
        cc.log("+++++++++++++++initSkill SKFreeze");
        var sp = cc.Sprite.create(wls.CheckPath(this.fullPath("battle/images/battleUI/effect_fullfz.png")));
        this.addChild(sp);
        sp.setPosition(display.width / 2, display.height / 2);
        sp.setScale(wls.MainScale * 2.01);
        sp.setVisible(false);
        this.sp = sp;
        this.bEffect = false;
    },

    doActiveSkill: function()
    {
        if (this.find("UIRewardTask")) {
            this.toast(wls.Config.getLanguage(800000423));
            return 
        }
        if (!this.isCanUse())
        {
            return;
        }
        this.activeSkill();
        this.find("UISkillPanel").doCost(this.id, FG.SelfViewID, this.calcUseType());
    },

    activeSkill: function()
    {
        if (this.find("UIRewardTask")) {
            this.toast(wls.Config.getLanguage(800000423));
            return 
        }
        var useType = this.calcUseType();
        FG.SendMsg("sendFreezeStart", useType);
        this.icon.setTouchEnable(false)
    },

    releaseSkill: function()
    {
        if (this.bEffect) return;
        this.bEffect = true;
        FG.PlayEffect("fishfreeze_01.mp3");
        this.sp.stopAllActions();
        this.sp.setOpacity(0);
        this.sp.setVisible(true);
        this.sp.runAction(cc.fadeIn(0.8));
        this.find("SCGameLoop").setFreeze(true);
    },

    stopSkill: function()
    {
        this.bEffect = false;
        this.sp.runAction(cc.sequence(cc.fadeOut(0.8), cc.hide()));
        this.find("SCGameLoop").setFreeze(false);
    },
    
});