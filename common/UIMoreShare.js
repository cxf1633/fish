/****************************************************************
* 作者：xiaos
* 日期：2018-07-19
* 描述：更多分享 各种地方弹出
****************************************************************/
wls.namespace.UIMoreShare = cc.Node.extend({
    getZorder:function () {
        return wls.ZOrder.Box+1
    },

    onCreate: function(info) {
        if (this.find("UIGreenHand") && this.find("UIGreenHand").runGreen) {
            this.removeFromScene()
            return
        }

        info = (info || {})
        this.id = info.id || 1
        this.args = info.args|| 0
        this.obj = info.obj
        this.func = info.func
        this.shareType = info.shareType
        this.initShareUI(info)
        this.initShareWord(info)

        var shareMaxTimes = this.getConfigTimes()
        var times = this.getTimes(this.id)
        var isOpen = this.getSwitch(this.id)
        if (this.obj) {
            this.obj.setVisible(false)
        }
        if (times >= shareMaxTimes || !isOpen) {
            this.doNoShow()
        }
    },

    //创建失败的处理
    doNoShow: function() {
        this.click_btn_cancel()
    },

    initShareUI: function() {
        this.convertShareUI(null, "2&3", 2);
    },
    //res=> img_info控件图片路径
    //str=>分享里面次数(传字符串,如："1&3")，无限传null
    //cnt=>按钮数量
    convertShareUI:function(res, str, cnt){
        wls.CreateMask(this);
        var node = wls.LoadStudioNode(this.fullPath("common/ui/uicommonshare.json"), this);
        node.setPosition(display.width/2, display.height/2);
        this.addChild(node);
        if (res) {
            this.img_info.ignoreContentAdaptWithSize(true)
            this.img_info.loadTexture(res, 1);   
        }
        this.node_btn_1.setVisible(false);
        this.node_btn_2.setVisible(false);
        this["node_btn_"+cnt].setVisible(true);
        //
        if(str){
            var pos = this["img_fxlq_"+cnt].getPosition();
            this.node_btn_text.setPosition(pos);
            this.fnt_share_times.setString(str);
            this.node_btn_text.setVisible(true);
            this["img_fxlq_"+cnt].setVisible(false);
        }
        else{
            this.node_btn_text.setVisible(false);
        }
    },
    initShareWord: function() {

    },

    getTimes: function(id) {
        if (this.find("DAPlayer")) {
            return this.find("DAPlayer").getShareTimes(id)
        }

        return 1
    },

    getSwitch: function(id) {
        //if (this.find("DAPlayer")) {
        //    return this.find("DAPlayer").getShareSwitch(id)
        //}
        //return false
        return wls.Modules.Enable_Share
    },

    //uicommonshare-------------里面有4个按钮
    click_btn_close:function(){
        this.click_btn_cancel();
    },
    click_btn_recharge:function(){
        this.click_btn_close()
        this.getScene().gotoShop()
    },
    click_btn_share_1:function(){
        this.click_btn_share();
    },
    click_btn_share_2:function(){
        this.click_btn_share();
    },
    //------------------------------------------------

    click_btn_cancel: function() {
        if (this.obj) {this.obj.setVisible(true)}
        if (this.func) {this.func()}
        this.removeFromScene()
        this.find("SCLayerMgr").hideLayerByName("UIMoreShare")
    },

    click_btn_share: function() {
        //var shareInfo = wls.GetShareInfo(this.shareType) || {}
        this.notify()
        this.click_btn_cancel()
        // ShareHelper.doShare({text:shareInfo.text}, function(res) {
        //     if (res.errMsg == "shareAppMessage:ok") {
        //         //成功
                
        //     }
        // }.bind(this))
    },

    notify: function() {
        this.sendMsg("sendShareSuccess", this.id, this.args) 
    },

    getConfigTimes: function() {
        return 9999
    },
})

//id:1 充值分享
wls.namespace.UIRechargeShare = wls.namespace.UIMoreShare.extend({
    onCreate: function(info) {
        info = info || {}
        info.id = 1
        info.shareType = wls.Config.get("share", 1).share_type
        this._super(info)
    },

    initShareUI: function() {
        var res = wls.Config.get("share", 1).res
        this.convertShareUI(this.fullPath("common/images/commonshare/"+res), null, 1);
    },

    getConfigTimes: function() {
        return parseInt(wls.Config.get("share", 1).times)
    },
})

