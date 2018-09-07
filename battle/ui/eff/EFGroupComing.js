//-----------------------------------------------------
// 鱼潮来临
//-----------------------------------------------------
wls.namespace.EFGroupComing = wls.WrapNode.extend
({
    getZorder:function () {
        return wls.ZOrder.limitPop
    },
    onCreate: function()
    {
        wls.CreateMask(this, 64, false);
        wls.BindUI(this, this);
        this.Node_Ani.setPosition(display.width / 2, display.height / 2);
        var scaleY = this.Node_Ani.getScaleY();
        this.Node_Ani.setScaleY(scaleY*wls.ScaleY);
        var action = this.getActionManager().getActionByTag(this.Node_Ani.getTag(), this.Node_Ani);
        this.action = action;
        this.setVisible(false);
    },

    play: function(callback)
    {
        this.callback = callback;
        this.setVisible(true);
        this.action.play("fishgroupcome", false);
        this.find('SCSound').playEffect("music_fishgroup.mp3", false);
        this.runAction(cc.sequence(cc.delayTime(80 / 60.0),cc.CallFunc.create(callback),cc.delayTime(80 / 60.0), cc.hide()));
    },
});