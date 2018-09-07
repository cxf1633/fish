//-----------------------------------------------------
// 闪电鱼死亡特效
//-----------------------------------------------------
wls.namespace.EFLighting = wls.WrapNode.extend
({
    onCreate: function()
    {
        this.startPos = cc.p(0, 0);
        this.bStart = false;
    },

    // 开启闪电
    startLighting: function(pos)
    {
        this.startPos.x = pos.x;
        this.startPos.y = pos.y;
        this.bStart = true;
        var self = this;
        this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(function(){
            self.setVisible(false);
            self.removeAllChildren();
        })));
        self.setVisible(true);
    },

    // 开启闪点结点
    addLighting: function(pos)
    {
        if (!this.bStart) return;
        var ball = cc.Sprite.create();
        this.addChild(ball, 1);
        ball.setScale(0.7);
        ball.setSpriteFrame(this.fullPath("battle/images/effect/lightningball.png"));
        ball.setPosition(pos);

        var thunder = cc.Sprite.create();
        this.addChild(thunder);
        thunder.setAnchorPoint(0.5, 0);
        var filename = this.fullPath("battle/images/effect/lightning")
        var animation = FG.CreateAnimation(filename, 1 / 10.0);
        thunder.runAction(cc.repeatForever(cc.Animate.create(animation)));
        thunder.setPosition(pos);
        var offset = cc.pSub(pos, this.startPos);
        var scaleY = cc.pGetLength(offset) / 400;
        thunder.setScaleY(scaleY);

        var rotation = wls.Atan2(offset.y, offset.x);
        thunder.setRotation(270 - rotation);

    },

    // 结束闪电
    endLighting: function()
    {
        this.bStart = false;
    },
});