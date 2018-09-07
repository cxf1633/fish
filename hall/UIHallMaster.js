/****************************************************************
 * 作者：xiaos
 * 日期：2018-08-03
 * 描述：大师赛入口界面
 ****************************************************************/

 wls.namespace.UIMasterRankItem = ccui.Layout.extend({
     onCreate: function(data) {
        var node = wls.LoadStudioNode(this.fullPath("hall/uimasterrankitem.json"), this)
        node.setPosition(this.getItemSize().width/2, this.getItemSize().height/2 - 15)
        this.addChild(node)
        var propId = data.propId
        var propCount = data.propCount
        var propData = wls.Config.getItemData(propId)
        this.setContentSize(this.getItemSize())
        
        this.text_score.setString("--")
        this.fnt_rank.setString(data.rankDes || "--")
        this.img_item.loadTexture(this.fullPath("common/images/prop/"+propData.res), 1)
        this.fnt_num.setString(propCount)
        this.text_name.setString("--")
        if (data.rank < 4) {
            this.img_bg.loadTexture(this.fullPath("hall/images/hall_jjc/arena_rank_no"+data.rank+".png"), 1)
            this.spr_rank.setSpriteFrame(this.fullPath("hall/images/hall_jjc/arena_rank_"+data.rank+".png"))
        } else {
            this.img_bg.loadTexture(this.fullPath("hall/images/hall_jjc/arena_rank_no.png"), 1)
        }
        this.spr_rank.setVisible(data.rank < 4)
        this.fnt_rank.setVisible(data.rank >= 4)
     },

     initWiew: function(data) {
        this.text_score.setString(data.score || 0)
        if (data.rank < 4) {
            this.text_name.setString(data.nickName || "")
        } else {
            var str = wls.Config.getLanguage(800000459)
            this.text_name.setString(wls.format(str,"%s",[data.rank]))
        }
    },

     getItemSize: function() {
         var size = this.img_bg.getContentSize()
         return this.img_bg.getContentSize()
     },
 })

