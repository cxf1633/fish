// 协议接收处理
wls.namespace.SCGameClient = cc.Node.extend
({
    onCreate: function()
    {
        this.client = null;
        this.bLeave = false;
        this.bInit = false;
        this.msg = new MsgHeader();
    },

    createMsgHeader: function()
    {
        var msg = this.msg;
        msg.wLen = 0;
        msg.byMask = 0;
        msg.byFlag = 0;
        msg.byRouteCount = 0;
        msg.byHeaderOffset = 0;
        msg.position = 8;
        return msg;
    },

    listenLeave: function()
    {
        this.bLeave = true;
    },

    cleanup: function()
    {
        
    },

    onCreateScene: function(client)
    {
        this.client = client;
        client.registerMsgProcess(31, this.onJMsg.bind(this));
    },

    onShutDown: function()
    {
        
    },

    onPlayerLeave: function(obj)
    {
        if (!this.bLeave) return;
        var id = obj.GetID();
        var player = FG.GetPlayer(id);
        if (!player) return;
        FG.RemovePlayer(id);
        this.post("onEventPlayerLeave", player.viewid);
    },

    onJMsg: function(msg)
    {
        var tb = wls.ParseMsg(msg);
        var delegate = this.find("SCRecv");
        // 没初始化状态，只接收MSGS2CGameStatus 消息
        if (!this.bInit)
        {
            if (tb.type != "MSGS2CGameStatus" && tb.type != "MSGS2CArenaReady")
            {   
                return;
            }
            this.bInit = true;
        }
        if (delegate[tb.type])
        {
            delegate[tb.type](tb.data);
        }
        else
        {
            cc.warn("SCRecv+++++++++++++++++没有定义消息处理函数 " + tb.type);
        }
    },

    sendJMsg: function(type, data)
    {
        if (this.client == null) return;
        var mgr = this.client._roomManager;
        if (mgr == null || mgr._pHallManager == null) return;
        var msg = this.createMsgHeader();
        msg.wMessageID = 30;
        msg.byHeaderOffset = 24;
        msg.writeUint32(mgr._pRoomInfo.serverid);
        msg.writeUint32(0);
        msg.writeUint32(mgr._pHallManager.GetSelfID());
        msg.writeUint32(mgr._pRoomInfo.id);
        wls.PacketMsg(msg, type, data);
        mgr._pHallManager.SendData(msg, MSG_HEADER_FLAG_OFFSET);
    },

    onProcess: function(funcName)
    {

    },

    standUp: function()
    {
        this.find("SCSound").stopMusic();
        wls.InitiativeLeave = true;
        if (this.client)
        {
            this.getScene().destroy();
            this.client.StandUP();
            cc.director.popToRootScene()
            if (wls.FishHallInst)
            {
                wls.FishHallInst.comeback();
            }
        }
        else
        {
            cc.director.popToRootScene()
            if (wls.FishHallInst)
            {
                wls.FishHallInst.comeback();
            }
        }
    },
});