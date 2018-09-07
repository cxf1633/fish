"use strict";
// 资源加载逻辑
wls.namespace.SCLoading = cc.Node.extend
({
    onCreate: function() 
    {
        this.initJMsg();
    },

    // 初始化协议
    initJMsg: function()
    {
        var t1 = wls.clock();
        wls.InitJMsg();
        wls.CallAfter(this, 0.01, function() {
            cc.log("+++++++++++++++++初始化协议", wls.clock() - t1);
            this.initConfig();
        }.bind(this));
    },

    // 初始化配置数据
    initConfig: function()
    {
        var t1 = wls.clock();
        wls.InitConfig();
        wls.CallLoop(this, 0.01, 200, function() {
            if (wls.Config.isDone()) {
                cc.log("+++++++++++++++++初始化配置数据", wls.clock() - t1)
                this.stopActionByTag(200);
                this.initStudioJson();
            }
        }.bind(this));
    },

    // 初始化Studio json
    initStudioJson: function()
    {
        var t1 = wls.clock();
        this.loadStudioJson();
        wls.CallLoop(this, 0.01, 201, function() {
            if (wls.bStudioJson)
            {
                cc.log("+++++++++++++++++Studio json", wls.clock() - t1)
                this.stopActionByTag(201);
                this.initStudioPlist();
            }
        }.bind(this));
    },

    // 初始化studio 导出图片的plist
    initStudioPlist: function()
    {
        var t1 = wls.clock();
        this.loadStudioPlist();
        var tag = 202;
        wls.CallLoop(this, 0.01, tag, function() {
            if (wls.bStudioJson)
            {
                cc.log("+++++++++++++++++Studio plist", wls.clock() - t1)
                this.stopActionByTag(tag);
                this.initFishPlist();
            }
        }.bind(this));
    },

    // 初始化plist
    initFishPlist: function()
    {
        var t1 = wls.clock();
        this.loadFishPlist();
        var tag = 203;
        wls.CallLoop(this, 0.01, tag, function() {
            if (wls.bFishPlist)
            {
                cc.log("+++++++++++++++++fish plist", wls.clock() - t1)
                this.stopActionByTag(tag);
                this.gotoNextState();
            }
        }.bind(this));
    },

    //-----------------------------------------------------
    // 加载资源
    //-----------------------------------------------------

    // 初始化studio 导出的json
    loadStudioJson: function()
    {
        if (wls.bStudioJson) return;
        var filename = "games/fish/assets/config/studio_json.json"
        var result = cc.loader.cache[wls.CheckPath(filename)];
        for (var k in result)
        {
            cc.loader.cache[wls.CheckPath(k)] = result[k];
        }
        wls.bStudioJson = true; 
    },

    // 初始化studio 导出的plist
    loadStudioPlist: function()
    {
        if (wls.bStudioPlist) return;
        if (!FishApp)
        {
            var filename = "games/fish/assets/config/studio_plist.json"
            var result = cc.loader.cache[wls.CheckPath(filename)];
            for (var k in result)
            {
                cc.loader.cache[wls.CheckPath(k)] = cc.plistParser.parse(result[k]);
            }
        }
        wls.bStudioPlist = true; 
    },

    // 初始化鱼资源的plist
    loadFishPlist: function()
    {
        if (wls.bFishPlist) return;
        if (!FishApp)
        {
            var filename = "games/fish/assets/config/fish_plist.json"
            var result = cc.loader.cache[wls.CheckPath(filename)];
            for (var k in result)
            {
                cc.loader.cache[wls.CheckPath(k)] = cc.plistParser.parse(result[k]);
            }
        }
        wls.bFishPlist = true; 
    },
    
});