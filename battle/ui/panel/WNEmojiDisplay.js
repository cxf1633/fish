//-----------------------------------------------------
// 表情播放
//-----------------------------------------------------
wls.namespace.WNEmojiDisplay = wls.WrapNode.extend
({
    onCreate: function()
    {
        wls.BindUI(this, this);
        var sx = 85;
        var sy = 165;
        var offsets = [cc.p(sx, sy), cc.p(-sx, sy), cc.p(-sx, -sy), cc.p(sx, -sy)];
        for (var i = 1; i <= 4; i++)
        {
            var node = this["Node_" + i];
            var p = cc.pAdd(FG.CannonPosList[i - 1], offsets[i - 1]);
            node.setPosition(p);
            node.setVisible(false);
        }
    },

    play: function(viewid, id)
    {
        var node = this["Node_" + viewid];
        node.setVisible(true);
        node.stopAllActions();
        node.setScale(0)
        var s1 = cc.scaleTo(0.25, 1);
        var s2 = cc.scaleTo(0.13, 1, 0.9);
        var s3 = cc.scaleTo(0.12, 1);
        var d1 = cc.delayTime(2.5);
        var s4 = cc.scaleTo(0.15, 1.1);
        var s5 = cc.scaleTo(0.1, 0.1);
        node.runAction(cc.sequence(s1, s2, s3, d1, s4, s5, cc.hide()));

        var filename = "emoji" + ((id < 10) ? ("0" + id) : id);
        filename = this.fullPath("battle/images/emoji/" + filename);
        var sp = node.getChildByTag(101);
        if (sp == null)
        {
            sp = cc.Sprite.create();
            node.addChild(sp);
            sp.setTag(101)
        }
        sp.stopAllActions();
        var animation = FG.CreateAnimation(filename, 0.3);
        sp.runAction(cc.RepeatForever.create(cc.Animate.create(animation)));
    },
});
