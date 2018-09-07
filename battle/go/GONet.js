// 渔网
wls.namespace.GONet = cc.Node.extend
({
    onCreate: function(id)
    {
        FG.NetRoot.addChild(this, id);
        this.sprites = [];
        for (var i = 0; i < 3; i++)
        {
            var sp = cc.Sprite.create();
            this.addChild(sp);
            sp.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
            this.sprites.push(sp);
            sp.setVisible(false);
        }
        var act = cc.Sequence.create(cc.delayTime(0.5), cc.hide());
        FG.RetainAction(act);
        this.act = act;
        this.setVisible(false);
    },

    destroy: function()
    {
        this.removeFromParent(true);
    },

    updateNetView: function(config)
    {
        if (config == null) return;
        var filename = config.net_res;
        var cnt = config.net_xplot.length / 2;
        var offy = cnt == 1 ? 125 : 125
        for (var i = 0; i < this.sprites.length; i++)
        {
            var sp = this.sprites[i];
            if (i < cnt)
            {
                var animation = FG.CreateAnimation(filename, 1 / 20.0);
                sp.runAction(cc.animate(animation));
                sp.setVisible(true);
                sp.setPosition(config.net_xplot[i * 2], config.net_xplot[i * 2 + 1] - offy);
            }
            else
            {
                sp.setVisible(false);
            }
        }
    },

    play: function(x, y)
    {
        this.setVisible(true);
        this.setPosition(x, y);
        this.runAction(this.act);
    },

    isOutOfScreen: function()
    {
        return !this.isVisible();
    },
})