"use strict";

// 获得奖励界面
wls.namespace.UIAwardResult = ccui.Layout.extend
({
    getZorder:function () {
        return wls.ZOrder.Award
    },
    onCreate: function()
    {
        wls.CreateMask(this, null, true);
        var ccnode = wls.LoadStudioNode(this.fullPath("common/ui/uiawardresult.json"), this);
        ccnode.setPosition(display.width/2,display.height/2)
        this.addChild(ccnode,10);
        ccnode.setScale(0.9)
        this.ccnode = ccnode

        //this.text_notice.ignoreContentAdaptWithSize(true)
        //this.text_notice.setString(wls.Config.getLanguage(800000374))
        // this.spr_light.runAction(cc.RepeatForever.create(cc.RotateBy.create(1,60)))

        
        wls.OnClicked(this.btn_share_freecoin.getChildByName("img_vip_3"), this);
        this.propData = null
    },

    //激活    一般要先将数据加入缓存
    onActive: function(uiLayerName,viewid,propList,callFun,isACt,shareInfoStr)
    {
        this.uiLayerName = uiLayerName
        this.viewid = viewid
        this.callFun = callFun
        this.inner_action.play(isACt?"show":"statice",false)
        this.propList = propList
        this.itemList = {}

        var isShare = false 
        var dis = 200
        for (var i = 0; i < propList.length; i++) {
            var element = propList[i];
            var item = this.getItem(element.propId,element.propCount)
            item.setPositionX(-(propList.length -1)*dis /2 + i*dis)
            this.node_awardlist.addChild(item)
            this.itemList[element.propId] = item
            if (this.isShare(element.propId,element.propCount) || (shareInfoStr != null)) {
                isShare = true 
            }
        }
        
        //判断是否需要分享
        // var isShare = this.isShare(propData.propId,propData.propCount) || (shareInfoStr != null)
        var shareInfo = shareInfoStr != null ? shareInfoStr.split(";") : wls.Config.get("share", 5).reward.split(";")
        var rewardUnit = wls.Config.getItemData(parseInt(shareInfo[0])).name
        this.btn_get.setPositionX(isShare?-224:0)
        this.btn_share.setPositionX(isShare?224:0)
        this.btn_share.setVisible(isShare)
        this.text_share_desc.setVisible(isShare)
        this.text_share_reward.setVisible(isShare)
        this.text_share_reward.setString(shareInfo[1]+rewardUnit)
        this.btn_share_freecoin.setVisible(false);
    },

    //免费鱼币 uiLayerName作为鱼币type shareInfoStr 字符串格式==>"1:5000"
    onShow: function(uiLayerName,viewid,propList,callFun,isACt,shareInfoStr){
        this.uiLayerName = uiLayerName
        this.viewid = viewid
        this.callFun = callFun
        this.inner_action.play(isACt?"show":"statice",false)
        this.propList = propList
        this.itemList = {}
        var dis = 200
        for (var i = 0; i < propList.length; i++) {
            var element = propList[i];
            var item = this.getItem(element.propId,element.propCount)
            item.setPositionX(-(propList.length -1)*dis /2 + i*dis)
            this.node_awardlist.addChild(item)
            this.itemList[element.propId] = item
        }
        this.btn_share.setVisible(false);
        var isShare = (shareInfoStr == undefined) || (shareInfoStr == 0) ? false : true;
        this.btn_share_freecoin.setVisible(isShare)
        this.btn_get.setPositionX(isShare?-224:0)
        this.btn_share_freecoin.setPositionX(isShare?224:0)
        this.img_vip_3.setVisible(false);
        this.spr_word_fxzlyc.setVisible(true);
        this.spr_word_share.setVisible(false);
        this.spr_type.setVisible(false);
        this.fnt_num.setVisible(false);
        //2018年8月27日 策划需求修改
        // if(shareInfoStr != undefined && typeof(shareInfoStr)=="string"){
        //     var shareInfoList = shareInfoStr.split(";");
        //     var type = shareInfoList[0];
        //     //预留货币图片
        //     // this.spr_type
        //     var num = shareInfoList[1];
        //     this.fnt_num.setString(num);
        //     this.spr_word_fxzlyc.setVisible(false);
        // }
        // if (FISH_DISABLE_CHARGE){
        //     this.img_vip_3.setVisible(false);  
        // }
        // if (this.uiLayerName == "1") {
        //     this.spr_word_fxzlyc.setVisible(true)
        //     this.img_vip_3.setVisible(false)
        //     this.spr_word_share.setVisible(false)
        //     this.spr_type.setVisible(false)
        //     this.fnt_num.setVisible(false)
        // }
    },
    click_img_vip_3:function(){
        this.pushView("UIVipRight", this.getZorder());
    },
    getItem: function(propId,propCount)
    {
        var itemData = wls.Config.getItemData(propId)
        if ( !itemData) { return null }
        var item = wls.LoadStudioNode(this.fullPath("common/ui/uiaward.json"));
        // this.node_awardlist.addChild(item)
        wls.BindUI(item,item)
        item.spr_prop.setSpriteFrame(this.fullPath("common/images/prop/"+itemData.res))
        var count = propId != 12?propCount :(propCount/100+"y")
        item.fnt_prop_count.setString(count)
        item.spr_light.runAction(cc.RepeatForever.create(cc.RotateBy.create(1,60)))

        return item
    },

    click_btn_get: function()
    {
        this.getAward()
        if (this.callFun) { this.callFun() }
        this.removeFromScene()
    },

    click_btn_share: function()
    {
        this.click_btn_get()
        this.notify()

        var shareInfo = wls.GetShareInfo() || {}
        ShareHelper.doShare({text:shareInfo.text}, function(res) {
            if (res.errMsg == "shareAppMessage:ok") {
                //成功
            }
        }.bind(this))
    },

    click_btn_share_freecoin:function(){
        this.click_btn_get()
        this.notify()

        var shareInfo = wls.GetShareInfo() || {}
        ShareHelper.doShare({text:shareInfo.text}, function(res) {
            if (res.errMsg == "shareAppMessage:ok") {
                //成功
            }
        }.bind(this))
    },
    //通知服务器分享成功
    notify: function() {
        this.sendMsg("sendFreeFishCoinReward", Number(this.uiLayerName), true, 0);
    },
    isShare: function(propId,propCount)
    {
        var list = wls.Config.getShareList()
        for (var index = 0; index < list.length; index++) {
            var element = list[index];
            if (element.propId == propId && element.propCount <= propCount) { return true}
        }
        return false
    },

    getAward: function()
    {
        if (this.propList == null) {return }
        for (var i = 0; i < this.propList.length; i++) {
            var element = this.propList[i];
            var self = this
            var flyData = {
                viewid     : this.viewid,
                firstPos   : wls.getWordPosByNode(this.itemList[element.propId]),
                propData   : element,
                isJump     : false,
                refreshType: 1,
                maxScale   : 1,
                zorder     : wls.ZOrder.Award +1
            }
            this.find("EFItems").play(flyData)
        }

        this.propList = null 
        this.find("SCLayerMgr").hideLayerByName(this.uiLayerName)
    },
});