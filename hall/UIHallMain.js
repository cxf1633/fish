/****************************************************************
 * 作者：xiaos
 * 日期：2018-07-09
 * 描述：大厅房间背景图标
 ****************************************************************/
"use strict";

//-----------------------------------------------------
// 房间结点
//-----------------------------------------------------
wls.namespace.UIRoom = ccui.Layout.extend({
    getZorder:function () {
        return 0
    },
    onCreate: function(data) {
        var ccnode = wls.LoadStudioNode(this.fullPath("hall/uiroom.json"), this)
        this.addChild(ccnode)
       
        this.isRunning = false
        this.lv = 0
        this.idx = 2
    },

    refreshWithData: function(data, time) {
        if (this.isRunning) { return }
        time = this.lv == 0 ? 0.2 : time
        if (time == 0) { return }
        var lv = data["lv"]
        this.resetRoomIcon(lv)
        this.unlockRoom(lv)
        this.scrollTo(data, time)
    },

    resetRoomIcon: function(lv) {
        this.node_fish.removeAllChildren()
        var ccnode = wls.LoadStudioNode(this.fullPath("hall/uiroom0"+lv+".json"), this.node_fish)
        this.node_fish.addChild(ccnode)
        for (var key = ccnode.getChildren().length-1; key >= 0; key--) {
            var order = parseInt(ccnode.getChildren()[key].getTag())
            wls.ChangeParentNode(ccnode.getChildren()[key], this.node_fish, order)
        }
        this.node_fish.getChildByName("room_title").setVisible(false)
        this.node_fish.getChildByName("room_condition").setVisible(true)
        this.lv = lv
    },

    unlockRoom: function(lv) {
        var maxGunRate = (this.find("DAPlayer").getMaxGunRate() || 0)
        var newUnlockLv = this.find("PageRoom").getUnlockRoomLv(maxGunRate)
        if (this.lv <= newUnlockLv) {
            this.node_fish.getChildByName("room_title").setVisible(true)
            this.node_fish.getChildByName("room_condition").setVisible(false)
        }
        
        
        return
        var maxGunRate = (this.find("DAPlayer").getMaxGunRate() || 0)
        if (maxGunRate == 0 || maxGunRate == null) { return }
        var newUnlockLv = this.find("PageRoom").getUnlockRoomLv(maxGunRate)
        var oldGunRate = (this.find("DAHall").getOldGunRate() || 1)
        var configMinGunRate = parseInt(wls.Config.get("room", 910000000+lv)["cannon_min"])
        var isNeedPlayUnlock = (newUnlockLv == lv && oldGunRate < configMinGunRate && maxGunRate >= configMinGunRate)
        var isGunRateUp = (maxGunRate > oldGunRate)

        if (maxGunRate >= configMinGunRate) {
            var nodeUnlocked = this.node_fish.node_unlocked
            var sprWordRoom = this.node_fish.spr_word_room
            //sprWordRoom.initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this.fullPath("hall/images/title/room_title_"+lv+"_2.png")))
            if (isGunRateUp && isNeedPlayUnlock) {
                //放动画
                var nodeUnlocked = this.node_fish.getChildByName("bg").getChildByName("node_unlocked")
                nodeUnlocked.removeAllChildren()
                var ccnode = wls.LoadStudioNode(this.fullPath("hall/uiroom_unlocked.json"), nodeUnlocked)
                nodeUnlocked.addChild(ccnode)
                nodeUnlocked.inner_action.play("unlocked", false)
                nodeUnlocked.runAction(cc.Sequence.create(cc.DelayTime.create(1.34), cc.CallFunc.create(function(){nodeUnlocked.setVisible(false)}.bind(this))))
                this.find("DAHall").setOldGunRate(maxGunRate)
            } else {
                nodeUnlocked.setVisible(false)
            }
        }
    },

    scrollTo: function(data, time) {
        if (this.isRunning) {return}
        var idx = data.idx
        this.scroll(this.idx, idx, time || 0)
        this.idx = idx
        this.isRunning = true
    },

    scroll: function(oldIdx, newIdx, time) {
        var scrollIdx = (newIdx == 4 ? 2 : newIdx)-(oldIdx == 4 ? 2 : oldIdx)
        var targetPos = cc.p(scrollIdx*360, 0)
        var isRight = (newIdx > oldIdx)
        var isShow = (oldIdx >= 1 && oldIdx <= 3) 
        var isToMid = (newIdx == 4 || newIdx == 2)
        var isSpecial = (oldIdx==4 && newIdx == 2)
        var scaleActName = ( isShow || isSpecial ? "S" : "H")+"ScrTo"+( isToMid ? "Mid" : "Side")

        this.inner_action.play(scaleActName, false)
        if (time == 0) {this.inner_action.gotoFrameAndPause(this.inner_action.getEndFrame())}
        var moveByTime = ((oldIdx == 3 || newIdx == 1) ? 0 : time)
        if (!isRight) { moveByTime = ((moveByTime == 0) ? time : 0) }
        var moveDelayTime = ((moveByTime==0) ? time : 0)
        var moveAct = cc.MoveBy.create(moveByTime, targetPos)
        var moveDelayAct = cc.DelayTime.create(moveDelayTime)
        var seq1 = cc.Sequence.create(moveAct, moveDelayAct)
        var seq2 = cc.Sequence.create(moveDelayAct, moveAct)
        this.runAction(oldIdx != 3 ? seq2 : seq1)
        this.runAction(cc.Sequence.create(cc.DelayTime.create(time), cc.CallFunc.create(function(){ this.scrollEnd() }.bind(this))))
        if (newIdx == 4) {
            this.setVisible(false)
        } else {
            this.runAction(cc.Sequence.create(cc.DelayTime.create(time), cc.CallFunc.create(function(){this.setVisible(true)}.bind(this))))
        }
    },

    scrollEnd: function() {
        this.isRunning = false
        if (this.idx == 2) { this.node_fish.inner_action.play("roomact", true) } else { this.node_fish.inner_action.play("stopact", true) }
    },

    getRoomSize: function() {
        return cc.size(this.panel.getContentSize().width, this.panel.getContentSize().height)
    },

    getIdx: function() { return this.idx },
    getLv: function() { return this.lv },
    isScrolling: function() { return this.isRunning },
    isClicked: function(touchBegPos) {
        var parent = this.panel.getParent()
        var pos = parent.convertToWorldSpace(this.panel.getPosition())
        var size = this.panel.getContentSize()
        var rect = cc.rect(pos.x-size.width/2, pos.y-size.height/2, size.width, size.height)
        var isContains = cc.rectContainsPoint(rect, touchBegPos)
        var ret = (isContains && this.isVisible())
        return ret
    },

    clicked: function(pos) {
        if (this.isRunning) { return }
        if (!this.find("SCRoomMgr")) { return }
        this.find("SCRoomMgr").doGetDesk(this.lv)
    },
});

