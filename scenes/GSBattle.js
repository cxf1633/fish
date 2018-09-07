"use strict";
// 微乐捕鱼(战斗场景)
wls.namespace.GSBattle = wls.GameScene.extend
({
    onCreate: function() 
    {
        cc.director.setAnimationInterval(1 / 60);
        wls.FishHallInst.setSleep(true);
        window.FishBattleInst = this;
        this.mAssetsPath = "games/fish/assets/";
        window.FG = {};
        wls.CostType = 0
        this.tax = wls.Config.getConfig("990000052")
        this.matchId = 0
        this.cannon_min = null

        this.initGlobal();
        this.initRoomConfig();
        this.initPlayerMgr();
        this.syncHallObjects();
        this.createGameObject("SCLayerMgr");
        this.DABattle = this.createGameObject("DABattle");
        this.createGameObject("DALottery")
        this.createGameObject("SCGameClient");
        this.createGameObject("SCSend");
        this.createGameObject("SCRecv");
        this.onDownloadRes();
        this.find("SCSound").stopMusic()
    },
    //设置比赛场的id
    setMatchId: function(val) 
    {
        this.matchId = val
    },
    getMatchId: function() 
    {
        return this.matchId
    },

    // 同步大厅对象(战斗场景中不在重新创建)
    syncHallObjects: function() 
    {
        this.mGameObjects["DAPlayer"] = wls.FishHallInst.find("DAPlayer");
        this.mGameObjects["SCSound"] = wls.FishHallInst.find("SCSound");
    },

    // 下载资源
    onDownloadRes: function()
    {
        this.removeGameObject("UIAssetsLoad");
        wls.Loaded_Battle_Assets = true;
        this.createGameObject("UIDialog");
        this.createGameObject("UIToast");
        this.createGameObject("UIWaiting");
        this.createGameObject("UINotice", 2);
        this.createGameObject("UILoading").setNextStateName("onAfterLoadRes");
    },

    // 资源加载完毕
    onAfterLoadRes: function()
    {
        this.createGameObject("SCPool");
        this.createGameObject("SCGameLoop");
        this.createGameObject("UIBackGround");
        this.createGameObject("SCTouch");
        this.createGameObject("UIMainPanel");
        if (wls.EnableDebug) this.createGameObject("UITestPanel");
        var node = cc.Node.create();
        this.addChild(node,wls.ZOrder.GreenHand);
        this.wrapGameObject(node, "UIGreenHand", FG.RoomConfig.ENABLE_GUIDE);
        this.find("SCRecv").setNextStateName("onAfterReady");
        this.sendReady()

    },

    sendReady: function() {
        FG.SendMsg("sendReady");
    },

    // 已经请求准备
    onAfterReady: function()
    {
        FG.PlayMusic(wls.RoomIdx);
        this.find("UISkillPanel").updateAllIcon();
        this.removeGameObject("UILoading");
        this.find("SCGameClient").listenLeave();
        this.find("WNSelfChairTips").setNextStateName("onGameStart");
        this.find("WNGunUpgrade").initView();
        this.find("WNJackpotPanel").initView();

        this.find("WNGunUpgrade").show(true,true);
        this.find("WNSelfChairTips").play();
        this.find("UISkillPanel").open();
        this.find("WNJackpotPanel").show(true,true);
    },

    // 游戏开始
    onGameStart: function()
    {
        this.cannon_min = this.cannon_min || wls.roomData.cannon_min
        this.listenKeyBackEvent();
        this.find("WNNewBieTask").getNewTask();
        this.find("SCTouch").startTouch();
        this.find("WNSetPanel").openTouchBegan()
        this.find("WNSelfCannonMenu").open();
    },

    // 水晶不足提示，跳转到商城
    showNotEnoughGemTip: function(callback, str)
    {
        if (FISH_DISABLE_CHARGE) {
            this.dialog(1,str || wls.Config.getLanguage(800000464))
            return true 
        }
        str = str || wls.Config.getLanguage(800000093);
        var self = this;
        this.dialog(3, str, function(ret)
        {
            if (ret == 2) return
            if (callback)
            {
                callback();
            }
            self.gotoShop(2);
        });
        return true
    },

    // 向玩家数据里添加道具
    addProps: function(props) {
        this.find("DAPlayer").addProps(props);
        this.post("onEventPlayerDataModified"); 
    },

    gotoShop: function(propId)
    {
        this.pushView("UIShop",propId);
    },

    doExit: function()
    {
        if (this.find("SCLayerMgr").listIdx != 6) {
            this.find("SCLayerMgr").setCurShowList(6)
        } else {
            this.find("SCLayerMgr").playNextlayer(false)
        }
    },
    //退出处理
    doGameExitNotice: function()
    {
        var self = this;
        var callFun = function () {
            self.leaveRoom();
        }
        if (!this.find("SKHourglass") || this.find("SKHourglass").exitCheck(callFun)) {
            self.dialog(3, wls.Config.getLanguage(800000004), function(ret) {
                if (ret == 2) return;
                callFun()
            }); 
        }
    },

    // 支付结果
    onPayResult: function(bSuccess)
    {
        cc.log("--------------onPayResult----------------")
        this.find("SCSend").sendBackFromCharge()
        if (bSuccess)
        {
            cc.log("--------------onPayResult------bSuccess----------")
            this.doReChargeSucceed();
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
    //各个场景如果不同要重写
    doReChargeSucceed: function(bSuccess)
    {
        cc.log("--------GSBattle------sendUpdateRecharge----------------")
        this.find("SCSend").sendUpdateRecharge()
    },
    //取消支付
    doCancelPay: function () {
        cc.log("--------------onPayResult------doCancelPay----------")
        this.find("SCSend").sendBackFromCharge()
        this.dialog(1,wls.Config.getLanguage(800000169));
    },

    //等待超时
    waitOverTime: function () {
        wls.ExitGameErrorCode = "network error"
        this.find("SCGameClient").standUp();
    },
    leaveRoom: function () {
        this.find("SCGameClient").standUp();
    },

    // 房间配置(功能开关)
    initRoomConfig: function() 
    {
        var t = {};
        t.skills = []; // 允许使用技能列表
        t.ENABLE_REWARD = true; // 抽渔券功能开关
        t.ENABLE_UNLOCK_CANNON = true; // 解锁炮倍功能开关
        t.ENABLE_SHOP = true; // 商店功能开关
        t.ENABLE_GIFT = true; // 礼包功能开关
        t.ENABLE_TASK = true; // 新手任务功能开关
        t.ENABLE_GUIDE = true; // 引导功能开关
        t.ENABLE_GUNRATE = true; //手动调整炮倍
        t.ENABLE_FREEMONEY = true; //免费鱼币
        t.PRIZE_POOL = true; //大奖金池

        var c = wls.Config.get("room", wls.RoomIdx + 910000000);
        //c = wls.Config.get("room", 910000007);
        var tb = wls.SplitArray(c.show_skill);
        for (var i = 0; i < tb.length; i++)
        {
            t.skills.push(parseInt(tb[i]));
        }
        t.ENABLE_REWARD = c.show_reward == 1;
        t.ENABLE_UNLOCK_CANNON = c.show_cannon == 1;
        t.ENABLE_SHOP = c.show_shop == 1;
        t.ENABLE_GIFT = c.show_gift == 1;
        t.ENABLE_TASK = c.show_task == 1;
        t.ENABLE_GUIDE = c.show_novice == 1;
        t.ENABLE_GUNRATE = c.show_change_gun_rate == 1;
        t.ENABLE_FREEMONEY = c.isfreemoney == 1;
        t.PRIZE_POOL = c.isPrizePool == 1;
        cc.log(c.name, "房间功能开关:");
        wls.warn(t);
        FG.RoomConfig = t;
    },

    // 全局对象
    initGlobal: function()
    {
        FG.FIRE_INTERVAL = 0.20
        FG.ENABLE_SHADOW = true;
        FG.AutoFire = false;
        FG.MaxCoin = 1000000;
        FG.BeansToFishIconRate = 10;
        FG.SkipFrame = false;// 是不跳帧
        FG.ClientFrame = 0;
        // 技能id定义
        FG.SkillMap = {
            3 : "SKFreeze",
            4 : "SKLock",
            17 : "SKViolent",
            5 : "SKSummon",
            14 : "SKHourglass",
            6 : "SKBomb6",
            16 : "SKBomb16",
            15 : "SKBomb15",
            21 : "SKBomb21",
            22 : "SKBomb22",
            23 : "SKBomb23",
        }

        // 结点
        FG.FishRoot = null;
        FG.BulletRoot = null;
        FG.NetRoot = null;
        FG.FishTimelineRoot = null;
        FG.SkillRoot = null;
        FG.EffectRoot_1 = null; // 鱼被抓特效层
        
        FG.BulletSpeed = 1100;

        var halfWidth = display.width / 2;
        var offcx = 308;
        //炮塔坐标
        FG.CannonPosList = 
        [
            cc.p(halfWidth - offcx, 0), 
            cc.p(halfWidth + offcx, 0), 
            cc.p(halfWidth + offcx, display.height),
            cc.p(halfWidth - offcx, display.height),
        ];
        FG.GetCannonPos = function(viewid)
        {
            var p = FG.CannonPosList[viewid - 1];
            return cc.p(p.x, p.y);
        };
        // 收取道具坐标
        FG.AimPosList = 
        [
            cc.p(halfWidth - offcx, 40), 
            cc.p(halfWidth + offcx, 40), 
            cc.p(halfWidth + offcx, display.height - 40),
            cc.p(halfWidth - offcx, display.height - 40),
        ];

        FG.ScreenRect = cc.rect(0, 0, display.width, display.height);

        var self = this;
        // 函数
        FG.SendMsg = function() {};
        this.mRetainActions = [];
        var list = this.mRetainActions;
        FG.RetainAction = function(action)
        {
            action.retain();
            list.push(action);
        };

         // 播放音效
        FG.PlayEffect = function(filename)
        {
            self.find("SCSound").playEffect(filename);
        };

        // 播放背景音
        FG.PlayMusic = function(idx)
        {
            self.find("SCSound").playGameMusic(idx);
        };

        var animations = {};
        FG.CreateAnimation = function(filename, interval)
        {
            var ret = animations[filename];
            if (ret) return ret;
            ret = wls.CreateAnimation(filename, interval);
            ret.retain();
            animations[filename] = ret;
            return ret;
        };
        FG.CreateDisorderAni = function(filename, interval,firstIdx,endIdx)
        {
            var idx = wls.Range(firstIdx,endIdx)
            var ret = animations[filename+idx];
            if (ret) return ret;
            for (var i = firstIdx; i < endIdx+1; i++) {
                var retitem = wls.CreateDisorderAni(filename, interval,firstIdx,endIdx,i);
                retitem.retain();
                animations[filename+i] = retitem;
            }
            ret = animations[filename+idx];
            return ret;
        };
    },

    // 玩家管理器
    initPlayerMgr: function()
    {
        FG.bGameStatus = false;
        FG.SelfViewID = 1;
        FG.PlayerFlip = false;

        this.players = {};
        this.viewidPlayers = {};
        this.selfPlayer = null;
        this.FlipMap = [3, 4, 1, 2];
        var self = this;
        // 
        FG.CalcViewID = function(chairid)
        {
            return FG.PlayerFlip ? self.FlipMap[chairid] : chairid + 1;
        }

        FG.GetSelfPlayer = function() 
        { 
            return self.selfPlayer;
        }

        FG.GetPlayer = function(id)
        {
            return self.players[id];
        }

        FG.GetPlayerByViewID = function(viewid)
        {
            return self.viewidPlayers[viewid];
        }

        FG.AddPlayer = function(player)
        {
            player.viewid = FG.CalcViewID(player.chairId);
            player.bSelf = player.viewid == FG.SelfViewID;
            if (player.bSelf)
            {
                self.selfPlayer = player;
            }
            self.players[player.playerId] = player;
            self.viewidPlayers[player.viewid] = player;
        }

        FG.RemovePlayer = function(id)
        {
            var viewid = self.players[id].viewid;
            delete self.players[id];
            delete self.viewidPlayers[viewid];
        }
    },

    // 发送消息
    sendMsg: function(funcName)
    {
        var target = this.find("SCSend");
        var func = target[funcName];
        if (func)
        {
            [].splice.call(arguments, 0, 1);
            func.apply(target, arguments);
        }
        else
        {
            cc.warn("游戏场景未定义发送函数 " + funcName);
        }
    },

    //发射扣钱
    shootCost: function(cannon,cost)
    {
        cannon.opCoin(-cost);
    },
    //无效子弹回复
    shootRevert: function(cannon,cost)
    {
        cannon.opCoin(cost);
    },

    //击中加钱
    hitGet: function(cannon,gunRate,fish,fishScore,isViolent)
    {
        var t = fish.config.trace_type;
        var showScore = this.calcFishScore(t,fishScore ,gunRate);
        cannon.willOpCoin(showScore);
        return {showScore : showScore,fishScore : fishScore}
    },

    // 计算鱼的价值
    calcFishScore: function(trace_type,fishRate, gunRate)
    {
        var score = fishRate * gunRate;
        if (trace_type == 3 || trace_type == 4)
        {
            score = score * (1 - this.tax / 10000);
        }
        return score;
    },

    // 发射子弹 (错误码：1 子弹数达到上限, 2 炮倍未解锁, 3 金钱不够, 4子弹不够)
    laucherBullet: function(cannon,rate)
    {
        var go = this.DABattle;
        // 子弹数达到上限
        if (go.isMaxBullet())
        {
            return 1
        }
        // 炮倍未解锁
        if (cannon.spr_gun_lock.isVisible())
        {
            return 2
        }
        rate = rate || 1;
        var curRate = cannon.getGunRate()
        // 金钱不够
        if ( cannon.getCoin() < curRate * rate)
        {
            var gunRate = go.getGunRateByCoin(cannon.getCoin(), curRate, rate);
            if (cannon.getCoin() >= gunRate*rate) 
            {
                cannon.requestNewGunRate(gunRate);
            }
            return 3
        }
        //钱够了房间最低限制 就切换到房间最低炮倍
        if (curRate < this.cannon_min && cannon.getCoin()/rate >= this.cannon_min) 
        {
            var gunRate = go.getGunRateByCoin(cannon.getCoin(), curRate, rate);
            gunRate = (gunRate>cannon.maxGunRate?cannon.maxGunRate:gunRate)
            if (cannon.getCoin() >= gunRate*rate) 
            {
                cannon.requestNewGunRate(gunRate);
            }
            return 3
        }
        return 0
    },

    //点击手动切换炮倍
    doChangeGunRate: function(bNext,max,gunRate)
    {
        var maxNext = wls.Config.getNextGunRate(max);
        maxNext = maxNext || max;
        var newRate = this.DABattle.calcChangeRate(gunRate, maxNext, bNext,this.cannon_min);
        if (newRate < this.cannon_min) {
            return
        }
        return newRate
    },

    countOver: function() { },
    gameOver: function() { },
    getMatchjoinState: function() { },
    initViewAfterReady: function() { },

    uiShowAct: function(node1,node2,isShow,isAct) { 
        node1.setVisible(true)
        node1.stopActionByTag(101)
        node2.setVisible(true)
        node2.stopActionByTag(101)
        if (!isAct) {
            node1.setVisible(isShow)
            node1.setOpacity(isShow?255:0)
            node2.setVisible(!isShow)
            node2.setOpacity(!isShow?255:0)
            return
        }
        var act1 = null
        var act2 = null
        var self = this
        var actTime = 0.3
        if (isShow) {
            act1 = cc.Sequence.create(cc.FadeTo.create(actTime, 255))
            act2 = cc.Sequence.create(cc.FadeTo.create(actTime, 0),cc.CallFunc.create(function () {
                node2.setVisible(false)
            }))
        } else {
            act1 = cc.Sequence.create(cc.FadeTo.create(actTime, 0),cc.CallFunc.create(function () {
                node1.setVisible(false)
            }))
            act2 = cc.Sequence.create(cc.FadeTo.create(actTime, 255))
        }
        act1.setTag(101)
        act2.setTag(101)
        node1.runAction(act1)
        node2.runAction(act2)

    },

});


