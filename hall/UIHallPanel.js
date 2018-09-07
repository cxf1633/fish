/****************************************************************
 * 作者：xiaos
 * 日期：2018-07-09
 * 描述：大厅按键层
 ****************************************************************/
"use strict";

//免费比赛按钮
wls.namespace.FreeMatchBtns = wls.WrapNode.extend
({
    onCreate: function() {
        wls.BindUI(this, this)
        this.adaptClose(this.btn_return)
    },

    click_btn_return: function() {
        this.waiting(true, "RetCommonHall")
        this.find("UIHallMain").switchPage(this.find("UIHallMain").PAGE_TYPE.JJC_PAGE)
        this.getScene().enterNextRoom("SCRoomMgr");
    },
})

//经典模式按钮
wls.namespace.JJCBtns = wls.WrapNode.extend
({
    onCreate: function() {
        wls.BindUI(this, this)
        this.adaptClose(this.btn_return)
    },

    click_btn_return: function() {
        this.find("UIHallMain").switchPage(this.find("UIHallMain").PAGE_TYPE.MAIN_PAGE)
    }
})

//经典模式按钮
wls.namespace.JdmsBtns = wls.WrapNode.extend
({
    onCreate: function() {
        wls.BindUI(this, this)
        this.adaptClose(this.btn_return)
        this.btn_msw.setPositionX(display.width-20)
    },

    click_btn_return: function() {
        this.find("UIHallMain").switchPage(this.find("UIHallMain").PAGE_TYPE.MAIN_PAGE)
    },

    click_btn_msw: function() {
        var id = this.find("DAHall").defaultRoomID || 1;
        this.find("SCRoomMgr").doGetDesk(id);
    },
})

//更多游戏按钮
wls.namespace.SGameBtns = wls.WrapNode.extend
({
    onCreate: function() {
        wls.BindUI(this, this)
        //this.btn_left.setPosition(65, display.height/2)
        //this.btn_right.setPosition(display.width-65, display.height/2)
        //this.btn_left.setVisible(false)
        this.adaptClose(this.btn_return)
    },

    click_btn_right: function() {
        this.find("PageYLC").scrollRight()
    },

    click_btn_left: function() {
        this.find("PageYLC").scrollLeft()
    },

    click_btn_return: function() {
        this.find("UIHallMain").switchPage(this.find("UIHallMain").PAGE_TYPE.MAIN_PAGE)
    },
})