//-----------------------------------------------------
// 每日免费赛页面
//-----------------------------------------------------
wls.namespace.PageFreeMatch = wls.WrapNode.extend
({
    onCreate: function() {
        wls.BindUI(this, this)
        this.listview_items.setPosition(display.width/2, display.height*5/11)
        this.img_free_match_demo.setVisible(false)
        var list1 = wls.Config.getMatchList(1)
        var list2 = wls.Config.getMatchList(2)
        this.configs = list1.concat(list2)
        this.listview_items.setBounceEnabled(false)
    },

    refresh: function() {
        this.listview_items.removeAllItems()
        this.addItems(this.configs)
    },

    addItems: function(list1) {
        for (var key = 0; key < list1.length; key++) {
            var icon = this.createItem(list1[key])
            this.listview_items.pushBackCustomItem(icon)
        }
    },

    createItem: function(config) {
        var serverRoomConfig = this.find("DAHall").getArenaRoomConfigs(config.ID)
        var shortId = (parseInt(config.ID)%10)
        var rewardList = config.reward.split(";")
        var costList = config.cost.split(";")
        var championPropId = parseInt(rewardList[1])
        var championPropCount = parseInt(rewardList[2])
        var costPropId = parseInt(costList[0])
        var costPropCount = parseInt(costList[1])
        var championPropInfo = wls.Config.getItemData(championPropId)
        var costPropInfo = wls.Config.getItemData(costPropId)
        var joinCount = this.find("DAPlayer").getArenaSignUpTimes(parseInt(config.ID))
        var freeTimes = parseInt(config.freetime)-joinCount
        var isOpen = serverRoomConfig.isOpen || false
        var timeInfo = (serverRoomConfig.timeParam || "").split(",")
        var timeStr = (timeInfo[0] || "10:00")+"-"+(timeInfo[1] || "23:00")
        var openTimeStr =  wls.Config.getLanguage(800000457)+timeStr
        var conditionStr = wls.format(wls.Config.getLanguage(800000455), "%s", [config.cannon || 1])
        var isShowCountdown = (parseInt(config.type) == 2 && isOpen)
        var endTime = wls.GetCurTimeFrame()+(serverRoomConfig.leftEndSecond || 10)+wls.serverTimeDis
        var countdownStr = wls.Config.getLanguage(800000456)+wls.getFormatTimeBySeconds(endTime-wls.GetCurTimeFrame()+wls.serverTimeDis)
        var item = this.img_free_match_demo.clone()
        var closeTimeParam = wls.GetTimeFrameByData(null,null,null,22,0,0)
        cc.log(wls.serverTimeDis)
        wls.BindUI(item, item)

        wls.OnClicked(item.btn_help, this, "btn_help")
        wls.OnClicked(item.btn_enter, this, "btn_enter")
        wls.OnClicked(item.btn_rank, this, "btn_rank")
        item.btn_rank.setTag(config.ID)
        item.btn_enter.setTag(shortId-1)
        item.btn_help.setTag(shortId-1)
        item.btn_rank.setVisible(parseInt(config.type) != 1)

        item.text_free_title.setVisible(freeTimes > 0)
        item.text_free_num.setVisible(freeTimes > 0)
        item.text_free_num.setString(freeTimes < 0 ? 0 : freeTimes)
        item.img_cost_icon.setVisible(freeTimes <= 0)
        item.text_cost_price.setVisible(freeTimes <= 0)

        item.text_cost_price.setString(costPropCount)
        item.text_desc_1.setString(isShowCountdown ? countdownStr : openTimeStr)
        item.text_desc_2.setString(conditionStr)
        item.img_cost_icon.loadTexture(this.fullPath("common/images/prop/"+costPropInfo.res), 1)
        item.text_gift_num.setString("x"+(championPropCount >= 10000 ? ((championPropCount/10000)+"万") : championPropCount))
        item.img_gift_icon.loadTexture(this.fullPath("common/images/prop/"+championPropInfo.res), 1)
        item.loadTexture(this.fullPath("hall/images/hall_jjc/dailyrace_bg_"+shortId+".png"), 1)
        item.img_icon.loadTexture(this.fullPath("hall/images/hall_jjc/dailyrace_icon_"+shortId+".png"), 1)
        item.img_title.loadTexture(this.fullPath("hall/images/hall_jjc/dailyrace_title_"+shortId+".png"), 1)
        item.setVisible(true)
        item.img_share.setVisible(false)
        if (!isShowCountdown) { return item }

        //判断是否分享
        var shareData = wls.Config.getShareDataById(config.share_id)
        if (shareData) {
            var curCount = this.find("DAPlayer").getShareTimes(shareData.type)
            if (joinCount >= config.maxnum + curCount) {
                item.img_share.setVisible(true)
                item.img_bm.setVisible(false)
                item.text_free_num.setVisible(false)
                item.text_free_title.setVisible(false)
                item.text_cost_price.setVisible(false)
                item.img_cost_icon.setVisible(false)
                var tb = {
                    isCanShare:joinCount < config.maxnum + shareData.awardnum,
                    id:shareData.type,
                    shareType:shareData.share_type,
                    share_res:this.fullPath("common/images/commonshare/" + shareData.res),
                    curCount:(curCount>shareData.awardnum?shareData.awardnum:curCount),
                    maxCount:shareData.awardnum,
                }
                item.img_share.info = tb 
            }
            var leaveTime = config.maxnum + curCount - joinCount 
            var conditionStr = wls.format(wls.Config.getLanguage(800000482), "%s", [leaveTime < 0 ?"0":(leaveTime+"")])
            item.text_desc_2.setString(conditionStr)
        }

        item.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.CallFunc.create(function(){
            var seconds = endTime-wls.GetCurTimeFrame()+wls.serverTimeDis
            if (seconds <= 0) { 
                endTime += parseInt(timeInfo[2])*60;
                seconds = endTime-wls.GetCurTimeFrame()+wls.serverTimeDis
            }
            countdownStr = wls.Config.getLanguage(800000456)+wls.getFormatTimeBySeconds(seconds)
            if (endTime >= closeTimeParam) {
                countdownStr = wls.Config.getLanguage(800000457)+(timeInfo[0] || "10:00")+"-"+(timeInfo[1] || "23:00")
                item.stopAllActions()
            }
            
            item.text_desc_1.setString(countdownStr)
        }.bind(this)), cc.DelayTime.create(1))))
        return item
    },

    getReadyEnterConfig: function() {
        return this.readyEnterConfig
    },

    click_btn_enter: function(sender) {
        var text_cost = sender.getChildByName("text_cost_price")
        var text_free_num = sender.getChildByName("text_free_num")
        var img_share = sender.getChildByName("img_share")
        if (img_share.isVisible()) {
            if (!img_share.info.isCanShare) {
                this.toast(wls.Config.getLanguage(800000481))
                return 
            }
            this.pushView("UIAddJoinCountShare",img_share.info)
            return 
        }

        this.readyEnterConfig = this.configs[sender.getTag()]
        if (this.find("DAPlayer").getMaxGunRate() < this.readyEnterConfig.cannon) { 
            this.toast(wls.format(wls.Config.getLanguage(800000469), "%s", [this.readyEnterConfig.cannon.toString()]))
            return
        }
        if (text_cost.isVisible() && this.find("DAPlayer").getMoney() < parseInt(text_cost.getString())) { 
            this.toast(wls.format(wls.Config.getLanguage(800000468), "%s", [text_cost.getString()]))
            return 
        }
        if (text_cost.isVisible()) {
            this.find("DAPlayer").setMoney(this.find("DAPlayer").getMoney()-parseInt(text_cost.getString()))
            if (this.find("UIHallPanel")) { this.find("UIHallPanel").updateMoney() }
        } else {
            var times = Number(text_free_num.getString())-1
            text_free_num.setString(times)
        }
        if (this.readyEnterConfig.ID == 500001002) {
            wls.RoomIdx = 7
        } else if (this.readyEnterConfig.ID == 500001003) {
            wls.RoomIdx = 7
        } else if (this.readyEnterConfig.ID == 500001001) {
            wls.RoomIdx = 6
        }

        this.find("SCRoomMgrArena").sendSignUpFreeMatch(this.readyEnterConfig.ID)
        //this.createGameObject("UIFreeMasterQueue", this.getReadyEnterConfig())
        
    },

    click_btn_help: function(sender) {
        var config = this.configs[sender.getTag()]
        this.pushView("UIHallMasterRule", config.helpful)
    },

    click_btn_rank: function(sender) {
        var roomId = sender.getTag()
        if (roomId == 500001002) {
            this.sendMsg("sendMasterGetRanking",5)
        } else if (roomId == 500001003) {
            this.sendMsg("sendMasterGetRanking",4)
        }
    },
})

