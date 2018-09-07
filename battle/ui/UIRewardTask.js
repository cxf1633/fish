/****************************************************************
 * 作者：xiaos
 * 日期：2018-07-12
 * 描述：悬赏任务
 ****************************************************************/
"use strict"
wls.namespace.UIRewardTask = ccui.Layout.extend({
    getZorder:function () {
        return wls.ZOrder.Normal
    },
    onCreate: function(resp) {
        this.find("UIMainPanel").setTitleIsShow(false)
        var isContinue = resp.result
        var data = resp.data
        var giftId = data.giftId || 1000
        var config = null 
        var award = null
        var taskEnd = null
        var time = 0
        this.isScoreAward = data.isScoreAward
        if (data.isScoreAward) {
            config = wls.Config.get("matchreward", data.taskId)
            award = config.reward
            time = data.endTime - (wls.GetCurTimeFrame() + wls.serverTimeDis)
        } else {
            config = wls.Config.get("rewardtask", data.rewardTaskId || 460000021)
            taskEnd = parseInt(config.end)
            time = (taskEnd-FG.ClientFrame)*0.05
        }
        var targetConfig = config.task_data.split(";")
        
        if (isContinue) {
            this.createRewardPanel(time < 0 ? 0 : time, targetConfig, giftId,award)
            return
        }
        cc.log("---------UIRewardTask-----------")
        this.black = wls.CreateMask(this)
        this.setTouchEnabled(true)
        this.createStart(function(){
            this.createRewardPanel(time < 0 ? 0 : time, targetConfig, giftId,award)
        }.bind(this))
    },

    createStart: function(callfunc) {
        this.start = wls.LoadStudioNode(this.fullPath("battle/rewardtask/uirewardstart.json"), this)
        this.start.setPosition(display.width/2, display.height/2)
        this.addChild(this.start)
        if (this.isScoreAward) {
            this.rt_xsrw_2.setSpriteFrame(this.fullPath("battle/images/rewardtask/rt_txt.png"))
        }
        this.inner_action.play("start", false)
        this.start.runAction(cc.Sequence.create(cc.DelayTime.create(4.5), cc.CallFunc.create(function(){
            this.removeChild(this.black)
            this.setTouchEnabled(false)
            callfunc()
        }.bind(this)), cc.RemoveSelf.create()))
    },

    createRewardPanel: function(time, targetConfig, giftId,scoreAward) {
        this.targetConfig = targetConfig
        this.rewardPanel = wls.LoadStudioNode(this.fullPath("battle/rewardtask/uirewardtask.json"), this)
        this.rewardPanel.setPosition(display.width/2, display.height+this.img_bg.getContentSize().height/2)
        this.addChild(this.rewardPanel)
        if (scoreAward == null) {
            this.spr_box_title.setVisible(true)
            this.img_box_icon.setVisible(true)
            this.node_score.setVisible(false)
            var data = wls.Config.get("rewardtaskgif", giftId)
            var cornerRes = this.fullPath("battle/images/rewardtask/"+(data["corner_res"] || "rt_pic_sjbx.png"))
            this.spr_box_title.initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame(cornerRes))
        } else {
            this.spr_box_title.setVisible(false)
            this.img_box_icon.setVisible(false)
            this.node_score.setVisible(true)
            this.fnt_score.setString(scoreAward)
        }

        var self = this
        this.rewardPanelDown()
        this.refreshTaskPanel()
        this.fnt_countdown.stopAllActions()
        this.spr_complete.setVisible(false)
        this.fnt_countdown.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.CallFunc.create(function(sender){
            if (time <= 0) {
                var moveUpAct = cc.MoveTo.create(0.5, cc.p(display.width/2, display.height+this.img_bg.getContentSize().height/2))
                var removeAct = cc.RemoveSelf.create()
                var callFun = cc.CallFunc.create(function () {
                    self.find("UIMainPanel").setTitleIsShow(true)
                })
                sender.stopAllActions()
                this.rewardPanel.runAction(cc.Sequence.create(moveUpAct,callFun, removeAct))
                return
            }
            time = parseInt(time)
            var min = wls.PrefixInteger(Math.floor((time%3600)/60), 2)
            var sec = wls.PrefixInteger(((time%3600)%60), 2)
            var timeStr = min+";"+sec
            sender.setString(timeStr)
            time = time-1
        }.bind(this)), cc.DelayTime.create(1))))
    },

    createUnfinished: function() {
        if (this.rewardPanel) {
            this.rewardPanel.runAction(cc.MoveTo.create(0.5, cc.p(display.width/2, display.height+this.img_bg.getContentSize().height/2)))
        }
        //将悬赏面板上移
        this.rewardPanelUp()
        
        this.unfinished = wls.LoadStudioNode(this.fullPath("battle/rewardtask/uirewardunfinished.json"), this)
        this.unfinished.setPosition(display.width/2, display.height/2)
        this.unfinished.runAction(cc.Sequence.create(cc.DelayTime.create(4), cc.CallFunc.create(function() {
            this.removeFromScene()
            this.find("UIMainPanel").setTitleIsShow(true)
        }.bind(this))))
        this.addChild(this.unfinished)
    },

    createComplete: function(player, boxId, callfunc) {
        var isSelf = player.bSelf
        var name = player.nickName
        var cannon = this.find("GOCannon"+player.viewid)
        var targetPos = cannon.getCannonWorldPos()
        var data = wls.Config.get("rewardtaskgif", boxId)
        if (data == null) { return}
        var boxType = data.type
        var actName = ((isSelf ? "success" : "fail")+boxType)
        
        this.rewardPanelUp()
        this.complete = wls.LoadStudioNode(this.fullPath("battle/rewardtask/uirewardbox.json"), this)
        this.complete.setPosition(display.width/2, display.height/2)
        this.addChild(this.complete)
        this.inner_action.play(actName, false)
        
        var img_tips = this.complete.getChildByName("bxdh").getChildByName("img_tips")
        this.complete.runAction(cc.Sequence.create(cc.DelayTime.create(1.5), cc.CallFunc.create(function() {
            if (isSelf && callfunc) { callfunc() } 
        }.bind(this)), cc.DelayTime.create(3), cc.CallFunc.create(function() {
            //获得道具出现 飞行
            this.removeFromScene()
        }.bind(this)), cc.RemoveSelf.create()))
        img_tips.setVisible(!isSelf)

        //不是自己完成就不放烟花
        //if (isSelf) { this.wrapGameObject(this.bxdh, "EFColourBar"); this.bxdh.play() }

        if (!isSelf) {
            this.complete.runAction(cc.Sequence.create(cc.DelayTime.create(2), cc.CallFunc.create(function() {
                this.complete.getChildByName("bxdh").getChildByName("img_tips").setVisible(false)
            }.bind(this)), cc.Spawn.create(cc.ScaleTo.create(0.5, 0), cc.MoveTo.create(0.5, targetPos)), cc.CallFunc.create(function() {
                var cannon = this.find("GOCannon"+player.viewid)
                cannon.isShowGetBoxTitle(true)
            }.bind(this))))
            this.refreshGetBoxTips(name)
        }
    },

    refreshTaskPanel: function(targetConfig, ids, counts) {
        counts = (counts || [])
        ids = (ids || [])
        targetConfig = (targetConfig || this.targetConfig || [])
        for (var key = 0; key < targetConfig.length; key+=2) {
            var val = targetConfig[key]
            var shortFishId = parseInt(targetConfig[key])%1000
            var targetNum = parseInt(targetConfig[key+1])
            var countId = 1
            for (var i = 0; i < ids.length; i++) { if (parseInt(ids[i]) == parseInt(targetConfig[key])) { countId = i; break;}}
            var curNum = counts[countId] || 0
            var pic = "fishid_"+shortFishId+".png"
            var targetSpr = this.rewardPanel.getChildByName("img_target"+(key/2+1)+"_bg")
            var icon = targetSpr.getChildByName("spr_icon"+(key/2+1))
            var fnt = targetSpr.getChildByName("fnt_num"+(key/2+1))
            icon.initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this.fullPath("battle/images/form/"+pic)))
            fnt.setString(curNum+"&"+targetNum)
        }
    },

    refreshGetBoxTips: function(name) {
        var testLabel = cc.LabelTTF.create(name, "Arial", 20)
        var img_tips = this.complete.getChildByName("bxdh").getChildByName("img_tips")
        var textName = img_tips.getChildByName("text_2")
        var richText = ccui.RichText.create()  
        richText.ignoreContentAdaptWithSize(true)
        textName.setString(name)
        var totalWidth = 0
        for (var key = 1; key <= 4; key++) {
            var text = img_tips.getChildByName("text_"+key)
            var content = text.getString()
            var color = text.getColor()
            if (key == 2) { color = cc.c3b(239, 218, 118) } else if (key == 4 ) {  color = cc.c3b(228, 95, 90) }
            var tips = ccui.RichElementText.create( key, color, 255, content, "Arial", 20 ) 
            text.setVisible(false) 
            richText.pushBackElement(tips)
            totalWidth = totalWidth+text.getContentSize().width
        }
        totalWidth = totalWidth
        img_tips.setContentSize(cc.size(totalWidth+80, img_tips.getContentSize().height))
        richText.setPosition(cc.p((totalWidth+80)/2, img_tips.getContentSize().height/2))
        img_tips.addChild(richText)
    },

    playCompleteAni: function(func) {
        this.spr_complete.setVisible(true)
        this.spr_complete.setScale(2)
        this.spr_complete.runAction(cc.Sequence.create(cc.ScaleTo.create(0.3, 1, 1), cc.DelayTime.create(0.5), cc.CallFunc.create(func)))
    },

    rewardPanelUp: function() {
        this.playCompleteAni(function() {
            this.spr_complete.setVisible(false)
            if (this.rewardPanel) {
                var bg = this.rewardPanel.getChildByName("img_bg")
                this.rewardPanel.runAction(cc.MoveTo.create(0.5, cc.p(display.width/2, display.height+bg.getContentSize().height/2)))
            }
            //新手引导面板放下来
            if (this.find("WNNewBieTask")) { this.find("WNNewBieTask").dropDownTaskWin() }
        }.bind(this))
        
    },

    rewardPanelDown: function() {
        if (this.rewardPanel) {
            var bg = this.rewardPanel.getChildByName("img_bg")
            this.rewardPanel.runAction(cc.MoveTo.create(0.5, cc.p(display.width/2, display.height-bg.getContentSize().height/2)))
        }
        //新手引导面板上升
        if (this.find("WNNewBieTask")){ this.find("WNNewBieTask").drawBackTaskWin()}
    },
})