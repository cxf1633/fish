"use strict";
// 捕鱼大厅房间管理器
wls.namespace.SCRoomMgr = cc.Node.extend
({
    onCreate: function() 
    {
        // 优先进入的测试房间
        this.testRoomIDs = { 606 : true, 103: true};
        this.emptyTB = {}
        this.bUseCache = true;
        this.msg = new MsgHeader();
    },

    cleanup: function()
    {
        this.leaveRoom();
    },

    leaveRoom: function()
    {
        if (this.roommgr)
        {
            wls.InitiativeLeave = true; // 玩家主动离开房间
            this.roommgr._pfnMsgProcess[4296] = null;
            this.roommgr.ExitRoom();
            this.roommgr = null;
        }
    },

    onShutDown: function()
    {
        if (GameApp.IsGameDisconnected()) return;
        this.dialog(1, "您已掉线，请重试！", function(){
            this.waiting(true, "EnterRoom")
            this.join()
        }.bind(this))
    },

    createRoomMgr: function()
    {
        var self = this;
        var cls = AllocSitRoomManager.extend({
            JoinRoomSuccess: function()
            {
                //wls.warn("sendGetHallInfo");
                self.sendGetHallInfo();
            },

            Shutdown: function()
            {
                this._super();
                // 由断线或服务器主动断开触发
                if (!wls.InitiativeLeave)
                {
                    wls.warn("Shutdown");
                    self.onShutDown();
                }
                wls.InitiativeLeave = false;
            },
        });
        var ret = new cls();
        return ret;
    },

    calcGameID: function(hallmgr)
    {
        var tb = hallmgr._mapGameInfo;
        for(var k in tb)
        {
            if (tb[k].shortname == "fish")
            {
                return k;
            }
        }
        return 0;
    },

    // 计算房间id
    calcRoomID: function()
    {
        var hallmgr = GameApp.GetHallManager();
        if (!hallmgr) return 0;
        var gameid = this.calcGameID(hallmgr);
        if (gameid == 0)
        {
            return 0;
        }
        var rooms = hallmgr.GetRoomsByGameId(gameid);
        this.rooms = rooms
        wls.GameID = gameid
        cc.log(rooms);
        if (rooms == null)
        {
            return 0;
        }
        var jsrooms = [];
        for (var key in rooms)
        {
            if (rooms[key].cmd.js == "1")
            {
                jsrooms.push(rooms[key]);
            }
            else if (this.testRoomIDs[key])
            {
                return key;
            }
        }
        if (jsrooms.length == 0)
        {
            return 0;
        }
        var limitDownNum = 500	//下限 小于这个数量就优先导入玩家
        var limitDownMax = 0
        for (var i = 0; i < jsrooms.length; i++)
        {
            var cnt = jsrooms[i].wPlayers;
            if (cnt <= limitDownNum && cnt >= limitDownMax)
            {
                return jsrooms[i].id;
            }
        }
        var r = wls.Range(0, jsrooms.length - 1);
        return jsrooms[r].id;
    },

    //获取房间表
    getRooms: function() {
        return this.rooms || []
    },

    // 加入房间
    join: function()
    {
        var self = this;
        var roomid = this.calcRoomID();
        if (roomid == 0)
        {
            this.dialog(1, "房间未找到", function(){
                self.getScene().doExitGame();
            })
            return;
        }
        wls.warn("准备进入房间: " + roomid);
        wls.RoomID = roomid;
        var roommgr = this.createRoomMgr();
        var hallmgr = GameApp.GetHallManager();
        var pRoomInfo = hallmgr.GetRoomInfos()[roomid];
        if (!pRoomInfo) {
            this.dialog(1, "房间未找到", function(){
                self.getScene().doExitGame();
            })
            return;
        }
        roommgr.setRoomInfo(hallmgr, roomid);
        hallmgr.SendJoinRoom(roomid);
        hallmgr.roommanager = roommgr;
        roommgr.registerMsgProcess(4296, this.onJMsg.bind(this));
        this.roommgr = roommgr;
    },

    joinByRoomId: function(roomid) {
        if (roomid == 0)
        {
            var self = this;
            this.dialog(1, "房间未找到", function(){
                self.getScene().doExitGame();
            })
            return;
        }
        wls.warn("准备进入房间: " + roomid);
        wls.RoomID = roomid;
        var roommgr = this.createRoomMgr();
        var hallmgr = GameApp.GetHallManager();
        roommgr.setRoomInfo(hallmgr, roomid);
        hallmgr.SendJoinRoom(roomid);
        hallmgr.roommanager = roommgr;
        roommgr.registerMsgProcess(4296, this.onJMsg.bind(this));
        this.roommgr = roommgr;
    },

    // 进入桌子
    doGetDesk: function(id)
    {
        var rate = this.find("DAPlayer").getMaxGunRate();
        var ret = wls.Config.get("room", id + 910000000);
        if (rate < ret.cannon_min)
        {
            this.dialog(1, "房间未解锁");
            return;
        }
        this.find("DAHall").setOldGunRate(rate)
        this.find("EFItems").clearItem()
        this.sendGetDesk(id);
    },

    createMsgHeader: function()
    {
        var msg = this.bUseCache ? this.msg : new MsgHeader();
        msg.wLen = 0;
        msg.byMask = 0;
        msg.byFlag = 0;
        msg.byRouteCount = 0;
        msg.byHeaderOffset = 0;
        msg.position = 8;
        return msg;
    },

    sendJMsg: function(type, data)
    {
        if (this.roommgr == null || this.roommgr._pHallManager == null) return;
        var msg = this.createMsgHeader();
        msg.wMessageID = 8;
        msg.byHeaderOffset = 24;
        msg.writeUint32(this.roommgr._pRoomInfo.serverid);
        msg.writeUint32(0);
        msg.writeUint32(this.roommgr._pHallManager.GetSelfID());
        msg.writeUint32(this.roommgr._pRoomInfo.id);
        wls.PacketMsg(msg, type, data);
        this.roommgr._pHallManager.SendData(msg, MSG_HEADER_FLAG_OFFSET);
    },

    // 请求大厅信息
    sendGetHallInfo: function()
    {
        var data = {};
        data.channelId = CHANNEL_ID;
        data.version = wls.GetVersion();
        this.sendJMsg("MSGC2SGetHallInfo", data);
        this.waiting(true,"joinHall");
    },

    // 请求进入桌子
    sendGetDesk: function(lv)
    {
        wls.RoomIdx = lv;
        var data = {};
        data.level = lv;
        this.sendJMsg("MSGC2SGetDesk", data);
    },

    //锻造
    sendForge: function(ret)
    {
        var data = {};
        data.useCrystalPower = ret;
        this.sendJMsg("MSGC2SForge", data);
    },
    //分身锻造
    sendSeperateForge:function(type)
    {
        var data = {};
        data.seperateGunType = type;
        this.sendJMsg("MSGC2SSeperateGunForge", data);
    },

    //商品购买
    sendShopBuy: function(id)
    {
        this.MsgShopBuy = this.MsgShopBuy || {};
        this.MsgShopBuy.id = id;
        this.sendJMsg("MSGC2SShopBuy", this.MsgShopBuy);
    },

    //邮件内容
    sendGetMailDetail: function(mailId)
    {
        var data = {};
        data.id = mailId;
        this.sendJMsg("MSGC2SGetMailDetail", data)
    },

    //邮件已读
    sendMakeMailAsRead: function(mailId)
    {
        var data = {};
        data.id = mailId;
        this.sendJMsg("MSGC2SMarkMailAsRead", data)
    },

    //开始普通转盘抽奖
    sendComDialStart: function() {
        this.sendJMsg("MSGC2SLoginDraw", this.emptyTB)
    },

    //进入鱼券转盘界面
    sendFishTicketDial: function() {
        this.sendJMsg("MSGC2SGetFishTicketDrawHistory", this.emptyTB)
    },

    //退出鱼券转盘界面
    sendExitFishTicketDial: function() {
        this.sendJMsg("MSGS2CCompleteFishTicketDraw", this.emptyTB)
    },

    //发送兑换商城抽奖消息
    sendStartExcDial: function()
    {
        this.sendJMsg("MSGC2SFishTicketDraw", this.emptyTB)
    },

    //发送兑换话费请求
    sendExcPhoneCharges: function(phone) {
        var data = {
            "phoneNo":phone,
            "appId":APP_ID.toString(),
            "appKey":APP_KEY,
            "channelId":CHANNEL_ID,
            "version":wls.GetVersion(),
            "areaCode":REGION_CODE.toString(),
            "token":hallmanager.GetSession(),
        }
        cc.log(data)
        this.sendJMsg("MSGC2SReceivePhoneFare", data)
    },

    //申请救济金信息
    sendReqAlmsInfo: function() {
        this.sendJMsg("MSGC2SAlmInfo", this.emptyTB)
    },

    //申请获取救济金
    sendGetAlms: function() {
        this.sendJMsg("MSGC2SApplyAlm", this.emptyTB)
    },
    
    //发送新手礼包
    sendGetNewerReward: function()
    {
        this.sendJMsg("MSGC2SGetNewerReward", this.emptyTB)
    },

    //发送领取月卡道具
    sendGetMonthCard: function()
    {
        this.sendJMsg("MSGC2SGetMonthCardReward", this.emptyTB);
    },

    //获取当前时光沙漏状态
    sendToGetTimeHourglass: function()
    {
        this.sendJMsg("MSGC2SGetTimeHourglass", this.emptyTB);
        this.waiting(true,"GetTimeHourglass")
    },

    //发送领取vip每日奖励
    sendGetVipDailyReward: function () {
        this.MsgGetVipDailyReward = this.MsgGetVipDailyReward || {};
        this.sendJMsg("MSGC2SGetVipDailyReward", this.MsgGetVipDailyReward)
    },

    //发送道具分解
    sendDecomposeReq: function (propId) {
        this.MsgDecompose = this.MsgDecompose || {};
        this.MsgDecompose.propId = propId
        this.sendJMsg("MSGC2SDecompose", this.MsgDecompose)
        this.waiting(true,"DecomposeReq")
    },

    //发送道具购买
    sendBuy: function (propId,count) {
        this.MsgBuy = this.MsgBuy || {};
        this.MsgBuy.propId = propId
        this.MsgBuy.count = count
        this.sendJMsg("MSGC2SBuy", this.MsgBuy)
        this.waiting(true,"BuyProp")
    },

    //发送道具出售
    sendSellItem: function (propId,count,propItemId) {
        this.MsgSell = this.MsgSell || {};
        this.MsgSell.propId = propId
        this.MsgSell.propItemId = propItemId
        this.MsgSell.count = count
        this.sendJMsg("MSGC2SSellItem", this.MsgSell)
        this.waiting(true,"SellItem")
    },

    //通知服务器微信分享成功
    sendNotifyShareSuccess: function() {
        this.sendJMsg("MSGC2SShareLink", {});
    },

    //分享成功请求奖励
    sendShareSuccess: function(shareId, shareArgs) {
        cc.log("share id:"+shareId+" share args:"+shareArgs)
        this.shareInfo = this.shareInfo || {}
        this.shareInfo.shareType = shareId
        this.shareInfo.shareArgs = shareArgs
        this.sendJMsg("MSGC2SCommonShare", this.shareInfo);
    },

    //发送领取免费鱼币
    sendFreeFishCoinReward: function(freeType, isShare, friendId) {
        var freeFishCoin = {};
        freeFishCoin.freeType = freeType;
        freeFishCoin.isShare = isShare;
        freeFishCoin.inviteId = friendId;
        this.sendJMsg("MSGC2SGetFreeFishCoinReward", freeFishCoin);
    },
    //--------------------------大师赛消息-----------------------------------------------
    //获取大师赛状态
    sendGetMasterStatus: function() {
        this.waiting(true,"GetMasterStatus")
        this.sendJMsg("MSGC2SGetMasterStatus", {});
    },

    //加入大师赛
    sendJoinMasterGame: function() {
        cc.log("---------------sendJoinMasterGame----hall---------")
        this.waiting(true,"JoinMasterGame")
        wls.RoomIdx = 8
        this.sendJMsg("MSGC2SJoinMasterGame", {});
    },

    //拉取排行
    sendMasterGetRanking: function(rankingType) {
        this.waiting(true,"MasterGetRanking")
        this.MasterGetRanking = this.MasterGetRanking || {}
        this.MasterGetRanking.rankingType = rankingType
        this.sendJMsg("MSGC2SMasterGetRanking", this.MasterGetRanking);
    },

    //获取每日任务
    sendGetAllTaskInfo: function() {
        this.waiting(true,"GetAllTaskInfo")
        this.sendJMsg("MSGC2SGetAllTaskInfo", {});
	},
    //查询8人赛信息
    sendCheckFreeMatchStatu: function(arenaType) {
        this.matchstatu = this.matchstatu || {}
        this.matchstatu.aneraType = arenaType
        this.sendJMsg("MSGC2SArenaStatu", this.matchstatu);
    },
    sendGetTaskReward: function(nTaskID) {
        this.waiting(true,"GetTaskReward")
        this.GetTaskReward = this.GetTaskReward || {}
        this.GetTaskReward.nTaskID = nTaskID
        this.sendJMsg("MSGC2SGetTaskReward", this.GetTaskReward);
	},

    
    //离开8人免费赛
    sendLeaveArenaRoom: function(resp) {
        this.sendJMsg("MSGC2SLeaveArenaRoom", {});
    },



    







    //-------------------------------------------------------------------------


    onJMsg: function(msg)
    {
        var tb = wls.ParseMsg(msg);
        if (this[tb.type])
        {
            this[tb.type](tb.data);
        }
        else
        {
            cc.error("+++++++++++++++++没有定义消息处理函数 " + tb.type);
        }
    },

    // 消息接收

    // 房间信息
    MSGS2CGetHallInfo: function(resp)
    {
        wls.EnableDebug = resp.enableDebug
        wls.Switchs = resp.switchs
        this.waiting(false, "EnterRoom")
        this.waiting(false, "RetCommonHall")
        this.find("DAHall").setHallInfo(resp);
        this.waiting(false,"joinHall");
        this.waiting(false,"comeback");
        this.find("PageRoom").refreshWithData(resp["playerInfo"])
        this.find("UIHallPanel").updateMoney();
        this.find("UIHallPanel").updatePlayer();
        this.find("MainBtns").updateBtns();
        this.find("UIHallPanel").updateMail();
        this.find("UIHallPanel").updateFreeCoin();
        this.find("UIHallPanel").updateMonthCard();
        this.find("PageJJC").updateMatchNum(resp.arenaGameCount || 0)
        this.find("UIHallMain").switchDefault()
        this.gotoNextState();

        this.MSGS2CAnnounce(resp.announce || [])

        //新手礼包
        if (resp.playerInfo.hasNewerReward != null && resp.playerInfo.hasNewerReward != false) 
        {   
            this.activeGameObject("UINewerReward");
            this.find("UINewerReward").showAct();
        }
        //登录转盘
        else {
            if (wls.LoginType == 0) {
                this.find("SCLayerMgr").setCurShowList(4)
            } else {
                this.find("SCLayerMgr").setCurShowList(3)
            }
            
        }
        wls.LoginType = 1
        wls.GameState = 1
        //救濟金
        if (this.find("DAPlayer").getMoney() <= 0) {
            this.sendReqAlmsInfo()
        } 

        if (this.find("UIForged")) 
        {
            this.find("UIForged").updateView();
        }

        if (this.find("UIGiftDial"))
        {
            this.find("UIGiftDial").updatePanel()
        }

        this.sendToGetTimeHourglass()

        //正在竞技场内
        if (resp.isInArenaGame) { 
            var roomData = wls.Config.getMatchData(resp.arenaType)
            var str = wls.format(wls.Config.getLanguage(800000475),"%s",[roomData.name])
            this.dialog(3, str, function(ret) {
                if (ret == 2) { this.sendLeaveArenaRoom(); return }//取消重新进入比赛
                this.waiting(true, "EnterArenaRoom");
                this.getScene().enterNextRoom("SCRoomMgrArena");
                wls.isReconnectArenaGame = resp.isInArenaGame
                if (resp.arenaType == 500001001) {
                    wls.RoomIdx = 6
                } else {
                    wls.RoomIdx = 7
                }
            }.bind(this))

        }


        wls.warn(SHARE_YFTX_USERID);
        if (SHARE_YFTX_USERID > 0) {
            this.sendMsg("sendFreeFishCoinReward", 5, true, SHARE_YFTX_USERID)
            SHARE_YFTX_USERID = 0
        }
        //查询每日免费赛状态
        //this.sendCheckFreeMatchStatu()
    },

    //大厅公告
    MSGS2CAnnounce: function(resp)
    {
        cc.log(resp);
        for (var i = 0; i < resp.length; i++) {
            var tb = {}
            tb.deskId =0
            tb.roomId =0
            tb.playerId =0
            tb.msgTemplete = "[146|62|13|255|24|%s]"
            tb.params = [resp[i]]
            this.find("UINotice").pushNotice(tb)
        }
    },

    //锻造
    MSGS2CForge: function(resp)
    {
        // cc.log(resp);
        if (this.find("UIForged")) 
        {
            this.find("UIForged").onReceive_1(resp);
        }
    },
    //分身锻造
    MSGS2CSeperateGunForge:function(resp)
    {
        if (this.find("UIForged")) 
        {
            this.find("UIForged").onReceive_2(resp);
        }
    },
    //商品购买
    MSGS2CShopBuy: function(resp)
    {
        if (resp.errorCode == 0) 
        {
            this.toast(wls.Config.getLanguage(800000154));
            this.sendGetHallInfo();
        }
    },

    //邮件内容
    MSGS2CGetMailDetail: function(resp)
    {
        cc.log(resp);
        if (this.find("UIMail")) 
        {
            this.find("UIMail").onGetMailDetail(resp);
        }
    },

    //邮件已读
    MSGS2CMarkMailAsRead: function(resp)
    {
        cc.log(resp);
        if (!resp.success) {
            this.dialog(1, "领取失败，请重试");
            return 
        }
        if (this.find("UIMail")) 
        {
            this.find("UIMail").onMakeMailAsRead(resp);
        }
        if (this.find("UIMailBody")) 
        {
            this.find("UIMailBody").onGetAward(resp);
        }
    },

    //话费兑换
    MSGS2CReceivePhoneFare: function(resp) {
        cc.log(resp)
        this.toast(resp.errorString)
        if (!resp.success) { return }
        this.sendGetHallInfo()
        this.find("UIPhoneChargesExc").removeFromScene()
        
    },

    //登录转盘
    MSGS2CLoginDraw: function(resp) {
        this.waiting(false, "StartComDial")
        if (!resp.isSuccess) { return }
        var targetIndex = this.find("UIDial").getTargetIndex(resp.props, resp.seniorProps)
        wls.connectPropTb(resp.props,resp.seniorProps)
        this.find("DAPlayer").setLoginDrawTimes(this.find("DAPlayer").getLoginDrawTimes()-1)
        this.find("UIDial").updatePanel()
        this.find("UIDial").startRotateAct(targetIndex, function() {
            this.createGameObject("UIAwardResult").onActive("UIDial",0, resp.props,function() {
            }.bind(this), true)
            this.find("UIDial").removeFromScene()
        }.bind(this))
    },

    //收到进入鱼券转盘的消息
    MSGS2CGetFishTicketDrawHistory: function(resp) {
        this.find("DAHall").setLeftLotteryTimes(resp.leftCount)
        this.find("UIGiftDial").updatePanel()
        this.find("UIGiftDial").addDialRecords(resp.items || [])
    },

    //收到兑换消息
    MSGFishTickDrawHistoryItem: function(resp) {
        this.find("UIGiftDial").addDialRecords([resp], 5)
    },

    //收到兑换转盘开始消息
    MSGS2CFishTicketDraw: function(resp) {
        if (resp.errorCode != 0) {
            this.toast("失败 errorcode:"+resp.errorCode)
            return
        }
        var rewardIndex = resp.index+1
        var propId = 1
        var propCount = 1
        resp.props = (resp.props || {})
        resp.seniorProps = (resp.seniorProps || {})
        this.find("DAHall").setLeftLotteryTimes(resp.leftCount)

        var costInfo = wls.Config.getConfig("990000116").split(";")
        this.getScene().addProps([{propId:18,propCount:-Number(costInfo[1])}])
        this.find("DAHall").setLeftLotteryTimes(resp.leftCount)
        this.find("UIGiftDial").updatePanel()

        wls.connectPropTb(resp.props, resp.seniorProps);

        var propData = null
        for (var key = 0; key < resp.props.length; key++) {
            propId = resp.props[key].propId
            propCount = resp.props[key].propCount
            propData = resp.props[key]
        }
        if (this.find("UIGiftDial")) {
            this.find("UIGiftDial").startRotateAct(rewardIndex, function(){
                if (propData == null) { return }
                var resultLayer = this.createGameObject("UIAwardResult")
                resultLayer.notify = function() { this.sendShareSuccess(7) }.bind(this)
                resultLayer.onActive("UIGiftDial",0,resp.props,function() {
                }.bind(this), true)
            }.bind(this))
        }

    },

    //请求救济金信息
    MSGS2CAlmInfo: function(resp) {
        if (this.find("DAHall")) { this.find("DAHall").setAlmsInfo(resp) }
        this.find("MainBtns").updateBtns()
    },

    //获取救济金
    MSGS2CApplyAlmResult: function(resp) {
        if (!resp.success) {return}
        this.find("UIHallPanel").updateAlm(resp.newFishIcon);
    },

    //获取新手启航礼包
    MSGS2CGetNewerReward: function(resp) {
        cc.log(resp);
        if (resp.errorCode != 0) { 
            this.toast("领取新手奖励失败")
            return 
        }

        resp.props = (resp.props || {})
        resp.seniorProps = (resp.seniorProps || {})

        if (this.find("UINewerReward")) {
            this.find("UINewerReward").onGetNewerReward(resp);
        }
    },

    //月卡领取
    MSGS2CGetMonthCardReward: function(resp) {
        cc.log(resp);
        if (!resp.isSuccess) {
            this.dialog(1,"领取失败，请重新登录")
            return
        }

        resp.rewardItems = (resp.rewardItems || {})
        resp.seniorProps = (resp.seniorProps || {})
        this.find("DAPlayer").setMonthCardGetAward()
        if (this.find("UIMonthcard")) {
            this.find("UIMonthcard").getMonthCardReward(resp);
        }
        if (this.find("MainBtns")) 
        {
            this.find("MainBtns").updateBtns();
        }  
        this.find("UIHallPanel").updateMonthCard();
    },

    //时光沙漏
    MSGS2CGetTimeHourglass : function (resp) 
    {
        if (resp.isSuccess || this.isJoinRoom) {
            this.isJoinRoom = false
            this.find("MainBtns").click_btn_msw()
        }
        this.waiting(false,"GetTimeHourglass")
    },

    //获得分享奖励
    MSGS2CShareLink: function(resp) 
    {
        if (!resp.isSuccess) { return }
        this.find("DAHall").setShareLinkUsed(true )
        this.find("UIWechatShare").playShareReward(wls.connectPropTb(resp.props, resp.seniorProps))
    },

    //领取vip每日奖励
    MSGS2CGetVipDailyReward: function(resp)
    {
        if (this.find("UIVipRight")) {
            this.find("UIVipRight").onGetVipDailyReward(resp)
        }
    },
    
    //分解
    MSGS2CDecompose: function (resp) 
    {
        this.waiting(false,"DecomposeReq")
        if (this.find("UIBag")) {
            this.find("UIBag").onDecomposeResult(resp)
        }
    },

    //购买
    MSGS2CBuy: function (resp) 
    {
        this.waiting(false,"BuyProp")
        if (this.find("UIBag")) {
            this.find("UIBag").OnBuyProp(resp)
        }
    },

    //出售
    MSGS2CSellItem: function (resp) 
    {
        this.waiting(false,"SellItem")
        if (this.find("UIBag")) {
            this.find("UIBag").OnSellItem(resp)
        }
    },

    //服务器返回分享数据
    MSGS2CCommonShare: function(resp) {
        cc.log(resp)
        if (resp.errorCode != 0) { return }
        this.find("DAPlayer").setShareInfos(resp.newShareInfo)
        if (resp.shareType == 14) {
            //登录转盘次数
            cc.log("add use login draw times:"+this.find("DAPlayer").getUseLoginDrawTimes())
            this.find("DAPlayer").setLoginDrawTimes(resp.shareArgs || 0)
            this.find("DAPlayer").setUseLoginDrawTimes(this.find("DAPlayer").getUseLoginDrawTimes()+1)
            if (this.find("UIDial")) {this.find("UIDial").updatePanel()}
            return 
        }
        var props = resp.rewards
        var itemWidth = 120
        var totalNum = props.length
        for (var key = 0; key < totalNum; key++) 
        {
            var prop = props[key];
            var propId = prop.propId;
            var pos = cc.p(display.width/2+(key*itemWidth+itemWidth/2)-(itemWidth*totalNum)/2, display.height/2)
            var flyData = {
                viewid  : 0,
                propData: prop,
                firstPos: pos,
                maxScale: 1,
                isJump  : false,
                zorder  : wls.ZOrder.Box+5
            }
            this.find("EFItems").play(flyData);
        }
        if (resp.shareType == 16 || resp.shareType == 18) {
            this.find("PageFreeMatch").refresh()
        }
        if (resp.shareType == 19 && this.find("UIHallMaster")) {
            this.find("UIHallMaster").updateView()
        }
    },
	
    MSGS2CGetFreeFishCoinReward: function(resp) {
        cc.log(resp)
        // if (resp.errorCode != 0) { return }

        resp.freeFishCoinInfo = resp.freeFishCoinInfo || {};
        //重置鱼币领取信息
        if (resp.errorCode == 0) {
            this.find("DAPlayer").resetFreeFishCoinInfo(resp);
        }
        
        resp.props = (resp.props || {});
        resp.seniorProps = (resp.seniorProps || {});
        wls.connectPropTb(resp.props, resp.seniorProps)
        
        //把相同的物品合一起
        var props = [];
        var pushSameInProps = function(list){
            for (var key in list) {
                if (list.hasOwnProperty(key)) {
                    var element = list[key];
                    if(props[element.propId]){
                        props[element.propId] = props[element.propId] + element.propCount;
                    }
                    else{
                        props[element.propId] = element.propCount;
                    }
                }
            }
        }
        pushSameInProps(resp.props);
        pushSameInProps(resp.shareProps);
        pushSameInProps(resp.vipProps);
        var sprops = [];
        for (var key in props) {
            if (props.hasOwnProperty(key)) {
                var element = props[key];
                var v = {};
                v.propId = Number(key);
                v.propCount = element;
                sprops.push(v);
            }
        }
        resp.allProps = sprops;
        
        if (resp.freeFishCoinInfo.freeType == 1) {
            if (this.find("UINewerGift")) {
                this.find("UINewerGift").getFreeReward(resp)
            }
        }
        else if(resp.freeFishCoinInfo.freeType == 2){
            if (this.find("UISignIn")) {
                this.find("UISignIn").onReceive(resp)
            }
        }
        else if(resp.freeFishCoinInfo.freeType == 3){
            if (this.find("UIFreeCoinShare")) {
                this.find("UIFreeCoinShare").onReceive(resp)
            }
        }
        else if(resp.freeFishCoinInfo.freeType == 4){
            if (this.find("UIFreeCoinYQYL")) {
                this.find("UIFreeCoinYQYL").onReceive(resp)
            }
        }
        else if(resp.freeFishCoinInfo.freeType == 6){
            if (this.find("UIWechatShare")) {
                this.find("UIWechatShare").playShareReward(resp.props)
                this.find("UIWechatShare").updatePanel()
                this.find("UIWechatShare").removeFromScene()
            }
        }
    },


    //--------------------------大师赛消息-----------------------------------------------
    //获取大师赛状态
    MSGS2CGetMasterStatus: function(resp) {
        this.waiting(false,"GetMasterStatus")
        this.find("DAMaster").setMasterStatus(resp)
        if (this.find("UIHallMaster")) {
            this.find("UIHallMaster").updateView()
        }
        // this.pushView("UIHallMaster")
    },

    //加入大师赛
    MSGS2CJoinMasterGame: function(resp) {
        cc.log("---------------MSGS2CJoinMasterGame----hall---------")
        if (this.find("DAMaster")) {
            this.find("DAMaster").JoinMasterGame(resp)
        }
    },
    //竞技场排行
    MSGS2CMasterGetRanking: function (resp) {
        cc.log("-----------SCRoomMgrArena----MSGS2CMasterGetRanking-------------")
        this.waiting(false,"MasterGetRanking")
        if (resp.rankingType == 1 ||resp.rankingType == 2 || resp.rankingType == 3) {
            if (this.find("DAMaster")) {
                this.find("DAMaster").showRank(resp)
            }
            return 
        }

        var list = resp.playerInfo
        var newList = []
        for (var i = 0; i < 50; i++) {
            if (!list[i]) { break }
            var element = list[i];
            var tb = {}
            tb.rank = element.rank
            tb.name = element.nickName
            tb.score = element.score
            tb.prop = element.rewards[0]
            newList.push(tb)
        }
        this.pushView("UIMatchRank", {rank:resp.rank, maxScore:resp.score, list:newList})

    },
    
    //日常任务数据
    MSGS2CGetAllTaskInfo: function(resp) {
        cc.log("---------------MSGS2CGetAllTaskInfo-------------")
        this.find("DAMaster").setTaskListData(resp.TaskInfo)
        if (this.find("UIHallMasterTask")) {
            this.find("UIHallMasterTask").updateView()
        }
        this.waiting(false,"GetAllTaskInfo")
    },
    //日常任务奖励
    MSGS2CGetTaskReward: function(resp) {
        cc.log("---------------MSGS2CGetTaskReward-------------")
        this.waiting(false,"GetTaskReward")
        this.find("DAMaster").getTaskAeard(resp) 
    },
    //日常任务完成
    MSGS2CHaveFinishTask: function(resp) {
        cc.log("---------------MSGS2CHaveFinishTask----------0---")
        var data =  wls.Config.getTaskDataById(resp.nTaskID)
        if (data.show_type == 2) {
            this.sendGetTaskReward(resp.nTaskID)
        }
    },
    
    //离开8人免费赛
    MSGS2CLeaveArenaRoom: function(resp) {
        
    },









    //-------------------------------------------------------------------------







});