//id:2 邀请好友
wls.namespace.UIInviteShare = wls.namespace.UIMoreShare.extend({
    onCreate: function(info) {
        info = info || {}
        info.id = 2
        info.shareType = wls.Config.get("share", 2).share_type
        this._super(info)
    },

    initShareUI: function() {
        var res = wls.Config.get("share", 2).res
        this.convertShareUI(this.fullPath("common/images/commonshare/"+res), null, 1);
    },

    getConfigTimes: function() {
        var times = parseInt(wls.Config.get("share", 2).times)
        return times == -1 ? 9999 : times
    },
})

//id:3 水晶不够免费领取水晶的分享 
wls.namespace.UIRecvCrystalShare = wls.namespace.UIMoreShare.extend({
    onCreate: function(info) {
        info = info || {}
        info.id = 3
        info.shareType = wls.Config.get("share", 3).share_type
        this._super(info)
    },

    initShareUI: function() {
        var res = wls.Config.get("share", 3).res
        this.convertShareUI(this.fullPath("common/images/commonshare/"+res), null, 1);
    },

    getConfigTimes: function() {
        return parseInt(wls.Config.get("share", 3).times)
    },
})

//id:5 炮倍升级成功的分享
wls.namespace.UIGunUpgradeShare = wls.namespace.UIMoreShare.extend({
    onCreate: function(info) {
        info = info || {}
        info.id = 5
        this._super(info)
    },

    initShareUI: function(info) {
        var rewards = wls.SplitArray(info.config)
        var data = {
            id:info.id,
            texts:[
                {"text":"恭喜您炮倍升级成功","color":cc.c3b(255, 255, 255)}
            ],
            props:[],
        }
        for (var key = 0; key < rewards.length; key += 2) {
            var item = {"propId":rewards[key],"propCount":rewards[key+1]}
            data.props.push(item)
        }

        wls.OnClicked(this.createGameObject("UIShareDialog", data).btn_close, this, "btn_cancel")
    },

    click_btn_cancel: function() {
        this._super()
        if (this.find("UIShareDialog")) { this.find("UIShareDialog").click_btn_close() }
    },
})

//id:6 打死boss分享
wls.namespace.UIKillBossShare = wls.namespace.UIMoreShare.extend({
    getZorder:function () {
        return wls.ZOrder.Normal
    },
    onCreate: function(info) {
        info = info || {}
        info.id = 6
        info.shareType = wls.Config.get("share", 4).share_type
        this._super(info)
    },

    initShareUI: function(info) {
        var rewards =  wls.SplitArray(wls.Config.get("share", 4).reward)
        var data = {
            id:info.id,
            texts:[
                {"text":"恭喜您击杀了","color":cc.c3b(255, 255, 255)},
                {"text":wls.Config.get("fish", info.fishid).name,"color":cc.c3b(0, 255, 50)},
                {"text":"，分享可得奖励","color":cc.c3b(255, 255, 255)},
            ],
            props:[],
        }

        for (var key = 0; key < rewards.length; key += 2) {
            var item = {"propId":rewards[key],"propCount":rewards[key+1]}
            data.props.push(item)
        }

        wls.OnClicked(this.createGameObject("UIShareDialog", data).btn_close, this, "btn_cancel")
    },

    initShareWord: function(info) {
        
    },

    getConfigTimes: function() {
        var times = parseInt(wls.Config.get("share", 2).times)
        return times == -1 ? 9999 : times
    },

    click_btn_cancel: function() {
        this._super()
        if (this.find("UIShareDialog")) { this.find("UIShareDialog").click_btn_close() }
    },
})

//id:9 新手任务完成的分享
wls.namespace.UINewerTaskCompleteShare = wls.namespace.UIMoreShare.extend({
    onCreate: function(info) {
        info = info || {}
        info.id = 9
        this._super(info)

        
    },

    initShareUI: function() {
        var res = wls.Config.get("share", 9).res
        this.convertShareUI(this.fullPath("common/images/commonshare/"+res), null, 1);
    },

    initShareWord: function(info) {
    },
})

//id:10 购买宝箱成功分享
wls.namespace.UIBuyBoxSucessShare = wls.namespace.UIMoreShare.extend({
    onCreate: function(info) {
        info = info || {}
        info.id = 10
        this._super(info)
    },

    initShareUI: function(info) {
        var rewards = wls.SplitArray(info.config)
        var data = {
            id:info.id,
            args:info.args,
            texts:[
                {"text":"恭喜您礼包购买成功","color":cc.c3b(255, 255, 255)}
            ],
            props:[],
        }
        for (var key = 0; key < rewards.length; key += 2) {
            var item = {"propId":rewards[key],"propCount":rewards[key+1]}
            data.props.push(item)
        }

        wls.OnClicked(this.createGameObject("UIShareDialog", data).btn_close, this, "btn_cancel")
    },

    click_btn_cancel: function() {
        this._super()
        if (this.find("UIShareDialog")) { this.find("UIShareDialog").click_btn_close() }
    },

})

