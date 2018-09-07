//-----------------------------------------------------
// boss来临
//-----------------------------------------------------
wls.namespace.EFBossComing = wls.WrapNode.extend
({
    getZorder:function () {
        return wls.ZOrder.limitPop
    },
    onCreate: function()
    {
        wls.CreateMask(this, null, false);
        wls.BindUI(this, this);
        this.Node_Ani.setPosition(display.width / 2, display.height / 2);
        var action = this.getActionManager().getActionByTag(this.Node_Ani.getTag(), this.Node_Ani);
        this.action = action;
        this.setVisible(false);
    },

    play: function(id, rate)
    {
        if (rate == 0 || id == 157)
        {
            rate = "www";
        }
        this.fnt_Rate.setString(rate);
        var filename = "battle/images/bosscome/title_pic_" + id + ".png";
        this.spr_bosscome.setSpriteFrame(this.fullPath(filename));

        this.action.play("bosscome", false);
        this.setVisible(true);
        this.runAction(cc.sequence(cc.delayTime(150 / 60.0), cc.hide()));
        FG.PlayEffect("bossalert_01.mp3");
    },
});