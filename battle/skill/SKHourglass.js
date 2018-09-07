// 时间沙漏
wls.namespace.SKHourglass = wls.SKBase.extend
({
    initSkill: function() 
    {
        cc.log("+++++++++++++++initSkill SKHourglass");
        this.startFishCoin = 0
    },

    // 技能icon
    initIcon: function(icon)
    {
        var go = this.wrapGameObject(icon, "UISkillIcon", this);
        go.updateIcon();
        this.icon = go;

        var nodeLight = wls.LoadStudioNode(this.fullPath("battle/skill/uiskilllight2.json"));
        go.addChild(nodeLight,102);
        nodeLight.setScale(0.85)
        nodeLight.runAction(nodeLight.inner_action);   
        nodeLight.inner_action.play("doplay",true)
        this.useLight = nodeLight

        var nodeHourglass = wls.LoadStudioNode(this.fullPath("battle/hourglass/uiskillanimation.json"));
        go.addChild(nodeHourglass,97);
        nodeHourglass.runAction(nodeHourglass.inner_action);   
        nodeHourglass.inner_action.play("doplay",true)
        this.nodeHourglass = nodeHourglass

        this.useLight.setVisible(false)
        this.nodeHourglass.setVisible(false)

    },

    //使用标志
    doUseSkill: function()
    {
        this.bUse = true;
        this.useLight.setVisible(true)
        this.nodeHourglass.setVisible(true)
    },

    //结束技能
    stopSkill: function(resp)
    {
        
        var player = FG.GetPlayer(resp.playerID);
        var cannon = this.find("GOCannon" + player.viewid)
        cannon.stopTimeRevert()
        if (!player.bSelf) { return }
        var self = this

        this.bUse = false;
        this.useLight.setVisible(false)
        this.nodeHourglass.setVisible(false)
        if (resp.useType == 0) {return}
        cannon.setCoin(cannon.getCoin())
        var addScore = resp.nFishIcon - cannon.getCoin()
        cannon.willOpCoin(addScore)
        this.addTimehourRevert(resp.nFishIcon,cannon.getCoin())

        wls.CallAfter(this,3,function () {
            self.find("EFCoins").playFishDropOut(cc.p(display.width/2,display.height/2), 12, FG.SelfViewID, addScore);
        })

    },

    //点击按键
    doActiveSkill: function()
    {
        var self = this
        if (this.bUse)
        {
            this.revertCheck()
            return;
        }
        if (!this.isCanUse()) return;
        this.startCheck();
    },

    //使用技能
    releaseSkill: function(viewid,resp)
    {
        var cannon = this.find("GOCannon" + viewid);
        if (cannon == null) return;
        var beginPos = cc.p(cannon.getPositionX(),cannon.getPositionY())
        var endPos = cc.p(display.width/2,display.height/2)

        FG.PlayEffect("hourglass_01.mp3")
        this.addLamp(beginPos,endPos)
        this.addDarkCloud(0.76,endPos)
        this.addDarkCloud(0.96,endPos)
        cannon.startTimeRevert(resp.nTimeRemain)
        if (viewid != FG.SelfViewID) return;
        this.startFishCoin = resp.nFishIcon
        this.doUseSkill()
        this.addTimehourBanner(resp.nTimeRemain,0.96)

    },

    //继续使用
    continueSkill: function (viewid,startFishCoin,nTimeRemain) 
    {
        var cannon = this.find("GOCannon" + viewid);
        if (cannon == null) return;
        cannon.startTimeRevert(nTimeRemain)
        if (viewid == FG.SelfViewID) { 
            this.startFishCoin = startFishCoin 
            this.doUseSkill()
        }
    },


//-------------------------------------------各种动画特效--------------------------------------------------
    //丢沙漏
    addLamp: function(beginPos,endPos)
    {
        var spawn = cc.Spawn.create(cc.RotateBy.create(0.88, 360),cc.MoveTo.create(0.88, endPos))
        var actTb = [
            cc.FadeTo.create(0.12, 255),
            cc.DelayTime.create(0.76),
            cc.FadeTo.create(0.08, 0),
            cc.DelayTime.create(0.76),
            cc.RemoveSelf.create()
        ]

        var lampSprite = cc.Sprite.create()
        lampSprite.setSpriteFrame(this.fullPath("common/images/prop/prop_014.png"))
        lampSprite.setPosition(beginPos)
        lampSprite.runAction(spawn)
        lampSprite.runAction(cc.Sequence.create(actTb))
        this.addChild(lampSprite, 99)
    },

    //乌云
    addDarkCloud: function(delaytime,endPos,callback)
    {
        var strFormat = this.fullPath("battle/images/effect/effect_lamp_clouds.png")
        for (var index = 0; index < 2; index++) {
            var cloud = cc.Sprite.create()
            cloud.setSpriteFrame(strFormat)
            cloud.setOpacity(0)
            cloud.setScale(0)
            cloud.setPosition(endPos.x,index == 0? endPos.y:endPos.x.y - cloud.getContentSize().height/2)
            
            var fadeAct = cc.Sequence.create(cc.DelayTime.create(delaytime + index *0.2),cc.FadeTo.create(0.6, 255), cc.FadeTo.create(0.6, 0))
            var tb = [
                cc.DelayTime.create(delaytime + index *0.2),
                cc.ScaleTo.create(1.2, 3),
                cc.CallFunc.create(function ( ){
                    if (index == 1) { if (callback) {callback()} }
                }),
                cc.RemoveSelf.create()
            ]
            var spawn = cc.Spawn.create(fadeAct, cc.Sequence.create(tb));
            cloud.runAction(spawn)
            this.addChild(cloud, 100)  
        }
    },

    //开始使用动画
    addTimehourBanner: function(nTimeRemain,dt)
    {
        var node = wls.LoadStudioNode(this.fullPath("battle/hourglass/uihourglassfirst.json"));

        this.addChild(node,200);
        node.setPosition(display.width/2,display.height/2)
        wls.BindUI(node, node);
        node.runAction(node.inner_action);
        
        node.fnt.setString(nTimeRemain)
        node.nTimeRemain = nTimeRemain
        node.setVisible(false)

        var rep = cc.RepeatForever.create( cc.Sequence.create(cc.DelayTime.create(1),cc.CallFunc.create(function () {
            node.nTimeRemain = node.nTimeRemain -1
            node.fnt.setString(node.nTimeRemain)
        })))

        var tb = [
            cc.DelayTime.create(dt),
            cc.CallFunc.create(function () {
                node.setVisible(true)
                node.inner_action.play("start",false)
                node.runAction(rep)
            }),
            cc.DelayTime.create(3),
            cc.RemoveSelf.create()
        ]
        node.runAction(cc.Sequence.create(tb))
		this.find('SCSound').playEffect("hourglass_01.mp3", false);
    },

    //回朔动画
    addTimehourRevert: function(aimCount,curCount)
    {
        FG.PlayEffect("congrat_01.mp3")
        var emitter = cc.ParticleSystem.create(this.fullPath("common/particle/partical_coin01.plist"))  
        this.addChild(emitter,0)
        emitter.setPosition(display.width/2,display.height/2)
        emitter.runAction(cc.Sequence.create(cc.DelayTime.create(3),cc.RemoveSelf.create()))

        var node = wls.LoadStudioNode(this.fullPath("battle/hourglass/uihourglasssecond.json"));
        this.addChild(node,200);
        node.setPosition(display.width/2,display.height/2)
        wls.BindUI(node, node);
        node.runAction(node.inner_action);
        node.inner_action.play("revert",false)
        node.fnt_num.setString(curCount)
        node.runAction(cc.Sequence.create( cc.DelayTime.create(25/60),cc.CallFunc.create(function () {
            wls.jumpingNumber(node.fnt_num,1,aimCount,curCount)
        }),cc.DelayTime.create(3-25/60),cc.RemoveSelf.create()))
    },



//-------------------------------------------各种检测和提示--------------------------------------------------
    //开始提示
    startCheck: function()
    {
        var self = this 
        this.dialog(3,'\n'+wls.Config.getLanguage(800000254) + "$"+this.propDes,function name(ret) {
            if (ret == 2) return;
            self.startCoolDown()
            var useType = self.calcUseType();
            FG.SendMsg("sendToStartTimeHourglass", useType);
            self.find("UISkillPanel").doCost(self.id, FG.SelfViewID, self.calcUseType());
        })
    },

    //回朔提示
    revertCheck: function()
    {
        var self = this 
        var curCoin = this.find("GOCannon" + FG.SelfViewID).getCoin()
        if (this.startFishCoin > curCoin) {
            FG.SendMsg("sendToStopTimeHourglass", 1);
            return 
        }
        var body = wls.format(wls.Config.getLanguage(800000257),"%s", [this.startFishCoin])
        this.dialog(3, wls.Config.getLanguage(800000271)+"\n" +body, function(ret){
            if (ret == 2) return;
            FG.SendMsg("sendToStopTimeHourglass", 1);
        });
    },

    //是否继续的检测
    continueCheck: function()
    {
        if (this.bUse)return true;
        var self = this 
        this.dialog(3,wls.Config.getLanguage(800000256),function name(ret) {
            if (ret == 2) {
                FG.SendMsg("sendToStopTimeHourglass", 0);
            } else {
                FG.SendMsg("sendToContinueTimeHourglass");
            }
        }) 
    },

    //退出检测
    exitCheck: function(callFun)
    {
        if (!this.bUse)return true;
        var self = this 
        var body = wls.format(wls.Config.getLanguage(800000257),"%s", [this.startFishCoin])
        this.dialog(3,wls.Config.getLanguage(800000258)+"\n" +body,function name(ret) {
            if (ret == 1) {
                FG.SendMsg("sendToStopTimeHourglass", 0);
                if (callFun) {callFun()}
            }
        }) 
        return false
    },

    //充值检测
    rechargeCheck: function(callFun)
    {
        if (!this.bUse)return true;
        var self = this 
        var body = wls.format(wls.Config.getLanguage(800000257),"%s", [this.startFishCoin])
        this.dialog(3,wls.Config.getLanguage(800000259)+"\n" +body,function name(ret) {
            if (ret == 2)  return 
            if (callFun) {callFun()}
        }) 
        return false
    },

    //倒计时提示
    isShowHourglassNotice: function(isShow)
    {
        var pos = this.icon.getPosition()
        if (this.notice == null) {
            var spr = cc.Sprite.create()
            spr.setSpriteFrame(this.fullPath("battle/images/hourglass/hourglass_pic_kjsl.png"))
            this.icon.getParent().addChild(spr)
            spr.setPosition(cc.p(pos.x+ 130,pos.y))
            spr.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.MoveBy.create(0.5,cc.p(20,0)),cc.MoveBy.create(0.5,cc.p(-20,0)))))
            this.notice = spr 
        }
        this.notice.setVisible(isShow)
    },

});