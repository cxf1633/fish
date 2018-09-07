//-----------------------------------------------------
// 自已炮台菜单栏
//-----------------------------------------------------
wls.namespace.WNSelfCannonMenu = wls.WrapNode.extend
({
    onCreate: function()
    {
        this.bClosing = false;
        wls.BindUI(this, this);
        this.setVisible(false);
        this.btn_autofire.origin = this.btn_autofire.getPosition();
        this.btn_face.origin = this.btn_face.getPosition();
        this.btn_changecannon.origin = this.btn_changecannon.getPosition();
    },

    click_btn_autofire: function()
    {
        this.close();
        if (this.find("DAPlayer").getMonthCardState().state == 0) 
        {
            if (FISH_DISABLE_CHARGE) {return this.dialog(1,wls.Config.getLanguage(800000463))}
            this.activeGameObject("UIFirstMonthcard");
            return;
        }
        if ((this.find("SKLock") && this.find("SKLock").isUsingSkill())
         || (this.find("SKViolent") && this.find("SKViolent").isUsingSkill()))
        {
            return;
        }
        FG.AutoFire = !FG.AutoFire;
        this.find("SCTouch").startAutoFire();
    },

    click_btn_face: function()
    {
        this.find("WNEmojiPanel").open();
        this.close();
    },

    click_btn_changecannon: function()
    {
        this.pushView("UIChangeGun");
        this.close();
    },

    onEventTouchEnded: function()
    {
        this.close();
    },

    trigger: function()
    {
        if (this.bClosing)
        {
            this.open();
        }
        else
        {
            this.close();
        }
    },

    open: function()
    {
        if (this.isVisible()) return;
        this.bClosing = false;
        this.spr_autofire.setVisible(!FG.AutoFire);
        this.spr_cancelauto.setVisible(FG.AutoFire);
        var pos = this.find("GOCannon" + FG.SelfViewID).getPosition();
        pos.y = 62;
        this.setPosition(pos);
        this.setVisible(true);
        this.showBtn(this.btn_autofire);
        this.showBtn(this.btn_face);
        this.showBtn(this.btn_changecannon);
    },

    close: function()
    {
        if (!this.isVisible()) return;
        if (this.bClosing) return;
        this.bClosing = true;
        this.hideBtn(this.btn_autofire);
        this.hideBtn(this.btn_face);
        this.hideBtn(this.btn_changecannon);
        this.runAction(cc.sequence(cc.delayTime(0.1), cc.hide()));
    },

    showBtn: function(btn)
    {
        btn.stopAllActions();
        btn.setPosition(0, 0);
        btn.setScale(0);
        btn.runAction(cc.scaleTo(0.1, 1));
        btn.runAction(cc.moveTo(0.1, btn.origin));
    },

    hideBtn: function(btn)
    {
        btn.stopAllActions();
        btn.setPosition(btn.origin);
        btn.setScale(1);
        btn.runAction(cc.scaleTo(0.1, 0));
        btn.runAction(cc.moveTo(0.1, cc.p(0, 0)));
    },
});