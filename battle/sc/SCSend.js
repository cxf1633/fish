// 协议发送请求
wls.namespace.SCSend = cc.Node.extend
({
    onCreate: function()
    {
        var target = this;
        FG.SendMsg = function(funcName)
        {
            var func = target[funcName];
            if (func)
            {
                [].splice.call(arguments, 0, 1, target);
                return Function.call.apply(func.bind(target), arguments);
            }
            else
            {
                cc.warn("捕鱼战斗中,没有定义发送函数 " + funcName);
            }
        }
    },

    convertFishList: function(tb)
    {
        var list = [];
        for (var i = 0; i < tb.length; i++)
        {
            var unit = {};
            unit.timelineId = tb[i].timelineid;
            unit.fishArrayId = tb[i].arrayid;
            list.push(unit);
        }
        return list;
    },

    // 开启心跳包定时器
    startHeartBeat: function()
    {
        this.startTimer("sendHeartBeat", 4, 101, -1);
    },

    sendJMsg: function(type, data, bo)
    {
        this.find("SCGameClient").sendJMsg(type, data, bo);
    },

    //-----------------------------------------------------
    // 系统消息
    //-----------------------------------------------------

    // 准备
    sendReady: function()
    {
        this.sendJMsg("MSGC2SClientReady", {});
    },

    // 心跳包
    sendHeartBeat: function()
    {
        this.MsgHeartBeat = this.MsgHeartBeat || {};
        this.MsgHeartBeat.frameCount = 0;
        this.sendJMsg("MSGC2SHeartBeat", this.MsgHeartBeat);
    },

    //-----------------------------------------------------
    // 玩家动作
    //-----------------------------------------------------

    // 请求发送兑换
    sendExchangeFishIcon: function(cnt)
    {
        this.MsgExchangeInfo = this.MsgExchangeInfo || {};
        this.MsgExchangeInfo.bean = parseInt(cnt);
        this.sendJMsg("MSGC2SExchangeFishIcon", this.MsgExchangeInfo);
    },

    // 发送子弹
    sendBullet: function(id, angle, bLock, rate,curGunRate)
    {
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        this.MsgBullet = this.MsgBullet || {};
        var data = this.MsgBullet;
        data.bulletId = id;
        data.frameCount = 0;
        data.angle = Math.floor((180 - angle) * 10) / 10 + "";
        data.gunRate = curGunRate || cannon.getGunRate();
        if (bLock)
        {
            var fish = this.find("SCGameLoop").getFollowFish(FG.SelfViewID);
            data.timelineId = fish == null ? 0 : fish.timelineid;
            data.fishArrayId = fish == null ? 0 : fish.arrayid;
        }
        else
        {
            data.timelineId = 0;
            data.fishArrayId = 0;
        }
        data.pointX = display.width; //屏幕宽与高
        data.pointY = display.height;
        data.isViolent = (rate == 2 || rate == 4);
        data.violentRate = rate || 0;
        this.sendJMsg("MSGC2SPlayerShoot", data, true);
    },  
    // 发送挑衅道具
    sendMagicProp:function (toId, propId)
    {   
        this.MsgMagicProp = this.MsgMagicProp || {};
        this.MsgMagicProp.magicpropId = propId % 1000;
        this.MsgMagicProp.toPlayerID = toId;
        this.sendJMsg('MSGC2SMagicprop',this.MsgMagicProp);
    },
    // 捕到鱼
    sendHit: function(bulletId, deadFishes, effectFishes)
    {
        this.MsgHit = this.MsgHit || {};
        var data = this.MsgHit;
        data.bulletId = bulletId
        data.frameId = 0;
        data.killedFishes = this.convertFishList(deadFishes);
        data.effectedFishes = this.convertFishList(effectFishes);
        this.sendJMsg("MSGC2SPlayerHit", data)
    },

    // 升级炮倍
    sendUpgradeCannon: function()
    {
        this.MsgUpgradeC = this.MsgUpgradeC || {};
        this.sendJMsg("MSGC2SUpgradeCannon", this.MsgUpgradeC);
    },

    // 切换炮倍
    sendNewGunRate: function(rate)
    {
        this.MsgNewGunRate = this.MsgNewGunRate || {};
        this.MsgNewGunRate.newGunRate = rate;
        this.sendJMsg("MSGC2SGunRateChange", this.MsgNewGunRate);
    },

     // 显示表情
     sendEmotionIcon: function(id)
     {
        this.MsgEmotion = this.MsgEmotion || {}
        this.MsgEmotion.emoticonId = id
        this.sendJMsg("MSGC2SEmoticon", this.MsgEmotion)
     },

     // 换炮台
     sendNewGunType: function(type)
     {
        this.MsgNewGunType = this.MsgNewGunType || {}
        this.MsgNewGunType.newGunType = type
        this.sendJMsg("MSGC2SGunTpyeChange", this.MsgNewGunType)
     },

     // 购买炮台
     sendShopBuy: function(id)
     {
        this.MsgShopBuy = this.MsgShopBuy || {}
        this.MsgShopBuy.id = id
        this.sendJMsg("MSGC2SShopBuy", this.MsgShopBuy)
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
    //发送领取免费鱼币
    sendFreeFishCoinReward: function(freeType, isShare, friendId) {
        var freeFishCoin = {};
        freeFishCoin.freeType = freeType;
        freeFishCoin.isShare = isShare;
        freeFishCoin.inviteId = friendId;
        this.sendJMsg("MSGC2SGetFreeFishCoinReward", freeFishCoin);
    },
    //-----------------------------------------------------
    // 新手任务
    //-----------------------------------------------------

    // 获取新手任务信息
    sendGetNewTaskInfo: function()
    {
        this.sendJMsg("MSGC2SGetNewTaskInfo", {});
    },

    // 领取新手任务奖励
    sendGetNewTaskReward: function(id)
    {
        this.MsgNewTaskReward = this.MsgNewTaskReward || {}
        this.MsgNewTaskReward.nTaskID = id
        this.sendJMsg("MSGC2SGetNewTaskReward", this.MsgNewTaskReward)
    },

    //-----------------------------------------------------
    // 技能申请
    //-----------------------------------------------------
    
    // 申请冰冻
    sendFreezeStart: function(useType)
    {
        this.MSGC2SFreezeStart = this.MSGC2SFreezeStart || {};
        this.MSGC2SFreezeStart.useType = useType;
        this.sendJMsg("MSGC2SFreezeStart", this.MSGC2SFreezeStart);
    },

    // 锁定
    sendlockFish: function(timelineId, fishArrayId, useType)
    {
        this.MsgLockFish = this.MsgLockFish || {}
        var data = this.MsgLockFish
        data.timelineId = timelineId
        data.fishArrayId = fishArrayId
        data.useType = useType
        this.sendJMsg("MSGC2SAim", data);
    },

    // 普通场使用狂暴技能
    sendUseViolent: function(useType)
    {
        this.MsgUseViolent = this.MsgUseViolent || {}
        this.MsgUseViolent.useType = useType
        cc.log(this.MsgUseViolent);
        this.sendJMsg("MSGC2SViolent", this.MsgUseViolent)
    },

    // 召唤鱼
    sendCallFish: function(useType, cnt)
    {
        this.MsgCallFish = this.MsgCallFish || {}
        var data = this.MsgCallFish
        data.callFishId = cnt
        data.useType = useType
        this.sendJMsg("MSGC2SCallFish", data)
    },

    // 核弹
    sendNBomb: function(x, y, useType, id)
    {
        this.bombid = this.bombid || 0;
        this.MsgBomb = this.MsgBomb || {}
        var data = this.MsgBomb;
        data.pointX = x;
        data.pointY = y;
        data.nBombId = this.bombid;
        data.useType = useType;
        data.nPropID = id;
        this.sendJMsg("MSGC2SNBomb", data);
        this.bombid++;
    },

    sendNBombBalst: function(id, tb)
    {
        this.MsgBombBalst = this.MsgBombBalst || {}
        var data = this.MsgBombBalst;
        data.nBombId = id
        data.killedFishes = this.convertFishList(tb)
        this.sendJMsg("MSGC2SNBombBlast", data)
    },

    sendToStartTimeHourglass: function(useType)
    {
        this.MsgStartHourglass = this.MsgStartHourglass || {}
        this.MsgStartHourglass.useType = useType;
        this.sendJMsg("MSGC2SUseTimeHourglass", this.MsgStartHourglass);
    },

    sendToStopTimeHourglass: function(useType)
    {
        this.MsgStopHourglass = this.MsgStopHourglass || {}
        this.MsgStopHourglass.useType = useType;
        this.sendJMsg("MSGC2SStopTimeHourglass", this.MsgStopHourglass);
    },

    sendToContinueTimeHourglass: function(useType)
    {
        this.MsgContinueHourglass = this.MsgContinueHourglass || {}
        this.sendJMsg("MSGC2SContinueTimeHourglass", this.MsgContinueHourglass);
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


    //发送加钱请求
    sendAddMoney: function(info)
    {
        this.MSGSetProp = this.MSGSetProp || {};
        this.MSGSetProp = info;
        /*var data = this.MSGSetProp;
        data.newProps = [];
        var prop = {};
        prop.propId = info.propId;
        prop.propCount = info.propCount;
        data.newProps.push(prop);*/
        this.sendJMsg("MSGC2SSetProp", this.MSGSetProp);
    },

    //充值成功发送消息
    sendUpdateRecharge: function()
    {
        this.MsgUpdateRecharge = this.MsgUpdateRecharge || {};
        this.sendJMsg("MSGC2SUpdateRecharge", this.MsgUpdateRecharge);
    },

    //发送开始抽奖
    sendStartLottery: function(drawGradeId)
    {
        this.MsgStatrLottery = this.MsgStatrLottery || {};
        this.MsgStatrLottery.drawGradeId = drawGradeId;
        this.sendJMsg("MSGC2SDraw", this.MsgStatrLottery);
    },
    
    //拉取救济金状态
    sendAlmInfo: function()
    {
        this.MsgAlmInfo = this.MsgAlmInfo || {};
        this.sendJMsg("MSGC2SAlmInfo", this.MsgAlmInfo);
        this.waiting(true,"AlmInfo")
    },
    //开始申请救济金
    sendApplyAlm: function()
    {
        this.MsgApplyAlm = this.MsgApplyAlm || {};
        this.sendJMsg("MSGC2SApplyAlm", this.MsgApplyAlm);
        this.waiting(true,"ApplyAlm")
    },

    //发送兑换话费请求
    sendExcPhoneCharges: function(phone) {
        var data = {
            "phoneNo":phone,
            "appId":APP_ID,
            "appKey":APP_KEY,
            "channelId":CHANNEL_ID,
            "version":wls.GetVersion(),
            "areaCode":REGION_CODE,
            "token":hallmanager.GetSession(),
        }
        this.sendJMsg("MSGC2SReceivePhoneFare", data)
    },

    //发送领取vip每日奖励
    sendGetVipDailyReward: function () {
        this.MsgGetVipDailyReward = this.MsgGetVipDailyReward || {};
        this.sendJMsg("MSGC2SGetVipDailyReward", this.MsgGetVipDailyReward)
    },

    //发送使用限时炮台
    sendUsePropCannon: function (useType,propID) {
        this.MsgUsePropCannon = this.MsgUsePropCannon || {};
        this.MsgUsePropCannon.useType = useType
        this.MsgUsePropCannon.propID = propID
        this.sendJMsg("MSGC2SUsePropCannon", this.MsgUsePropCannon)
    },

    //分享成功请求奖励
    sendShareSuccess: function(shareId, shareArgs) {
        cc.log("share id:"+shareId+" share args:"+shareArgs)
        this.shareInfo = this.shareInfo || {}
        this.shareInfo.shareType = shareId
        this.shareInfo.shareArgs = shareArgs
        this.sendJMsg("MSGC2SCommonShare", this.shareInfo);
    },

    //充值成功
    sendReChargeSucceed: function()
    {
        this.MsgRechargeSuccess = this.MsgRechargeSuccess || {};
        this.sendJMsg("MSCC2SRechargeSuccess",this.MsgRechargeSuccess);
    },
    //进入充值界面发送消息使不会被踢
    sendGotoCharge: function()
    {
        this.MsgGotoCharge = this.MsgGotoCharge || {};
        this.sendJMsg("MSGC2SGotoCharge", this.MsgGotoCharge);
    },
    //退出充值界面发送消息
    sendBackFromCharge: function()
    {
        this.MsgBackFromCharge = this.MsgBackFromCharge || {};
        this.sendJMsg("MSGC2SBackFromCharge", this.MsgBackFromCharge);
    },

       //--------------------------大师赛消息-----------------------------------------------
    //获取大师赛状态
    sendGetMasterStatus: function() {
        this.waiting(true,"GetMasterStatus")
        this.sendJMsg("MSGC2SGetMasterStatus", {});
    },
    //加入大师赛
    sendJoinMasterGame: function() {
        cc.log("---------------sendJoinMasterGame----game---------")
        this.waiting(true,"JoinMasterGame")
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
    sendGetTaskReward: function(nTaskID) {
        this.waiting(true,"GetTaskReward")
        this.GetTaskReward = this.GetTaskReward || {}
        this.GetTaskReward.nTaskID = nTaskID
        this.sendJMsg("MSGC2SGetTaskReward", this.GetTaskReward);
	},
    //发送竞技场准备消息
    sendArenaReady: function() {
        this.sendJMsg("MSGC2SArenaReady", {});
    },

    //竞技场请求状态
    sendGetFreeMatchStatus: function(playerId, ticketId) {
        this.joinFreeMatchData = this.joinFreeMatchData || {}
        this.joinFreeMatchData.playerId = playerId
        this.joinFreeMatchData.ticketId = ticketId
        this.sendJMsg("MSGC2SJoinArenaFreeGame", this.joinFreeMatchData);
    },
    
    //竞技场报名
    sendSignUpFreeMatch: function(arenaType, isLimitTime) {
        this.waiting(true,"SignUpFreeMatch")
        this.signupInfo = this.signupInfo || {}
        this.signupInfo.aneraType = arenaType
        this.signupInfo.isLimitTime = isLimitTime
        this.sendJMsg("MSGC2SArenaSignUp", this.signupInfo);
    },

    //竞技场充值发送消息
    sendArenaRechargeSuccess: function()
    {
        this.ArenaRechargeSuccess = this.ArenaRechargeSuccess || {};
        this.sendJMsg("MSGC2SArenaRechargeSuccess", this.ArenaRechargeSuccess);
    },

    //获取奖金池
    sendGetBonusPool: function(rankingType) {
        this.GetBonusPool = this.GetBonusPool || {}
        this.sendJMsg("MSGC2SGetBonusPool", this.GetBonusPool);
    },

});