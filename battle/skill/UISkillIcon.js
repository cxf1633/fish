//-----------------------------------------------------
// 技能icon
//-----------------------------------------------------
wls.namespace.UISkillIcon = wls.WrapNode.extend
({
    onCreate: function(delegate)
    {
        this.delegate = delegate;
        wls.BindUI(this, this);
        var picname = delegate.getIconFilename();
        this.spr_lock.setSpriteFrame(picname);
        this.spr_gray.setVisible(false);

        var p = new cc.ProgressTimer(this.spr_gray);
        p.type = cc.ProgressTimer.TYPE_RADIAL;
        this.addChild(p,98);
        p.setPercentage(100);
        p.setPosition(this.spr_gray.getPosition());
        p.setVisible(false);
        this.pro = p;
        this.bEnable = true;
        this.beganFrame = 0

        this.num_bg.setLocalZOrder(99)
        this.spr_diamonds.setLocalZOrder(100)
        this.fnt_count.setLocalZOrder(100)
    },

    setTouchEnable: function(bEnable)
    {
        this.bEnable = bEnable;
    },

    startCD: function(t1)
    {
        this.beganFrame = wls.GetCurTimeFrame() + wls.serverTimeDis
        var p = this.pro;
        p.setPercentage(100);
        p.setVisible(true);
        p.stopAllActions();
        var self = this
        var act = cc.sequence(cc.progressTo(t1, 0),cc.CallFunc.create(function () {
            self.onCoolDownEnd()
        }));
        p.runAction(act);
        this.bEnable = false;
        //wls.CallAfter(this, t1, "onCoolDownEnd");
    },
    updateCD: function(allTime)
    {
        var p = this.pro;
        p.stopAllActions();
        var dis = this.beganFrame + this.delegate.cd - wls.GetCurTimeFrame() - wls.serverTimeDis
        if (dis <= 0) {
            this.onCoolDownEnd()
            p.setPercentage(0);
            return 
        }
        p.setPercentage(dis/allTime*100);
        p.setVisible(true);
        
        var self = this
        var act = cc.sequence(cc.progressTo(dis, 0),cc.CallFunc.create(function () {
            self.onCoolDownEnd()
        }));
        p.runAction(act);
    },

    onCoolDownEnd: function()
    {
        this.bEnable = true;
        this.pro.setVisible(false);
    },

    click_btn_skill: function()
    {
        if (!this.bEnable) 
        {
            return;
        }
        this.delegate.doActiveSkill();
    },

    updateIcon: function()
    {
        this.updateAmount();
        var picname = this.delegate.getIconFilename();
        this.spr_lock.setSpriteFrame(picname);
    },

    updateAmount: function()
    {
        var amount = this.delegate.getAmount();
        if (amount > 0 || !this.delegate.can_buy)
        {
            this.num_bg.setVisible(false);
            this.spr_diamonds.setVisible(false);
            this.fnt_count.setScale(1);
            this.fnt_count.setString(amount);
        }
        else
        {
            var cost = this.delegate.getCost();
            this.num_bg.setVisible(true);
            this.spr_diamonds.setVisible(true);
            this.fnt_count.setString(cost);
            this.fnt_count.setScale(1);
            var w = this.fnt_count.getContentSize().width;
            if (cost > 999)
            {
                this.fnt_count.setScale(0.8);
            }
            else if(cost > 99)
            {
                this.fnt_count.setScale(0.9);
            }
            var w1 = this.spr_diamonds.getContentSize().width / 2 * this.spr_diamonds.getScale();
            this.spr_diamonds.x = this.fnt_count.x - (w * this.fnt_count.getScale()) - w1;
        }
    },

    showUseState: function(bUse)
    {
        var node = this.find("UISkillPanel");
        node.node_bomb_light.setVisible(bUse);
        node.node_bomb_light.setPosition(this.getPosition());
    },
});