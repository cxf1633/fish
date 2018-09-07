//-----------------------------------------------------
// 发财了特效
//-----------------------------------------------------
wls.namespace.EFMegawin = wls.WrapNode.extend
({
    getZorder:function () {
        return wls.ZOrder.limitPop+1
    },
    onCreate: function()
    {
        wls.BindUI(this, this);
        var action = this.getActionManager().getActionByTag(this.getTag(), this);
        this.action = action;
        this.setVisible(false);
        this.setPosition(display.width / 2, display.height / 2);
        this.isUsing = false

        var emitter = cc.ParticleSystem.create(this.fullPath("common/particle/partical_coin01.plist"))  
        this.addChild(emitter,0)
        emitter.setPosition(30,0)
        this.emitter = emitter
        this.emitter.setVisible(false)
        this.node_score.setLocalZOrder(10);
        this.minScore = wls.Config.getConfig("990000069")
    },

    play: function(cnt)
    {
        if (this.isUsing || cnt < this.minScore  ) { return false }
        this.isUsing = true
        var self = this
        this.fnt_coin.setString(0);
        this.setVisible(false);

        wls.CallAfter(this, 1, function(){
            FG.PlayEffect("lvup_01.mp3");
            self.setVisible(true);
            self.action.play("bigrich",false)
        });
        wls.CallAfter(this, 1+ 24/60, function(){
            self.fnt_coin.stopAllActions()
            wls.jumpingNumber(self.fnt_coin, 1,cnt, 0)
            self.emitter.setVisible(true)
            self.emitter.resetSystem()
        });
        
        wls.CallAfter(this, 1+ 180 / 60, function(){
            self.isUsing = false
            self.setVisible(false);
            self.emitter.setVisible(false)
            self.fnt_coin.stopAllActions()
            self.fnt_coin.setString(0)
            self.find("SCLayerMgr").playEFEnd()
        });
        return true
    },
    getUsing: function(cnt)
    {
        return  this.isUsing
    } 
});