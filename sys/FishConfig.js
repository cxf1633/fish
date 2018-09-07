"use strict";
// 配置数据管理
wls.namespace.FishConfig = cc.Class.extend
({
    onCreate: function() 
    {
        this.mConfigMap = new Array();
        wls.Config = this;
        this.loadcnt = 1;
        this.levelExp = [];
        this.loadDataBin();
        //cc.log("加载文件完毕");
    },

    isDone: function()
    {
        return this.loadcnt < 1;
    },

    loadDataBin: function()
    {
        var filename = "games/fish/assets/config/databin.txt"
        cc.loader.loadTxt(wls.CheckPath(filename), function(err, data) {
            if (err)
            {
                cc.error(err);
                return;
            }
            this.parsetDataBin(data);
            this.loadcnt--;
        }.bind(this));
    },

    parsetDataBin : function(data)
    {
        data = data.replace(new RegExp('\r', 'g'), '');
        var allRows = data.split("<label>\n");
        for (var i = 0; i < allRows.length; i++)
        {
            if (allRows[i] == "")
            {
                continue;
            }
            this.loadCsv(allRows[i]);
        }
    },


    // 解析csv
    loadCsv: function(data) 
    {
        var obj = new Object();
        obj.list = new Object();
        var allRows = data.split("\n");
        var key = allRows[0];
        var keys = allRows[1].split(',');
        obj.keys = keys;
        for (var i = 2; i < allRows.length; i++)
        {
            if (allRows[i] != "")
            {
                var rowCells = allRows[i].split(',');
                obj.list[rowCells[0]] = rowCells;
            }
        }
        this.mConfigMap[key] = obj;
        //cc.log(key + " +++++++++++++++++++++++加载成功");
        if (this["parse_" + key])
        {
            this["parse_" + key]();
        }
    },

    // 原始数据，不做数字转换
    getOrigin: function(key, id, ret)
    {
        var config = this.mConfigMap[key];
        if (config == null) 
        {
            //cc.error("找不到数据文件" + key);
            return null;
        }
        var data = config.list[id];
        if (data == null)
        {
            //cc.error(key + " 找不到id为 " + id + " 的数据");
            return null;
        }
        if (ret == null)
        {
            ret = {};
        }       
        for (var i = 0; i < config.keys.length; i++)
        {
            ret[config.keys[i]] = data[i];
        }
        if (this["get_" + key])
        {
            this["get_" + key](ret);
        }
        return ret
    },

    // 获得数据(如果是数字类型，默认转成number)
    get: function(key, id, ret)
    {
        var config = this.mConfigMap[key];
        if (config == null) 
        {
            //cc.error("找不到数据文件" + key);
            return null;
        }
        var data = config.list[id];
        if (data == null)
        {
            //cc.error(key + " 找不到id为 " + id + " 的数据");
            return null;
        }
        if (ret == null)
        {
            ret = {};
        }       
        for (var i = 0; i < config.keys.length; i++)
        {
            var n = Number(data[i]);
            if (isNaN(n))
            {
                ret[config.keys[i]] = data[i];
            }
            else
            {
                ret[config.keys[i]] = n;
            }
        }
        if (this["get_" + key])
        {
            this["get_" + key](ret);
        }
        return ret
    },

    getAll: function(key)
    {
        return this.mConfigMap[key];
    },

    ForEach: function(key, callback)
    {
        var list = this.mConfigMap[key].list;
        var ret = {}
        for (var id in list)
        {
            this.get(key, id, ret);
            if (callback(ret)) break;
        }
    },

    ForEachNew: function(key, callback)
    {
        var list = this.mConfigMap[key].list;
        for (var id in list)
        {
            var ret = {}
            this.get(key, id, ret);
            if (callback(ret)) break;
        }
    },

    ForEachOriginNew: function(key, callback)
    {
        var list = this.mConfigMap[key].list;
        for (var id in list)
        {
            var ret = {}
            this.getOrigin(key, id, ret);
            if (callback(ret)) break;
        }
    },

    //-----------------------------------------------------
    // 内部解析
    //-----------------------------------------------------

    // 解析鱼游的路径
    parse_fishpathEx: function()
    {
        var list = this.mConfigMap["fishpathEx"].list;
        for (var key in list)
        {
            var str = list[key][1];
            list[key][1] = str.split(';');
        }
    },

    parse_skill: function()
    {
        var list = this.mConfigMap["skill"].list;
        var map = {};
        for (var key in list)
        {
            var val = list[key];
            map[val[2]] = val;
        }
        this.mConfigMap["skill"].list = map;
    },

    parse_cannon: function()
    {
        var list = this.mConfigMap["cannon"].list;
        var map = {};
        var rates = [];
        for (var key in list)
        {
            var val = list[key];
            map[val[1]] = val;
            rates.push(parseInt(val[1]));
        }
        this.mConfigMap["cannon"].rates = rates;
        this.mConfigMap["cannon"].list = map;
    },

    parse_bomb: function()
    {
        var list = this.mConfigMap["bomb"].list;
        var map = {};
        for (var key in list)
        {
            var val = list[key];
            map[val[1]] = val;
        }
        this.mConfigMap["bomb"].list = map;
    },

    parse_vip: function()
    {
        var vipList = [];
        this.ForEachNew("vip", function(ret) {
            vipList.push(ret);
        });
        //vipList.sort(function(a, b) { return a.vip_level < b.vip_level;});
        this.vipList = vipList;
    },
    parse_level: function()
    {
        var levelExp = [];
        this.ForEachNew("level", function(ret) {
            levelExp.push(ret);
        });
        //vipList.sort(function(a, b) { return a.vip_level < b.vip_level;});
        this.levelExp = levelExp;
    },
    //-----------------------------------------------------
    // 内部获取方法
    //-----------------------------------------------------

    get_shop: function(ret)
    {
        var a;
        if (typeof(ret.cost_item) == "string")
        {
            a = ret.cost_item.split(";");
            delete ret.cost_item;
            ret.costPropId = parseInt(a[0]);
            ret.costPropCount = parseInt(a[1]);
        }

        if (typeof(ret.reward_item) == "string")
        {
            a = ret.reward_item.split(";");
            delete ret.reward_item;
            ret.getPropId = parseInt(a[0]);
            ret.getPropCount = parseInt(a[1]);
        }
    },

    get_cannonoutlook: function(ret)
    {
        ret.bullet_xplot = ret.bullet_xplot.split(";");
        ret.net_xplot = ret.net_xplot.split(";");
    },

    //-----------------------------------------------------
    // 获取方法
    //-----------------------------------------------------

    getLanguage: function(id)
    {
        this.languageTmp = this.languageTmp || {};
        this.get("language", id, this.languageTmp);
        return this.languageTmp.ch;
    },
    getConfig: function(id)
    {
        this.configTmp = this.configTmp || {};
        this.get("config", id, this.configTmp);
        return this.configTmp.data;
    },
    getItemData: function(id)
    {
        var itemTmp = this.get("item", id+200000000);
        if (!itemTmp) { return null }
        itemTmp.sellPropId = parseInt(itemTmp.sell_value.split(";")[0])
        itemTmp.sellPropCount = parseInt(itemTmp.sell_value.split(";")[1])
        itemTmp.buyPropId = parseInt(itemTmp.price.split(";")[0])
        itemTmp.buyPropCount = parseInt(itemTmp.price.split(";")[1])
        return itemTmp
    },
    getLevelData: function(exp)
    {
        var curExp = exp
        var list = this.levelExp;
        var old = list[0];
        for (var index = 0; index < list.length; index++) {
            var element = list[index];
            if (element.exp > curExp) {
                return {level : old.level, curExp:curExp,needExp:element.exp}
            }
            else if (index+1 == list.length) {
                return {level : element.level, curExp:0,needExp:0}
            }
            else {
                curExp = curExp - element.exp
            }
            old = element;

        }
        return {level : 0, curExp:0,needExp:0}
    },
    getLevelDataByLV: function(level)
    {
        var list = this.levelExp;
        for (var index = 0; index < list.length; index++) {
            var element = list[index];
            if (element.level == level) {
                return element
            }
        }
        return 
    },

    getVipLevelData: function(exp)
    {
        for (var i = this.vipList.length - 1; i >= 0; i--)
        {
            if (exp >= this.vipList[i].money_need)
            {
                var ret = wls.Copy(this.vipList[i]);
                ret.lvlup_need = 0;
                ret.percent = 100;
                ret.has_cost = 0;
                if (i < this.vipList.length - 1)
                {
                    ret.lvlup_need = this.vipList[i + 1].money_need - this.vipList[i].money_need;
                    ret.has_cost = exp - ret.money_need;
                    ret.percent = Math.floor((exp - ret.money_need) / ret.lvlup_need * 100);
                }
                return ret;
            }
        }
    },
    getShareList: function()
    {
        var config = wls.Config.get("config", 990000117).data;
        var list = config.split(";")
        var limitList = []
        for (var index = 0; index < list.length; ) {
            var item = {propId:list[index],propCount:list[index+1]}
            limitList.push(item)
            index = index +2
        }
        return limitList
    },
    getViolentNoticeList: function()
    {
        var config = wls.Config.get("config", 990000125).data;
        var list = config.split(";")
        var limitList = []
        for (var index = 0; index < list.length; ) {
            var item = {rate:list[index],propCount:list[index+1]}
            limitList.push(item)
            index = index +2
        }
        return limitList
    },

    // 获得指定炮倍的下一级炮倍
    getNextGunRate: function(rate)
    {
        var list = wls.Config.getAll("cannon").rates;
        for (var i = 0; i < list.length; i++)
        {
            if (list[i] == rate)
            {
                if (i < list.length - 1)
                {
                    return list[i + 1];
                }
            }
        }
    },
    // 获得指定炮倍的前一级炮倍
    getPreGunRate: function(rate)
    {
        var list = wls.Config.getAll("cannon").rates;
        for (var i = 0; i < list.length; i++)
        {
            if (list[i] == rate)
            {
                if (i > 0)
                {
                    return list[i - 1];
                }
            }
        }
    },
        
    // 获得炮台数据
    calcCannonConfig: function(type, maxGunRate)
    {
        var list = [];
        wls.Config.ForEachNew("cannonoutlook", function(val) {
            if (val.type == type)
            {
                list.push(val);
            }
        });
        var length = list.length;
        if (length == 1)
        {
            return list[0];
        }
        cc.log(length);
        var c = null;
        for (var i = length - 1; i >= 0; i--)
        {
            if (maxGunRate >= list[i].reach_times)
            {
                c = list[i];
                break;
            }
        }
        return c;
    },

    // 获取礼包列表
    getGifList: function(type)
    {
        var boxList = [];
        wls.Config.ForEachNew("gif", function(ret) {
            if (ret.type == type)
            {
                var tb = ret.cannon_limit.split(";");
                var unit = ret
                unit.gunRateLow = parseInt(tb[0]);
                unit.gunRateHigh = parseInt(tb[1]);
                boxList.push(unit);
            }
        });
        return boxList;
    },

    //获取每日免费赛的数据
    getMatchList: function(type) {
        var matchList = []
        var configList = this.mConfigMap["match"].list
        wls.Config.ForEachNew("match", function(ret) {
            if (parseInt(ret.type) == type) {
                matchList.push(ret)
            }
        })
        return matchList
    },
    //获取比赛的数据
    getMatchData: function(id) {
        var matchData = null
        var configList = this.mConfigMap["match"].list
        wls.Config.ForEachNew("match", function(ret) {
            if (parseInt(ret.ID) == id) {
                matchData = ret
            }
        })
        return matchData
    },

    // 获取任务列表
    getTaskListByType: function(type)
    {
        var taskList = [];
        wls.Config.ForEachNew("task", function(ret) {
            if (ret.task_type == type)
            {
                var tb = ret.task_reward.split(";");
                var unit = ret
                unit.awardId = parseInt(tb[0]);
                unit.awardCount = parseInt(tb[1]);
                taskList.push(unit);
            }
        });
        taskList.sort( function(a, b){ return  b.task_turn - a.task_turn; })
        return taskList;
    },
    // 获取任务数据
    getTaskDataById: function(nTaskID)
    {
        var unit = null
        wls.Config.ForEachNew("task", function(ret) {
            if (ret.id == nTaskID + 430000000)
            {
                unit = ret
                if (ret.task_reward != 0) {
                    var tb = ret.task_reward.split(";");
                    unit.awardId = parseInt(tb[0]);
                    unit.awardCount = parseInt(tb[1]);
                } else {
                    unit.awardId = 0
                    unit.awardCount = 0
                }
            }
        });
        return unit 
    },

    //分享数据
    getShareDataByType: function(type) {
        var unit = null
        wls.Config.ForEachNew("share", function(ret) {
            if (parseInt(ret.type) == type) {
                unit = ret
            }
        })
        return unit
    },
    //分享数据
    getShareDataById: function(id) {
        var unit = null
        wls.Config.ForEachNew("share", function(ret) {
            if (parseInt(ret.id) == id) {
                unit = ret
            }
        })
        return unit
    },

});