//id:16,18,19 报名分享
wls.namespace.UIAddJoinCountShare = wls.namespace.UIMoreShare.extend({
    //创建失败的处理
    doNoShow: function() {
        this.toast(wls.Config.getLanguage(800000481))
        this.click_btn_cancel()
    },
    initShareUI: function(info) {
        var str = (info.maxCount - info.curCount) + "&" + info.maxCount
        this.convertShareUI(info.share_res, str, 1);
    },
})

//id:17 救济金分享
wls.namespace.UIBankruptShare = wls.namespace.UIMoreShare.extend({
    initShareUI: function(info) {
        var str = (info.maxCount - info.curCount) + "&" + info.maxCount
        this.convertShareUI(info.share_res, str, 2);
    },
})

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////



//首次破产分享
wls.namespace.UIBankruptcyShare = wls.namespace.UIMoreShare.extend({
    onCreate: function(info) {
        info = info || {}
        info.id = 10
        this._super(info)
        this.txt_word.setString(wls.Config.getLanguage(800000408))
    },


    initShareUI: function() {
        wls.CreateMask(this)
        this.node = wls.LoadStudioNode(this.fullPath("battle/share/uisharealms.json"), this)
        this.node.setPosition(display.width/2, display.height/2)
        this.addChild(this.node)
    },

    click_btn_share: function() {
        this._super()
        if (this.func) {this.func()}
    },

    click_btn_close: function() {
        this.removeFromScene()
    },
})

wls.namespace.UIShareDialog = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop
    },

    onCreate: function(info) {
        wls.CreateMask(this)
        var node = wls.LoadStudioNode(this.fullPath("common/ui/uiShareDialog.json"), this)
        node.setPosition(display.width/2, display.height/2-15)
        this.addChild(node)
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        node.setScale(node.getScale()*scale)

        info = (info || {})
        this.id = info.id
        this.args = info.args

        this.initShareWord(info)
    },

    initShareWord: function(info) 
    {
        //texts.text, texts.color
        if (info.texts) {
            var richText = ccui.RichText.create();
            var item = null;
            for (var index = 0; index < info.texts.length; index++) {
                var element = info.texts[index];
                item = ccui.RichElementText.create(index+1, element.color, 255, element.text, "Arial", 24);
                richText.pushBackElement(item);
            }
            richText.setPosition(this.node_text.getPosition());
            this.panel.addChild(richText, 100);
        }
        else {
            this.img_frame.setContentSize(cc.size(this.img_frame.getContentSize().width, this.img_frame.getContentSize().height-70))
            this.img_bg.setContentSize(cc.size(this.img_bg.getContentSize().width, this.img_bg.getContentSize().height-50))
            this.img_item_demo.setPositionY(this.img_item_demo.getPositionY()+70)
            this.btn_share.setPositionY(this.btn_share.getPositionY()+60)
        }
        
        var itemSize = cc.size(this.img_item_demo.getContentSize().width+4, this.img_item_demo.getContentSize().height)
        this.img_item_demo.setVisible(false)
        this.items = []
        var totalWidth = 0

        //props.propId, props.propCount
        if (info.props) {
            var itemNum = info.props.length
            for (var key = 0; key < itemNum; key++) {
                var propId = parseInt(info.props[key].propId)
                var propCount = parseInt(info.props[key].propCount)
                var posx = -(itemSize.width*itemNum)/2+(key*itemSize.width+itemSize.width/2)
                var item = this.createItem(propId, propCount)
                item.setPositionX(posx)
                this.panel.addChild(item)
                this.items.push(item)
                totalWidth += itemSize.width
            }

            if (totalWidth <= itemSize.width*3) {
                totalWidth = itemSize.width*3
            }
            this.img_frame.setContentSize(cc.size(totalWidth+20, this.img_frame.getContentSize().height))
            this.img_bg.setContentSize(cc.size(this.img_frame.getContentSize().width+50, this.img_bg.getContentSize().height))
            this.btn_close.setPositionX(this.img_bg.getContentSize().width/2-10)
        }
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

    notify: function() {
        this.sendMsg("sendShareSuccess", this.id, this.args) 
    },

    click_btn_share: function() {
        var shareInfo = wls.GetShareInfo() || {}
        this.notify()
        this.click_btn_close()
        ShareHelper.doShare({text:shareInfo.text}, function(res) {
            if (res.errMsg == "shareAppMessage:ok") {
                //成功
                
            }
        }.bind(this))
    },

    click_btn_close: function() {
        this.removeFromScene()
        if (this.id == 11) {
            this.find("SCLayerMgr").hideLayerByName("UIBigShare")
        }
    },
})