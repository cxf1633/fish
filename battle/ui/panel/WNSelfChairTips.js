//-----------------------------------------------------
// 自已位置提示
//-----------------------------------------------------
wls.namespace.WNSelfChairTips = wls.WrapNode.extend
({
    onCreate: function()
    {
        wls.BindUI(this, this);
        this.setVisible(false);
    },

    play: function()
    {
        this.setVisible(true);
        wls.CreateMask(this);
        var pos = this.find("GOCannon" + FG.SelfViewID).getPosition();
        pos.y = 202;
        this.Node_2.setPosition(pos);
        wls.CallAfter(this, 1.6, "hide");

        var act = cc.sequence(cc.moveBy(0.5, cc.p(0, -10)), cc.moveBy(0.5, cc.p(0, 10)), cc.moveBy(0.5, cc.p(0, -10)), cc.moveBy(0.5, cc.p(0, 10)))
        this.Node_2.runAction(act);
    },

    hide: function()
    {
        this.gotoNextState();
        this.removeFromScene();
    },
});