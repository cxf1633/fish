//-----------------------------------------------------
// 奖池面板
//-----------------------------------------------------
wls.namespace.WNJackpotPanel = wls.WrapNode.extend
({
    onCreate: function()
    {
        this.setScale(wls.MinScale)
        wls.BindUI(this, this);
        //var action = this.getActionManager().getActionByTag(this.getTag(), this);
        //this.action = action;
        this.img_bg_1.setTouchEnabled(true);
        this.btn_lottery.setTouchEnabled(true);
        wls.OnClicked(this.img_bg_1, this, "panel");
        this.openX = this.img_bg_1.x;
        this.closeX = 100;
        this.show(false, false);
        //this.node_animation.setVisible(false);
        this.precent = 0;
        this.x = this.x+wls.OffsetX;
    },

    initView: function()
    {
        this.setVisible(FG.RoomConfig.ENABLE_REWARD);   
        this.updateView();
        this.show(true, true);
    },

    updateView: function()
    {
        var data = this.find("DABattle").getJackpot();
        cc.log(data);
        data.drawRequireRewardFishCount == 0?data.drawRequireRewardFishCount = 1:0
        var self = this;
        var canLottery = data.killRewardFishInDay >= data.drawRequireRewardFishCount;
        self.spr_startlottery.setVisible(canLottery)
        self.image_bar_bg.setVisible(!canLottery)
        self.fnt_allcoin.setString(data.rewardRate)

        self.fnt_per.setString(data.killRewardFishInDay+"&"+data.drawRequireRewardFishCount)
        //self.fnt_aimNun.setString(data.drawRequireRewardFishCount)
        this.precent = data.killRewardFishInDay / data.drawRequireRewardFishCount * 100;
        self.bar_LoadingBar.setPercent(this.precent);

        if (this.precent >= 100)
        {
            //this.node_animation.setVisible(true);
            //this.action.gotoFrameAndPlay(0);
        }
        else
        {
            //this.node_animation.setVisible(false);
            //this.action.gotoFrameAndPause(0);
        }
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
        //this.pushView("UIJackpot");
        this.show(!this.bOpen, true);
    },

    click_panel: function()
    {
        if (this.bOpen && this.precent >= 100)
        {
            this.pushView("UIJackpot");
            return;
        }
        if (this.bOpen)
        {
            this.show(false, true);
            this.pushView("UIJackpot");
        }
        else
        {
            this.show(true, true);
        }
    },

});