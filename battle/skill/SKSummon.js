// 召唤鱼技能
wls.namespace.SKSummon = wls.SKBase.extend
({
    initSkill: function() 
    {
        cc.log("+++++++++++++++initSkill SKSummon");
        this.callFishCount = 1;
    },

    activeSkill: function()
    {
        var useType = this.calcUseType();
        FG.SendMsg("sendCallFish", useType, this.callFishCount);
        this.callFishCount++;
        this.startCoolDown()
    },

    releaseSkill: function(viewid, data)
    {
        var src = FG.AimPosList[viewid - 1];
        var dst = this.calcFishPos(data.frameId, data.pathId);
        if (dst == null) return;
        this.showLamp(src, dst); 
        FG.PlayEffect("com_btn03.mp3")
        wls.CallAfter(this, 0.88, "showSmoke", dst);
        wls.CallAfter(this, 1.08, "showSmoke", dst);
        wls.CallAfter(this, 1.18, "showFish", data);
    },

    calcFishPos: function(frame, pathid)
    {
        var offset = this.find("SCGameLoop").mbFreeze ? 0 : 5;
        frame = (FG.ClientFrame + offset - frame) * 3;
        frame = frame < 0 ? 0 : frame;
        var path = wls.Config.get("fishpathEx", pathid).pointdata;
        if (frame - path.length > 1)
        {
            return;
        }
        var x = wls.FishPathSX * (parseFloat(path[frame]))
        var y = wls.FishPathSY * (parseFloat(path[frame + 1]))
        if (FG.PlayerFlip)
        {
            x = display.width - x;
            y = display.height - y;
        }
        cc.log(x, y);
        return cc.p(x, y);
    },

    showLamp: function(src, dst)
    {
        var filename = this.fullPath("battle/images/effect/effect_lamp.png")
        var sp = cc.Sprite.create()
        sp.initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame(filename));
        this.addChild(sp);
        sp.setPosition(src);
        sp.setOpacity(0);
        var t1 = 0.88;
        sp.runAction(cc.rotateBy(t1, 360));
        sp.runAction(cc.moveTo(t1, dst));
        sp.runAction(cc.sequence(cc.delayTime(1.16), cc.removeSelf()));
        sp.runAction(cc.sequence(cc.fadeIn(0.12), cc.delayTime(0.76), cc.fadeOut(0.08)));
    },

    showSmoke: function(dst)
    {
        var filename = this.fullPath("battle/images/effect/effect_lamp_clouds.png")
        var s1 = cc.Sprite.create()
        s1.initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame(filename));
        this.addChild(s1);
        s1.setPosition(dst);
        s1.setOpacity(0);

        s1.runAction(cc.sequence(cc.fadeIn(0.6), cc.fadeOut(0.6)));
        s1.runAction(cc.sequence(cc.scaleTo(1.2, 3), cc.removeSelf()));
    },

    showFish: function(data)
    {
        this.find("SCGameLoop").addSummonFish(data);
    },
    
});