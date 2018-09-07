//-----------------------------------------------------
// BonusWheel
//-----------------------------------------------------
wls.namespace.EFBonusWheel = wls.WrapNode.extend
({
    getZorder:function () {
        return wls.ZOrder.limitPop-1
    },
    onCreate: function(viewid)
    {
        wls.BindUI(this, this);
        var pos = FG.GetCannonPos(viewid);
        pos.y += viewid > 2 ? -200 : 200;
        this.setPosition(pos);
        this.wheel.runAction(cc.repeatForever(cc.rotateBy(1, 720)));
        this.scoreFnt.runAction(cc.repeatForever(cc.sequence(cc.rotateTo(0.48, -10), cc.rotateTo(0.48, 10))));
        this.setVisible(false);
    },

    play: function(id, score, dt)
    {
        var filename = this.fullPath("battle/images/killbonus/fishname_" + id + ".png");
        if (cc.spriteFrameCache.getSpriteFrame(filename) == null) return;
        dt = dt || 0;
        this.scoreFnt.setString(score);
        this.setOpacity(255);
        this.stopActionByTag(101);
        this.setScale(0);
        this.setVisible(false);
        this.titleName.setSpriteFrame(filename);
        var act2 = cc.callFunc(function() {
            FG.PlayEffect("rolling_02.mp3");
        });
        var act4 = cc.spawn(cc.scaleTo(0.2, 1.2), cc.fadeTo(0.2, 255));
        var act8 = cc.spawn(cc.scaleTo(0.16, 0), cc.fadeTo(0.16, 0));
        var act = cc.sequence(cc.delayTime(dt), act2, cc.show(), act4, cc.scaleTo(0.12, 1), cc.delayTime(2.5), cc.scaleTo(0.04, 1.2), act8, cc.hide());
        act.setTag(101);
        this.runAction(act);
    },
});
