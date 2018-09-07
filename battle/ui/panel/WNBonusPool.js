//-----------------------------------------------------
// 大奖池面板
//-----------------------------------------------------
wls.namespace.WNBonusPool = wls.WrapNode.extend
({
    onCreate: function()
    {
        this.setScale(wls.MinScale)
        wls.BindUI(this, this);
        var action = this.getActionManager().getActionByTag(this.getTag(), this);
        this.action = action;
        this.img_bg_1.setTouchEnabled(true);
        this.btn_lottery.setTouchEnabled(true);
        wls.OnClicked(this.img_bg_1, this, "panel");
        this.setVisible(FG.RoomConfig.PRIZE_POOL)
        this.fnt_allcoin.setString(0)
        this.show(false,false)

        this.rewardList = []
    },

    onEventTouchEnded: function()
    {
        if (this.bOpen)
        {
            this.show(false, true);
        }
    },

    // 显示或隐藏
    show: function(bVisible,isAct)
    {
        if (this.bOpen == bVisible) { return }
        this.bOpen = bVisible
        this.getScene().uiShowAct(this.img_bg_1,this.img_bg_2,bVisible,isAct)
    },

    click_btn_lottery: function()
    {
        this.show(!this.bOpen,true)
    },

    click_panel: function()
    {
        this.pushView("UIBonusPoolDes")
    },

    startUpdate: function()
    {
        var self = this
        var seq = cc.Sequence.create(cc.CallFunc.create(function () {
            self.sendUpdateView()
        }),cc.DelayTime.create(5))
        var rep = cc.RepeatForever.create(seq)
        rep.setTag(202)
        this.stopActionByTag(202)
        this.runAction(rep)
    },

    sendUpdateView: function()
    {
        if (this.waitNet == true) { return }
        //不需要刷新判断
        if (this.bOpen == false) { return }

        this.sendMsg("sendGetBonusPool")
        this.waitNet = true
    },

    setPoolNum: function(money)
    {
        this.waitNet = false 
        this.fnt_allcoin.setString(money)
    },



});