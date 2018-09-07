//跳动数字动画
wls.namespace.EFNumJump = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.limitPop-1
    },
    FNT_DISY :120,
    onCreate: function()
    {
    },

    // 初始化滚动条 type 1:鱼券鱼掉落
    initWithType: function(type,viewid,showData)
    {
        this.effType = type;
        this.showData = showData
        this.viewid = viewid
        var ccnode = null
        if (type == 1) {
            ccnode = wls.LoadStudioNode(this.fullPath("battle/bossratechange/uifishcardrate.json"), this);
        } else if (type == 2) {
            ccnode = wls.LoadStudioNode(this.fullPath("battle/bossratechange/uibossratechange.json"), this);
        }
        this.addChild(ccnode,10);
        this.ccnode = ccnode
        var cannon = this.find("GOCannon" + viewid);
        ccnode.setPosition(cannon.getPositionX(),cannon.getPositionY()+ (viewid > 2?-230:230));
        // this.inner_action.play("open",false)
        if (type == 1) {
            this.initFishCardRateData(viewid,showData)
            this.playFishCardRate(viewid,showData)
        } else if (type == 2) {
            this.initBossRateData(viewid,showData)
            this.playBossRate(viewid,showData)
        }
    },
    // var showData = {
    //     propId: propId,
    //     propCount: propCount,
    //     dropPos: dropPos,
    //     endRate :endRate,
    //     base_num :base_num,
    // }
    initFishCardRateData: function(viewid,showData)
    {
        var isSingle = Math.floor(showData.endRate/10) == 0
        this.fnt_count.setString(showData.base_num)
        this.node_fnt_1.setVisible(!isSingle)
        this.panel_fnt.setPositionX(isSingle?249:286)
        this.spr_multiple.setPositionX(isSingle?255:286)
    },

    // var showData = {
    //     rate: randomFishScore,
    //     gunRate: resp.gunRate,
    //     dropPos: dropPos,
    //     fishId :fish.config.id -100000000,
    // }
    initBossRateData: function(viewid,showData)
    {

    },



    initNumList: function(numList)
    {
        for (var index = 0; index < numList.length; index++) {
            var node = this["node_fnt_"+(index+1)]
            wls.BindUI(node, node);
            node.endNum = numList[index]
            node.idx = index+1
            node.isEnd = false
            node.fnt_1.setString(1)
            node.fnt_2.setString(0)
            node.fnt_3.setString(9)
            for (var index2 = 0; index2 < 3; index2++) {
                node["fnt_"+(index2+1)].setPositionY((1 - index2)*this.FNT_DISY)
            }
        }
    },

    //运动
    playNumAct: function(fntList)
    {
        fntList.speed = 48
        var self = this
        var disTime = 0.01
        var actFun = function () {
            self.updateActNum(fntList)
            for (var index = 0; index < 3; index++) {
                var fnt = fntList["fnt_"+(index+1)];
                fnt.setPositionY(fnt.getPositionY() - fntList.speed)
            }
            self.checkEnd(fntList)
        }
        var rep = cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(disTime),cc.CallFunc.create(actFun)))
        fntList.runAction(rep)
    },

    //调换数字使得循环
    updateActNum: function(fntList)
    {
        if (fntList.fnt_2.getPositionY() > -this.FNT_DISY/2 ) { return true }
        var node3 = fntList.fnt_3
        node3.setPositionY(fntList.fnt_1.getPositionY() + this.FNT_DISY)
        fntList.fnt_3 =  fntList.fnt_2
        fntList.fnt_2 =  fntList.fnt_1
        fntList.fnt_1 =  node3
        node3.setString((parseInt(node3.getString()) + 3)%10)
        if (fntList.idx == 1) {
            FG.PlayEffect("rolling_01.mp3");
        }
    },

    //跳动结束
    setJumpEnd: function(idx)
    {
        var fntList = this["node_fnt_"+idx]
        var disNum = fntList.endNum + 6
        fntList.isEnd = true
        fntList.fnt_1.setString((disNum + 1)%10)
        fntList.fnt_2.setString(disNum%10)
        fntList.fnt_3.setString((disNum - 1)%10)
    },


    //检查是否结束
    checkEnd: function(fntList)
    {
        if (!fntList.isEnd) { return false}
        if (fntList.fnt_2.getString() == fntList.endNum) {
            for (var index2 = 0; index2 < 3; index2++) {
                var fnt = fntList["fnt_"+(index2+1)]
                fnt.stopAllActions()
                fnt.setPositionY((1 - index2)*this.FNT_DISY)
            }
            this.jumpEnd(fntList)
        } else {
            fntList.speed = fntList.speed > 12 ? fntList.speed - 2:12
        }
    },

    jumpEnd: function(fntList)
    {
        var self = this
        fntList.stopAllActions()
        if (fntList.idx > 1) {
            this.setJumpEnd(fntList.idx - 1)
        } else {
            if (this.effType == 1) {
                this.doFishCardEnd()
            } else if (this.effType == 2) {
                this.doBossRateEnd()
            }
        }
    },

    //播放鱼券鱼转盘
    playFishCardRate: function(viewid,showData)
    {
        var self = this
        //动画1 道具飞行
        var pos1 = wls.getWordPosByNode(this.spr_prop)
        var flyData = {
            viewid     : viewid,
            firstPos   : showData.dropPos,
            endPos     : pos1,
            isShowCount: false,
            refreshType: 0,
            endScale   : 1,
            propData   : showData.propData,
            zorder     : wls.ZOrder.limitPop-1
        }
        var actTime = this.find("EFItems").play(flyData)
        this.spr_prop.setVisible(false)
        this.fnt_count.setVisible(false)
        this.inner_action.play("open",false)

        this.numList = [
            Math.floor(showData.endRate/10),
            showData.endRate%10
        ]
        this.initNumList(this.numList);

        wls.CallAfter(this, actTime, function(){
            self.spr_prop.setVisible(true)
            self.fnt_count.setVisible(true)
            self.inner_action.play("down",false)
        });

        wls.CallAfter(this, actTime + 15 / 60, function(){
            for (var index = 0; index < self.numList.length; index++) {
                var node = self["node_fnt_"+(index+1)]
                self.playNumAct(node)
            }
        });

        wls.CallAfter(this, actTime + 75 / 60, function(){
            self.setJumpEnd(self.numList.length);
        });
    },

    //处理鱼券鱼转盘结果
    doFishCardEnd: function()
    {
        var self = this
        wls.CallAfter(this, 10/60, function(){
            var emitter = cc.ParticleSystem.create(self.fullPath("common/particle/Particle_lbbz.plist"))  
            //emitter.resetSystem()
            self.ccnode.addChild(emitter,10)
            emitter.setPosition(30,0)
        });
        wls.CallAfter(this, 60/60, function(){
            self.inner_action.play("close",false)

            var cannon = self.find("GOCannon" + self.viewid);
            var flyData = {
                viewid     : self.viewid,
                firstPos   : wls.getWordPosByNode(self.spr_prop),
                endPos     : cannon.getCentrePos(),
                isShowCount: true,
                refreshType: 2,
                isJump     : false,
                propData   : self.showData,
                zorder     : wls.ZOrder.limitPop-1
            }
            var actTime = self.find("EFItems").play(flyData)
        });
        wls.CallAfter(this, (60 + 10)/60, function(){
            self.removeFromScene()
        });
    },

    //播放变倍率boss转盘
    playBossRate: function(viewid,showData)
    {
        var self = this
        this.numList = [
            Math.floor(showData.endRate/1000%10),
            Math.floor(showData.endRate/100%10),
            Math.floor(showData.endRate/10%10),
            showData.endRate%10
        ]
        this.initNumList(this.numList);
        this.inner_action.play("open",false)

        wls.CallAfter(this, 35 / 60, function(){
            for (var index = 0; index < self.numList.length; index++) {
                var node = self["node_fnt_"+(index+1)]
                self.playNumAct(node)
            }
        });

        wls.CallAfter(this, (35+60) / 60, function(){
            self.setJumpEnd(self.numList.length);
        });

    },

    //处理变倍率boss转动结束
    doBossRateEnd: function()
    {
        var self = this
        wls.CallAfter(this, (60)/60, function(){
            self.inner_action.play("close",false)
        });
        
        wls.CallAfter(this, (60 + 10)/60, function(){
            self.find("EFBonusWheel" + self.viewid).play(self.showData.fishId, self.showData.allScore, 0);
            self.find("EFCoins").playFishDropOut(self.showData.dropPos, self.showData.coin_num, self.viewid, self.showData.allScore);
            self.removeFromScene()
        });
    }
});