//-----------------------------------------------------
// 娱乐城页面
//-----------------------------------------------------
wls.namespace.PageYLC = wls.WrapNode.extend
({
    onCreate: function() {
        wls.BindUI(this, this);
        //适配屏幕
        var offsetX = 45+wls.OffsetX;
        this.pageview_games.setPosition(display.width / 2, display.height / 2);
        this.btn_left.setPosition(offsetX, display.height / 2);
        this.btn_right.setPosition(display.width - offsetX, display.height / 2);
        this.node_indicators.setPosition(display.width / 2, 40);

        var size = cc.size(display.width, 500/720*display.height);
        this.pageview_games.setContentSize(size);
        this.pageview_games.addEventListener(this.scrollEvent.bind(this));
        this.gameIndex = 0;
        //配置文件
        this.configs = [];
        var self = this;
        wls.Config.ForEachNew("moregame", function (val) {
                self.configs.push(val);
        });
        this.configs.sort(function (a, b) {
            return a.id - b.id;
        });
        this.createPages(3);
    },
    createPages: function(pageNum) {
        var indicatorSize = this.img_indicator_demo.getContentSize()
        for (var i = 0; i < pageNum; i++) {
            var layout = this.createGameItems();
            this.pageview_games.addPage(layout);
            var p = this.pageview_games.getPosition();
            //添加指示器
            var indicator = this.img_indicator_demo.clone()
            indicator.setPositionX(0-(pageNum*indicatorSize.width)/2+indicatorSize.width/2+i*indicatorSize.width)
            indicator.setPositionY(0)
            this.node_indicators.addChild(indicator)
        }
        this.btn_left.setVisible(false);
        this.node_indicators.getChildren()[0].loadTexture(this.fullPath("hall/images/smallgame/sgame_indicator_1.png"), 1);
        this.img_indicator_demo.setVisible(false);
        this.img_sgame_demo.setVisible(false);
    },
    createGameItems: function() {
        var layout = ccui.Layout.create();
        layout.setBackGroundColor(cc.c3b(255, 0, 0));
        layout.setBackGroundColorOpacity(0);
        layout.setBackGroundColorType(1);

        var offsetX = 350/1280*display.width;
        var offsetY = 250/720*display.height;
        var baseX = 290/1280*display.width;
        var baseY = 350/720*display.height;
        for (var i = 0; i < 6; i++){
            var item = this.img_sgame_demo.clone();
            item.idx = i;
          
            var posX = (i%3)*offsetX + baseX;
            var posY = baseY - Math.floor(i/3)*offsetY;
            item.setPosition(posX, posY);
            wls.OnClicked(item, this);
            layout.addChild(item);
            var config = this.configs[this.gameIndex];
            if(config){
                var path = this.fullPath("hall/images/smallgame/" + config.icon);
                item.loadTexture(path, 1);
                item.setTouchEnabled(true);
            }
            else{
                item.setTouchEnabled(false);
            }
            this.gameIndex += 1;
        }
        return layout;
    },
    click_img_sgame_demo:function(sender){
        var config = this.configs[sender.idx];
        if(config.type == 1 && wls.IsMiniProgrom()){
            var extraData = {"gameId": config.gameid, "appId": config.appid};
            GameBoxLogic.openGameBox(extraData);
        }
        else if(config.type == 2 && wls.IsMiniProgrom()){
            GameBoxLogic.openGameBox();
        }
        else{
            cc.log("config.type =", config.type);
            cc.log("iswechat =", wls.IsMiniProgrom());
        }
    },
    click_btn_left: function() {
        var idx = this.pageview_games.getCurPageIndex()-1
        this.pageview_games.scrollToPage(idx)
    },
    click_btn_right: function() {
        var idx = this.pageview_games.getCurPageIndex()+1
        this.pageview_games.scrollToPage(idx)
    },
    scrollEvent: function(sender, event) {
        var totalPage = this.pageview_games.getPages().length
        var idx = this.pageview_games.getCurPageIndex()
        this.btn_left.setVisible(idx != 0)
        this.btn_right.setVisible(idx != (totalPage-1))
        for (var index = 0; index < this.node_indicators.getChildren().length; index++) {
            this.node_indicators.getChildren()[index].loadTexture(
                this.fullPath("hall/images/smallgame/sgame_indicator_"+(index == idx ? 1 : 0)+".png"), 1)
        }
    },

    enterSGame: function(gameid) {
        //离开捕鱼房间
        this.find("SCRoomMgr").leaveRoom();
        var roomInfos = HallManager.getInstance().GetRoomInfos();
        for (var key in roomInfos) {
            if (roomInfos.hasOwnProperty(key)) {
                var element = roomInfos[key];
                if(element.gameid == gameid){
                    HallManager.getInstance().JoinRoom(element.id);
                    return;
                }
            }
        }
    },

    click_btn_enter: function(sender) {
        var isShowGame = sender.getChildByName("spr_game").isVisible()
        if (!isShowGame) { return }
        var gameid = sender.getTag()
        var touchBeginPos = sender.getTouchBeganPosition()
        var touchEndPos = sender.getTouchEndPosition()
        touchBeginPos = sender.getParent().convertToWorldSpace(touchBeginPos)
        touchEndPos = sender.getParent().convertToWorldSpace(touchEndPos)
        if ((touchEndPos.x-touchBeginPos.x < 6) && (touchEndPos.x-touchBeginPos.x > -6)) {
            this.enterSGame(gameid)
        }
    },
})

