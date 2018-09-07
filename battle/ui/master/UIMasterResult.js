//-----------------------------------------------------
// 大师赛游戏内结算界面
//-----------------------------------------------------
wls.namespace.UIMasterResult = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.limitPop+1
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("battle/master/uimasterresult.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width/2, display.height/2);

        //提示中文
        this.txt_notice.setString(wls.Config.getLanguage(800000476))

        //花费 是否有免费次数
        var btnState = this.getScene().getMatchjoinState()
        this.fnt_cost_count.setVisible(btnState != 0)
        this.spr_cost_prop.setVisible(btnState != 0)
        if (btnState == 3) {
            this.btn_again.setVisible(false)
            this.btn_sure.setPositionX(0)
        }

        var self = this
        var seq = cc.Sequence.create(cc.DelayTime.create(30),cc.CallFunc.create(function () {
            self.click_btn_sure()
        }))
        this.runAction(seq)
    },


    updateView: function(curRank,curScore,maxScore,roomId)
    {
        this.roomId = roomId
        this.fnt_cur_rank.setString(curRank)
        this.fnt_cur_rank.setVisible(curRank > 0)
        this.spr_no_order.setVisible(curRank <= 0)
        this.fnt_cur_score.setString(curScore)
        this.fnt_max_score.setString(maxScore)

        var data = wls.Config.getMatchData(roomId)
        var costTb = wls.SplitArray(data.cost)
        var itemData = wls.Config.getItemData(parseInt(costTb[0]))
        this.spr_cost_prop.setSpriteFrame(this.fullPath("common/images/prop/"+itemData.res))
        this.fnt_cost_count.setString(costTb[1])

        var titleFile = "battle/images/compic/result_title_" + roomId + ".png"
        this.spr_title.setSpriteFrame(this.fullPath(titleFile))

    },   

    click_btn_sure: function()
    {
        this.getScene().leaveRoom()
    },

    click_btn_again: function()
    {
        if (this.roomId == 500002000 ) {
            this.find("SCSend").sendJoinMasterGame()
        } else {
            this.find("SCSend").sendSignUpFreeMatch(this.roomId)
        }
    },

});