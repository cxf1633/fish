//-----------------------------------------------------
// 大师赛数据
//-----------------------------------------------------
wls.namespace.DAMaster = cc.Node.extend
({
    onCreate: function()
    {
        this.initRoomConfig()
    },

    initRoomConfig: function()
    {
        var tb = wls.Config.get("match", 500002000);
        cc.log(tb)
        var costData = tb.cost.split(";")
        tb.costPropId = parseInt(costData[0])
        tb.costPropCount = parseInt(costData[1])

        var openTimeData = tb.timepara.split(";")
        tb.openTimeStart = openTimeData[0]
        tb.openTimeEnd = openTimeData[1]
    
        var endStr = tb.openTimeEnd
        var tb2 = endStr.split(":")
        tb.endTimehour = parseInt(tb2[0])
        tb.endTimeMinute = parseInt(tb2[1])

        this.matchData = tb 


        var reward = this.matchData.reward
        var tb = reward.split(";")
        var list = []
        for (var i = 0; i < tb.length; i++) {
            var data = {}
            data.rank = parseInt(tb[i])
            data.propId = parseInt(tb[i+1])
            data.propCount = parseInt(tb[i+2])
            i = i +2
            list.push(data)
        }
        this.awardList = list
    },

    getRoomConfig: function()
    {
        return this.matchData
    },

    getRankAward: function()
    {
        return this.awardList
    },
    getRankAwardByRank: function(rank)
    {
        for (var i = 0; i < this.awardList.length; i++) {
            var element = this.awardList[i];
            if (rank <= element.rank) {
                return element
            }
        }
        return
    },

    //设置大师赛状态数据
    setMasterStatus: function(val)
    {
        this.masterStatus = val
    },
    getMasterStatus: function()
    {
        return this.masterStatus
    },

    //设置周冠军数据
    setWeekData: function(val)
    {
        this.weekData = val[0]
    },
    getWeekData: function()
    {
        return this.weekData||[]
    },

    //设置竞技场排行数据
    setDayRankListData: function(val)
    {
        this.dayRankList = val
    },
    getDayRankListData: function()
    {
        return this.dayRankList||[]
    },

    //设置竞技场任务数据
    setTaskListData: function(val)
    {
        this.TaskInfo = val
    },
    getTaskListData: function()
    {
        return this.TaskInfo||[]
    },

    //报名类型 btnState: 0.免费挑战   1.继续挑战  2.花钱挑战  3.未开放  4.可以分享  5.不能分享
    getCurMasterType: function()
    {
        if (!this.isGameOpen()) { return 3 }
        if (!this.masterStatus) { return 0 }
        if (this.find("DAPlayer").leftMasterBullets > 0 ) { return 1 } 
        if (this.masterStatus.masterJoinTimes < this.matchData.freetime ) { //免费挑战
            return 0
        }
        var shareData = wls.Config.getShareDataById(this.matchData.share_id)
        var curCount = this.find("DAPlayer").getShareTimes(shareData.type)
        if (this.masterStatus.masterJoinTimes < this.matchData.maxnum + curCount) {
            return 2
        }
        if (curCount < shareData.awardnum) { return 4 }
        return 5
    },

    getShareData: function()
    {
        if (!this.masterStatus) { return }
        var shareData = wls.Config.getShareDataById(this.matchData.share_id)
        var curCount = this.find("DAPlayer").getShareTimes(shareData.type)
        var leaveTime = this.matchData.maxnum + curCount - this.masterStatus.masterJoinTimes 
        var tb = {
            id:shareData.type,
            shareType:shareData.share_type,
            share_res:this.fullPath("common/images/commonshare/" + shareData.res),
            curCount:(curCount>shareData.awardnum?shareData.awardnum:curCount),
            maxCount:shareData.awardnum,
            leaveTime:leaveTime
        }
        return tb
    },

    isGameOpen: function(){
        if (this.matchData == null) {return false }
        var curTime = wls.GetCurTimeFrame() + wls.serverTimeDis
        var endTime = wls.GetTimeFrameByData(null,null,null,this.matchData.endTimehour,this.matchData.endTimeMinute,0)
        return curTime < endTime
    },

    //获得日常奖励
    getTaskAeard: function(resp)
    {
        var award = ""
        var dis = 100
        var leftPos = display.width/2 - (resp.props.length - 1)*dis/2
        for (var key = 0; key < resp.props.length; key++) 
        {
            var prop = resp.props[key]
            var item = wls.Config.getItemData(prop.propId)
            award = award + prop.propCount +  item.name + (key<resp.props.length-1?",":"")
            var pos = cc.p(leftPos+key*dis, display.height/2)
            var flyData = {
                viewid  : wls.GameState==2?FG.SelfViewID:0,
                propData: prop,
                firstPos: pos,
            }
            this.find("EFItems").play(flyData);
        }
        var str = wls.format(wls.Config.getLanguage(800000473),"%s",[award])
        this.toast(str);
        this.sendMsg("sendGetAllTaskInfo")
    },

    //加入大师赛
    JoinMasterGame: function(resp) {
        cc.log("---------------JoinMasterGame-------------")
        this.waiting(false,"JoinMasterGame")
        if (resp.errorCode == 0) { //成功
            if (wls.GameState == 2) {
                this.getScene().doReChargeSucceed();
                this.find("SCSend").sendGetMasterStatus()
            } else {
                wls.RoomIdx = 8
            }
            if (this.find("UIHallMaster")) {
                this.find("UIHallMaster").removeFromScene()
            }
            if (this.find("UIMasterResult")) {
                this.find("UIMasterResult").removeFromScene()
            }
            return 
        }
        var str = ""
        if (resp.errorCode == -2) {
            str = "报名次数超过限制"
        } else if (resp.errorCode == -3) {
            str = wls.Config.getLanguage(800000469)
            str = wls.format(str,"%s",[this.matchData.cannon])
        } else if (resp.errorCode == -4) {
            str = wls.Config.getLanguage(800000464)
        } else if (resp.errorCode == -5) {
            str = wls.Config.getLanguage(800000470)
        } else if (resp.errorCode == -6) {
            str = wls.Config.getLanguage(800000468)
            str = wls.format(str,"%s",[this.matchData.need_coin])
        } else if (resp.errorCode == -7 || resp.errorCode == -8) {
            str = wls.Config.getLanguage(800000481)
        } else {
            str = wls.Config.getLanguage(800000470)
        }
        this.toast(str)
    },

    //大师赛排行
    showRank: function(resp)
    {
        this.waiting(false,"MasterGetRanking")
        if (resp.rankingType == 1) {
            this.setDayRankListData(resp.playerInfo)
            if (this.find("UIHallMaster")) {
                this.find("UIHallMaster").updateData()
            }
        } else if (resp.rankingType == 2) {
            this.pushView("UIHallMasterFamous",resp.playerInfo)
        } else if (resp.rankingType == 3) {
            this.setWeekData(resp.playerInfo)
            if (this.find("UIHallMaster")) {
                this.find("UIHallMaster").updateWeekData()
            }
        }
    },

});