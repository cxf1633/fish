/****************************************************************
 * 作者：xiaos
 * 日期：2018-07-11
 * 描述：普通转盘
 ****************************************************************/

wls.namespace.UIDial = ccui.Layout.extend({
    getZorder:function () {
        return wls.ZOrder.Pop+1
    },
    onCreate: function() {
        var mask = wls.CreateMask(this, 168, true)
        var node = wls.LoadPopupView(this.fullPath("hall/uidialcommon.json"), this)
        node.setPosition(display.width/2, display.height/2)
        this.addChild(node)
        this.adaptClose(this.btn_close)
        this.curIndex = 1
        wls.OnClicked(mask, this, "btn_click")
        this.probabilityTab = [{"probability":10},{"probability":15},{"probability":10},{"probability":5},{"probability":10},{"probability":10},{"probability":10},{"probability":15},{"probability":15}]
        this.rewardsTab = wls.SplitArray(wls.Config.getConfig("990000036"))
        this.isRolling = false
        for (var key = 0; key < this.rewardsTab.length; key+=3) {
            var propId = parseInt(this.rewardsTab[(key)])
            var propCount = parseInt(this.rewardsTab[key+1])
            var unit = (propId == 12 ? wls.Config.getLanguage("800000210") : "")
            var info = wls.Config.getItemData(propId)
            propCount =  (propId == 12 ? propCount/100 : propCount)
            var nameStr = propCount+unit
            var pic = "common/images/prop/"+info.res
            this["item"+(key/3+1)+"_name"].setString(propId == 0 ? "" : nameStr)
            this["item"+(key/3+1)+"_icon"].loadTexture(this.fullPath(pic), 1)
            this.probabilityTab[key/3].name = info.name
            this.probabilityTab[key/3].num = propCount
        }

        //闪光灯 1秒一次
        this.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.CallFunc.create(function(){
            for (var key = 1; key <= 6; key++) {
                var point1 = this.node_light_1.getChildByName("spr_light_"+key)
                var point2 = this.node_light_2.getChildByName("spr_light_"+key)
                var pos = point1.getPosition()
                point1.setPosition(point2.getPosition())
                point2.setPosition(pos)
            }
        }.bind(this)), cc.DelayTime.create(1))))
        
        this.text_notice.setVisible(!window.FISH_DISABLE_CHARGE)
        this.times = this.find("DAPlayer").getLoginDrawTimes()
        this.updatePanel()
    },

    getTargetIndex: function(props, seniorProps) {
        if (props != null) {
            var rate = this.find("DAPlayer").getVipData().checkin_rate
            var propId = props[0].propId
            var propCount = (props[0].propCount / rate)
            for (var key = 0; key < this.rewardsTab.length; key+=3) {
                var isEqualId = parseInt(this.rewardsTab[(key)]) == propId
                var isEqualCount = parseInt(this.rewardsTab[key+1]) == propCount
                if (isEqualId && isEqualCount) {
                    return (key/3+1)
                }
            }
        } else {
            var propId = seniorProps[0].propId
            var propCount = 1
            for (var key = 0; key < this.rewardsTab.length; key+=3) {
                var isEqualId = parseInt(this.rewardsTab[(key)]) == propId
                var isEqualCount = parseInt(this.rewardsTab[key+1]) == propCount
                if (isEqualId && isEqualCount) {
                    return (key/3+1)
                }
            }
        }
    },

    updatePanel: function() {
        this.times = this.find("DAPlayer").getLoginDrawTimes()
        if (this.times <= 0) {
            this.text_notice.setString("分享可额外获得抽奖次数")
        } else {
            this.text_notice.setString("当前剩余抽奖次数:"+this.times)
        }
        this.text_notice.setPositionY(-display.height/2+15)
    },

    startRotateAct: function(targetIndex, rotateActEnd) {
        this.isRolling = true
        var INTERVAL = 40
        var angle = 0
        var playMusic = function(sender) {
            if (sender.getRotation() >= angle+INTERVAL) {
                angle = sender.getRotation()
                //播放音乐
                this.find("SCSound").playEffect("rolling_01.mp3", false)
            }
        }.bind(this)
        var endAct = function(sender) {
            this.curIndex = targetIndex
            //播放完成动画
            this.inner_action.play("getaward", false)
            this.runAction(cc.Sequence.create(cc.DelayTime.create(1), cc.CallFunc.create(function(){
                //显示出奖励
                rotateActEnd()
                this.isRolling = false
            }.bind(this))))
        }.bind(this)

        var targetAngle = 720+(360-((targetIndex-1)*INTERVAL-(this.curIndex-1)*INTERVAL))
        var rotateAct = cc.Sequence.create(cc.EaseSineIn.create(cc.RotateBy.create(1.5, 1440)), cc.EaseExponentialOut.create(cc.RotateBy.create(2.5, targetAngle)), cc.CallFunc.create(endAct))
        var playMusicAct = cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(0.05), cc.CallFunc.create(playMusic)))
        playMusicAct.setTag(15432)
        this.spr_bg.stopActionByTag(15432)
        this.spr_bg.runAction(rotateAct)
        this.spr_bg.runAction(playMusicAct)
    },

    click_btn_click: function() {
        if (this.isRolling) { return }
        if (this.times > 0) {
            this.waiting(true, "StartComDial")
            this.sendMsg("sendComDialStart")

        } else {
            if (this.find("DAPlayer").getUseLoginDrawTimes() >= parseInt(wls.Config.get("share", 10).awardnum)) {
                this.toast("已经到每日分享的最大次数")
                return
            }
            this.dialog(1, "转盘次数不足，进行分享获得次数", function() {
                var shareInfo = wls.GetShareInfo(wls.Config.get("share", 10).share_type) || {}
                ShareHelper.doShare({text:shareInfo.text}, function(res) {
                }.bind(this))
                this.sendMsg("sendShareSuccess", 14) 
            }.bind(this))
        }
        
    },

    click_btn_help: function() {
        this.createGameObject("UIProbability", this.probabilityTab).setPanelPosByNode(this.btn_help)
    },

    click_btn_close: function() {
        if (this.isRolling) { return }
        this.removeFromScene()
    },
})