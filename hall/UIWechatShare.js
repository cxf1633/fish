/****************************************************************
* 作者：xiaos
* 日期：2018-07-13
* 描述：微信分享
****************************************************************/
"use strict";
wls.namespace.UIWechatShare = ccui.Layout.extend({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function() {
        wls.CreateMask(this)
        var node = wls.LoadPopupView(this.fullPath("hall/uiwechatshare.json"), this)
        node.setPosition(display.width/2, display.height/2)
        this.addChild(node)
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        node.setScale(node.getScale()*scale)
        this.adaptClose(this.btn_close)
        var gunRate = (this.find("DAPlayer") ? this.find("DAPlayer").getMaxGunRate() : 1)
        var rewards = wls.Config.getConfig(gunRate>=1000?"990000123":"990000042").split(";")
        var itemNum = rewards.length/2
        var itemSize = cc.size(this.img_item_demo.getContentSize().width+5, this.img_item_demo.getContentSize().height)
        this.img_item_demo.setVisible(false)
        this.items = []
        var totalWidth = 0
        for (var key = 0; key < rewards.length; key += 2) {
            var propId = parseInt(rewards[key])
            var propCount = parseInt(rewards[key+1])
            var posx = -(itemSize.width*itemNum)/2+(key/2*itemSize.width+itemSize.width/2)
            var item = this.createItem(propId, propCount)
            item.setPositionX(posx)
            this.panel.addChild(item)
            this.items.push(item)
            totalWidth += itemSize.width
        }
        this.text_time.setTag(0)
        this.img_frame.setContentSize(cc.size(totalWidth+20, this.img_frame.getContentSize().height))
        this.img_bg.setContentSize(cc.size(this.img_frame.getContentSize().width+50, this.img_bg.getContentSize().height))
        this.updatePanel()
    },

    updatePanel: function() {
        this.text_time.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.CallFunc.create(function(sender) {
            var info = this.find("DAPlayer").getFreeFishCoinInfo(6) || []
            var endTime = info.time || (wls.GetCurTimeFrame() + wls.serverTimeDis)
            var curTime = wls.GetCurTimeFrame() + wls.serverTimeDis
            var seconds = endTime-curTime
            this.text_time.setTag(seconds)
            if (seconds <= 0) { sender.stopAllActions(); this.text_time.setString("00:00"); return; }
            var timeStr = wls.PrefixInteger((seconds - seconds % 60) / 60%60,2)+":"+wls.PrefixInteger(seconds % 60,2)
            this.text_time.setString(timeStr)
        }.bind(this)), cc.DelayTime.create(1))))
        var info = this.find("DAPlayer").getFreeFishCoinInfo(6) || []
        var count = info.receiveCount || 0
        var configCount = parseInt(wls.Config.get("share", 9).awardnum)
        this.text_times.setString((configCount-count)+"/"+configCount)
    },

    createItem: function(propId, propCount) {
        var info = wls.Config.getItemData(propId)
        var item = this.img_item_demo.clone()
        var filename = this.fullPath("common/images/prop/prop_"+wls.PrefixInteger(propId, 3)+".png")
        wls.BindUI(item, item)
        item.img_icon.loadTexture(filename, 1)
        item.text_name.setString(info.name)
        item.fnt_num.setString(propCount)
        item.fnt_num.setLocalZOrder(2)
        item.setVisible(true)
        item.propId = propId
        item.propCount = propCount
        return item
    },

    playShareReward: function(props,viewid) {
        for (var key = 0; key < props.length; key++) 
        {
            var prop = props[key];
            var propId = prop.propId;
            var pos = wls.getWordPosByNode(this.items[key])
            var flyData = {
                viewid  : viewid||0,
                propData: prop,
                firstPos: pos,
                maxScale: 1,
                isJump  : false,
                zorder  : wls.ZOrder.Award+1
            }
            this.find("EFItems").play(flyData);
        }
    },

    click_btn_close: function() {
        this.find("SCLayerMgr").hideLayerByName("UIWechatShare")
        this.find("SCLayerMgr").hideLayerByName("dayShare")
        this.removeFromScene()
    },

    click_btn_share: function() {
        if (this.text_time.getTag() > 0) { this.toast("分享冷却中，请稍后进行分享"); return}
        var shareInfo = wls.GetShareInfo(wls.Config.get("share", 9).share_type) || {}
        //成功
        this.sendMsg("sendFreeFishCoinReward", 6, true, 0)
        ShareHelper.doShare({text:shareInfo.text}, function(res) {
            if (res.errMsg == "shareAppMessage:ok") {
                
            }
        }.bind(this))
    },
})