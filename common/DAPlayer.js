//-----------------------------------------------------
// 玩家自身数据(不包括其他玩家)
//-----------------------------------------------------
wls.namespace.DAPlayer = cc.Node.extend
({
    onCreate: function()
    {
        this.playerId = 0;
        this.gradeExp = 0;
        this.forgeCount = 0;

        this.mPropsList = [];
        this.money = 0;
        this.gem = 0;
        this.nickname = "";
        this.maxGunRate = 0;
        this.leftLotteryTimes = 0;
        this.loginDrawUsed = true;
        this.vipDailyRewardToken = false 
        this.vipExp = 0;
        this.buyHistory = [];
        this.todayBuy = [];
        this.levelData = {}

        this.freeFishCoinInfo = [];
        for (var index = 1; index <=7 ; index++) {
            var element = {}
            element.freeType = index;//类型
            element.isReceive = false;//是否可领取
            element.receiveCount = 0;//领取次数 
            element.inviteCount = 0;//邀请数量
            element.time = 0;//获取倒计时
            element.inviteId = 0;//好友id  
            this.freeFishCoinInfo[index] = element;
        }
        //分身炮台类型
        this.seperateGunType = 0;
    },

    updatePlayer: function(resp)
    {
        this.initVip(resp.vipExp);
        var info = GameApp.GetHallManager().GetUserInfo();
        this.nickname = info.nickname;
        this.playerId = resp.playerId;
        this.gradeExp = resp.gradeExp;
        this.forgeCount = resp.forgeCount; 
        this.gem = resp.crystal;
        var props = resp.props;
        var seniorProps = resp.seniorProps || [];
        this.money = resp.fishIcon;
        this.initProps(props, seniorProps);
        this.setMaxGunRate(resp.maxGunRate)
        this.levelData = wls.Config.getLevelData(this.gradeExp);
        this.loginDrawUsed = resp.loginDrawUsed
        this.loginDrawTimes = resp.leftLoginDrawCount || 0
        this.useLoginDrawTimes = resp.loginDrawCount || 0
        this.leftMonthCardDay = resp.leftMonthCardDay
        this.monthCardRewardToken = resp.monthCardRewardToken
        if (resp.vipDailyRewardToken) {
            this.vipDailyRewardToken = resp.vipDailyRewardToken
        }
        this.leftMasterBullets = resp.leftMasterBullets
        this.masterScore = resp.masterScore
        this.signUpHistory = resp.signUpHistory || []
        this.initChest();
        this.seperateGunType = resp.seperateGunType;
    },

    //-----------------------------------------------------
    // 基础数据获取
    //-----------------------------------------------------

    getDataByName:function(name){
        if(this[name] == undefined){
            cc.log("get data from DAPlayer fail! name=", name);
        }
        return this[name];
    },
    getLevelData: function()
    {
        return this.levelData;
    },

    setLevel: function(lv)
    {
        this.levelData.level = lv
    },
    //设置水晶数量
    setGem: function(val)
    {
        this.gem = val
    },

    // 水晶数量
    getGem: function()
    {
        return this.gem;
    },

    //设置金钱数量
    setMoney: function(val)
    {
        this.money = val
    },

    // 金钱
    getMoney: function()
    {
        return this.money;
    },

    getPropAmount: function(propId)
    {
        if (propId == 1) {
            return this.getMoney()
        } else if (propId == 2) {
            return this.getGem()
        }
        for (var i = 0; i < this.mPropsList.length; i++)
        {
            if (this.mPropsList[i].propId == propId)
            {
                return this.mPropsList[i].propCount
            }
        }
        return 0;
    },

    getNickname: function()
    {
        return this.nickname;
    },

    getMaxGunRate: function()
    {
        return this.maxGunRate;
    },

    setMaxGunRate: function(v)
    {
        this.maxGunRate = v;
        var next = wls.Config.getNextGunRate(this.maxGunRate);
        if (next == null) {
            this.nextGunData = null 
            return 
        }
        this.nextGunData = wls.Config.get("cannon", next);
        if (this.nextGunData.unlock_item != 0) {
            this.nextGunData.itemList = this.nextGunData.unlock_item.split(";")
        }
        

    },

    getPlayerId: function()
    {
        return this.playerId;
    },

    getForgeCount: function()
    {
        return this.forgeCount;
    },

    setForgeCount: function(forgeCount)
    {
        this.forgeCount = forgeCount;
    },

    setLeftLotteryTimes: function(times) {
        this.leftLotteryTimes = times
    },

    getLeftLotteryTimes: function() {
        return this.leftLotteryTimes
    },

    isUseLoginDraw: function() {
        return this.loginDrawUsed
    },

    getAccountName: function() {
        return "微信用户"
    },

    setVipAwardState: function (val) {
        this.vipDailyRewardToken = val
    },
    getVipAwardState: function () {
        return this.vipDailyRewardToken
    },

    //-----------------------------------------------------
    // 道具相关
    //-----------------------------------------------------

    // 初始化道具
    initProps: function(props, seniorProps)
    {
        this.addDefaultItem(props);
        this.mPropsList = [];
        for (var i = 0; i < props.length; i++)
        {
            var prop = props[i];
            prop.config = wls.Config.getItemData(prop.propId)
            if (prop.config != null) {
                this.mPropsList.push(prop)
            }
        }

        for (var i = 0; i < seniorProps.length; i++)
        {
            var prop = seniorProps[i];
            prop.propCount = 1;
            prop.config = wls.Config.getItemData(prop.propId)
            if (prop.config != null) {
                this.mPropsList.push(prop)
            }
        }
        cc.log(this.mPropsList);
    },

    //添加道具
    addProps: function(props) {
        props = (props || [])
        //添加普通道具
        for (var i = 0; i < props.length; i++) {
            var prop = props[i]
            var isSeniorProp = (prop.propItemId != null)
            var isNewProp = true

            if (prop.propId == 1) {
                this.setMoney(this.getMoney() + prop.propCount )
                continue
            } else if (prop.propId == 2) {
                this.setGem(this.getGem() + prop.propCount )
                continue
            }
            //添加高级道具
            if (isSeniorProp) {
                prop.propCount = 1
                prop.config = wls.Copy(wls.Config.getItemData(prop.propId))
                if (prop.config != null) {
                    //查找是否原本就有该道具
                    var isAdd = true
                    for (var j = 0; j < this.mPropsList.length; j++) {
                        var existProp = this.mPropsList[j]
                        if (existProp.propId == prop.propId && existProp.propItemId == prop.propItemId) {
                            this.mPropsList[j] = prop
                            isAdd = false
                            break
                        }
                    }
                    if (isAdd) {this.mPropsList.push(prop)}
                }
                continue
            }
            //查找是否原本就有该道具
            for (var j = 0; j < this.mPropsList.length; j++) {
                var existProp = this.mPropsList[j]
                if (existProp.propId == prop.propId) {
                    existProp.propCount += prop.propCount
                    isNewProp = false
                    break
                }
            }
            //背包没有该数据
            if (isNewProp) {
                var prop = props[i];
                prop.config = wls.Copy(wls.Config.getItemData(prop.propId))
                if (prop.config != null) {
                    this.mPropsList.push(prop)
                }
            }
        }
    },

    // 默认道具
    addDefaultItem: function(props)
    {
        var maps = {};
        var callback = function(ret)
        {
            if (ret.default_show == 1)
            {
                maps[ret.id - 200000000] = true;
            }
        };
        wls.Config.ForEach("item", callback);
        for (var i = 0; i < props.length; i++)
        {
            var propId = props[i].propId;
            if (maps[propId])
            {
                maps[propId] = false;
            }
        }
        for (var key in maps)
        {
            if (maps[key])
            {
                var unit = {};
                unit.propId = parseInt(key);
                unit.propCount = 0;
                props.push(unit);
            }
        }
    },

    getProps: function()
    {
        return this.mPropsList;
    },

    getLimitGun: function()
    {
        var list = []
        for (var i = 0; i < this.mPropsList.length; i++) {
            var element = this.mPropsList[i];
            if (element.propItemId != null && element.config.use_outlook != -1 ) {
                list.push(element)
            }
        }
        return list
    },

    getDisplayProps: function()
    {
        var list = [];
        for (var i = 0; i < this.mPropsList.length; i++)
        {
            if (this.mPropsList[i].config.if_show == 0) {
                continue
            }
            if (this.mPropsList[i].config.default_show == 0 && this.mPropsList[i].propCount <= 0)
            {
                continue
            }
            list.push(this.mPropsList[i]);
        }
        list.sort(function(a, b){
            return b.config.show_order - a.config.show_order;
        })
        return list;
    },

    //获取月卡状态 0没有  1.有，未领取  2.有，已领取
    getMonthCardState: function()
    {
        var tb = {}
        if (this.leftMonthCardDay <= 0) {
            tb.state = 0
        } else if (this.monthCardRewardToken) {
            tb.state = 2
        } else {
            tb.state = 1
        }
        tb.leftDay = this.leftMonthCardDay
        return tb
    },

    setMonthCardGetAward: function()
    {
        this.monthCardRewardToken = true
    },

    setLoginDrawTimes: function(times) {
        this.loginDrawTimes = times
    },

    getLoginDrawTimes: function() {
        return this.loginDrawTimes || 0
    },

    setUseLoginDrawTimes: function(useTimes) {
        this.useLoginDrawTimes = useTimes
    },

    getUseLoginDrawTimes: function() {
        return this.useLoginDrawTimes || 0
    },

    //-----------------------------------------------------
    // 分享信息相关
    //-----------------------------------------------------
    setShareInfos: function(shareInfos) {
        this.shareInfos = shareInfos || []
    },

    setShareSwitchs: function(switchs) {
        this.shareSwitchs = switchs || []
    },

    getShareTimes: function(shareId) {
        for (var key = 0; key < this.shareInfos.length; key++) {
            var id = this.shareInfos[key].shareType
            if (shareId == id) {
                return this.shareInfos[key].shareCount
            }
        }
        return 0
    },

    getShareSwitch: function(shareId) {
        for (var key = 0; key < this.shareSwitchs.length; key++) {
            if (this.shareSwitchs[key] == shareId) {
                return true
            }
        }
        return false
    },

    //-----------------------------------------------------
    // 免费鱼币
    //-----------------------------------------------------
    updateFreeFishCoinInfo:function(info){
        if(info == undefined){
            cc.log("updateFreeFishCoinInfo info is undefined!");
            return;
        }
        for (var index = 0; index < info.length; index++) {
            var element = info[index];
            this.freeFishCoinInfo[element.freeType] = element;
        }
    },
    resetFreeFishCoinInfo: function(info) {
        var data = info.freeFishCoinInfo;
        if(!this.freeFishCoinInfo[data.freeType]){
            cc.log("getFreeFishCoinInfo fail type=", data.freeType);
            return 
        }
        
        this.freeFishCoinInfo[data.freeType].isReceive = data.isReceive;
        this.freeFishCoinInfo[data.freeType].receiveCount = data.receiveCount;
        this.freeFishCoinInfo[data.freeType].time = data.time || 0
    },
    //根据类型获取信息
    getFreeFishCoinInfo:function(type){
        if(!this.freeFishCoinInfo[type]){
            cc.log("getFreeFishCoinInfo fail type=", type);
            return 
        }
        return this.freeFishCoinInfo[type];
    },
    //-----------------------------------------------------
    // vip相关
    //-----------------------------------------------------

    initVip: function(vipExp)
    {
        this.vipExp = vipExp;
        this.vipData = wls.Config.getVipLevelData(vipExp);
    },

    getVipData: function()
    {
        return this.vipData
    },

    getVipLevel: function()
    {
        return this.vipData.vip_level
    },

    //锻造显示的是VIP最高的炮塔外观
    getVipMaxGunOutLook:function()
    {
        var config = null;
        var vipLev = this.getVipLevel();

        wls.Config.ForEach("cannonoutlook", function(ret){
            if(ret.type - 1 == vipLev ){
                config = ret;
                return true;
            }
        });
        return config;
    },
    //-----------------------------------------------------
    // 宝箱相关
    //-----------------------------------------------------

    setBuyHistory: function(l)
    {
        this.buyHistory = l;
    },

    setTodayBuy: function(l)
    {
        this.todayBuy = l;
    },

    // 是否已经够买
    hasBuyChest: function(id)
    {
        for (var i = 0; i < this.buyHistory.length; i++)
        {
            if (this.buyHistory[i].id == id && this.buyHistory[i].count > 0)
            {
                return true;
            }
        }
        return false;
    },

    // 初始化礼包
    initChest: function()
    {
        this.luckBoxEndTime = 0
        this.BoxLevelLimit = 0;
        // 炮倍礼包区间表
        if (this.gunRateBoxList == null)
        {
            this.gunRateBoxList = [];
            wls.Config.ForEach("gif", function(ret) {
                if (ret.type == 6)
                {
                    var tb = ret.cannon_limit.split(";");
                    var unit = {};
                    unit.gunRateLow = parseInt(tb[0]);
                    unit.gunRateHigh = parseInt(tb[1]);
                    unit.id = ret.id;
                    this.gunRateBoxList.push(unit);
                }
            }.bind(this));
            cc.log("炮倍礼包区间", this.gunRateBoxList);
        }

        // 尊享礼包区间表
        if (this.nobleBoxList == null)
        {
            this.nobleBoxList = [];
            wls.Config.ForEach("gif", function(ret) {
                if (ret.type == 7)
                {
                    var unit = {};
                    var tb;
                    if (ret.cannon_limit == -1)
                    {
                        unit.gunRateLow = 0;
                        unit.gunRateHigh = -1;
                    }
                    else
                    {
                        tb = ret.cannon_limit.split(";");
                        unit.gunRateLow = parseInt(tb[0]);
                        unit.gunRateHigh = parseInt(tb[1]);
                    }      
                    // 充值区间
                    tb = ret.recharge_limit.split(";");
                    unit.rechargeLow = parseInt(tb[0]);
                    unit.rechargeHigh = parseInt(tb[1]);
                    unit.id = ret.id;
                    this.nobleBoxList.push(unit);
                }
            }.bind(this));
            cc.log("尊享礼包区间", this.nobleBoxList);
        }
    },

    //是否游戏内配置礼包
    isGameOpenGif: function()
    {
        if (wls.GameState == 1) {
            return true
        }
        if (FG == undefined) {
            return false
        }
        if ( FG != null &&  FG.RoomConfig && FG.RoomConfig.ENABLE_GIFT ) {return true}
        return false
    },

    // 判断是否一元礼包
    calcSingleBox: function()
    {
        if (FISH_DISABLE_CHARGE) {return 0}
        if (!this.isGameOpenGif()) {return 0}
        var level = this.getLevelData().level;
        if (level >= this.BoxLevelLimit && this.vipExp == 0 && wls.Switchs.oneYuanChest)
        {
            return 830001016;// ios 返回830001030
        }
        return 0;
    },

    // 判断是否炮倍礼包
    calcGunRateBox: function()
    {       
        if (FISH_DISABLE_CHARGE) {return 0}
        if (!this.isGameOpenGif()) {return 0}
        var level = this.getLevelData().level;
        var id = 0;
        if (level >= this.BoxLevelLimit)
        {
            for (var i = 0; i < this.gunRateBoxList.length; i++)
            {
                var unit = this.gunRateBoxList[i];
                if(this.maxGunRate >= unit.gunRateLow && this.maxGunRate <= unit.gunRateHigh)
                {
                    id = unit.id;
                    break;
                }
            }
        }
        if (id != 0)
        {
            if (this.hasBuyChest(id))
            {
                id = 0;
            }
        }
        return id;
    },

    //是否刚好触发炮倍礼包
    isJustShowGunRateBox: function()
    {       
        if (FISH_DISABLE_CHARGE) {return false}
        for (var i = 0; i < this.gunRateBoxList.length; i++)
        {
            if(this.maxGunRate == this.gunRateBoxList[i].gunRateLow)
            {
                return true 
            }
        }
        return false
    },

    // 判断是否幸运礼包
    calcLuckBox: function()
    {
        if (FISH_DISABLE_CHARGE) {return 0}
        if (!this.isGameOpenGif()) {return 0}
        var id = 0;
        for (var i = 0; i < this.mPropsList.length; i++)
        {
            var prop = this.mPropsList[i];
            if (prop.propId == 2004 || prop.propId == 2005)
            {
                var buyID = prop.propId - 2004 + 830001024;
                if (!this.hasBuyChest(buyID))
                {
                    if (prop.intProp1 >wls.GetCurTimeFrame() + wls.serverTimeDis) {
                        id = buyID;
                        this.luckBoxEndTime = prop.intProp1
                        break;
                    }
                }
            }
        }
        return id;
    },

    // 判断是否尊享礼包
    calcNobleBox: function()
    {
        if (FISH_DISABLE_CHARGE) {return 0}
        if (!this.isGameOpenGif()) {return 0}
        var id = 0;
        for (var i = 0; i < this.nobleBoxList.length; i++)
        {
            var unit = this.nobleBoxList[i];
            if (this.vipExp >= unit.rechargeLow && this.vipExp < unit.rechargeHigh)
            {
                if((unit.gunRateHigh == -1) || (this.maxGunRate >= unit.gunRateLow && this.maxGunRate <= unit.gunRateHigh))
                {
                    var isCanBuy = true
                    for (var j = 0; j < this.todayBuy.length; j++)
                    {
                        if (this.todayBuy[j].id == unit.id && this.todayBuy[j].count >= unit.num)
                        {
                            isCanBuy = false
                        }
                    }
                    if (isCanBuy) {
                        id = unit.id
                        break;
                    }
                }
            }
        }
        return id;
    },

    calcBoxID: function()
    {
        var list = ["calcSingleBox", "calcGunRateBox", "calcLuckBox", "calcNobleBox"];
        var id = 0;
        for (var i = 0; i < list.length; i++)
        {
            id = this[list[i]]();
            if (id > 0) break;
        }
        return id;
    },

    getTypeConfig: function(t)
    {
        return this._boxTypes[t];
    },

    _boxTypes: 
    {
        1 : {
            cls : "UIYiYuanChest",
            name : "一元礼包",
            type : 1,
            res : "single_box.json",
            icon : "box_min_btn_single.png",
        },

        2 : {
            cls : "UILuckChest",
            name : "幸运宝箱",
            type : 2,
            res : "luck_box.json",
            icon : "box_min_btn_lucky.png",
        },

        3 : {
            cls : "UIForgedChest",
            name : "锻造礼包",
            type : 3,
            res : "forged_box.json",
            icon : "box_min_btn_single.png",
        },

        4 : {
            cls : "UIGemChest",
            name : "水晶礼包",
            type : 4,
            res : "uigembox.json",
            icon : "box_min_btn_single.png",
        },

        5 : {
            cls : "UIGunRateChest",
            name : "神秘宝箱",
            type : 5,
            res : "gunRateBox.json",
            icon : "box_min_btn_single.png",
        },

        6 : {
            cls : "UIGunRateChest",
            name : "炮倍礼包",
            type : 6,
            res : "gunRateBox.json",
            icon : "box_min_btn_gunrate.png",
        },

        7 : {
            cls : "UINobleChest",
            name : "尊享礼包",
            type : 7,
            res : "noble_box.json",
            icon : "box_min_btn_noble.png",
        },
    },

    getSmallGameConfig: function(t)
    {
        return this._smallGames[t];
    },

    _smallGames: 
    {
        0:{
            gameName : "赛狗",
            picPath : "hall/images/smallgame/sgame_icon_3.png",
            updateFileName : "saig",
            gameLittleName : "saig",
            APP_NAME : "龟兔赛跑",
            APP_ID_android : "368",
            APP_ID_ios : "367",
            APP_ID_windows : "368",
            APP_KEY : "633E848B26EfD1bcD05d48D8AE5f21f2",
            GAME_ID : "366",
            VER : 0,
        },
        1:{
            gameName : "赛狗",
            picPath : "hall/images/smallgame/sgame_icon_4.png",
            updateFileName : "saig",
            gameLittleName : "saig",
            APP_NAME : "龟兔赛跑",
            APP_ID_android : "368",
            APP_ID_ios : "367",
            APP_ID_windows : "368",
            APP_KEY : "633E848B26EfD1bcD05d48D8AE5f21f2",
            GAME_ID : "366",
            VER : 0,
        },
        2:{
            gameName : "套牛",
            picPath : "hall/images/smallgame/sgame_icon_1.png",
            updateFileName : "fknz",
            gameLittleName : "fknz",
            APP_NAME : "疯狂牛仔",
            APP_ID_android : "368",
            APP_ID_ios : "367",
            APP_ID_windows : "368",
            APP_KEY : "633E848B26EfD1bcD05d48D8AE5f21f2",
            GAME_ID : "457",
            VER : 0,
        },
        3:{
            gameName : "地鼠",
            picPath : "hall/images/smallgame/sgame_icon_2.png",
            updateFileName : "fkds",
            gameLittleName : "fkds",
            APP_NAME : "疯狂地鼠",
            APP_ID_android : "368",
            APP_ID_ios : "367",
            APP_ID_windows : "368",
            APP_KEY : "633E848B26EfD1bcD05d48D8AE5f21f2",
            GAME_ID : "504",
            VER : 0,
        },
       
    },

    // 判断是否能锻造
    isForget: function()
    {
        if (this.maxGunRate < 1000) { return false }
        if (this.nextGunData == null ) {return false}
        if (this.getGem() < this.nextGunData.unlock_gem) { return false }

        for (var i = 0; i < this.nextGunData.itemList.length; i++)
        {
            var propId = this.nextGunData.itemList[i]
            var propCount = this.nextGunData.itemList[i+1]
            var count = 0
            for (var j = 0; j < this.mPropsList.length; j++)
            {
                if (this.mPropsList[j].propId == propId)
                {
                    count = this.mPropsList[j].propCount
                    break
                }
            }
            if (count < propCount) { return false }
            i++
        }
        return true
    },

    getArenaSignUpTimes: function(type) {
        for (var key = 0; key < this.signUpHistory.length; key++) {
            if (this.signUpHistory[key].arenaType == type) {
                return this.signUpHistory[key].count
            }
        }

        return 0
    },

});