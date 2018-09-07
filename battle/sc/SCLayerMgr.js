// 弹框管理器
wls.namespace.SCLayerMgr = cc.Node.extend
({
    onCreate: function() 
    {
        this.EFList = []
        this.isEFRunning = false
        this.initShowData()
    },

//--------------------------------------特效管理---------------------------------------------
    //插入特效列表
    pushEFLayewr: function(EFName,data)
    {
        this.EFList.push({EFName:EFName,data:data})
        this.updateEFLayewr()
    },
    //更新特效列表
    updateEFLayewr: function()
    {
        if (this.isEFRunning || this.EFList[0] == null) { return }
        var EFData = this.EFList[0]
        var isShow = true
        if (EFData.EFName == "EFMegawin") {
            isShow = this.find("EFMegawin").play(EFData.data.killFishScore);
        } else if (EFData.EFName == "EFWindfall") {
            isShow = this.find("EFWindfall").play(EFData.data.killFishScore);
        } else if (EFData.EFName == "EFLevelUp") {
            isShow = this.find("EFLevelUp").play(EFData.data);
        } else if (EFData.EFName == "EFBonuswin") {
            isShow = this.find("EFBonuswin").play(EFData.data);
        }
        if (!isShow) { 
            this.playEFEnd()
        } else {
            this.isEFRunning = true
        }
    },
    //播放下一个特效
    playEFEnd: function()
    {
        this.isEFRunning = false
        this.EFList.splice(0, 1);
        this.updateEFLayewr()
    },

//--------------------------------------礼包弹框管理---------------------------------------------

    //初始化显示列表
    initShowData: function()
    {
        var SHOW_LIST_1 = [//普通点击商店弹出
            ["UIMoreShare"],
            ["UIYiYuanChest"],
            ["ShopLayer"]
        ]
        var SHOW_LIST_2 = [//游戏内非首次救济金点击立即获得弹出 
            ["UIYiYuanChest","UIGunRateChest","UILuckChest","UINobleChest"],
            ["ShopLayer"]
        ]
        var SHOW_LIST_3 = [//50倍后退出任意房间时（不包含小游戏）弹出月卡礼包，购买以后不再弹出，如涉及尊享礼包弹出，月卡礼包不弹出
            ["UIDial"],
            ["UIFirstMonthcard"]
        ]
        var SHOW_LIST_4 = [//新手起航，普通转盘，分享,(锻造)
            // ["UINewerReward"],
            ["UIDial"],
            ["UIWechatShare"],
            ["UIForgedChest"]
        ]   
        var SHOW_LIST_5 = [//游戏内普通点击商店弹出
            ["UIMoreShare"],
            ["UINobleChest"],
            ["ShopLayer"]
        ]   
        var SHOW_LIST_6 = [//游戏内退出游戏
            ["SingleBoxByRate"],
            // ["GameExitTimerNotice","GameExitNotice"]
            ["GameExitNotice"]
        ]   
        var SHOW_LIST_7 = [//游戏内点击礼包
            ["UIMoreShare"],
            ["UIBox"]
        ]
        var SHOW_LIST_8 = [//大厅中点击商店弹出
            ["UIMoreShare"],
            ["UIYiYuanChest"],
            ["ShopLayer"]
        ]
        var SHOW_LIST_9 = [//水晶不足弹出 
            ["dayShare"],
            ["enoughGem"],
        ]
        var SHOW_LIST_10 = [//破产弹出
            ["almsShare"],
        ]
        var SHOW_LIST_11 = [//锻造分享
            ["UIBigShare"],
            ["ForgedLayer"]
        ]
        this.SHOW_LIST = {
            1:SHOW_LIST_1,
            2:SHOW_LIST_2,
            3:SHOW_LIST_3,
            4:SHOW_LIST_4,
            5:SHOW_LIST_5,
            6:SHOW_LIST_6,
            7:SHOW_LIST_7,
            8:SHOW_LIST_8,
            9:SHOW_LIST_9,
            10:SHOW_LIST_10,
            11:SHOW_LIST_11,
        }
        this.exitMonthCount = wls.Config.get("config", 990000127).data
    },

    setCurShowList: function(idx,data)
    {
        var showList = this.SHOW_LIST[idx]
        if (showList == null) { return }
        this.showList = showList
        this.listIdx = idx
        this.curIdx = 0
        this.showData = data 
        this.updateShow()
    },
    clearCurShowList: function()
    {
        this.showList = null
        this.listIdx = 0
        this.curShowName = null
        this.curIdx = 0
    },

    showBoxById: function(id)
    {
        if (FISH_DISABLE_CHARGE) {return false}
        if (!this.find("DAPlayer").isGameOpenGif()) {return false }
        var config = wls.Config.get("gif", id);
        if (config == null) { return false}
        var tConfig = this.find("DAPlayer").getTypeConfig(config.type);
        if (tConfig == null) { return false}
        var ui = this.find(tConfig.cls);
        if (ui && ui.id != id)
        {
            ui.removeFromScene();
        }
        this.pushView(tConfig.cls, id);
        return true
    },

    showLayerByName: function(layerName,isForce,data)
    {
        isForce = isForce || false
        if (isForce != true) { this.curShowName = layerName}
        var isShowSucceed = false
        if (layerName == "UIYiYuanChest") {
            var id = this.find("DAPlayer").calcSingleBox()
            if (id == 0) { return false }
            isShowSucceed = this.showBoxById(id)
        } else if (layerName == "UIGunRateChest") {
            var id = this.find("DAPlayer").calcGunRateBox()
            if (id == 0) { return false }
            isShowSucceed = this.showBoxById(id)
        } else if (layerName == "UILuckChest") {
            var id = this.find("DAPlayer").calcLuckBox()
            if (id == 0) { return false }
            isShowSucceed = this.showBoxById(id)
        } else if (layerName == "UINobleChest") {
            var id = this.find("DAPlayer").calcNobleBox()
            if (id == 0) { return false }
            isShowSucceed = this.showBoxById(id)
        } else if (layerName == "UIForgedChest") { //锻造宝箱
            data = data ||{}
            data.boxId = data.boxId || 0
            var boxId = data.boxId
            var gunRate = this.find("DAPlayer").getMaxGunRate()
            if (!isForce) { // 不是强制的，判断弹出条件
                if (gunRate < 2000 || this.find("DAPlayer").getLevelData().level < 8) {
                    return false
                }

                var playerId = this.find("DAPlayer").getPlayerId()
                var myDate = new Date((wls.GetCurTimeFrame() + wls.serverTimeDis)*1000);//获取系统当前时间
                var curDayData = wls.strFormat(myDate.getFullYear(),4) + wls.strFormat(myDate.getMonth()+1,2) + wls.strFormat(myDate.getDate(),2)
                var strData = cc.sys.localStorage.getItem(playerId+"loginForgedBox");
                if (curDayData == strData ) { return false }
                cc.sys.localStorage.setItem(playerId+"loginForgedBox", curDayData); 
                boxId = 830001028
            }
            if (boxId == 0) {
                var list = wls.Config.getGifList(3)
                for (var i = list.length-1; i >=0; i--) {
                    var element = list[i];
                    if (gunRate >= element.gunRateLow  && gunRate < element.gunRateHigh) {
                        boxId = element.id 
                        break
                    }
                }
            }
            isShowSucceed = this.showBoxById(boxId)
        } else if (layerName == "ShopLayer") {
            if (FISH_DISABLE_CHARGE) {return false}
            this.showData = this.showData ||{}
            this.showData.shopType = this.showData.shopType || 1
            this.pushView("UIShop",this.showData.shopType)
            isShowSucceed = true  
        } else if (layerName == "UIDial") {
            if (!this.find("DAPlayer").isUseLoginDraw()) {
                this.activeGameObject("UIDial")
                isShowSucceed = true  
            }
        } else if (layerName == "UIWechatShare") {
            if (!wls.Switchs.share) { return false }
            if (this.find("DAPlayer").isUseLoginDraw() && !isForce ) { return false }
            this.pushView("UIWechatShare")
            isShowSucceed = true  
        } else if (layerName == "UIFirstMonthcard") {
            if (FISH_DISABLE_CHARGE) {return false}
            var cardState = this.find("DAPlayer").getMonthCardState();
            if (cardState.state != 0 || this.find("DAPlayer").getMaxGunRate() <= 50) {return false } 
            var playerId = this.find("DAPlayer").getPlayerId()
            var myDate = new Date((wls.GetCurTimeFrame() + wls.serverTimeDis)*1000);//获取系统当前时间
            var curDayData = wls.strFormat(myDate.getFullYear(),4) + wls.strFormat(myDate.getMonth()+1,2) + wls.strFormat(myDate.getDate(),2)
            var strData = cc.sys.localStorage.getItem(playerId+"exitMonthcard");
            if (strData == null) { strData = curDayData+";" + 0 }
            var tb = strData.split(";")
            var newData = ""
            if (tb[0] == curDayData ) {
                if (parseInt(tb[1]) >= this.exitMonthCount) {return false}
                newData = curDayData+";" +(parseInt(tb[1])+1)
            } else {
                newData = curDayData+";" + 1
            }
            cc.sys.localStorage.setItem(playerId+"exitMonthcard", newData ); 
            this.activeGameObject("UIFirstMonthcard");
            isShowSucceed = true  
        } else if (layerName == "SingleBoxByRate") {
            var rate = this.find("DAPlayer").getMaxGunRate()
            if (this.exitRate == null) {
                var str = wls.Config.get("config", 990000124).data
                var tb = str.split(";")
                this.exitRate = {minRate:parseInt(tb[0]), maxRate:parseInt(tb[1])}    
            }
            if (this.exitRate.minRate > rate || this.exitRate.maxRate < rate) { return false }
            var id = this.find("DAPlayer").calcSingleBox()
            if (id == 0) { return false }
            isShowSucceed = this.showBoxById(id)
        } else if (layerName == "GameExitNotice") {
            this.getScene().doGameExitNotice()
            isShowSucceed = true  
            this.clearCurShowList()
        } else if (layerName == "UIMoreShare") {
            var shareType = this.showData.shareType
            if (shareType == "UIRechargeShare") {
                this.pushView("UIRechargeShare")
            }
            isShowSucceed = true 
        } else if (layerName == "UIBox") {
            var boxId = this.showData.boxId
            if (boxId == null ) { return false }
            isShowSucceed = this.showBoxById(boxId)
        } else if (layerName == "dayShare") { //日常分享
            isShowSucceed = this.showLayerByName("UIWechatShare",true)
        } else if (layerName == "enoughGem") {
            return this.getScene().showNotEnoughGemTip()
        } else if (layerName == "almsShare") { //救济金分享
            var shareData = wls.Config.getShareDataByType(17)
            var curCount = this.find("DAPlayer").getShareTimes(17)
            var tb = {
                id:17,
                shareType:shareData.share_type,
                share_res:this.fullPath("common/images/commonshare/" + shareData.res),
                curCount:(curCount>shareData.awardnum?shareData.awardnum:curCount),
                maxCount:shareData.awardnum,
            }
            this.pushView("UIBankruptShare",tb)
        } else if (layerName == "UIBigShare") {
            var curCount = this.find("DAPlayer").getShareTimes(11)
            var configCount = parseInt(wls.Config.get("share", 7).times)//索引 7 type 11
            if (curCount < configCount) {
                if (this.find("UIShareDialog")) {
                    this.pushView("UIShareDialog", this.showData)
                } else {
                    this.pushView("UIForged");
                    this.pushView("UIShareDialog", this.showData)
                }
            }
            return false
        } else if (layerName == "ForgedLayer") {
            this.pushView("UIForged");
            return true
        }




        return isShowSucceed
    },

    hideLayerByName: function(layerName,data)
    {
        if (this.showList == null) {return }
        var isCur = false 
        for (var i = 0; i < this.showList.length; i++) {
            var tb = this.showList[i]
            for (var j = 0; j < tb.length; j++) {
                if (layerName == tb[j] ) {
                    isCur = true 
                    break
                }
            }
        }
        if (!isCur) {return }
        for (var i = 0; i < this.showList.length; i++) {
            var tb = this.showList[i]
            for (var j = 0; j < tb.length; j++) {
                if (this.curShowName == tb[j] && i == this.curIdx ) {
                    this.curIdx = this.curIdx +1
                    this.updateShow()
                    return 
                }
            }
        }
    },

    updateShow: function( )
    {
        if (this.showList == null) {return }
        var curShowList = this.showList[this.curIdx]
        if (curShowList == null) {
            this.clearCurShowList()
            return 
        }

        for (var i = 0; i < curShowList.length; i++) {
            if (this.showLayerByName(curShowList[i],null,null)){ return }
        }
        this.curIdx = this.curIdx +1
        this.updateShow()
    },

    playNextlayer: function( isOverClear,data )
    {
        if (this.showList == null) {return }
        this.curIdx = this.curIdx +1
        if (isOverClear == false && this.curIdx > this.showList.length) {return }
        this.updateShow()
    },

    hideAllLayer: function()
    {
        var list = this.getScene().mPushViewList
        var l = list.length;
        while (l > 0)
        {
            l = l - 1;
            var ui = list[l];
            list.splice(l, 1);
            if (ui.isVisible() && ui.doKeyBack())
            {}
        }
    },


});