"use strict"
// 场景
wls.namespace.Scene = SceneBase.extend
({
    event_network_error: function(tag, state)
    {
        cc.log("event_network_error", state);
        wls.ExitGameArgs = [tag, state];
        wls.ExitGameErrorCode = "network error";
        this._gs.find("SCGameClient").standUp();
    },

    onAppEnterForeground_: function() {
        this._super();
        wls.warn("onAppEnterForeground")
        this._gs.post("onEventEnterForgeGround");
    }

    //_showDebugBtn: function(){},
});

// 事件监听
wls.namespace.FishClientEvent = BaseClientEvent.extend
({
    CreateGameScene : function() 
    {  
        var scene = new wls.namespace.Scene();
        var name = wls.Config.get("room", wls.RoomIdx + 910000000).scene_name;
        cc.log("创建游戏场景", name);
        //name = "GSQualify"
        var cls = wls.namespace[name];
        var gs = new cls;
        scene.addChild(gs);
        scene._gs = gs;
        this.delegate = gs.find("SCGameClient");
        this.delegate.onCreateScene(this.client);
        cc.director.pushScene(scene);
        return null;
	},

	OnPlayerLeave : function(pPlayer, p1)
	{
        this.delegate.onPlayerLeave(p1);
    },
    
    PrintMessage: function()
    {

    },
});

// 游戏启动
wls.namespace.FishGameClient = BaseClient.extend
({
    ctor : function(roomManager)
    {
        var event = new wls.namespace.FishClientEvent();
        event.client = this;
        event.delegate = null;
        this._super(roomManager, event);
    }
});

wls.namespace.FishGameClient.create = function(roomManager) 
{
    return new wls.namespace.FishGameClient(roomManager);
};

// 返回游戏内所需资源
wls.namespace.FishGameClient.loadRes = function(  ) {
    return []
};

// 返回游戏内只下载但不加载到内存，需要用时在自行加载
wls.namespace.FishGameClient.downloadRes = function(  ) {
    return []
};

GameManager.registerGameClient("fish", wls.namespace.FishGameClient);