wls.namespace.UIHallMaster = cc.Node.extend
({
    getZorder: function () {
        return wls.ZOrder.Pop+1
    },
    onCreate: function() {
        wls.CreateMask(this)
        var node = wls.LoadPopupView(this.fullPath("hall/uihallmaster.json"), this)
        node.setPosition(display.width/2, display.height/2)
        this.addChild(node)
        this.startTimer("onUpdate", 0.05, 1, -1)
        this.btn_left.setVisible(false)
        this.btn_right.setVisible(false)
        this.btn_left.setEnabled(false)
        this.btn_right.setEnabled(false)
        
        var data= this.find("DAMaster").getRoomConfig()
        this.idstr = data.helpful
        this.txt_time.setString(data.openTimeStart+"-"+data.openTimeEnd)
        this.txt_cost.setString(data.costPropCount)

        var itemData = wls.Config.getItemData(data.costPropId)
        this.spr_cost.setSpriteFrame(this.fullPath("common/images/prop/"+itemData.res))

        this.freeTime = data.freetime

        var str = wls.Config.getLanguage(800000458)
        var momt = wls.GetCurTimeData().getMonth()+1
        var day = wls.GetCurTimeData().getDate()
        this.txt_notice.setString(wls.format(str,"%s",[momt,day]))

        var awardList = wls.Config.get("config", 990000133).data
        var tb = awardList.split(";")
        var propData = wls.Config.getItemData(parseInt(tb[0]))
        this.img_item.loadTexture(this.fullPath("common/images/prop/"+propData.res), 1)
        this.fnt_num.setString(tb[1])
        this.text_name.setString("--")
        this.text_score.setString("--")

        this.updateView()
        this.createRankItems(this.find("DAMaster").getRankAward())
        this.sendMsg("sendMasterGetRanking",1)
        this.sendMsg("sendMasterGetRanking",3)
        this.adaptClose(this.btn_close)
    },

    updateWeekData: function() {
        var data = this.find("DAMaster").getWeekData()
        this.text_name.setString(data.nickName||"--")
        this.text_score.setString(data.score||"--")
    },

    onUpdate: function() {
        var containerWidth = this.listview_items.getInnerContainerSize().width
        var scrollviewWidth = this.listview_items.getContentSize().width
        var containerX = Math.abs(this.listview_items.getInnerContainer().getPositionX())
        this.btn_left.setVisible(containerX > 20)
        this.btn_right.setVisible(containerX+scrollviewWidth < containerWidth-20)
    },

    updateView: function() {
        var data= this.find("DAMaster").getMasterStatus()
        if (data) {
            this.txt_score.setString(data.score<0?"--":data.score )
            this.txt_rank.setString(data.rank<0?"--":data.rank)
        }
        if (wls.GameState == 2) {
            this.btn_enter.setVisible(false)
            return 
        }

        var btnState = this.find("DAMaster").getCurMasterType()
        this.spr_continue.setVisible(btnState == 1)
        this.spr_free.setVisible(btnState == 0)
        this.node_cost.setVisible(btnState == 2)
        this.spr_end.setVisible(btnState == 3)
        this.btn_enter.setEnabled(btnState != 3)
        this.img_share.setVisible(btnState == 4 ||btnState == 5)
        this.btnState = btnState

        var shareData = this.find("DAMaster").getShareData()
        if (!shareData) { return }
        var leaveTime = shareData.leaveTime
        var conditionStr = wls.format(wls.Config.getLanguage(800000482), "%s", [leaveTime < 0 ?"0":(leaveTime+"")])
        this.txt_count_des.setString(conditionStr)

    },
    updateData: function() {
        var list = this.find("DAMaster").getDayRankListData()
        for (var key in this.itemList) {
            var element = this.itemList[Number(key)];
            for (var j = 0; j < list.length; j++) {
                if (list[j].rank == Number(key)) {
                    element.initWiew(list[j])
                }
            }
        }
    },
    createRankItems: function(list) {
        this.listview_items.removeAllChildren()
        var curRank  = "1"
        this.itemList = {}
        this.getScene().setGameObjectRoot(this.listview_items)
        for (var key = 0; key < 6; key++) {
            list[key].rankDes = curRank + "-" + list[key].rank 
            curRank = list[key].rank + 1
            var item = this.createUnnamedObject("UIMasterRankItem", list[key])
            this.itemList[list[key].rank] = item
        }
        this.getScene().setGameObjectRoot(null)
    },

    click_btn_enter: function() {
        if (this.btnState == 5) {
            this.toast(wls.Config.getLanguage(800000481))
            return 
        } else if (this.btnState == 4) {
            this.pushView("UIAddJoinCountShare",this.find("DAMaster").getShareData())
            return 
        }

        //进入大师赛
        this.sendMsg("sendJoinMasterGame")
    },
    click_btn_task: function() {
        this.sendMsg("sendGetAllTaskInfo")
        this.pushView("UIHallMasterTask")
    },
    click_btn_rule: function() {
        this.pushView("UIHallMasterRule", this.idstr)
    },
    click_btn_famous: function() {
        this.sendMsg("sendMasterGetRanking",2)
    },
    click_btn_rank: function() {
        var go = this.find("DAMaster")
        var list = go.getDayRankListData()
        var state = go.getMasterStatus()
        var newList = []
        for (var i = 0; i < 50; i++) {
            if (!list[i]) { break }
            var element = list[i];
            var tb = {}
            tb.rank = element.rank
            tb.name = element.nickName
            tb.score = element.score
            tb.prop = go.getRankAwardByRank(element.rank)
            newList.push(tb)
        }
        this.pushView("UIMatchRank", {rank:state.rank, maxScore:state.score, list:newList})
    },
    
    click_btn_close: function() {
        this.removeFromScene()
    },
  
})