//-----------------------------------------------------
// 竞技场页面
//-----------------------------------------------------
wls.namespace.PageJJC = wls.WrapNode.extend
({
    onCreate: function() {
        wls.BindUI(this, this)
        this.img_mrmfs.setPositionX(display.width/2-this.img_mrmfs.getContentSize().width*3/5)
        this.img_dss.setPositionX(display.width/2+this.img_dss.getContentSize().width*3/5)
        this.img_mrmfs.setPositionY(display.height*5/11)
        this.img_dss.setPositionY(display.height*5/11)
        wls.OnClicked(this.img_mrmfs.getChildByName("btn_challenge"), this, "btn_free_chall")
        wls.OnClicked(this.img_dss.getChildByName("btn_challenge"), this, "btn_dss_chall")

        var data= this.find("DAMaster").getRoomConfig()
        var str = wls.format(wls.Config.getLanguage(800000461),"%s",[data.openTimeStart,data.openTimeEnd]) + "\n"
        var str1 = wls.format(wls.Config.getLanguage(800000462),"%s",[data.cannon])
        this.txt_dss_des.setString(str+str1)

        wls.PlayTimelineAction(this.node_mfs, "act", true)
        wls.PlayTimelineAction(this.node_dss, "act", true)

    },

    updateMatchNum: function(num) {
        this.txt_mrmfs_des.setString(wls.format(wls.Config.getLanguage(800000460),"%s",[num.toString()]))
    },

    click_btn_free_chall: function() {
        this.waiting(true,"EnterArenaRoom");
        this.getScene().enterNextRoom("SCRoomMgrArena");
    },

    click_btn_dss_chall: function() {
        this.pushView("UIHallMaster")
        this.sendMsg("sendGetMasterStatus")
    },
})

