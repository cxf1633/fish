//-----------------------------------------------------
// 解锁炮倍界面
//-----------------------------------------------------

wls.namespace.UIUnlockCannon = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("battle/unlockcannon/uiunlockcannon.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);  
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        ccnode.setScale(ccnode.getScale()*scale)
        this.adaptClose(this.btn_close)
        this.node_items = [];
        this.node_item_6.setVisible(false);

        for (var i = 1; i <= 6; i++)
        {
            var item = this["node_item_" + i];
            this.node_items.push(item)

            wls.BindUI(item, item);
            item.btn_lock.setTouchEnabled(i == 3);
            //item.text_num.ignoreContentAdaptWithSize(true)
            wls.OnClicked(item.btn_lock, this);
        }
        wls.PlayTimelineAction(this.AniNode);

        this.isShowBox = false
        this.midScale = 1
        this.otherScale = 0.87
        this.posY = this.node_item_3.getPositionY()
        var allWidth = this.node_item.getContentSize().width
        var itemWidth = this.node_item_3.panel.getContentSize().width
        var disWidth = (allWidth - itemWidth*4*this.otherScale - itemWidth*this.midScale)/5
        this.itemPos = []
        var leftPosX = -disWidth/2 - itemWidth/2*this.otherScale
        for (var i = 1; i < 8; i++) {
            this.itemPos.push(leftPosX)
            leftPosX = leftPosX + disWidth + itemWidth/2*this.otherScale + itemWidth/2*((i == 3 ||i == 4)?this.midScale:this.otherScale)
        }

    },

    onActive: function()
    {
        this.updateView();
        this.find("UIGreenHand").playNextAct("openUpGunList")
    }, 

    // 计算当前最大炮倍，后一个，与前三个炮倍
    calcGunRates: function(maxGunRate)
    {
        var tb = [];
        var list = wls.Config.getAll("cannon").rates;
        for (var i = 0; i < list.length; i++)
        {
            if (list[i] == maxGunRate)
            {
                tb.push(list[i - 1] || 0);
                tb.push(list[i - 0] || 0);
                tb.push(list[i + 1] || 0);
                tb.push(list[i + 2] || 0);
                tb.push(list[i + 3] || 0);
                tb.push(list[i + 4] || 0);
                break;
            }
        }
        return tb;
    },

    //当升级成功时，播放升级动画
    OnGunUpgraded: function ()
    {
        var c = 0;
        var self = this;
        wls.PlayTimelineAction(this.node_items[2],'unlockact',false);
        self.AniNode.setVisible(false);
        var lastItem = self.node_items[self.node_items.length - 1]
        lastItem.setVisible(lastItem.Rate<=1000);
        lastItem.setPositionX(self.itemPos[self.itemPos.length - 1]);
        for(var i = 0; i < self.node_items.length; i++){
            var action = self.getAction(i, function(){
                c++;
                if(c >= self.node_items.length)
                {
                    self.updateView();
                    self.AniNode.setVisible(true);
                }
            });
            self.node_items[i].runAction(action);
        }
    },

    getAction: function(i, callback)
    {   
        var self = this;
        var delayTime = 0.5;//播放时长
        var action = cc.moveTo(delayTime, self.itemPos[i], this.posY);
        switch(i)
        {
            case 2://第三个动画需要缩放
                action = cc.spawn(
                    action,
                    cc.scaleTo(delayTime, this.otherScale , this.otherScale)
                );
                break;
            case 3://第四个动画需要放大
                action = cc.spawn(
                    action,
                    cc.scaleTo(delayTime, this.midScale, this.midScale)
                )
                break;
        }
        action = cc.sequence(
            cc.delayTime(1),
            action,
            cc.callFunc(function(){
                if(i == 0)
                {
                    self.node_items[0].setVisible(false);
                    self.node_items.push(self.node_items.shift());
                }
                callback && callback();
            })
        )
        action.setTag(202)
        return action;
    },

    updateView: function()
    {
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        var maxGunRate = cannon.getMaxGunRate();
        var gem = cannon.getGem();
        var isMaxRate = maxGunRate >= 1000;
        this.spr_zgpb.setVisible(isMaxRate)
        this.node_item.setVisible(!isMaxRate)
        this.AniNode.setVisible(!isMaxRate);
        this.spr_effect_unlock.setVisible(!isMaxRate)
        if (isMaxRate) return;
        var tb = this.calcGunRates(maxGunRate);
        
        var c =  wls.Config.calcCannonConfig(this.find("DAPlayer").getVipLevel()+1, maxGunRate);
        for (var i = 0; i < 6; i++)
        {
            wls.PlayTimelineAction(this.node_items[i],'statice',false);
            this.node_items[i].setScale(i != 2?  this.otherScale : this.midScale)
            this.node_items[i].stopActionByTag(202)
            this.node_items[i].setPositionX(this.itemPos[i+1])
            this.node_items[i].btn_lock.setTouchEnabled(i == 2);
            this.updateItem(this.node_items[i], tb[i], i + 1, c);
        }
    },

    updateItem: function(item, rate, idx, conf)
    {
        item.Rate = rate
        if (rate == 0 || rate > 1000)
        {
            item.setVisible(false);
            return;
        }
        item.setVisible(true);
        var config = wls.Config.getOrigin("cannon", rate);
        item.fnt_rate.setString(config.times)
        item.fnt_award.setString(config.unlock_award)
        item.bmf_num.setString(config.unlock_gem)

        var isUnlock = idx < 3;
        item.layer_lock_bg.setVisible(!isUnlock)
        item.node_lock.setVisible(!isUnlock)
        item.node_unlock.setVisible(!isUnlock)
        item.spr_jscg.setVisible(isUnlock)
        item.image_word_bg.setVisible(!isUnlock)
        item.fnt_award.setVisible(idx <= 3)
        item.spr_wh.setVisible(idx > 3)

        item.bmf_num.setVisible(idx == 3)
        item.spr_wh_num.setVisible(idx != 3)

        item.text_num.setString(config.fishticket_drop)
        item.spr_gun.setSpriteFrame(this.fullPath("battle/cannon/"+ conf.cannon_img));
    
        var tb = [item.spr_present,item.spr_coins,item.spr_wh,item.fnt_award]
        wls.autoSortPos(tb,item.image_word_bg,2,10)

        var tb2 = [item.spr_diamonds,item.spr_wh_num,item.bmf_num]
        wls.autoSortPos(tb2,item.node_unlock,1)
    },

    click_btn_lock: function()
    {
        if (this.find("UIRewardTask")) {
            this.toast(wls.Config.getLanguage(800000422));
            return 
        }
        var ret = this.find("WNGunUpgrade").doSendUpgrade();
        this.node_items[2].btn_lock.setTouchEnabled(!ret);
    },

    click_btn_close: function()
    {
        this.setVisible(false);
        if (this.isShowBox) {
            //是否弹炮倍礼包
            this.find("SCLayerMgr").showLayerByName("UIGunRateChest")
            this.isShowBox = false
        }
    },
});