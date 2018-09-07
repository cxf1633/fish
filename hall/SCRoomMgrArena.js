/****************************************************************
 * 作者：xiaos
 * 日期：2018-08-11
 * 描述：房间管理器
 ****************************************************************/
wls.namespace.SCRoomMgrArena = wls.namespace.SCRoomMgr.extend({
    SIGN_UP_CODE:{
        "-1":"0",
        "-2":"0",
        "-3":"0",
        "-4":"800000470",
        "-5":"0",
        "-7":"800000465",
    },
    onCreate: function() 
    {
        this._super();
    },

    onShutDown: function() {
        if (GameApp.IsGameDisconnected()) return;
        if (this.find("UIFreeMasterQueue")) { this.find("UIFreeMasterQueue").removeFromScene() }
        this.dialog(1, "您已掉线，请重试！", function(){
            this.waiting(true, "EnterRoom")
            this.join()
        }.bind(this))

    },

    // 计算房间id
    calcRoomID: function()
    {
        var roomids = this.find("DAHall").getArenaServers();
        if (roomids.length == 0) 
        {
            this.toast("竞技场未开启");
            this.waiting(false, "EnterArenaRoom"); 
            return;
        }
        var r = wls.Range(0, roomids.length - 1);
        return roomids[r];
    },

    sendGetHallInfo: function() {
        this.sendJMsg("MSGC2SGetArenaFreeHallInfo", {})
    },

    //8人免费赛报名
    sendSignUpFreeMatch: function(arenaType, isLimitTime) {
        this.signupInfo = this.signupInfo || {}
        this.signupInfo.aneraType = arenaType
        this.signupInfo.isLimitTime = isLimitTime
        this.sendJMsg("MSGC2SArenaSignUp", this.signupInfo);
        this.waiting(true,"ArenaSignUp")
    },

    //重连8人赛的加入消息
    sendJoinArenaFreeGame: function() {
        //wls.RoomIdx = 6
        this.joinFreeGame = this.joinFreeGame || {}
        this.sendJMsg("MSGC2SJoinArenaFreeGame", this.joinFreeGame);
    },



    MSGS2CGetArenaFreeHallInfo: function(resp) {
        this.waiting(false, "EnterRoom")

        resp.unreadMails = []
        resp.buyHistory = []
        resp.leftFishTicketDrawCount = 0
        resp.shareLinkUsed = true
        this.find("DAHall").setArenaHallInfo(resp);
        this.waiting(false,"EnterArenaRoom");
        this.find("UIHallMain").switchPage(this.find("UIHallMain").PAGE_TYPE.FREE_MATCH_PAGE)
        //wls.RoomIdx = 6
        if (wls.isReconnectArenaGame) {
            wls.isReconnectArenaGame = false
            this.sendJoinArenaFreeGame()
            return 
        }
    },

    MSGS2CArenaSignUp: function(resp) {
        this.waiting(false,"ArenaSignUp")
        if (resp.errorCode != 0) { 
            var tip = this.SIGN_UP_CODE[resp.errorCode.toString()] || "0"
            tip = parseInt(tip)
            this.toast(tip == 0 ? ("error code:"+resp.errorCode) : wls.Config.getLanguage(tip))
            return
        }
        if (wls.RoomIdx == 6) {
            this.createGameObject("UIFreeMasterQueue", this.find("PageFreeMatch").getReadyEnterConfig())
        } else {
            this.waiting(true,"waitEntetArenaRoom")
        }
    },

    MSGS2CArenaSignUpChange: function(resp) {
        if (this.find("UIFreeMasterQueue")) {this.find("UIFreeMasterQueue").refresh(resp.count || 1)}
    },

    MSGS2CJoinArenaFreeGame: function(resp) {
        if (resp.errorCode == 0) {
            
            return
        }
        if (resp.errorCode == -1) {
            this.toast("比赛已经结束")
            return
        }
        this.toast("加入免费赛失败code:"+resp.errorCode)
    },

    //报名队列失败
    MSGArenaSignupTimeout: function(resp) {
        this.toast(wls.Config.getLanguage(800000474))
        if (this.find("UIFreeMatchQueue")) { this.find("UIFreeMatchQueue").removeFromScene() }
    },


})