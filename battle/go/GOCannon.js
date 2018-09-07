// 炮台
wls.namespace.GOCannon = cc.Node.extend
({
    onCreate: function(viewid)
    {
        this._defaultGunIdx = 1;
        this.viewid = viewid;
        var ccnode = wls.LoadStudioNode(this.fullPath("battle/cannon/uicannon.json"), this);
        this.addChild(ccnode);
        this.initGuns();
        this.node_violent_1.action = this.getActionManager().getActionByTag(this.node_violent_1.getTag(), this.node_violent_1);
        this.node_violent_2.action = this.getActionManager().getActionByTag(this.node_violent_2.getTag(), this.node_violent_2);
        this.initWithViewID(viewid);
        this.reset();
        this.cannonWorldPos = this.node_gun_1.convertToWorldSpaceAR(cc.p(0, 0))
        this.setVisible(false);
        this.panel_1.setTouchEnabled(true)
        wls.OnClicked(this.panel_1, this);
        this.config = wls.Config.get("cannonoutlook", 930000001);

        //悬赏相关
        this.img_reward_rank.setVisible(false)
        this.img_getbox_title.setVisible(false)
    },

    // 初始化炮台
    initGuns: function()
    {
        wls.BindUI(this.node_gun_1, this.node_gun_1);
        wls.BindUI(this.node_gun_2, this.node_gun_2);
        wls.BindUI(this.node_gun_3, this.node_gun_3);
    },

    initWithViewID: function(viewid)
    {
        this.setPosition(FG.CannonPosList[viewid - 1]);
        if (viewid == 2)
        {
            this.spr_coin_bg.setPositionX(-this.spr_coin_bg.getPositionX())
            this.Node_fnt_curadd.setPositionX(-this.Node_fnt_curadd.getPositionX())
            this.node_buff.setPositionX(-this.node_buff.getPositionX())
        }
        else if (viewid == 3)
        {
            this.setRotation(180)
            this.spr_coin_bg.setRotation(180)
            this.spr_bankrupt.setRotation(180)
        }
        else if (viewid == 4)
        {
            this.setRotation(180)
            this.spr_coin_bg.setRotation(180)
            this.spr_bankrupt.setRotation(180)
            this.spr_coin_bg.setPositionX(-this.spr_coin_bg.getPositionX())
            this.Node_fnt_curadd.setPositionX(-this.Node_fnt_curadd.getPositionX())
            this.node_buff.setPositionX(-this.node_buff.getPositionX())
        }
    },

    reset: function()
    {
        this.playerid = 0;
        this.errorCode = "";
        this.props = {};
        this.mWillOpGemList = [];
        this.mWillOpCoinList = [];
        this.mWillOpCountList = [];
        this.mWillOpScoreList = [];
        this.playerInfo = {}
        this.is_self = false
        this.maxGunRate = 0;
        this.gunType = 1;
        this.spr_gun_lock.setVisible(false)
        this.spr_bankrupt.setVisible(false)
        this.spr_light.setVisible(false)
        this.node_gun_2.setVisible(false)
        this.node_gun_3.setVisible(false)
        this.node_gun_1.spr_gunfire.setVisible(false)
        this.node_gun_2.spr_gunfire.setVisible(false)
        this.node_gun_3.spr_gunfire.setVisible(false)
        this.btn_minus.setVisible(false)
        this.btn_add.setVisible(false)
        this.spr_circle.setVisible(false)
        this.spr_circle.stopAllActions()
        this.TimeRevertCount = 0
        this.node_violent.setVisible(false)
        this.fnt_coins.cur = 0
        this.fnt_diamonds.cur = 0
        this.fnt_multiple.cur = 0
        this.pointAngle = 0;
        this.updateAngle(90)
        this.stopTimeRevert()
        this.node_violent_1.action.gotoFrameAndPause(0);
        this.node_violent_2.action.gotoFrameAndPause(0);
        this.vipLevel = 0;
        this.isManual = false;
    },

    onEventPlayerLeave: function(viewid)
    {
        if (this.viewid == viewid)
        {
            this.leave();
        }
    },

    updateAngleByPos: function(pos, gunIdx)
    {
        this.updateAngle(wls.Atan2(pos.y - this.cannonWorldPos.y, pos.x - this.cannonWorldPos.x), gunIdx);
    },

    updateAngle: function(angle, gunIdx)
    {
        gunIdx = gunIdx || this._defaultGunIdx;
        angle = parseInt(angle);
        if (this.is_self)
        {
            if (angle >= -90 && angle < 0)
            {
                angle = 0;
            }
            else if(-90 >= angle && angle >= -180)
            {
                angle = 180;
            }
        }
        this.pointAngle = angle;
        this["node_gun_" + gunIdx].setRotation(-angle + 90)
    },

    // 发射子弹 (错误码：1 子弹数达到上限, 2 炮倍未解锁, 3 金钱不够, 4子弹不够)
    laucherBullet: function(rate)
    {
        var go = this.find("DABattle");
        var errorCode = this.getScene().laucherBullet(this,rate)
        this.errorCode = errorCode
        if (errorCode == 0) {
            go.modifyBulletCnt(FG.SelfViewID, 1);
            return this.fire();
        }
        return
    },

    // 开火，创建子弹
    fire: function(fish, bViolent, gunIdx)
    {
        gunIdx = gunIdx || this._defaultGunIdx;
        var node = this["node_gun_" + gunIdx];
        node.setVisible(true)
        this.playFireAni();
        var pos = node.Node_launcher.convertToWorldSpace(cc.p(0, 0))
        var angle = -node.rotation;
        if (this.viewid > 2)
        {
            angle = 180 + angle;
        }
        var radian = wls.DegreeToRadian(angle);
        var bullet = this.find("SCPool").createBullet(1);
        bullet.laucher(pos, -Math.sin(radian), Math.cos(radian))
        this.find("SCGameLoop").addBullet(bullet)
        bullet.viewid = this.viewid;
        bullet.id = this.find("DABattle").createBulletID();
        bullet.updateView(this.config);
        if (fish)
        {
            bullet.follow(fish, bViolent);
        }
        return bullet
    },

    // 初始化炮台fnt显示
    initFntShow: function()
    {
        this.fnt_coins.setVisible(false)
        this.fnt_diamonds.setVisible(false)
        this.fnt_score.setVisible(false)
        this.fnt_count.setVisible(false)
        //wls.RoomIdx = 7
        //判断大师场
        if (wls.RoomIdx == 8) {
            this.fnt_coins.setVisible(this.is_self)
            this.fnt_diamonds.setVisible(this.is_self)
            this.fnt_count.setVisible(!this.is_self)
            this.fnt_score.setVisible(!this.is_self)
        } else if (wls.RoomIdx == 6 || wls.RoomIdx == 7){
            this.fnt_score.setVisible(true)
            this.fnt_diamonds.setVisible(this.is_self)
            this.fnt_count.setVisible(!this.is_self)
        } else {
            this.fnt_coins.setVisible(true)
            this.fnt_diamonds.setVisible(true)
        }
        
        if (this.fnt_coins.isVisible()) {
            this.spr_coins.setSpriteFrame(this.fullPath("common/images/com_icon_coins.png"))
            this.spr_coins.setScale(1)
        }
        if (this.fnt_diamonds.isVisible()) {
            this.spr_diamonds.setSpriteFrame(this.fullPath("common/images/com_icon_diamonds.png"))
            this.spr_diamonds.setScale(1)
        }
        if (this.fnt_score.isVisible()) {
            this.spr_coins.setSpriteFrame(this.fullPath("battle/images/compic/com_amount.png"))
            this.spr_coins.setScale(0.4)
        }
        if (this.fnt_count.isVisible()) {
            this.spr_diamonds.setSpriteFrame(this.fullPath("battle/images/compic/com_bullet.png"))
            this.spr_diamonds.setScale(0.4)
        }


    },

    join: function(id)
    {
        this.playerid = id;
        this.is_self = this.viewid == FG.SelfViewID;
        this.setVisible(true);
        if (this.is_self)
        {
            this.spr_circle.setVisible(true)
            this.spr_circle.runAction(cc.repeatForever(cc.rotateBy(5.0, 360)));
            this.btn_minus.setVisible(FG.RoomConfig.ENABLE_GUNRATE)
            this.btn_add.setVisible(FG.RoomConfig.ENABLE_GUNRATE)
        }
        this.initFntShow()
    },

    leave: function()
    {
        this.setVisible(false);
        this.reset();
    },

    updateGun: function(type)
    {
        this.playerInfo.gunType = type
        this.gunType = type;
        var c =  wls.Config.calcCannonConfig(type, this.maxGunRate);
        this.config = c ? c : this.config;
        var f = this.fullPath("battle/cannon/"+ c.cannon_img);
        this.node_gun_1.spr_cannon.setSpriteFrame(f);
        this.node_gun_2.spr_cannon.setSpriteFrame(f);
        this.node_gun_3.spr_cannon.setSpriteFrame(f);
    },

    getGunType: function(type)
    {
        return this.gunType;
    },

    //-----------------------------------------------------
    // 数据处理
    //-----------------------------------------------------

    // 获得玩家数据
    getPlayer: function()
    {
        return this.playerInfo
    },

    // 更新玩家数据
    initPlayerInfo: function(data)
    {
        for (var key in data) {
            var element = data[key];
            this.updateDataByKey(key,element)
        }
    },

    // 更新玩家数据
    updateDataByKey: function(key, val)
    {
        this.playerInfo[key] = val
    },
    // 更新玩家数据
    getDataByKey: function(key)
    {
        return this.playerInfo[key]
    },

    // 高级道具
    initSeniorProps: function(props)
    {
        this.seniorProps = {};
        for(var i = 0; i < props.length; i++)
        {
            if (this.seniorProps[props[i].propId] == null) {
                this.seniorProps[props[i].propId] = {}
            }
            this.seniorProps[props[i].propId][props[i].propItemId] = props[i];
        }
        cc.log(this.seniorProps);
    },

    //获取分享奖励
    getShareConfig: function() {
        var config = wls.Config.get("cannon", this.maxGunRate)
        return config.share_reward
    },

    getAllSeniorProps: function()
    {
        return this.seniorProps;
    },

    getSeniorProp: function(id)
    {
        return this.seniorProps[id];
    },
    getSeniorPropById: function(id,itemId)
    {
        if (this.seniorProps[id] == null) {return null }
        return this.seniorProps[id][itemId];
    },
    opSeniorProp: function(seniorData,isAdd)
    {
        if (this.seniorProps[seniorData.propId] == null) {
            this.seniorProps[seniorData.propId] = {}
        }
        if (isAdd) {
            this.seniorProps[seniorData.propId][seniorData.propItemId] = seniorData;
            if (this.is_self) {
                this.getScene().addProps([seniorData])
            }
        } else {
            this.seniorProps[seniorData.propId][seniorData.propItemId] = null;
        }
    },

    // 普通首具
    initProps: function(propList)
    {
        this.props = {};
        for(var i = 0; i < propList.length; i++)
        {
            this.props[(propList[i].propId)] = propList[i].propCount;
        }
    },

    getProp: function(id)
    {
        if (id == 1) {
            this.getCoin()
            return 
        } else if (id == 2) {
            this.getGem()
            return
        }
        return this.props[id] || 0;
    },

    opProp: function(id, val)
    {
        if (id == 1) {
            this.opCoin(val)
            return 
        } else if (id == 2) {
            this.opGem(val)
            return
        }
        if (val.propItemId != null) {
            if (this.is_self) {
                this.getScene().addProps([val])
            }
            return 
        }
        var cur = this.props[id] || 0;
        cur += val;
        this.props[id] = cur;
        if (this.is_self) {
            this.find("UISkillPanel").updateAllIcon()
            this.getScene().addProps([{propId:id,propCount:val}])
        }
    },

    willOpProp: function(id,val)
    {
        if (id == 1) {
            this.willOpCoin(val)
            return 
        } else if (id == 2) {
            this.willOpGem(val)
            return
        }
    },

    doOpProp: function(propId,propCount,propData)
    {
        if (propId == 1) {
            this.doOpCoin(propCount)
            return 
        } else if (propId == 2) {
            this.doOpGem(propCount)
            return
        } else if (propData) {
            this.opSeniorProp(propData,propData.propCount > 0)
        } else {
            this.opProp(propId,propCount)
        }
    },

    setCoin: function(val)
    {
        this.mWillOpCoinList = [];
        this.fnt_coins.cur = val;
        this.fnt_coins.setString(val);
        if (val > 0) { this.setBankrupt(false) }
    },

    getCoin: function()
    {
        return this.fnt_coins.cur;
    },

    opCoin: function(val)
    {
        this.fnt_coins.cur += val;
        this.fnt_coins.setString(this.fnt_coins.cur);
        if (val > 0) {
            var action = cc.Sequence.create(cc.ScaleTo.create(0.1,1.7),cc.ScaleTo.create(0.3,1))
            this.fnt_coins.stopAllActions()
            this.fnt_coins.runAction(action);
            this.setBankrupt(false)
        }
    },

    willOpCoin: function(val)
    {
        this.mWillOpCoinList.push(val);
    },

    doOpCoin: function(val)
    {
        if (wls.HasValueAndRemove(this.mWillOpCoinList, val))
        {
            this.opCoin(val);
            this.playAddCoinAni(val);
        }
    },

    setGem: function(val)
    {
        this.mWillOpGemList =[];
        this.fnt_diamonds.cur = val;
        this.fnt_diamonds.setString(val);
        if(this.is_self)
        {
            this.find('WNGunUpgrade').onEventMofiyGem(this.fnt_diamonds.getString());
        }
    },

    getGem: function()
    {
        return this.fnt_diamonds.cur;
    },

    opGem: function(val)
    {
        this.fnt_diamonds.cur += val;
        this.fnt_diamonds.setString(this.fnt_diamonds.cur);
        if (val > 0) 
        {
            var action = cc.Sequence.create(cc.ScaleTo.create(0.1,1.7),cc.ScaleTo.create(0.3,1))
            this.fnt_diamonds.stopAllActions()
            this.fnt_diamonds.runAction(action);
        }
        if(this.is_self)
        {
            this.find('WNGunUpgrade').onEventMofiyGem(this.fnt_diamonds.getString());
        }
    },
    
    willOpGem: function(val)
    {
        this.mWillOpGemList.push(val);
    },

    doOpGem: function(val)
    {
        if (wls.HasValueAndRemove(this.mWillOpGemList, val))
        {
            this.opGem(val);
        }
    },

    //-------------子弹个数----------------------------
    setCount: function(val)
    {
        if (wls.CostType ==0) {return }
        this.mWillOpCountList = [];
        this.fnt_count.cur = val;
        this.fnt_count.setString(val);
        if (!this.is_self) { return }
        this.find("DAPlayer").leftMasterBullets = this.fnt_count.cur
        if (this.find("UIMasterBar")) {
            this.find("UIMasterBar").updateView()
        }
        if (this.find("UIArenaBulletCount")) {
            this.find("UIArenaBulletCount").updateView(this.viewid, this.fnt_count.cur)
        }
    },
    getCount: function()
    {
        return this.fnt_count.cur;
    },
    opCount: function(val)
    {
        if (wls.CostType == 0) {return }
        this.fnt_count.cur += val;
        this.fnt_count.setString(this.fnt_count.cur);
        if (val > 0) {
            var action = cc.Sequence.create(cc.ScaleTo.create(0.1,1.7),cc.ScaleTo.create(0.3,1))
            this.fnt_count.stopAllActions()
            this.fnt_count.runAction(action);
        }
        if (!this.is_self) { return }
        this.find("DAPlayer").leftMasterBullets = this.fnt_count.cur
        if (this.find("UIMasterBar")) {
            this.find("UIMasterBar").updateView()
        }
        if (this.find("UIArenaBulletCount")) {
            this.find("UIArenaBulletCount").updateView(this.viewid, this.fnt_count.cur)
        }
    },
    willopCount: function(val)
    {
        if (wls.CostType == 0) {return }
        this.mWillOpCountList.push(val);
    },
    doOpCount: function(val)
    {
        if (wls.CostType == 0) {return }
        if (wls.HasValueAndRemove(this.mWillOpCountList, val))
        {
            this.opCount(val);
        }
    },
    //-------------积分----------------------------
    setScore: function(val)
    {
        this.mWillOpScoreList = [];
        this.fnt_score.cur = val;
        this.fnt_score.setString(val);
        if (!this.is_self) { return }
        this.find("DAPlayer").masterScore = this.fnt_score.cur
        if (this.find("UIMasterBar")) {
            this.find("UIMasterBar").updateView()
        }
    },
    getScore: function()
    {
        return this.fnt_score.cur;
    },
    opScore: function(val)
    {
        this.fnt_score.cur += val;
        this.fnt_score.setString(this.fnt_score.cur);
        if (val > 0) {
            var action = cc.Sequence.create(cc.ScaleTo.create(0.1,1.7),cc.ScaleTo.create(0.3,1))
            this.fnt_score.stopAllActions()
            this.fnt_score.runAction(action);
        }
        if (!this.is_self) { return }
        this.find("DAPlayer").masterScore = this.fnt_score.cur
        if (this.find("UIMasterBar")) {
            this.find("UIMasterBar").updateView()
        }
    },
    willOpScore: function(val)
    {
        this.mWillOpScoreList.push(val);
    },
    doOpScore: function(val)
    {
        if (wls.HasValueAndRemove(this.mWillOpScoreList, val))
        {
            this.opScore(val);
            if (!this.fnt_coins.isVisible()) {
                this.playAddCoinAni(val);
            }
            
        }
    },
    //-----------------------------------------


    // 设置炮倍
    setGunRate: function(val)
    {
        this.fnt_multiple.cur = val;
        this.fnt_multiple.setString(val);
        this.spr_gun_lock.setVisible(this.is_self && val > this.maxGunRate);
        this.playerInfo.currentGunRate = val
    },

    // 获得炮倍
    getGunRate: function()
    {
        return this.fnt_multiple.cur;
    },

    getMaxGunRate: function()
    {
        return this.maxGunRate;
    },

    setMaxGunRate: function(val)
    {
       this.maxGunRate = val; 
       this.playerInfo.maxGunRate = val
       if (this.is_self) {
           this.find("DAPlayer").setMaxGunRate(val)
       }
    },

    setVipLevel: function(lv)
    {
        this.vipLevel = lv;
    },

    getVipLevel: function()
    {
        return this.vipLevel;
    },
    setLevel: function(lv)
    {
        this.level = lv;
        if (this.is_self) {
            this.find("DAPlayer").setLevel(lv)
        }
    },

    getLevel: function()
    {
        return this.level;
    },
    //-----------------------------------------------------
    // 事件处理
    //-----------------------------------------------------
    click_panel_1: function()
    {
        if (this.is_self)
        {
            if (this.find("WNEmojiPanel").isVisible())
            {
                this.find("WNEmojiPanel").close();
                return;
            }
            this.find("WNSelfCannonMenu").trigger();
        }
        else
        {
            var player = FG.GetPlayerByViewID(this.viewid);
            if(!player) return ;
            this.find("WNPlayerInfoPanel").open(this.viewid);
        }
    },

    click_btn_minus: function()
    {
        this.doChangeGunRate(false);
    },

    click_btn_add: function()
    {
        this.doChangeGunRate(true);
    },

    doChangeGunRate: function(bNext)
    {
        var rate = this.getScene().doChangeGunRate(bNext,this.getMaxGunRate(),this.getGunRate());
        if ((!rate) || rate == 0) { return }
        this.requestNewGunRate(rate);
    },

    requestNewGunRate: function(rate)
    {
        if (rate < 0) {return }
        this.btn_minus.setTouchEnabled(false);
        this.btn_add.setTouchEnabled(false);
        FG.SendMsg("sendNewGunRate", rate);
    },

    //-----------------------------------------------------
    // 特效表现
    //-----------------------------------------------------
    // 播放狂暴效果
    playViolentAct: function(bShow)
    {
        this.node_violent.setVisible(bShow);
        if (bShow)
        {
            this.node_violent_1.action.gotoFrameAndPlay(0, false);
            wls.CallAfter(this.node_violent, 55 /60, function(){
                this.node_violent_2.action.gotoFrameAndPlay(0, true);
                this.node_violent_2.setVisible(true);
            }.bind(this));
            this.node_violent_2.action.gotoFrameAndPause(0);
            this.node_violent_2.setVisible(false);
        }
        else
        {
            this.node_violent_1.action.gotoFrameAndPause(0);
            this.node_violent_2.action.gotoFrameAndPause(0);
        }
    },

    // 炮倍改变特效
    playGunRateChangeAni: function(gunIdx)
    {
        gunIdx = gunIdx || this._defaultGunIdx;
        var node = this["node_gun_" + gunIdx];
        var self = this;
        self.spr_light.stopAllActions()
        self.spr_light.setOpacity(0)
        self.spr_light.setScale(1)
        var act1 = cc.sequence(cc.show(), cc.fadeTo(0.04, 255), cc.scaleTo(0.08, 1.5), cc.fadeTo(0.04, 0), cc.hide());
        self.spr_light.runAction(act1)
        node.stopAllActions()
        node.setOpacity(255)
        node.setScale(1)
        var act2 = cc.sequence(cc.scaleTo(0.04, 0.5), cc.scaleTo(0.08, 1));
        node.runAction(act2)
        if (!this.is_self) {return }
		this.find('SCSound').playEffect("gunswitch_01.mp3", false);
    },

    // 炮开火动画
    playFireAni: function(gunIdx)
    {
        gunIdx = gunIdx || this._defaultGunIdx;
        var node = this["node_gun_" + gunIdx];
        if (this.is_self)
        {
            this.find('SCSound').playEffect("gunfire_01.mp3", false, true);
        }
        node.spr_cannon.stopAllActions();
        var act = new cc.Sequence(cc.scaleTo(0.04, 1, 0.9), cc.scaleTo(0.02, 1, 1));
        node.spr_cannon.runAction(act);
        node.spr_gunfire.stopAllActions();
        if (!node.gunFireAction)
        {
            var filename = this.fullPath("battle/cannon/gunfire_1");
            var animation = FG.CreateAnimation(filename, 1 / 24.0);
            node.gunFireAction = new cc.Sequence(cc.show(), cc.Animate.create(animation), cc.hide());
            FG.RetainAction(node.gunFireAction);
        }
        node.spr_gunfire.runAction(node.gunFireAction);
    },

    // 播放金币增加动画
    playAddCoinAni: function(val)
    {
        if (val <= 0) return;
        this.find("EFLabels").playCannonTips(this.viewid, val);
    },

    getCentrePos: function()
    {
        return cc.p(this.getPositionX(),this.getPositionY() + 30)
    },

    //炮台获得道具文字
    playAwardTip: function(propId,propCount)
    {
        if (propId == 2004 || propId == 2005) { return }
        var tipNode = cc.Node.create()
        this.addChild(tipNode)
        var tipBg = ccui.ImageView.create()
        tipBg.loadTexture(this.fullPath("common/images/layerbg/com_tips_bg.png"), 1)
        tipBg.setScale9Enabled(true);
        tipBg.setCapInsets({x : 20, y : 18, width : 1, height : 1})
        tipNode.addChild(tipBg)

        var word = wls.Config.getLanguage(800000374) + " "
        var tipword = cc.LabelTTF.create(word, "Arial", 20);
        tipword.setColor(cc.c3b(255, 255,255));
        tipNode.addChild(tipword)

        var item = wls.Config.getItemData(propId)
        var tipDate = cc.LabelTTF.create("", "Arial", 20);
        tipDate.setColor(cc.c3b(255, 230,114));
        tipNode.addChild(tipDate)
        tipDate.setString(item.name+"*"+propCount)
        if (propId == 12) {
            tipDate.setString(item.name+"*"+(propCount/100) + wls.Config.getLanguage(800000210))
        }
        
        var sizeTipDate = tipDate.getContentSize()
        var sizeTipWord = tipword.getContentSize()
        var allSize = sizeTipDate.width + sizeTipWord.width
        tipword.setPositionX(sizeTipWord.width/2 -allSize/2)
        tipDate.setPositionX(allSize/2 - sizeTipDate.width/2)
        tipBg.setContentSize(cc.size(allSize+30,sizeTipDate.height+10))
        tipNode.setOpacity(255)
        tipNode.setVisible(false)
        tipNode.setPosition(cc.p(0,180))
        if (this.tipsCount == null) {this.tipsCount = 0 }  
        this.tipsCount = this.tipsCount +1
        var self = this
        var spawnAct = cc.Spawn.create(cc.MoveBy.create(1,cc.p(0,80)),cc.FadeTo.create(1,0))
        var tb = [
            cc.DelayTime.create((self.tipsCount - 1)*0.5),
            cc.Show.create(),
            spawnAct,
            cc.CallFunc.create(function () {
                self.tipsCount = self.tipsCount -1
            }),
            cc.RemoveSelf.create()
        ]
        var seq = cc.Sequence.create(tb)
        tipNode.runAction(seq)
    },

    //炮台提示文字
    playGunNotice: function(showType,data)
    {
        var ccnode = wls.LoadStudioNode(this.fullPath("battle/gameeffect/uigunnotice.json"));
        this.addChild(ccnode)
        ccnode.setPosition(0,200)
        wls.BindUI(ccnode, ccnode);
        // ccnode.text_word_1.ignoreContentAdaptWithSize(true)
        // ccnode.text_word_2.ignoreContentAdaptWithSize(true)

        if (showType == "upgrade") {
            var item = wls.Config.getItemData(data.propId)
            ccnode.text_word_1.setString(wls.Config.getLanguage(800000164))
            ccnode.text_word_2.setString(item.name)
            ccnode.fnt_coin.setString(data.propCount)
        } else if ( showType == "alms" ) {
            ccnode.text_word_1.setString(wls.Config.getLanguage(800000005))
            var str = "("+ data.leaveTime + "/" + data.allCount + ")"
            ccnode.text_word_2.setString(wls.Config.getLanguage(800000165) + str)
            ccnode.fnt_coin.setString(data.propCount)
        }

        this.find("EFCoins").showGunAwardCoin(this.viewid,data.propCount,6)

        var moreDis = 10
        var overDis = 20
        var sizeText1 = ccnode.text_word_1.getContentSize().width
        var sizeText2 = ccnode.text_word_2.getContentSize().width
        var sizeFnt = ccnode.fnt_coin.getContentSize().width*0.5
        var sizeX = sizeText1 + sizeText2 + sizeFnt + moreDis*2 + overDis*2
        ccnode.image_bg.setContentSize(cc.size(sizeX,ccnode.image_bg.getContentSize().height))
    
        ccnode.text_word_1.setPositionX( sizeText1 + overDis)
        ccnode.fnt_coin.setPositionX(ccnode.text_word_1.getPositionX() + moreDis )
        ccnode.text_word_2.setPositionX(ccnode.fnt_coin.getPositionX() + sizeFnt + moreDis )

        ccnode.inner_action.play("gunupgrade",false)
        wls.CallAfter(this, 54 / 25, function(){
            ccnode.removeFromParent()
        });
    },

    //破产
    setBankrupt: function(isBankrupt)
    {
        this.isBankrupt = isBankrupt
        if (isBankrupt &&  !this.spr_bankrupt.isVisible()) {
            this.spr_bankrupt.setVisible(true)
            this.spr_bankrupt.setOpacity(50)
            this.spr_bankrupt.setScale(15.0)
            var spawn = cc.Spawn.create(cc.FadeTo.create(0.25,255),cc.ScaleTo.create(0.25,1))
            this.spr_bankrupt.runAction(spawn)
        } else {
            this.spr_bankrupt.setVisible(false)
            if (this.find("EFAlminfo") && this.is_self) {
                this.find("EFAlminfo").removeFromScene()
                return 
            } 
        }

        if (this.is_self) {
            var myDate = new Date(wls.GetCurTimeFrame() + wls.serverTimeDis);//获取系统当前时间
            var curDayData = wls.strFormat(myDate.getFullYear(),4) + wls.strFormat(myDate.getMonth()+1,2) + wls.strFormat(myDate.getDate(),2)
            cc.sys.localStorage.setItem(this.playerid+"showNobleBox", curDayData); 
        }

    },

    //时光沙漏
    startTimeRevert: function(showTime)
    {
        this.stopTimeRevert()
        this.node_buff.setVisible(true)
        var act = cc.RepeatForever.create(cc.RotateBy.create(6, 360))
        this.spr_buff.runAction(act)
        this.img_numbg.setVisible(this.is_self)
        this.txt_timecount.setVisible(this.is_self)
        if (!this.is_self) { return }
        this.txt_timecount.setString(showTime+"S")
        this.TimeRevertCount = showTime
        this.startTime = wls.GetCurTimeFrame()
        //this.txt_timecount.ignoreContentAdaptWithSize(true)
        var self = this
        var callAct = cc.CallFunc.create(function () {
            var cur = wls.GetCurTimeFrame()
            var curCount = self.TimeRevertCount - (cur - self.startTime)
            self.txt_timecount.setString(curCount+"S")
            if (curCount <= 10) {
                self.find("SKHourglass").isShowHourglassNotice(true)
            } else {
                self.find("SKHourglass").isShowHourglassNotice(false)
            }
            if (curCount <=0 ) {
                self.stopTimeRevert()
                FG.SendMsg("sendToStopTimeHourglass", 0);
            }
        })

        var sequence = cc.Sequence.create(cc.DelayTime.create(1), callAct)
        var action = cc.RepeatForever.create(sequence)
        this.node_buff.runAction(action)
    },

    //停止沙漏
    stopTimeRevert: function()
    {
        this.node_buff.setVisible(false)
        this.node_buff.stopAllActions()
        this.spr_buff.stopAllActions()
        if (this.is_self) {
            this.find("SKHourglass").isShowHourglassNotice(false)
        }
    },

    //炮台提示文字图片   播放抽奖中动画 永久解锁狂暴
    playGunTipPic: function(type)
    {
        var fileName = ""
        if (type == "Lottery") {
            fileName = "battle/images/lottery/lottery_pic_cjz.png"
        } else if (type == "Violent") {
            fileName = "battle/images/skill/bl_pic_kb_yjjs.png"
        }
        var spr = cc.Sprite.create()
        spr.setSpriteFrame(this.fullPath(fileName))
        this.addChild(spr,1000)
        spr.setPosition(cc.p(0,170))
        if (this.viewid > 2) {spr.setRotation(180)}
        var RemoveAct = cc.Sequence.create(cc.DelayTime.create(3),cc.RemoveSelf.create())
        spr.runAction(RemoveAct)
        var seq1 = cc.Sequence.create(cc.FadeTo.create(0.5,0.75*255),cc.FadeTo.create(0.5,255))
        spr.runAction(cc.RepeatForever.create(seq1))
    },

    //悬赏排名
    isShowRewardRank: function(isShow, rank)
    {
        this.img_reward_rank.setVisible(isShow)
        this.fnt_reward_rank.setString(rank || 1)
        this.img_reward_rank.setRotation(this.viewid == 3 || this.viewid == 4 ? 180 : 0)
    },

    //悬赏宝箱获得者
    isShowGetBoxTitle: function(isShow) 
    {
        this.img_getbox_title.setVisible(isShow)
        if (!isShow) { return }
        this.img_getbox_title.setRotation(this.viewid == 3 || this.viewid == 4 ? 180 : 0)
        this.img_getbox_title.runAction(cc.Sequence.create(cc.DelayTime.create(3), cc.CallFunc.create(function() {
            this.img_getbox_title.setVisible(false)
        }.bind(this))))
    },

    getCannonWorldPos: function()
    {
        return cc.p(this.cannonWorldPos.x, this.cannonWorldPos.y)
    }
})