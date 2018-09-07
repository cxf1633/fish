"use strict";
// 微信小程序捕鱼(大厅场景)
wls.namespace.GSFishHall = wls.GameScene.extend
({
    onCreate: function() 
    {
        this.mCurRoomMgrName = ""; // 当前的房间对象名
        this.mbEnterRoom = false;
        this.mbConnencted = false;
        NotificationCenter.addNotification(this, Event.HALL_ON_JOIN_HALL);
        NotificationCenter.addNotification(this, "event_enter_foreground");
    },

    onEnter: function()
    {
        this._super();
        cc.director.setAnimationInterval(1 / 30);
    },

    onExit: function()
    {
        this.find("SCSound").stopMusic();
        this._super();
    },

    destroy: function()
    {
        this._super();
        NotificationCenter.removeNotificationByName(this, Event.HALL_ON_JOIN_HALL);
        NotificationCenter.removeNotificationByName(this, "event_enter_foreground");
    },

    event_hall_on_join_hall: function()
    {
        this.mbConnencted = true;
        wls.warn("event_hall_on_join_hall");
        if (!this.mbEnterRoom) return;
        this.enterNextRoom("SCRoomMgr");
    },

    event_enter_foreground: function()
    {
        if (this.isSleep()) return;
        wls.warn("hall onAppEnterForeground")
        this.post("onEventEnterForgeGround");
    },

    play: function(root) 
    {   
        root = root || cc.director.getRunningScene();
        root.addChild(this);
        if (wls.Loaded_Hall_Assets)
        {
            this.onDownloadRes();
        }
        else
        {
            this.createGameObject("UIAssetsLoad").setNextStateName("onAfterDownload");
        }
    },

    initGlobal: function()
    {
        wls.FishHallInst = this;
    },

    // 下载资源完成
    onAfterDownload: function()
    {
        this.createGameObject("SCLoading").setNextStateName("onDownloadRes");
    },

    onDownloadRes: function()
    {
        this.removeGameObject("UIAssetsLoad");
        wls.Loaded_Hall_Assets = true;
        this.mAssetsPath = "games/fish/assets/";
        this.initGlobal();
        this.createGameObject("SCLayerMgr");
        this.createGameObject("DAHall");
        this.createGameObject("DAPlayer");
        this.createGameObject("DAMaster");
        this.createGameObject("UIWaiting");
        this.createGameObject("UIHallMain");
        this.createGameObject("UIHallPanel");
        this.createGameObject("UIDialog");
        this.createGameObject("UINotice", 1);
        this.createGameObject("SCSound");
        this.createGameObject("UIToast");
        var node = cc.Node.create();
        this.addChild(node);
        this.wrapGameObject(node, "EFItems");
        var node2 = cc.Node.create();
        this.addChild(node2);
        this.wrapGameObject(node2, "EFOther");
        wls.LoginType = 0
        this.find("SCSound").load()
        this.find("SCSound").playGameMusic(0)
        this.createGameObject("SCRoomMgr");
        this.createGameObject("SCRoomMgrArena");
        this.waiting(true, "WaitForLoginIn");
        wls.CallLoop(this, 0.05, 101, function() {
            if (this.mbConnencted)
            {
                this.waiting(false, "WaitForLoginIn");
                this.onHallConnected();
                this.stopActionByTag(101);
            }
        }.bind(this));
    },

    // 检查加载完毕
    onHallConnected: function()
    {
        this.mbEnterRoom = true;
        this.find("SCRoomMgr").setNextStateName("onEnterRoom");
        this.find("SCRoomMgr").join();
        this.mCurRoomMgrName = "SCRoomMgr";
    },

    // 进入房间成功
    onEnterRoom: function()
    {
        wls.ExitGameErrorCode = 0;
        wls.ExitGameArgs = [];
        this.initGlobal();
        this.find("UIHallPanel").setVisible(true);
    },

    //-----------------------------------------------------
    // 管理房间
    //-----------------------------------------------------

    // 进入另外的房间
    enterNextRoom: function(tag)
    {
        cc.assert(tag, "enterNextRoom must set tag");
        var mgr = this.find(this.mCurRoomMgrName);
        if (mgr) mgr.leaveRoom();
        wls.CallAfter(this, 0.5, function() {
            if (tag == "SCRoomMgrArena")
            {
                this.find("SCRoomMgrArena").join();
            } 
            else
            {
                this.find("SCRoomMgr").join();
            }
            this.mCurRoomMgrName = tag;
        }.bind(this));
    },

    getRoomMgr: function()
    {

    },

    // 离开当前房间
    leaveCurrentRoom: function()
    {
        var mgr = this.find(this.mCurRoomMgrName);
        if (mgr) mgr.leaveRoom();
    },

   //----------------------------------------------------- 

    showWaiting: function(bVisible,keyName)
    {
        var self = this;
        this.waiting(bVisible,keyName,null, function() {
            self.doExitGame();
            ToastMessageManager.pushMessage(wls.Config.getLanguage(800000036))
        })
    },

    doExitGame: function()
    {
        this.destroy();
        GameApp.Logout();
    },

    // 从游戏中返回
    comeback: function()
    {
        cc.director.setAnimationInterval(1 / 30);
        this.setSleep(false);
        cc.log("+++++++++++++++++++++++++comeback: " + wls.ExitGameErrorCode);
        var self = this;
        wls.LoginType = 2
        wls.GameState = 1
        this.find("SCSound").playGameMusic(0)
        this.waiting(false,"waitEntetArenaRoom")
        if (wls.ExitGameErrorCode == 0)
        {
            this.waiting(true,"comeback");
            this.enterNextRoom("SCRoomMgr");
        }
        else if(wls.ExitGameErrorCode == "network error")
        {
            this.dialog(1, "网络错误，请重试", function() {
                ReconnectModule.onNetworkChanged(wls.ExitGameArgs[0], wls.ExitGameArgs[1]);
            });
        }
        else if(wls.ExitGameErrorCode == "upgradrGunOver")
        {
            this.dialog(1,wls.Config.getLanguage(800000088));
            this.waiting(true,"comeback");
            this.enterNextRoom("SCRoomMgr");
        } else if(wls.ExitGameErrorCode == "gotoNextRoom")
        {
            this.waiting(true,"comeback");
            this.find("SCRoomMgr").isJoinRoom = true;
            this.enterNextRoom("SCRoomMgr");
        } 
        wls.ExitGameErrorCode = 0
    },

    // 支付结果
    onPayResult: function(bSuccess)
    {
        if (bSuccess)
        {
            var s = this.find("SCRoomMgr");
            s.sendGetHallInfo();
            this.dialog(1,wls.Config.getLanguage(800000157));

            //购买礼包的分享
            var config = wls.Config.get("gif", wls.rechargeId)
            if (config && parseInt(config.share_reward) != 0) {
                this.pushView("UIBuyBoxSucessShare", {"config":config.share_reward, "args":wls.rechargeId%10000})
            }
        }
        else
        {
            this.dialog(1,wls.Config.getLanguage(800000159));
        }
    },

    //等待超时
    waitOverTime: function () {
        var self = this
        this.dialog(1,wls.Config.getLanguage(800000036),function () {
            if (self.callBack) { self.callBack() }
            if (wls.GameState == 1) {
                self.doExitGame();
                ToastMessageManager.pushMessage(wls.Config.getLanguage(800000036))
            }
        });
    },

    // 向玩家数据里添加道具
    addProps: function(props) {
        this.find("DAPlayer").addProps(props);
        this.post("onEventPlayerDataModified"); 
    },

    // 发送消息
    sendMsg: function(funcName)
    {
        var target = this.find(this.mCurRoomMgrName);
        if (target == null ) {
            cc.log("--------房间管理器不存在----------")
            return 
        }
        var func = target[funcName];
        if (func)
        {
            [].splice.call(arguments, 0, 1);
            func.apply(target, arguments);
        }
        else
        {
            cc.warn("大厅场景未定义发送函数 " + funcName);
        }
    },

});