//-----------------------------------------------------
// 房间选择页面
//-----------------------------------------------------
wls.namespace.PageRoom = wls.WrapNode.extend
({
    ROOM_LV_LIST : [
        {"lv":1, "idx":1},
        {"lv":2, "idx":2},
        {"lv":3, "idx":3},
        {"lv":5, "idx":4},
    ],
    onCreate: function() {
        wls.BindUI(this, this);
        this.curIdx = 0
        this.setVisible(false)
        this.setPosition(display.width / 2, display.height / 2)
        this.Panel_Touch.setPosition(0, 0)
        this.Panel_Touch.setContentSize(display.width, display.height)
        this.Panel_Touch.addTouchEventListener(this.touchEvent, this)

        this.rooms = []
        this.getScene().setGameObjectRoot(this.RoomRoot);
        for (var key = 0; key < 4; key++) {
            var icon = this.createUnnamedObject("UIRoom", this.ROOM_LV_LIST[key])
            icon.setVisible(false)
            this.rooms.push(icon);
        }
        this.getScene().setGameObjectRoot(null);
    },

    refreshWithData: function(data) {
        var maxGunRate = (data.maxGunRate || 1)
        var roomList = this.getRoomList(maxGunRate)
        for (var key = 0; key < this.rooms.length; key++) {
            var room = this.rooms[key]
            room.setVisible(true)
            room.refreshWithData(roomList[key])
        }
    },

    getRoomList: function(maxGunRate) {
        var copyRoomList = [
            {"lv":1, "idx":1},
            {"lv":2, "idx":2},
            {"lv":3, "idx":3},
            {"lv":5, "idx":4},
        ]
        var offsetIdx = 0
        for (var key = copyRoomList.length-1; key >= 0; key--) {
            var lv = copyRoomList[key]["lv"]
            var idx = copyRoomList[key]["idx"]
            var roomLimitMax = parseInt(wls.Config.get("room", 910000000+lv)["cannon_max"])
            var roomLimitMin = parseInt(wls.Config.get("room", 910000000+lv)["cannon_min"])
            var isOverMinReq = (maxGunRate >= roomLimitMin)
            var isEndless = (roomLimitMax == -1)
            var isLock = (!isOverMinReq)
            if (isOverMinReq) {
                offsetIdx = 2-idx
                break
            }
        }

        for (var key = copyRoomList.length-1; key >= 0; key--) {
            var tempIdx = copyRoomList[key]["idx"]+offsetIdx
            tempIdx = (tempIdx <= 0 ? (4+tempIdx) : tempIdx)
            tempIdx = (tempIdx > 4 ? (tempIdx-4) : tempIdx)
            copyRoomList[key]["idx"] = tempIdx
        }

        var compare = function(room1, room2) {
            return room1["idx"] >= room2["idx"]
        }
        copyRoomList.sort(compare)

        if (maxGunRate >= 150) {
            for (var key = 0; key < copyRoomList.length; key++) {
                if (copyRoomList[key]["lv"] == 1) {
                    var temp = copyRoomList[key]["lv"]
                    copyRoomList[key]["lv"] = copyRoomList[3]["lv"]
                    copyRoomList[3]["lv"] = temp
                }
            }
        }

        return copyRoomList
    },

    getUnlockRoomLv: function(maxGunRate) {
        var selectLv = 1
        for (var key = this.ROOM_LV_LIST.length-1; key >= 0; key--) {
            var room = this.ROOM_LV_LIST[key]
            var lv = room.lv
            var configMinGunRate = wls.Config.get("room", 910000000+lv)["cannon_min"]
            if (maxGunRate >= configMinGunRate) {
                selectLv = lv
                break
            }
        }
        return selectLv
    },

    getRoom: function(idx) {
        for (var key = 0; key < this.rooms.length; key++) {
            var room = this.rooms[key]
            if (room.getIdx() == idx) {
                return room
            }
        }
    },

    scroll: function(beginPos, endPos) {
        if (this.getRoom(1) && this.getRoom(1).isScrolling()) { return }
        var isValid = false
        var isRight = (endPos.x > beginPos.x)
        var maxGunRate = this.find("DAPlayer").getMaxGunRate()
        for (var key = 0; key < this.rooms.length; key++) {
            if (this.rooms[key].isClicked(beginPos)) {
                isValid = true
                break
            }
        }

        if (isValid == false) {
            return;
        }

        for (var key = 0; key < this.rooms.length; key++) {
            var val = this.rooms[key]
            var lv = val.getLv()
            var idx = val.getIdx()
            idx = isRight ? ((idx%4)+1) : (((idx%4)-1) == 0 ? 4 : ((idx-1)%4))
            val.scrollTo({"lv":lv, "idx":idx}, 0.2)
        }
        if (maxGunRate < 150) { return }
        //炮倍大于150
        var lv = 1
        for (var key = 0; key < this.rooms.length; key++) {
            var val = this.rooms[key]
            if (isRight && val.getIdx() == 1) {
                var lv = this.getRoom(4).getLv()
                val.resetRoomIcon(lv)
                val.unlockRoom(lv)
            }
            if (!isRight && val.getIdx() == 3) {
                var lv = this.getRoom(4).getLv()
                val.resetRoomIcon(lv)
                val.unlockRoom(lv)
            }
        }
        for (var key = 0; key < this.rooms.length; key++) {
            var val = this.rooms[key]
            if (val.getIdx() == 4) {
                val.resetRoomIcon(lv)
                val.unlockRoom(lv)
            }
        }
    },
    
    click: function(endPos) {
        if (!this.isVisible()) { return }
        var beginPos = cc.p(0, 0)
        for (var key = 0; key < this.rooms.length; key++) {
            var val = this.rooms[key]
            if (val.isClicked(endPos) && (!val.isScrolling())) {
                if (val.getIdx() == 2) {
                    val.clicked(endPos)
                    break
                } else {
                    beginPos = cc.p(val.getIdx()>2 ? endPos.x+1 : endPos.x-1, endPos.y)
                    this.scroll(beginPos, endPos)
                }
            }
        }
    },

    touchEvent: function(sender, type)
    {
        if (type == ccui.Widget.TOUCH_ENDED) {
            cc.log("touch end")
            this.find("SCSound").playEffect("com_btn03.mp3")
            var touchBeginPos = sender.getTouchBeganPosition()
            var touchEndPos = sender.getTouchEndPosition()
            if ((touchEndPos.x-touchBeginPos.x > 6) || (touchEndPos.x-touchBeginPos.x < -6)) {
                this.scroll(touchBeginPos, touchEndPos)
            } else {
                this.click(touchEndPos)
            }
        }
    },
});


