//-----------------------------------------------------
// 大师赛游戏内结算界面
//-----------------------------------------------------
wls.namespace.UIMasterBar = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Normal
    },
    onCreate: function()
    {
        var ccnode = wls.LoadPopupView(this.fullPath("battle/master/uiprogressbar.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width*0.04, display.height*0.22);
        this.barHeight = this.img_bar_bg.getContentSize().height

        this.taskList = wls.Config.getTaskListByType(13)

        this.curScore = -1
        this.img_bar_bg.setVisible(false)
        this.x = this.x + wls.OffsetX;
    },

    setScore: function(val)
    {
        if (this.curScore == val ) { return }
        this.curScore = val
        this.fnt_score.setString(val)
        var action = cc.Sequence.create(cc.ScaleTo.create(0.1,1.7),cc.ScaleTo.create(0.3,1))
        this.fnt_score.stopAllActions()
        this.fnt_score.runAction(action);
    },

    setBarPer: function(rate)
    {
        this.bar_per.setPercent(rate*100)
        var posY = this.barHeight*rate
        this.node_aim.setPositionY(posY)
    }, 

    getCurTask: function(curScore)
    {
        var awardData = null
        for (var i = 0; i < this.taskList.length; i++) {
            var element = this.taskList[i]
            if (curScore < element.task_data2) {
                awardData = {}
                awardData.id = element.id
                awardData.aimScore = element.task_data2
                awardData.minScore = this.taskList[i- 1]?this.taskList[i- 1].task_data2:0
                awardData.awardId = element.awardId
                awardData.awardCount = element.awardCount
                break
            }
        }
        return awardData
    }, 

    updateView: function()
    {
        //更新数值
        var curScore = this.find("DAPlayer").masterScore
        var leaveCount = this.find("DAPlayer").leftMasterBullets
        this.setScore(curScore)
        this.fnt_count.setString(leaveCount)
        //更新类型  更新进度
        var awardData = null
        if (this.awardData == null || curScore >= this.awardData.aimScore ) {
            awardData = this.getCurTask(curScore)
            if (awardData == null) {
                this.awardData = null 
                this.img_bar_bg.setVisible(false)
                return 
            }
            var list = this.find("DAMaster").getTaskListData()
            for (var i = 0; i < list.length; i++) {
                if (list[i].nTaskID + 430000000 == awardData.id && list[i].isReward ) {
                    this.awardData = null 
                    this.img_bar_bg.setVisible(false)
                    return 
                }
            }

            this.awardData = awardData
            this.spr_rank.setVisible(false)
            this.img_bar_bg.setVisible(true)
            this.spr_award.setVisible(true)
            var item = wls.Config.getItemData(awardData.awardId)
            this.spr_cost_prop.setSpriteFrame(this.fullPath("common/images/prop/" + item.res));  
        }

        this.fnt_award.setString(this.awardData.awardCount)
        this.txt_count.setString(this.awardData.aimScore)
        this.setBarPer(1-(curScore-this.awardData.minScore)/(this.awardData.aimScore -this.awardData.minScore ))

    },   


});