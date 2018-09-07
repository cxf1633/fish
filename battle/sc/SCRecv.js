// 协议接收处理
wls.namespace.SCRecv = cc.Node.extend
({
    onCreate: function()
    {
        this.tax = wls.Config.getConfig("990000052")
        this.shareLimit = parseInt(wls.Config.get("config", 990000128).data)
    },

    initChairMap: function(chairid)
    {
        var viewid = chairid + 1;
        FG.PlayerFlip = viewid > 2;
        FG.SelfViewID = FG.CalcViewID(chairid);
    },

    // 心跳包
    MSGS2CHeartBeat: function(resp)
    {
        this.find("SCGameLoop").syncFrame(resp.frameCount);
    },

    // 进入游戏初始化
    MSGS2CGameStatus: function(resp)
    {
        wls.GameState = 2
        wls.roomData = wls.Config.get("room", wls.RoomIdx + 910000000);
        wls.serverTimeDis = resp.serverTime - wls.GetCurTimeFrame()
        FG.bGameStatus = true;
        FG.MaxCoin = resp.maxInGameFishIcon;
        wls.Switchs = resp.switchs;
        FG.BeansToFishIconRate = resp.beansToFishIconRate;
        this.find("DAPlayer").setBuyHistory(resp.buyHistory)
        this.find("DAPlayer").setTodayBuy(resp.todayBuy)
        this.find("SCSend").startHeartBeat();
        this.find("SCPool").setKilledFishes(resp.killedFishes)
        // 奖池数据
        this.find("DABattle").initJackpot(resp.killRewardFishInDay, resp.drawRequireRewardFishCount, resp.rewardRate)
        var players = resp.playerInfos;
        // 初始化座位表
        for(var i = 0; i < players.length; i++)
        {
            if (players[i].playerId == resp.playerId)
            {
                this.initChairMap(players[i].chairId);
                break;
            }
        }
        // 玩家加入
        for(var i = 0; i < players.length; i++)
        {
            this.MSGS2CPlayerJion(players[i]);
        }
        // 鱼线
        FG.ClientFrame = resp.frameId;
        //resp.timelineIndex = 3;
        this.find("SCPool").setEnableResizeFishPool(!resp.isInGroup);
        if (resp.isInGroup)
        {
            this.find("SCGameLoop").addGroup(resp.timelineIndex, resp.frameId);
        }
        else
        {
            this.find("SCGameLoop").addTimeline(resp.timelineIndex, resp.frameId, false);
            this.find("SCGameLoop").addTimeline(resp.timelineIndex, resp.frameId, true);
        }
        this.find("SCGameLoop").startUpdate();
        this.gotoNextState();
        this.find("DAPlayer").setBuyHistory(resp.buyHistory);
        this.find("WNLuckBox").updateBox();
        FG.bGameStatus = false;

        //处理时光沙漏
        for (var index = 0; index < resp.inTimeHourGlass.length; index++) {
            var player = FG.GetPlayer(resp.inTimeHourGlass[index]);
            if (!player) {continue}
            if (player.bSelf) {
                this.find("SKHourglass").continueCheck()
            } else {
                this.find("SKHourglass").continueSkill(player.viewid,0,300);
            }
        }

        //悬赏任务
        var rewardTaskInfo = (resp.rewardTaskStatus || {})
        var rewardStatus = (rewardTaskInfo.rewardTaskId || 0)
        if (rewardStatus != 0) {
            this.createGameObject("UIRewardTask", {"result":true, "data":rewardTaskInfo})
            this.MSGS2CRewardTaskProgressChange(rewardTaskInfo)
        }

        //大师悬赏任务
        if ( wls.RoomIdx == 8 && resp.masterTaskStatus && resp.masterTaskStatus.taskId != 0) {
            if (resp.masterTaskStatus.endTime > wls.GetCurTimeFrame()) {
                resp.masterTaskStatus.isScoreAward = true
                this.createGameObject("UIRewardTask", {"result":true, "data":resp.masterTaskStatus})
                this.MSGS2CMasterRewardTaskUpdate(resp.masterTaskStatus)
            }

        }

        //显示玩家召唤的鱼
        for(var i = 0; i < resp.calledFishes.length; i++){
            var calledFish = resp.calledFishes[i];
            var args = {};
            args.frameId = resp.frameId - calledFish.frameId;
            args.pathId = calledFish.pathId.toString();
            args.fishId = calledFish.fishTypeId.toString();
            args.timelineId = -calledFish.playerId;
            args.callFishId = calledFish.callFishId;
            var fish = this.find("SCGameLoop").addSummonFish(args);
        }


        this.find("DAPlayer").setShareInfos(resp.shareInfo)
        this.find("DAPlayer").setShareSwitchs(resp.shareSwitchs)

        if (FG.RoomConfig.PRIZE_POOL) {
            if (this.find("WNBonusPool")) {
                this.find("WNBonusPool").startUpdate()
                this.sendMsg("sendGetBonusPool")
            }
        }
    },

    //大厅公告
    MSGS2CGameAnnouceString: function(resp)
    {
        cc.log(resp);
        this.find("UINotice").pushNotice(resp)
    },

    //-----------------------------------------------------
    // 玩家动作
    //-----------------------------------------------------

    // 玩家加入
    MSGS2CPlayerJion: function(resp)
    {
        if (resp.playerInfo) resp = resp.playerInfo;
        FG.AddPlayer(resp);
        this.find("UIBackGround").showWaiting(resp.viewid, false);

        var cannon = this.find("GOCannon" + resp.viewid);
        cannon.reset();
        cannon.join(resp.playerId);
        this.MSGPlayerInfo(resp)

    },

    //充值后刷新玩家数据
    MSGS2CUpdateRecharge: function(resp)
    {
        cc.log(resp);
        var player = FG.GetPlayer(resp.playerInfo.playerId);
        if (!player) return;
        if (player.bSelf)
        {
            this.find("DAPlayer").setBuyHistory(resp.buyHistory)
            this.find("DAPlayer").setTodayBuy(resp.todayBuy)
        }
        this.MSGPlayerInfo(resp.playerInfo);
    },

    MSGPlayerInfo: function(resp)
    {
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        var cannon = this.find("GOCannon" + player.viewid);
        cannon.setVipLevel(wls.Config.getVipLevelData(resp.vipExp).vip_level);
        cannon.setLevel(wls.Config.getLevelData(resp.gradeExp).level);
        cannon.initPlayerInfo(resp);
        cannon.initSeniorProps(resp.seniorProps || []);
        cannon.initProps(resp.props);
        cannon.setCoin(resp.fishIcon);
        cannon.setGem(resp.crystal);
        cannon.setMaxGunRate(resp.maxGunRate);
        cannon.setGunRate(resp.currentGunRate);
        cannon.updateGun(resp.gunType);
        cannon.setBankrupt(resp.fishIcon <= 0)
        cannon.setCount(resp.leftMasterBullets);
        cannon.setScore(resp.masterScore);

        if (player.bSelf)
        {
            cannon.requestNewGunRate(resp.maxGunRate);
            //if (resp.fishIcon <= 0) { FG.SendMsg("sendAlmInfo"); }
            this.find("UISkillPanel").updateAllIcon()
            this.find("DAPlayer").updatePlayer(resp);
            this.find("WNGunUpgrade").updateView();
            if (this.find("UIMasterBar")) {
                this.find("UIMasterBar").updateView()
            }
            this.find("WNLuckBox").updateBox();
        }
    },

    // 兑换金币成功
    MSGS2CExchangFishIcon: function(resp)
    {
        cc.log(resp);
        if (resp.errorCode != 0) return;
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        var cannon = this.find("GOCannon" + player.viewid);
        cannon.setCoin(resp.fishIconCount);
        if (player.bSelf)
        {
            this.gotoNextState();
        }
    },

    // 玩家射击
    MSGS2CPlayerShoot: function(resp)
    {
        //cc.log(resp);
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        var cannon = this.find("GOCannon" + player.viewid);
        var cost = resp.isViolent ? resp.gunRate*resp.nViolentRatio : resp.gunRate;
        if (player.bSelf)
        {
            if (!resp.validate) {
                this.getScene().shootRevert(cannon,resp.gunRate)
            }
            return;
        }
        if (!resp.validate) return;
        var fish = null;
        if (resp.timelineId != 0 || resp.fishArrayId != 0)
        {
            fish = this.find("SCGameLoop").findByID(resp.timelineId, resp.fishArrayId);
        }
        this.find("SCGameLoop").setFollowFish(player.viewid, fish);
        
        cannon.updateAngle(180 - resp.angle);
        cannon.fire(fish, resp.isViolent);
        this.getScene().shootCost(cannon,cost)
    },

    // 网与鱼碰撞
    MSGS2CPlayerHit: function(resp)
    {
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        var gl = this.find("SCGameLoop");
        var ef = this.find("EFFishCatched");
        var cannon = this.find("GOCannon" + player.viewid);
        var dropPos = cc.p(0,0);
        var killBossId = 0;
        var allFishScore = 0
        var oldFishScore = 0
        var showScore = 0
        var fishScore = 0
        for (var i = 0; i < resp.killedFishes.length; i++)
        {
            var fish = gl.findByID(resp.killedFishes[i].timelineId, resp.killedFishes[i].fishArrayId);
            if (fish && fish.isAlive())
            {
                var t = fish.config.trace_type;
                dropPos = fish.getPosition();
                oldFishScore = t == 10 ?resp.randomFishScore :fish.config.score
                var newData = this.getScene().hitGet(cannon,resp.gunRate,fish,oldFishScore,resp.isViolent)
                showScore = newData.showScore
                fishScore = newData.fishScore
                allFishScore = allFishScore + newData.fishScore
                fish.setAlive(false);
                
                ef.play(fish, player.viewid, showScore,fishScore);
                if (t == 3 || t == 4 || t == 5)
                {
                    this.find("EFBonusWheel" + player.viewid).play(fish.config.id -100000000, showScore, 0);
                }
                if (t == 10) {
                    var go = this.createGameObject("EFNumJump");
                    var showData = {
                        endRate: resp.randomFishScore,
                        gunRate: resp.gunRate,
                        dropPos: dropPos,
                        fishId :fish.config.id -100000000,
                        allScore:resp.randomFishScore*resp.gunRate,
                        coin_num :fish.config.coin_num
                    }
                    go.initWithType(2,player.viewid,showData)
                }
                if (t == 5 || t == 10) { 
                    killBossId = (showScore < this.shareLimit ? 0 : fish.config.id)
                }
                if (player.bSelf && (t == 6 || t == 7 || t == 8)) {
                    this.find("SCLayerMgr").pushEFLayewr("EFMegawin",resp)
                }
            } 
        }

        if (resp.masterScore != allFishScore ) {
            cannon.opScore(resp.masterScore - allFishScore);
        }

        if (player.bSelf && killBossId != 0 
            && (!this.find("WNNewBieTask") || !this.find("WNNewBieTask").isVisible())
            && !this.find("UIRewardTask")
        ) 
        {
            // this.find("UIMainPanel").setTitleIsShow(false)
            var self = this
            this.createGameObject("UIKillBossShare", {"fishid":killBossId,"func":function () {
                 //self.find("UIMainPanel").setTitleIsShow(true)
            }})

            
        }
 
        if (resp.dropCrystal > 0) {
            resp.dropProps.push({propId:2,propCount:resp.dropCrystal})
        }
        
        if (resp.dropProps.length > 0 || resp.dropSeniorProps.length > 0 ) { 
            this.find("EFItems").playHitDropProp(player.viewid, dropPos,cannon.getCentrePos(), resp.dropProps, resp.dropSeniorProps);
        }

        this.find("EFLighting").endLighting();    
    },

    // 玩家升级结果
    MSGS2CUpgrade: function(resp)
    {
        cc.log(resp);
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        if (resp.dropFishIcon > 0) {
            resp.dropProps.push({propId:1,propCount:resp.dropFishIcon})
        }
        if (resp.dropCrystal > 0) {
            resp.dropProps.push({propId:2,propCount:resp.dropCrystal})
        }
        var cannon = this.find("GOCannon" + player.viewid);
        if (!player.bSelf) {
            for (var key in resp.dropProps) {
                var element = resp.dropProps[key];
                cannon.opProp(element.propId,element.propCount)
            }
            cannon.setLevel(resp.newGrade)
            return 
        }
        
        if (resp.newGrade >= 4 && cannon.getLevel() < 4) {
            resp.isShowBox = true
        }
        cannon.setLevel(resp.newGrade)
        resp.endPos = cannon.getCentrePos()
        resp.viewid = player.viewid

        wls.connectPropTb(resp.dropProps,resp.dropSeniorProps)
        for (var key in resp.dropProps) {
            var element = resp.dropProps[key];
            cannon.willOpProp(element.propId,element.propCount)
        }

        this.find("SCLayerMgr").pushEFLayewr("EFLevelUp",resp)
    },

    // 炮倍升级结果
    MSGS2CUpgradeCannonResult: function(resp)
    {
        cc.log(resp);
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        var cannon = this.find("GOCannon" + player.viewid);
        cannon.setMaxGunRate(resp.newGunRate);

        //处理扣钱
        for (var index = 0; index < resp.costProps.length; index++) {
            var element = resp.costProps[index];
            cannon.opProp(element.propId,-element.propCount)
        }

        wls.connectPropTb(resp.dropProps,resp.dropSeniorProps)

        cannon.updateGun(cannon.getGunType())
        if (!player.bSelf){
            for (var index = 0; index < resp.dropProps.length; index++) {
                var element = resp.dropProps[index];
                cannon.opProp(element.propId,element.propCount)
            }
            return 
        }

        for (var index = 0; index < resp.dropProps.length; index++) {
            var element = resp.dropProps[index];
            if (element.propId == 1) {
                cannon.willOpProp(element.propId,element.propCount)
                cannon.playGunNotice("upgrade",{propId:element.propId,propCount :element.propCount}) 
            } else {
                cannon.opProp(element.propId,element.propCount)
            }   
        }

        cannon.requestNewGunRate(resp.newGunRate);
        this.find("WNGunUpgrade").updateView();
        var ui = this.find("UIUnlockCannon");
        if (ui && ui.isVisible())
        {
            ui.OnGunUpgraded();
            //是否弹炮倍礼包
            if (this.find("DAPlayer").isJustShowGunRateBox()) {
                ui.isShowBox  = true
            }
        }
 
        if (wls.roomData.cannon_max > -1 && wls.roomData.cannon_max <= resp.newGunRate) {
            wls.ExitGameErrorCode = "upgradrGunOver"
            this.find("SCGameClient").standUp()
            return 
        }
        this.find("WNLuckBox").updateBox();

        //是否永久解锁狂暴
        if (this.find("UISkillPanel").isJustRelieve(17,resp.newGunRate)) {
            cannon.playGunTipPic("Violent")
            this.find("SKViolent").relieveSkill()
        }

        //是否弹出分享
        var shareConfig = cannon.getShareConfig()
        if (parseInt(shareConfig) != 0) {
            this.pushView("UIGunUpgradeShare", {"config":shareConfig})
        }

        var str = wls.roomData.cannon_roomid
        var gunRate = wls.SplitArray(str)
        var self = this
        if ( parseInt(gunRate[0]) == resp.newGunRate) {
            var roomName = wls.Config.get("room", parseInt(gunRate[1]) + 910000000).name
            var str = wls.format(wls.Config.getLanguage(800000451),"%s",[gunRate[0],roomName])
            str = str.replace(/[\\]n/g, '\n')
            this.dialog(3,str, function(ret) {
                if (ret == 2) return;
                wls.ExitGameErrorCode = "gotoNextRoom"
                self.find("SCGameClient").standUp()
                
            });
        }
        this.find("UIGreenHand").playNextAct("clickUpGun")
    },

    // 新的炮倍
    MSGS2CGunRateChange: function(resp)
    {
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        var cannon = this.find("GOCannon" + player.viewid);
        cannon.setGunRate(resp.newGunRate);
        cannon.playGunRateChangeAni();
        if (player.bSelf)
        {
            cannon.btn_minus.setTouchEnabled(true);
            cannon.btn_add.setTouchEnabled(true);
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
    //
    MSGS2CGetVipDailyReward: function(resp)
    {
        if(!resp.success){
            cc.log("领取失败！");
        }
        else{
            this.find("UIVipRight").getVipReward();
        }

    },
    // 改变炮的类型
    MSGS2CGunTpyeChange: function(resp)
    {
        if (!resp.isSuccess) {
            this.dialog(1, "使用失败");
            return 
        }
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        var cannon = this.find("GOCannon" + player.viewid);
        cannon.updateGun(resp.newGunType);
        if (player.bSelf)
        {
            if (this.find("UIChangeGun"))
            {
                this.find("UIChangeGun").updateAllItem();
            }
        }
    },

    // 播放表情表现
    MSGS2CEmoticon: function(resp)
    {
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        this.find("WNEmojiDisplay").play(player.viewid, resp.emoticonId);
    },

    // 购买完成
    MSGS2CShopBuy: function(resp)
    {
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        if (player.bSelf)
        {
            if (resp.errorCode != 0)
            {
                this.dialog(1, wls.Config.getLanguage(800000317));
            }
        }
    },
    //播放魔法表情
    MSGS2CMagicprop: function(resp)
    {   
        if(!resp.isSuccess) return ;
        var player = FG.GetPlayer(resp.playerId);
        var toPlayer = FG.GetPlayer(resp.toPlayerID);
        if(!player || !toPlayer) return;
        this.find('EFMagicProp').play(toPlayer.viewid , 410000000 + resp.magicpropId , player.viewid);
    },

    // 玩家破产
    MSGC2SBankup: function(resp)
    {
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        var cannon = this.find("GOCannon" + player.viewid);
        cannon.setBankrupt(true)
        if (player.bSelf) {
            //FG.SendMsg("sendAlmInfo");
            //更新礼包按键
            this.find("WNLuckBox").updateBox();
        }
    },

    // 拉取救济金状态
    MSGS2CAlmInfo: function(resp)
    {
        this.waiting(false,"AlmInfo")
        if (this.find("EFAlminfo")) {
            this.find("EFAlminfo").initView(FG.SelfViewID,resp)
            return 
        } 
        var cannon = this.find("GOCannon" + FG.SelfViewID);
        this.getScene().setGameObjectRoot(cannon);
        var go = this.createGameObject("EFAlminfo")
        this.getScene().setGameObjectRoot(null);
        go.initView(FG.SelfViewID,resp)
    },
    // 申请救济金结果
    MSGS2CApplyAlmResult: function(resp)
    {
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        if (player.bSelf) {this.waiting(false,"ApplyAlm");}

        if (!resp.success) {
            if (player.bSelf) { 
                this.toast("领取失败，重新拉取数据");
                //FG.SendMsg("sendAlmInfo") 
            }
            return 
        }
        var cannon = this.find("GOCannon" + player.viewid);
        if (!player.bSelf) {
            cannon.opCoin(resp.newFishIcon)
            return 
        } 
        cannon.willOpCoin(resp.newFishIcon);
        cannon.playGunNotice("alms",{leaveTime:resp.lectCount,allCount :resp.totalCount,propCount:resp.newFishIcon})
        
        if (this.find("EFAlminfo")) {this.find("EFAlminfo").removeFromScene()} 

    },
    //-----------------------------------------------------
    // 奖池
    //-----------------------------------------------------

    // 游戏内抽奖结果
    MSGS2CDrawResult: function(resp)
    {
        cc.log(resp);
        cc.log("wls.Switchs:"+wls.Switchs)
        if(!resp.isSuccess) return;
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        wls.connectPropTb(resp.props,resp.seniorProps)

        resp.viewid = player.viewid;
        var cannon = this.find("GOCannon" + player.viewid);
        if (!player.bSelf) 
        {
            //普通道具
            for (var index = 0; index < resp.props.length; index++) 
            {
                var flyData = {
                    viewid       : player.viewid,
                    propData     : resp.props[index],
                    firstPos     : cc.p(display.width/2, display.height/2),
                }
                this.find("EFItems").play(flyData);
            }
            cannon.playGunTipPic("Lottery")
            return;
        }

        // 奖池数据
        this.find("DABattle").initJackpot(resp.killRewardFishInDay, resp.drawRequireRewardFishCount, resp.rewardRate)
        this.find("UILotteryStart").refreshUIAfterLottery(resp);
        this.find("WNJackpotPanel").initView();
        if (this.find("UIJackpot")) {this.find("UIJackpot").updateView();} 
    },

    // 更新奖池
    MSGS2CDrawStatusChange: function(resp)
    {
        cc.log(resp);
        // 奖池数据
        this.find("DABattle").initJackpot(resp.killRewardFishInDay, resp.drawRequireRewardFishCount, resp.rewardRate)
        this.find("WNJackpotPanel").initView();
        if (this.find("UIJackpot")) {this.find("UIJackpot").updateView();} 
        //--todo 新手引导没加
    },

    //-----------------------------------------------------
    // 新手任务
    //-----------------------------------------------------

    // 获取新手任务信息
    MSGS2CGetNewTaskInfo: function(resp)
    {
        cc.log(resp);
        if (!FG.RoomConfig.ENABLE_TASK) {return 0}
        if (resp.isSuccess)
        {
            this.find("WNNewBieTask").resetTask(resp.nTaskID, resp.nTaskData);
        }
    },

    // 领取新手任务奖励
    MSGS2CGetNewTaskReward: function(resp)
    {
        cc.log(resp);
        if (!FG.RoomConfig.ENABLE_TASK) {return 0}
        var player = FG.GetPlayer(resp.playerID);
        if (!player) return;
        if (resp.isSuccess)
        {
            this.find("WNNewBieTask").getNextTask(resp, player);
        }
    },


    //-----------------------------------------------------
    // 技能逻辑
    //-----------------------------------------------------

    // 自己的冰冻
    MSGS2CFreezeResult: function(resp)
    {
        cc.log(resp);
        this.find("SKFreeze").icon.setTouchEnable(true)
        if (!resp.isSuccess) {
            this.dialog(2, wls.Config.getLanguage(800000321));
            this.find("UISkillPanel").doCost(3, FG.SelfViewID, resp.useType,false);
            return
        };

        this.find("SKFreeze").releaseSkill();
        this.find("SKFreeze").startCoolDown();
        this.find("UISkillPanel").hideSkillNoticeNode(3)
    },

    // 别人的冰冻
    MSGS2CFreezeStart: function(resp)
    {
        if (!this.find("SKFreeze")) { return }
        this.find("SKFreeze").releaseSkill();
    },

    // 结束冰冻技能
    MSGS2CFreezeEnd: function(resp)
    {
        if (!this.find("SKFreeze")) { return }
        this.find("SKFreeze").stopSkill()
    },

    // 自己锁定技能
    MSGS2CAimResult: function(resp)
    {
        cc.log(resp);
        this.find("SKLock").icon.setTouchEnable(true)
        if (!resp.isSuccess) {
            this.dialog(2, wls.Config.getLanguage(800000321));
            this.find("UISkillPanel").doCost(4, FG.SelfViewID, resp.useType,false);
            return
        };
        this.find("UISkillPanel").hideSkillNoticeNode(4)
        this.find("SKLock").releaseSkill(resp.skillPlus);
        this.find("SKLock").startCoolDown();
        
    },

    // 别人锁定技能
    MSGS2CAim: function(resp)
    {
        cc.log(resp);
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
    },

    // 锁定跟踪目标改变
    MSGS2CBulletTargetChange: function(resp)
    {
        cc.log(resp);
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
    },

    // 开启狂暴
    MSGS2CViolent: function(resp)
    {
        cc.log(resp);
        var player = FG.GetPlayer(resp.playerID);
        if (!player) return;
        if (!resp.isSuccess) {
            if (player.bSelf){
                this.dialog(2, wls.Config.getLanguage(800000321));
                this.find("UISkillPanel").doCost(17, FG.SelfViewID, resp.useType,false);
            }
            return
        };

        if (player.bSelf)
        {
            this.find("UISkillPanel").resetViolentRate(4);
            this.find("SKViolent").releaseSkill(100);
            this.find("SKViolent").startCoolDown();
            this.find("UISkillPanel").hideSkillNoticeNode(17)
        }
        var cannon = this.find("GOCannon" + player.viewid);
        cannon.playViolentAct(true);
    },

    // 狂暴结束
    MSGS2CViolentTimeOut: function(resp)
    {
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        if (player.bSelf)
        {
            this.find("SKViolent").stopSkill();
        }
        var cannon = this.find("GOCannon" + player.viewid);
        cannon.playViolentAct(false);
    },

    // 改变狂暴倍率
    MSGS2CSetViolentRatio: function(resp)
    {

    },

    // 召唤鱼
    MSGS2CCallFish: function(resp)
    {
        cc.log(resp);
        if (!resp.isSuccess)
        {
            if (resp.failType == 1) {
                this.dialog(2, wls.Config.getLanguage(800000317));
            } else if(resp.failType == 2) {
                this.dialog(2, wls.Config.getLanguage(800000109));
            }
            this.find("UISkillPanel").doCost(5, FG.SelfViewID, resp.useType,false);
            return;
        }
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        this.find("UISkillPanel").onUseSkill(5, player.viewid, resp.useType);
        this.find("SKSummon").releaseSkill(player.viewid, resp);
    },

    // 申请核弹结果
    MSGS2CNBomb: function(resp)
    {
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        if (!resp.isSuccess) {
            this.dialog(2, wls.Config.getLanguage(800000321));
            this.find("UISkillPanel").doCost(resp.nPropID, FG.SelfViewID, resp.useType,false);
            return
        };
        this.find("UISkillPanel").onUseSkill(resp.nPropID, player.viewid, resp.useType);
        this.find("SKBomb" + resp.nPropID).releaseSkill(player.viewid, resp);
    },

    // 核弹爆炸结果
    MSGS2CNBombBlast: function(resp)
    {
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        if (!resp.isSuccess)
        {
            this.dialog(2, wls.Config.getLanguage(800000321));
            return;
        }
        resp.dropSeniorProps = [];
        resp.killFishScore = resp.moneyChange
        resp.dropProps = [];
        this.MSGS2CPlayerHit(resp);
        
        if (resp.nPropID == 16 && player.bSelf) {
            // this.find("EFWindfall").play(resp.killFishScore);
            this.find("SCLayerMgr").pushEFLayewr("EFWindfall",resp)
        }
    },

    // 时光沙漏
    MSGS2CUseTimeHourglass: function(resp)
    {
        var player = FG.GetPlayer(resp.playerID);
        if (!resp.isSuccess)
        {
            this.dialog(2, wls.Config.getLanguage(800000321));
            this.find("UISkillPanel").doCost(14, FG.SelfViewID, resp.useType,false);
            return;
        }
        if (!player) return;

        this.find("UISkillPanel").onUseSkill(14, player.viewid, resp.useType);
        this.find("SKHourglass").releaseSkill(player.viewid, resp);
        
    },

    // 时光沙漏
    MSGS2CStopTimeHourglass: function(resp)
    {
        var player = FG.GetPlayer(resp.playerID);
        if ((!resp.isSuccess) ||!player) return;
        if (!player.bSelf) {
            if (resp.useType == 1) {
                var cannon = this.find("GOCannon" + player.viewid)
                cannon.setGem(resp.nFishIcon)
                cannon.stopTimeRevert()
            }
            return 
        }
        this.find("SKHourglass").stopSkill(resp);

    },

    //继续时光沙漏
    MSGS2CContinueTimeHourglass: function (resp) 
    {
        var player = FG.GetPlayer(resp.playerID);
        if (!player)return
        if (!resp.isSuccess) return;
        this.find("SKHourglass").continueSkill(player.viewid,resp.nFishIcon,resp.nTimeRemain);
    },

    //话费兑换
    MSGS2CReceivePhoneFare: function(resp) {
        this.toast(resp.errorString)
        if (!resp.success) { return }
        this.getScene().addProps([{"propId":12, "propCount":-5000}])
        this.find("UIPhoneChargesExc").removeFromScene()
    },

    //收到进入鱼券转盘的消息
    MSGS2CGetFishTicketDrawHistory: function(resp) {
        this.find("DAPlayer").setLeftLotteryTimes(resp.leftCount)
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

        var costInfo = wls.SplitArray(wls.Config.getConfig("990000116"))
        this.getScene().addProps([{propId:18,propCount:-Number(costInfo[1])}])
        this.find("DAPlayer").setLeftLotteryTimes(resp.leftCount)
        this.find("UIGiftDial").updatePanel()

        wls.connectPropTb(resp.props, resp.seniorProps);

        var cannon = this.find("GOCannon" + FG.SelfViewID);
        var propData = null
        for (var key = 0; key < resp.props.length; key++) {
            propData = resp.props[key]
            cannon.willOpProp(propData.propId,propData.propCount)
        }
        
        if (this.find("UIGiftDial")) {
            this.find("UIGiftDial").startRotateAct(rewardIndex, function(){
                if (propData == null) { return }
                var resultLayer = this.createGameObject("UIAwardResult")
                resultLayer.notify = function() { this.find("SCSend").sendShareSuccess(7) }.bind(this)
                resultLayer.onActive("UIGiftDial",FG.SelfViewID,resp.props,function() {
                }.bind(this), true)
            }.bind(this))
        }

    },


    //悬赏任务开始
    MSGS2CRewardTaskStart: function(resp) 
    {
        this.createGameObject("UIRewardTask", {"result":false, "data":resp})
    },

    //悬赏任务排名变化
    MSGS2CRewardTaskProgressChange: function(resp)
    {
        for (var key = 0; key < (resp.playerRank.length || 0); key++) {
            var playerId = resp.playerRank[key]
            var player = FG.GetPlayer(playerId)
            if (player) {
                var cannon = this.find("GOCannon"+player.viewid)
                cannon.isShowRewardRank(true, key+1)
            }
        }
    },

    //悬赏任务进度变化
    MSGS2CRewardTaskFishCountChange: function(resp)
    {
        this.find("UIRewardTask").refreshTaskPanel(null, resp.fishIds, resp.counts)
    },

    //悬赏任务结束
    MSGS2CRewardTaskComplete: function(resp) 
    {
        cc.log(resp)
        resp.props = (resp.props || [])
        resp.seniorProps = (resp.seniorProps || [])
        var isFinished = (resp.winnerPlayerId != 0)
        //隐藏排名
        for (var key = 0; key < resp.playerRank.length; key++) {
            var playerId = resp.playerRank[key]
            var player = FG.GetPlayer(playerId)
            if (player) {
                var cannon = this.find("GOCannon"+player.viewid)
                cannon.isShowRewardRank(false)

            }
        }

        if (!isFinished) { this.find("UIRewardTask").createUnfinished(); return; }

        var winPlayer = FG.GetPlayer(resp.winnerPlayerId)
        var cannon = this.find("GOCannon"+winPlayer.viewid)
        if (winPlayer == null || winPlayer == undefined) { return }
        this.find("UIRewardTask").createComplete(winPlayer, resp.giftId, function(){
            if (!winPlayer.bSelf) { return }
            //var itemSize = cc.size(112, 112)
            wls.connectPropTb(resp.props, resp.seniorProps);
            var shareInfoStr = wls.Config.get("rewardtaskgif", resp.giftId).share_reward

            //普通道具
            var resultLayer = this.createGameObject("UIAwardResult")
            resultLayer.notify = function() {
                this.find("SCSend").sendShareSuccess(8, resp.giftId)
            }.bind(this)
            resultLayer.onActive("",winPlayer.viewid,resp.props,function() {
                
            }.bind(this), true, parseInt(shareInfoStr) == 0 ? null : shareInfoStr)

        }.bind(this))

        //别的玩家直接加金币水晶
        if (!winPlayer.bSelf) {
            for (var key = 0; key < resp.props.length; key++) {
                cannon.opProp(resp.props[key].propId,resp.props[key].propCount);
            }
            return
        }
    },

    //领取vip每日奖励
    MSGS2CGetVipDailyReward: function(resp)
    {
        if (this.find("UIVipRight")) {
            this.find("UIVipRight").onGetVipDailyReward(resp)
        }
    },

    //使用限时炮台
    MSGS2CUsePropCannon: function (resp) {
        var player = FG.GetPlayer(resp.playerID);
        if (!player || !player.bSelf)return
        if (!resp.isSuccess) {
            this.dialog(1,"使用失败，请重试")
            if (this.find("UIChangeGun"))
            {
                this.find("UIChangeGun").updateAllItem();
            }
        }
        
        var cannon = this.find("GOCannon" + player.viewid);
        cannon.opProp(resp.propInfo.propId,resp.propInfo)

        var item = wls.Config.getItemData(resp.propInfo.propId)
        FG.SendMsg("sendNewGunType", item.use_outlook);

        if (this.find("UIChangeGun"))
        {
            this.find("UIChangeGun").updateAllItem();
        }
    },




    //-----------------------------------------------------
    // 鱼线
    //-----------------------------------------------------
    // 鱼潮来临提示
    MSGS2CFishGroupNotify: function(resp)
    {
        var self = this;
        function playHalf(){
            self.find("UIBackGround").changeBG();
        }
        function callback()
        {
            self.find("EFGroupComing").play(playHalf);
            self.find("SCGameLoop").beforeGroupCome();
        };
        this.find("UISkillPanel").setGroup(true);
        wls.CallAfter(this, 11, callback);
        self.find("UIBackGround").readyBG();
        this.toast(wls.Config.getLanguage(800000085));
    },

    // 鱼潮来临
    MSGS2CStartFishGroup: function(resp)
    {
        cc.log(resp);
        this.find("SCPool").setEnableResizeFishPool(false);
        this.find("SCGameLoop").beforeGroupCome();
        this.find("UISkillPanel").setGroup(false);
        this.find("SCGameLoop").addGroup(resp.index, 0);
    },

    // 鱼时间线
    MSGS2CStartTimeline: function(resp)
    {
        this.find("SCPool").setEnableResizeFishPool(true);
        this.find("SCGameLoop").beforeGroupCome();
        this.find("SCGameLoop").addTimeline(resp.index, 0, false);
        this.find("SCGameLoop").addTimeline(resp.index, 0, true);
    },

    MSGS2CCommonShare: function(resp)
    {
        if (resp.errorCode != 0) { return }
        var player = FG.GetPlayer(resp.playerId);
        if (!player.bSelf) {
            //处理别人加道具
            for (var key = 0; key < resp.rewards.length; key++) {
                this.find("EFItems").updatePropCount(3, player.viewid, resp.rewards[key])
            }
            return
        }
        var props = resp.rewards
        var itemWidth = 120
        var totalNum = props.length
        for (var key = 0; key < totalNum; key++) 
        {
            var prop = props[key];
            var propId = prop.propId;
            //var pos = cc.p(display.width/2-((totalNum*itemWidth)/2+itemWidth/2+key*itemWidth), display.height/2)
            var pos = cc.p(display.width/2+(key*itemWidth+itemWidth/2)-(itemWidth*totalNum)/2, display.height/2)
            var flyData = {
                viewid  : player.viewid,
                propData: prop,
                firstPos: pos,
                maxScale: 1,
                isJump  : false,
                zorder  : wls.ZOrder.Box+2
            }
            this.find("EFItems").play(flyData);
        }
        this.find("DAPlayer").setShareInfos(resp.newShareInfo)
        if (resp.shareType == 19 && this.find("UIHallMaster")) {
            this.find("UIHallMaster").updateView()
        }
    },

    //获取大师赛状态
    MSGS2CGetMasterStatus: function(resp) {
        this.waiting(false,"GetMasterStatus")
        this.find("DAMaster").setMasterStatus(resp)
        if (this.find("UIHallMaster")) {
            this.find("UIHallMaster").updateView()
        }
        if (this.find("UIMasterBar")) {
            this.find("UIMasterBar").awardData = null
            this.find("UIMasterBar").updateView()
        }
    },

    //大师赛结算
    MSGS2CMasterResult: function (resp) {
        cc.log("---------------MSGS2CMasterResult--------0-----")
        this.getScene().gameOver(resp)
    },

    //加入大师赛
    MSGS2CJoinMasterGame: function(resp) {
        cc.log("---------------MSGS2CJoinMasterGame---------game----")
        if (this.find("DAMaster")) {
            this.find("DAMaster").JoinMasterGame(resp)
        }
    },
    //大师赛排行
    MSGS2CMasterGetRanking: function (resp) {
        cc.log("---------------MSGS2CMasterGetRanking-------------")
        if (this.find("DAMaster")) {
            this.find("DAMaster").showRank(resp)
        }
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
        cc.log("---------------MSGS2CHaveFinishTask-------------")
        var data =  wls.Config.getTaskDataById(resp.nTaskID)
        if (data.show_type == 2) {
            this.find("SCSend").sendGetTaskReward(resp.nTaskID)
        }
    },
    //免费赛初始化
    MSGS2CArenaReady: function(resp) {
        wls.GameState = 2
        wls.roomData = wls.Config.get("room", wls.RoomIdx + 910000000);
        wls.serverTimeDis = resp.serverTime - wls.GetCurTimeFrame()

        FG.bGameStatus = true;
        FG.MaxCoin = resp.maxInGameFishIcon;
        wls.Switchs = resp.switchs;
        FG.BeansToFishIconRate = resp.beansToFishIconRate;
        this.find("DAPlayer").setShareInfos(resp.shareInfo)
        this.find("DAPlayer").setShareSwitchs(resp.shareSwitchs)

        this.find("UIArenaBulletCount").updateBulletNum(resp.initBulletCount || 300)
        this.find("SCSend").startHeartBeat();
        this.find("SCPool").setKilledFishes(resp.killedFishes)
        this.find("UIArenaTitle").setVisible(false)
        this.find("UIArenaTitle").setTitlePicById(resp.arenaType)
        this.getScene().setMatchId(resp.arenaType)
        var players = resp.playerInfo;
        // 初始化座位表
        for(var i = 0; i < players.length; i++)
        {
            if (players[i].playerId == resp.playerId)
            {
                this.initChairMap(players[i].chairId);
                break;
            }
        }
        // 玩家加入
        for(var i = 0; i < players.length; i++)
        {
            this.MSGS2CArenaPlayerJoin(players[i]);
        }
        // 鱼线
        FG.ClientFrame = resp.frameId;
        if (resp.started) {
            this.MSGS2CArenaGameStart({timeline:resp.timelineIndex, leftSecond:resp.leftSecond, frameId:resp.frameId})
        } else {
            this.createGameObject("EFReadyGo").play(function(){

            }.bind(this))
        }

        //显示玩家召唤的鱼
        for(var i = 0; i < resp.calledFishes.length; i++){
            var calledFish = resp.calledFishes[i];
            var args = {};
            args.frameId = resp.frameId - calledFish.frameId;
            args.pathId = calledFish.pathId.toString();
            args.fishId = calledFish.fishTypeId.toString();
            args.timelineId = -calledFish.playerId;
            args.callFishId = calledFish.callFishId;
            var fish = this.find("SCGameLoop").addSummonFish(args);
        }

        this.MSGS2CArenaRank({players:resp.rankPlayers})

        //更新初始子弹个数
        this.find("UIArenaBulletCount").updateView(FG.GetSelfPlayer().viewid, this.find('GOCannon' + FG.GetSelfPlayer().viewid).getCount())
        
        this.getScene().initViewAfterReady()
        
        this.gotoNextState();
        
    },

    //充值成功刷新
    MSGS2CArenaRechargeSuccess: function(resp) {
        var player = FG.GetPlayer(resp.playerInfo.playerId);
        if (!player) return;
        if (player.bSelf)
        {
            this.find("DAPlayer").setBuyHistory(resp.buyHistory)
            this.find("DAPlayer").setTodayBuy(resp.todayBuy)
        }
        this.MSGS2CArenaFreePlayerInfo(resp.playerInfo)
        this.getScene().initViewAfterReady()
    },

    MSGS2CArenaFreePlayerInfo: function(resp) {
        if (resp.playerInfo) resp = resp.playerInfo
        resp.fishIcon = 1
        resp.gradeExp = 1
        resp.currentGunRate = resp.gunRate
        resp.thunderRate = 1
        resp.nBombRate = 1
        resp.leftMasterBullets = resp.bulletCount
        resp.masterScore = resp.score || 0
        this.MSGS2CPlayerJion(resp)
    },

    MSGS2CArenaFreeHit: function(resp) {

        this.MSGS2CPlayerHit(resp)
    },

    
   //悬赏任务开始
   MSGS2CStartMasterRewardTask: function(resp) 
   {
        resp.isScoreAward = true
        this.createGameObject("UIRewardTask", {"result":false, "data":resp})
   },

   //悬赏任务进度变化
   MSGS2CMasterRewardTaskUpdate: function(resp)
   {
       if (this.find("UIRewardTask")) {
            this.find("UIRewardTask").refreshTaskPanel(null, resp.fishIds, resp.counts)
       }
   },

   //悬赏任务结束
   MSGS2CMasterRewardTaskComplete: function(resp) 
   {
        var winPlayer = FG.GetPlayer(resp.playerId)
        if (winPlayer == null || winPlayer == undefined) { return }
        var cannon = this.find("GOCannon"+winPlayer.viewid)
        if (cannon == null || cannon == undefined) { return }
        this.find("UIMainPanel").setTitleIsShow(true)
        var score = (resp.addScore ||0)
        if (!resp.isSuccess) {
            if (winPlayer.bSelf) {
                if (this.find("UIRewardTask")) {
                    this.find("UIRewardTask").createUnfinished(); 
                }
            }
            return; 
        }

       //玩家直接加积分
        cannon.opScore(score);
        this.toast("恭喜获得悬赏奖励，积分:"+score)
        this.find("UIRewardTask").removeFromScene()
        
   },

   MSGS2CGetFreeFishCoinReward: function(resp) 
   {
        cc.log(resp)
        // if (resp.errorCode != 0) { return }

        resp.freeFishCoinInfo = resp.freeFishCoinInfo || {};

        resp.props = (resp.props || {})
        resp.seniorProps = (resp.seniorProps || {})
        wls.connectPropTb(resp.props, resp.seniorProps)
        //处理别人的道具增加
        var player = FG.GetPlayer(resp.playerID);
        if (!player) { return }
        if (!player.bSelf) {
            wls.connectPropTb(resp.props, resp.shareProps)
            wls.connectPropTb(resp.props, resp.vipProps)
            for (var key = 0; key < resp.props.length; key++) {
                this.find("EFItems").updatePropCount(3, player.viewid, resp.props[key])
            }
            return 
        }

        //重置鱼币领取信息
        if (resp.errorCode == 0) {
            this.find("DAPlayer").resetFreeFishCoinInfo(resp);
        }

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
                this.find("UIWechatShare").playShareReward(resp.props,player.viewid)
                this.find("UIWechatShare").updatePanel()
                this.find("UIWechatShare").removeFromScene()
            }
        }
   },
   
    //8人免费赛比赛结束
    MSGS2CArenaGameComplete: function(resp) {
        cc.log("---------------MSGS2CArenaGameComplete--------0-----")
        this.getScene().gameOver(resp)
    },

    //8人赛排行变化
    MSGS2CArenaRank: function(resp) {
        if (this.find("UIArenaRank")) {
            this.find("UIArenaRank").updateView(resp.players)
        }
    },

    MSGS2CArenaFreeShoot: function(resp) {
        this.MSGS2CPlayerShoot(resp)
    },

    MSGS2CArenaGunRateChange: function(resp) {
        if (!FG.RoomConfig.ENABLE_GUNRATE) {
            if (resp.playerId == FG.GetSelfPlayer().playerId) {this.createGameObject("EFGunRateUp")}
        }
        this.MSGS2CGunRateChange(resp)
    },

    MSGS2CArenaPlayerJoin: function(resp) {
        if (resp.playerInfo) resp = resp.playerInfo
        resp.fishIcon = 1
        resp.gradeExp = 1
        resp.currentGunRate = resp.gunRate
        resp.thunderRate = 1
        resp.nBombRate = 1
        resp.leftMasterBullets = resp.bulletCount
        resp.masterScore = resp.score || 0
        this.MSGS2CPlayerJion(resp)
    },

    MSGS2CArenaGameStart: function(resp) {
        this.find("SCGameLoop").addTimeline(resp.timeline, resp.frameId || 0, false);
        this.find("SCGameLoop").addTimeline(resp.timeline, resp.frameId || 0, true);
        
        //倒计时
        this.find("UIArenaTitle").setVisible(true)
        this.find("UIArenaTitle").startTime( wls.GetCurTimeFrame() + (resp.leftSecond || 0)+wls.serverTimeDis)
        this.find("SCGameLoop").startUpdate();

    },

    MSGS2CArenaLimitTimeGameStart: function(resp) {
        var player = FG.GetPlayer(resp.playerInfo.playerId);
        if (!player) return;
        if (! player.bSelf) {
            this.MSGS2CArenaFreePlayerInfo(resp.playerInfo);
            return 
        }

        this.waiting(false,"waitAgainGame")
        //倒计时
        this.find("UIArenaTitle").setVisible(true)
        this.find("UIArenaTitle").startTime( wls.GetCurTimeFrame() + (resp.leftSecond || 0)+wls.serverTimeDis)

        if (this.find("UIMasterResult")) {
            this.find("UIMasterResult").removeFromScene()
        }
        this.MSGS2CArenaFreePlayerInfo(resp.playerInfo);
        this.getScene().initViewAfterReady()
    },
    MSGS2CArenaSignUp: function(resp) {
        cc.log("------game-------MSGS2CArenaSignUp----------")
        this.waiting(false,"SignUpFreeMatch")
        if (resp.errorCode != 0) { 
            this.dialog(1, "报名错误，请重新登录。", function(){
                this.getScene().leaveRoom()
            }.bind(this))
            return
        }
        this.waiting(true,"waitAgainGame")
    },

    //获取奖金池当前额度
    MSGS2CGetBonusPool: function(resp) {
        if (this.find("DALottery")) {
            this.find("DALottery").setPoolNum(resp.money)
        }
        if (this.find("WNBonusPool")) {
            this.find("WNBonusPool").setPoolNum(resp.money)
        }
        if (this.find("UIBonusPoolDes")) {
            this.find("UIBonusPoolDes").setPoolNum(resp.money)
        }

    },

    //获取奖金池记录
    MSGS2CBonusPoolReward: function(resp) {
        if (this.find("DALottery")) {
            this.find("DALottery").pushPoolReward(resp)
        }
        var player = FG.GetPlayer(resp.playerId);
        if (!player) return;
        var cannon = this.find("GOCannon"+player.viewid)
        cannon.willOpProp(1,resp.money)
        if (! player.bSelf) {
            this.find("EFCoins").playFishDropOut(cc.p(display.width/2,display.height/2), 12, player.viewid, resp.money);
            return 
        }
        this.find("SCLayerMgr").pushEFLayewr("EFBonuswin",resp)
    },
});