// 背景界面
wls.namespace.UIHallMain = ccui.Layout.extend
({
    PAGE_TYPE:{
        MAIN_PAGE:1,
        JDMS_PAGE:2,
        JJC_PAGE:3,
        DSS_PAGE:4,
        YLC_PAGE:5,
        FREE_MATCH_PAGE:6,
    },
    onCreate: function()
    {
        var ccnode = wls.LoadStudioNode(this.fullPath("hall/fish_hall_bg.json"), this)
        this.addChild(ccnode)
        this.setContentSize(display.width, display.height)
        this.node_mode.setPosition(display.width/2, display.height/2)
        this.img_hall_bg.setPosition(display.width / 2, display.height / 2)
        this.img_hall_bg.setScale(wls.MainScale * 1.01)
        // wls.PlayTimelineAction(this.sunshine)
        // wls.PlayTimelineAction(this.water_light)
        this.wrapGameObject(this.Node_Room, "PageRoom")
        this.wrapGameObject(this.node_jjc, "PageJJC")
        this.wrapGameObject(this.node_sgame, "PageYLC")
        this.wrapGameObject(this.node_free_match, "PageFreeMatch")
        wls.PlayTimelineAction(this.mode_jjc, "act", true)
        wls.PlayTimelineAction(this.mode_jdms, "act", true)
        //wls.PlayTimelineAction(this.mode_hdxb, "act", true)
        wls.PlayTimelineAction(this.mode_ylc, "act", true)
        this.lockModel("mode_hdxb")
        //this.lockModel("mode_ylc")
        this.switchPage(-1)
    },

    switchDefault: function() {
        if (this.pageType != -1) { return } 
        this.find("UIHallMain").switchPage(wls.isShowJDMS ? this.find("UIHallMain").PAGE_TYPE.JJC_PAGE : this.find("UIHallMain").PAGE_TYPE.MAIN_PAGE)
    },

    lockModel: function(name) {
        if (this[name] == null || this[name] == undefined) { return }
        var lock = cc.Sprite.create()
        lock.setSpriteFrame(this.fullPath("hall/images/room/hall_pic_suo.png"))
        this[name].addChild(lock)
        this[name].setColor(cc.c3b(127, 127, 127))
    },

    switchPage: function(pageType) {
        if (this.pageType == pageType) { return }
        var isShowMain = pageType == this.PAGE_TYPE.MAIN_PAGE
        var isShowJDMS = pageType == this.PAGE_TYPE.JDMS_PAGE
        var isShowJJC = pageType == this.PAGE_TYPE.JJC_PAGE
        var isShowYLC = pageType == this.PAGE_TYPE.YLC_PAGE
        var isShowFreeMatch = pageType == this.PAGE_TYPE.FREE_MATCH_PAGE
        if (this.find("UIHallPanel")) {this.find("UIHallPanel").switchPage(pageType)}
        this.node_mode.setVisible(isShowMain)
        this.Node_Room.setVisible(isShowJDMS)
        this.node_jjc.setVisible(isShowJJC)
        this.node_sgame.setVisible(isShowYLC)
        this.node_free_match.setVisible(isShowFreeMatch)
        if (isShowFreeMatch) { this.node_free_match.refresh() }
        this.pageType = pageType
    },

    getCurPage: function() {
        return this.pageType
    },

    click_btn_jjc: function() {
        this.switchPage(this.PAGE_TYPE.JJC_PAGE)
    },
    
    click_btn_jdms: function() {
        
        this.switchPage(this.PAGE_TYPE.JDMS_PAGE)
        
    },

    click_btn_yqxb: function() {
        this.toast("功能暂未开放!")
    },

    click_btn_gdyx: function() {
        //this.toast("功能暂未开放!")
        this.switchPage(this.PAGE_TYPE.YLC_PAGE)
    },

})