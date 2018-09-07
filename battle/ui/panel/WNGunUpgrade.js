//-----------------------------------------------------
// 炮升级面板
//-----------------------------------------------------
wls.namespace.WNGunUpgrade = wls.WrapNode.extend
({
    onCreate: function()
    {
        this.setScale(wls.MinScale)
        wls.BindUI(this, this);
        //var action = this.getActionManager().getActionByTag(this.getTag(), this);
        //this.action = action;
        this.times = 0;
        this.reward = 0;
        this.total = 10000000000;
        this.take = 20;
        this.bOpen = true;
        this.img_bg_1.setVisible(false)
        this.img_bg_2.setVisible(false)

        this.node_spr.setVisible(true);
        wls.OnClicked(this.img_bg_1, this);
        this.show(false, false);
        this.x = this.x + wls.OffsetX;
        this.node_forged.setVisible(false)
        wls.BindUI(this.node_forged,this.node_forged)
        wls.OnClicked(this.node_forged.btn_forged, this);
    },

    // 初始化
    initView: function()
    {
        this.updateView();
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        var gem = cannon.getGem();
        if (gem >= this.total)
        {
            this.show(true, true);
        }
        else
        {
            this.show(false, true);
        }
    },

    updateView: function()
    {
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        this.maxGunRate = cannon.getMaxGunRate();
        this.btn_upgrade.setVisible(this.maxGunRate < 1000)
        this.node_forged.setVisible(this.maxGunRate >= 1000)
        if (this.maxGunRate >= 1000) {
            this.img_bg_1.setVisible(false)
            this.img_bg_2.setVisible(false)
            this.updataIsforged()
            return 
        };
        this.show(this.bOpen,false)
        this.setVisible(FG.RoomConfig.ENABLE_UNLOCK_CANNON);
        this.calcReward();
        this.updateProgress(cannon.getGem());
    },

    show: function(bVisible,isAct)
    {
        if (this.bOpen == bVisible) { return }
        if (this.maxGunRate >= 1000) {return }
        this.bOpen = bVisible
        this.getScene().uiShowAct(this.img_bg_1,this.img_bg_2,bVisible,isAct)
    },

    // 宝石数量变更
    onEventMofiyGem: function(cnt)
    {
        //this.updateProgress(cnt);
        this.updateView()
    },

    onEventTouchEnded: function()
    {
        if (this.bOpen)
        {
            this.click_btn_upgrade( )
        }
    },

    //点击升级图标  因为同一个地方点击的表现不一致，所以改了下
    click_btn_upgrade: function()
    {
        if(this.take >= this.total && this.bOpen) return 
        this.show(!this.bOpen, true);
    },

    click_img_bg_1: function()
    {
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        this.maxGunRate = cannon.getMaxGunRate();
        if (this.maxGunRate >= 1000) return;
        if (this.bOpen)
        {
            this.pushView("UIUnlockCannon");
            return;
        }
    },

    doSendUpgrade: function()
    {
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        this.maxGunRate = cannon.getMaxGunRate();
        var gem = cannon.getGem();
        if (this.maxGunRate >= 1000) return;
        if (gem >= this.total)
        {
            if (wls.roomData.cannon_max > -1 && this.times >= wls.roomData.cannon_max) {
                this.dialog(3,wls.Config.getLanguage(800000430),function(ret) {
                    if (ret == 2) return;
                    FG.SendMsg("sendUpgradeCannon");
                })
                return false
            }
            FG.SendMsg("sendUpgradeCannon");
            return true;
        }
        else
        {
            var obj = this.pushView("UIRecvCrystalShare")
            if (obj.getTimes() >= obj.getConfigTimes()) {
                this.getScene().showNotEnoughGemTip();
                //this.find("SCLayerMgr").setCurShowList(9)
            }
            return false;
        }
    },

    calcReward: function()
    {
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        this.maxGunRate = cannon.getMaxGunRate();
        var next = wls.Config.getNextGunRate(this.maxGunRate);
        if (next == null) return false;
        var config = wls.Config.get("cannon", next);
        this.times = next;
        this.reward = config.unlock_award;
        this.total = config.unlock_gem;
        return true;
    },

    // 更新进度
    updateProgress: function(cur)
    {
        this.take = cur;
        var self = this;
        var total = self.total;
        if (cur >= total)
        {
            //当进度条满时强制打开界面
            if(!self.bOpen) self.show(true,true);
            cur = total;
            self.fnt_coin.setString(self.reward);
            self.fnt_multiple_count.setString(self.times);
            //this.action.play("upGunPanel", true);
            //this.node_animation.setVisible(true);
            if (self.times == 2) {
                cc.log("------UIGreenHand---------iFirstUpGun-")
                this.find("UIGreenHand").trigger("iFirstUpGun")
            }
        }
        else
        {
            self.fnt_multiple_1.setString(self.times)
            self.fnt_per.setString(cur+"&"+total)
            //self.fnt_aimNun.setString(total)
            self.bar_LoadingBar.setPercent(cur / total * 100)
            //this.node_animation.setVisible(false);
        }
        var bCanLock = cur >= total;
        self.spr_words_bp.setVisible(! bCanLock)
        self.spr_startupgun.setVisible(bCanLock)
        self.image_bar_bg.setVisible(! bCanLock)
        self.node_sendcoin.setVisible(bCanLock)
    },




    click_btn_forged: function()
    {
        //this.pushView("UIForged");
        var data = {}
        var rewards = wls.SplitArray(wls.Config.get("share", 7).reward)//.split(";")
        data.props = []
        for (var key = 0; key < rewards.length; key += 2) {
            var item = {"propId":rewards[key],"propCount":rewards[key+1]}
            data.props.push(item)
        }
        data.id = 11
        this.find("SCLayerMgr").setCurShowList(11,data)
    },

    updataIsforged: function()
    {
        cc.log("----------------updataIsforged---------------------")
        var isCane = this.find("DAPlayer").isForget()
        wls.PlayTimelineAction(this.node_forged, isCane?"jump":"static", isCane);
    },











});