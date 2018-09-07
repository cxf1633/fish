//-----------------------------------------------------
// 开始倒计时动画
//-----------------------------------------------------
wls.namespace.EFReadyGo = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.GreenHand+20
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("battle/arena/uiarenastartani.json"), this);
        this.addChild(ccnode);
        ccnode.setScale(wls.ScaleX)
        ccnode.setPosition(display.width/2, display.height/2);
    },

    play: function(callFun)
    {
        this.inner_action.play("start",false)
        var self = this
        var seq = cc.Sequence.create(cc.DelayTime.create(285/60),cc.CallFunc.create(function () {
            if (callFun) { callFun() }
            self.removeFromParent()
        }))
        this.runAction(seq)
    },
});