//主界面按钮
wls.namespace.MainBtns = wls.WrapNode.extend
({
    DOWN_BTN_NAME_LIST : [
        "btn_hd",
        "btn_dh",
        "btn_ph",
        "btn_yj",
        "btn_dz",
        "btn_sc",
    ],
    LEFT_BTN_NAME_LSIT : [
        "btn_mfyb",
        "btn_mrfx",
        "btn_yklb",
    ],
    onCreate: function() {
        wls.BindUI(this, this)
        
        
        this.adaptation()
        this.setBtnNormal("btn_mfyb")
        this.setBtnNormal("btn_mrfx")
        this.setBtnNormal("btn_yklb")
        wls.OnClicked(this.btn_mfyb.getChildByName("btn"), this, "btn_mfyb")
        wls.OnClicked(this.btn_mrfx.getChildByName("btn"), this, "btn_mrfx")
        wls.OnClicked(this.btn_yklb.getChildByName("btn"), this, "btn_yklb")

        this.btn_mrfx.setVisible(false)
        this.btn_sc.setVisible(!window.FISH_DISABLE_CHARGE)
        this.btn_yklb.setVisible(!window.FISH_DISABLE_CHARGE)
        this.btn_exit.setVisible(!wls.IsMiniProgrom())
        if (!this.btn_exit.isVisible()) {
            this.btn_kf.setPositionY(this.btn_exit.getPositionY()+15)
            this.btn_yjfk.setPositionY(this.btn_yjfk.getPositionY()-15)
        }
        if (!wls.Modules.Enable_Exchange) { this.review() }
    },

    review: function() {
        this[this.DOWN_BTN_NAME_LIST[1]].setVisible(false)
        this.btn_more.setVisible(false)
    },

    adaptation: function() {
        var initBtn = function(btn, pos) {
            btn.setPosition(pos)
            btn.getChildByName("spr_light").setVisible(false)
            btn.getChildByName("btn").getChildByName("image_bg").setVisible(false)
        }.bind(this)
        this.btn_msw.setPositionX(display.width-20)
        var offy = wls.IsMiniProgrom() ? 158 : 58
        this.btn_more.setPosition(display.width-64, display.height-offy)
        initBtn(this.btn_mfyb, cc.p(67+wls.OffsetX, display.height-200))
        initBtn(this.btn_mrfx, cc.p(67+wls.OffsetX, this.btn_mfyb.getPositionY()-120))
        initBtn(this.btn_yklb, cc.p(67+wls.OffsetX, this.btn_mrfx.getPositionY()-120))
    },

    updateBtns: function() {
        var posX = 17
        for (var key = 0; key < this.DOWN_BTN_NAME_LIST.length; key++) {
            if (this[this.DOWN_BTN_NAME_LIST[key]].isVisible()) {
                this[this.DOWN_BTN_NAME_LIST[key]].setPositionX(posX)
                posX += 156
            }
        }

        var posY = 522
        for (var key = 0; key < this.LEFT_BTN_NAME_LSIT.length; key++) {
            if (this[this.LEFT_BTN_NAME_LSIT[key]].isVisible()) {
                this[this.LEFT_BTN_NAME_LSIT[key]].setPositionY(posY)
                posY -= 120
            }
        }
    },


    setBtnsVisible: function(isShow) {
       
    },

    setBtnState: function(btnName,isJump,isTimeCount) {
        if (isJump) {
            this.setBtnJump(btnName,isTimeCount)
        } else {
            this.setBtnNormal(btnName)
        }
    },

    setBtnJump: function(btnName,isTimeCount) {
        if (this[btnName] == null || this[btnName] == undefined) { return }
        var node = this[btnName]
        var btn = node.getChildByName("btn")
        var light = node.getChildByName("spr_light")
        var cdBg = btn.getChildByName("image_bg")
        wls.PlayTimelineAction(this[btnName], "jump", true)
        isTimeCount == null? isTimeCount = false:0
        cdBg.setVisible(isTimeCount)
        light.setVisible(true)
        light.runAction(cc.RepeatForever.create(cc.RotateBy.create(1, 60)))
        
    },

    setBtnNormal: function(btnName) {
        if (this[btnName] == null || this[btnName] == undefined) { return }
        var node = this[btnName]
        var btn = node.getChildByName("btn")
        var light = node.getChildByName("spr_light")
        var cdBg = btn.getChildByName("image_bg")
        var redPoint = btn.getChildByName("red_point")
        wls.PlayTimelineAction(node, "nojump", true)
        cdBg.setVisible(false)
        light.setVisible(false)
        redPoint.setVisible(false)
        btn.loadTextures(this.fullPath("hall/images/"+btnName+"_0.png"),
                        this.fullPath("hall/images/"+btnName+"_1.png"),
                        this.fullPath("hall/images/"+btnName+"_1.png"),1)
    },

    setBtnNormalDot: function(btnName, state) {
        if (this[btnName] == null || this[btnName] == undefined) { return }
        var node = this[btnName]
        var btn = node.getChildByName("btn")
        var redPoint = btn.getChildByName("red_point")
        redPoint.setVisible(state)
    },

    click_btn_dz: function()
    {
        if (this.find("DAPlayer").getMaxGunRate() >= 1000)
        {
            // this.activeGameObject("UIForged");
            var data = {}
            var rewards = wls.SplitArray(wls.Config.get("share", 7).reward)//.split(";")
            data.props = []
            for (var key = 0; key < rewards.length; key += 2) {
                var item = {"propId":rewards[key],"propCount":rewards[key+1]}
                data.props.push(item)
            }
            data.id = 11
            this.find("SCLayerMgr").setCurShowList(11,data)
        }
        else
        {
            this.toast(wls.Config.getLanguage(800000472));
        }
    },

    click_btn_mrfx: function() {
        this.pushView("UIWechatShare")
    },
    
    click_btn_dh: function() {
        this.activeGameObject("UIGiftShop")
    },

    click_btn_more: function() {
        this.img_more.setPosition(this.btn_more.getPositionX(), this.btn_more.getPositionY()+10)
        if (this.img_more.isVisible()) {
            this.img_more.setVisible(false)
            this.btn_more.loadTextures(this.fullPath("hall/images/btn_more_0.png"), 
                                        this.fullPath("hall/images/btn_more_1.png"), 
                                        this.fullPath("hall/images/btn_more_1.png"), 1)
        } else {
            this.img_more.setVisible(true)
            this.btn_more.loadTextures(this.fullPath("hall/images/btn_more_1.png"), 
                                        this.fullPath("hall/images/btn_more_0.png"), 
                                        this.fullPath("hall/images/btn_more_0.png"), 1)
        }
        
    },

    click_btn_yklb: function() 
    {
        var data = this.find("DAPlayer").getMonthCardState();
        if (data.state == 0) 
        {
            this.activeGameObject("UIFirstMonthcard");
        } 
        else if (data.state == 1 || data.state == 2)
        {
            this.activeGameObject("UIMonthcard");
        }

    },

    click_btn_ph: function() {
        this.toast("功能暂未开放!");
    },

    click_btn_mfyb: function() {
        this.activeGameObject("UIFreeCoin")
    },

    click_btn_hd: function() {
        this.toast("功能暂未开放!");
    },

    click_btn_gzyl: function() {
        this.createGameObject("UIPublicNumber")
    },

    click_btn_sc: function()
    {
        this.activeGameObject("UIShop");
    },

    // 马上玩，快速进入桌子
    click_btn_msw: function()
    {
        var id = this.find("DAHall").defaultRoomID || 1;
        this.find("SCRoomMgr").doGetDesk(id);
    },

    // 退出
    click_btn_exit: function()
    {
        this.getScene().doExitGame();
    },

    click_btn_kf: function() {
        Device.callCustomerServiceApi("buyu", wls.GameID, wls.RoomID)
    },

    click_btn_yj: function() {
        this.activeGameObject("UIMail")
    },

    click_btn_yjfk: function() {
        this.createGameObject("UIFeedback")
    },

})


