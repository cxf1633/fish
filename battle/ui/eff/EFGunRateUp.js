//-----------------------------------------------------
// 炮倍升级动画动画
//-----------------------------------------------------
wls.namespace.EFGunRateUp = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.limitPop-1
    },
    onCreate: function()
    {
        var spr = cc.Sprite.create()
        this.addChild(spr)
        spr.setSpriteFrame(this.fullPath("battle/images/compic/com_pic_pbtsts.png"))
        spr.setPosition(display.width / 2, display.height / 2);

        this.spr = spr
        this.play()
    },

    play: function()
    {
        var self = this
        var seq = cc.Sequence.create(cc.DelayTime.create(2),cc.FadeTo.create(1,0),cc.CallFunc.create(function () {
            self.removeFromParent()
        }))
        this.spr.runAction(seq)
    },
});