// 设置界面
wls.namespace.UIHallPanel = ccui.Layout.extend
({
    getZorder:function () {
        return 2
    },
    onCreate: function()
    {
        this.setContentSize(display.width, display.height)
        var ccnode = wls.LoadStudioNode(this.fullPath("hall/fish_hall_panel.json"), this)
        this.addChild(ccnode)
        this.adaptation()

        wls.OnClicked(this.btn_bb.getChildByName("btn"), this, "btn_bb")
        this.btn_bb.getChildByName("spr_light").setVisible(false)
        this.btn_bb.getChildByName("btn").getChildByName("image_bg").setVisible(false)
        this.btn_bb.getChildByName("btn").getChildByName("red_point").setVisible(false)
        this.fnt_coin = this.node_coin.getChildByName("fnt_coin")
        this.fnt_gem = this.node_crystal.getChildByName("fnt_coin")


        this.setVisible(false)
        this.clipHead()
        this.wrapGameObject(this.node_main, "MainBtns")
        this.wrapGameObject(this.node_jjc, "JJCBtns")
        this.wrapGameObject(this.node_jdms, "JdmsBtns")
        this.wrapGameObject(this.node_gdyx, "SGameBtns")
        this.wrapGameObject(this.node_free_match, "FreeMatchBtns")
        
        this.switchPage(this.find("UIHallMain").getCurPage())
        if (this.img_more) {this.img_more.setVisible(false)} 

        this.btn_addcoin.setVisible(!window.FISH_DISABLE_CHARGE)
        this.btn_addcrystal.setVisible(!window.FISH_DISABLE_CHARGE)
        this.btn_privilege.setVisible(!window.FISH_DISABLE_CHARGE)
        this.inner_action.play("msw_act",true)
    },

    adaptation: function() {
        this.node_info.y = display.height - 20
        this.node_coin.y = display.height - 58
        this.node_crystal.y = display.height - 58
        this.img_btn_bg.setContentSize(display.width, this.img_btn_bg.getContentSize().height)
        this.img_btn_bg.setPositionX(0)
        this.btn_bb.setPositionY(display.height-54)
    },

    clipHead: function() {
        var edgeBgParent = this.spr_head_edge.getParent()
        var headParent = this.img_player_photo.getParent()
        var clipNode = cc.ClippingNode.create()
        var pos = this.img_player_photo.getPosition()
        this.img_player_photo.retain()
        this.spr_head_edge.retain()
        this.spr_head_edge.setPosition(this.img_player_photo.getPositionX(), this.img_player_photo.getPositionY())
        headParent.removeChild(this.img_player_photo, false)
        edgeBgParent.removeChild(this.spr_head_edge, false)
        
        clipNode.setAlphaThreshold(0.9)
        clipNode.setStencil(this.spr_head_edge)
        clipNode.setInverted(false)
        clipNode.addChild(this.img_player_photo)
        headParent.addChild(clipNode, -1)
        //this.spr_empty_edge.setLocalZOrder(2)
    },

    onEventPlayerDataModified: function () {
        this.updateMoney()
    },  
    updateMoney: function()
    {
        var coinNum = this.find("DAPlayer").getMoney()
        var crystalNum = this.find("DAPlayer").getGem()
        if (Number(this.fnt_coin.getString()) < coinNum) {
            var action = cc.Sequence.create(cc.ScaleTo.create(0.1,1.5),cc.ScaleTo.create(0.3,0.8))
            this.fnt_coin.stopAllActions()
            this.fnt_coin.runAction(action);
        }
        this.fnt_coin.setString(coinNum)

        if (Number(this.fnt_gem.getString()) < crystalNum) {
            var action = cc.Sequence.create(cc.ScaleTo.create(0.1,1.5),cc.ScaleTo.create(0.3,0.8))
            this.fnt_gem.stopAllActions()
            this.fnt_gem.runAction(action);
        }
        this.fnt_gem.setString(crystalNum)

    },

    updatePlayer: function()
    {
        var go = this.find("DAPlayer")
        var headUrl = hallmanager.GetUserInfo().avatarpath
        var name = go.getNickname() //|| "default"
        this.text_name.setString(name)
        var width = this.text_name.getContentSize().width
        this.fnt_vip_num.setString(go.getVipLevel())

        if (width > 140) {
            //截掉
            var totalWidth = 0
            var newName = ""
            for (var key = 0; key < name.length && totalWidth < 140; key++) {
                newName += name[key]
                if (/^[\x41-\x5a]/.test(name[key])) {
                    totalWidth += this.text_name.getFontSize()*0.75
                    continue
                } else if (/^[\x00-\xff]/.test(name[key])) {
                    totalWidth += this.text_name.getFontSize()/2
                    continue
                } else {
                    totalWidth += this.text_name.getFontSize()
                }
                
            }
            this.text_name.setString(newName+"..")
        }
        
        if(headUrl == "") { return }
        wls.DownloadPic(headUrl, function(filePath){
            cc.log("download head success:"+filePath)
            this.setPlayerHead(filePath)
        }.bind(this))

        
    },

    updateMail: function()
    {
        var mails = this.find("DAHall").getMails()
        this.btn_yj.getChildByName("red_point").setVisible(mails.length > 0)
    },

    updateFreeCoin: function()
    {
        var configs = wls.SplitArray(wls.Config.getConfig("990000131"))
        for (var i = 0; i < configs.length; i++) {
            var id = configs[i];
            var info = this.find("DAPlayer").getFreeFishCoinInfo(id)
            var configCount = parseInt(wls.Config.get("share", 9).awardnum)
            if (!info.isReceive && (id!=6||id!=7)) {
                this.find("MainBtns").setBtnState("btn_mfyb", true);
                return
            }
            else if ((6==id && info.receiveCount<configCount) || (7==id && this.find("DAPlayer").getLoginDrawTimes()>0)) {
                this.find("MainBtns").setBtnState("btn_mfyb", true);
                return
            }
        }
        this.find("MainBtns").setBtnNormal("btn_mfyb")
    },

    updateMonthCard: function()
    {
        var data = this.find("DAPlayer").getMonthCardState();
        if (data.state == 1) 
        {
            this.find("MainBtns").setBtnState("btn_yklb", true);
        } 
        else
        {
            this.find("MainBtns").setBtnNormal("btn_yklb")
        }
    },

    updateAlm: function(newFishIcon) {
        this.btn_jjj.setVisible(false);
        var self = this;
        var callback = function()
        {
            self.find("SCRoomMgr").sendGetHallInfo();
        };
        
        var dataTab = {};
        dataTab.newFishIcon = newFishIcon;
        dataTab.propCount = 2;
        dataTab.firstPos = wls.getWordPosByNode(this.btn_jjj);
        this.find("EFOther").coinFlyAct(dataTab, null, callback);
    },

    switchPage: function(pageType) {
        var isShowMain = pageType == this.find("UIHallMain").PAGE_TYPE.MAIN_PAGE
        var isShowRoom = pageType == this.find("UIHallMain").PAGE_TYPE.JDMS_PAGE
        var isShowJJC = pageType == this.find("UIHallMain").PAGE_TYPE.JJC_PAGE
        var isShowDSS = pageType == this.find("UIHallMain").PAGE_TYPE.DSS_PAGE
        var isShowGDYX = pageType == this.find("UIHallMain").PAGE_TYPE.YLC_PAGE
        var isShowFreeMatch = pageType == this.find("UIHallMain").PAGE_TYPE.FREE_MATCH_PAGE
        
        this.node_main.setVisible(isShowMain)
        this.node_jdms.setVisible(isShowRoom)
        this.node_jjc.setVisible(isShowJJC)
        this.node_dss.setVisible(isShowDSS)
        this.node_gdyx.setVisible(isShowGDYX)
        this.node_free_match.setVisible(isShowFreeMatch)

    },

    setPlayerHead: function(path) {
        this.img_player_photo.loadTexture(path)
    },

    click_btn_addcrystal: function() {
        cc.log("click_btn_addcrystal")
        this.find("SCLayerMgr").setCurShowList(8,{shareType:"UIRechargeShare",shopType:2})
    },
    click_btn_addcoin: function() {
        cc.log("click_btn_addcoin")
        this.find("SCLayerMgr").setCurShowList(8,{shareType:"UIRechargeShare",shopType:1})
    },
    click_btn_privilege: function() {
        this.pushView("UIVipRight")
    },
    click_btn_player_head_bg: function()
    {
        this.activeGameObject("UIPlayerInfoPanel");
    },

    click_btn_bb: function() {
        this.activeGameObject("UIBag");
    },
});