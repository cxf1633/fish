//-----------------------------------------------------
// 救济金
//-----------------------------------------------------
wls.namespace.EFAlminfo = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.limitPop-1
    },
    onCreate: function()
    {
        var ccnode = wls.LoadStudioNode(this.fullPath("battle/uialminfo.json"), this);
        this.addChild(ccnode);

        // this.text_word_white.ignoreContentAdaptWithSize(true)
        // this.text_word_yellow.ignoreContentAdaptWithSize(true)
        this.bgHeight = this.btn_bg.getContentSize().height
        this.lightWidth = this.spr_light.getContentSize().height
        this.overDis = 20
        this.inner_action.play("gold",true)
        this.spr_light.runAction(cc.RepeatForever.create(cc.RotateBy.create(1,60)))
    },

    initView: function(viewid,resp)
    {
        this.leftCount = resp.leftCount
        this.curTime = resp.cd
        this.totalCount = resp.totalCount
        
        var pos = this.find("GOCannon" + viewid).getPosition()
        this.setPosition(0,200)

        if (this.leftCount <= 0) {
            this.setViewState(3)
        } else if (this.curTime > 0 ) {
            this.setViewState(1)
            this.startTime()
        } else {
            this.setViewState(2)
        }
    },

    setViewState: function(state)
    {
        this.hideAllNode()
        var bgSize = this.btn_bg.getContentSize()
        this.showState = state
        if (state == 3) {//不可领取，没次数
            this.node_box.setVisible(true)
            var str = wls.Config.getLanguage(800000074)
            this.text_word_white.setString(wls.Config.getLanguage(800000074))
            this.text_word_white.setVisible(true)
        } else if (state == 2) {//可领取，剩余次数
            this.btn_bg.setTouchEnabled(true)
            this.text_word_yellow.setVisible(true)
            var str = wls.Config.getLanguage(800000073)+"("+this.leftCount+"/"+this.totalCount+")"
            this.text_word_yellow.setString(str)
        } else if (state == 1) {//不可领取，冷却时间
            this.node_box.setVisible(true)
            this.text_word_white.setVisible(true)
            this.text_word_yellow.setVisible(true)
            this.text_word_white.setString( wls.Config.getLanguage(800000072))
            this.text_word_yellow.setString("00:00:00")
        }
        bgSize.width = 0
        bgSize.width = bgSize.width + (this.node_box.isVisible()?this.lightWidth/2:0)
        bgSize.width = bgSize.width + (this.text_word_white.isVisible()?this.text_word_white.getContentSize().width:0)
        bgSize.width = bgSize.width + (this.text_word_yellow.isVisible()?this.text_word_yellow.getContentSize().width:0)
        bgSize.width = bgSize.width + this.overDis*2
        
        this.btn_bg.setContentSize(bgSize)

        var posX = -bgSize.width /2
        posX = posX + this.overDis
        if (this.node_box.isVisible()) {
            this.node_box.setPositionX(posX)
            posX = posX + this.lightWidth/2
        }
        if (this.text_word_white.isVisible()) {
            this.text_word_white.setPositionX(posX + this.text_word_white.getContentSize().width/2)
            posX = posX + this.text_word_white.getContentSize().width
        }
        if (this.text_word_yellow.isVisible()) {
            this.text_word_yellow.setPositionX(posX + this.text_word_yellow.getContentSize().width/2)
            posX = posX + this.text_word_yellow.getContentSize().width
        }
    },

    hideAllNode: function () {
        this.btn_bg.setTouchEnabled(false)
        this.node_box.setVisible(false)
        this.text_word_white.setVisible(false)
        this.text_word_yellow.setVisible(false)     
    },
    startTime: function () {
        if (this.curTime <= 0) { this.stopTime(); return }
        var self = this
        var seq = cc.Sequence.create(cc.CallFunc.create(function () { self.updateTime()}),cc.DelayTime.create(1))
        var rep = cc.RepeatForever.create(seq)
        this.stopActionByTag(10122)
        rep.setTag(10122)
        this.runAction(rep)
    },
    stopTime: function () {
        this.setViewState(2)
        this.stopActionByTag(10122)
    },
    updateTime: function () {
        if (this.curTime <= 0) { this.stopTime(); return }
        this.curTime = this.curTime -1
        var timeStr = wls.getFormatTimeBySeconds(this.curTime)
        this.text_word_yellow.setString(timeStr)
    },


    click_btn_bg: function()
    {
        cc.log("--------click_btn_bg------------")
        if (this.curTime <= 0 && this.showState == 2) { FG.SendMsg("sendApplyAlm"); }
    },

    click_btn_toshop: function()
    {
        cc.log("--------click_btn_toshop------------")
        var share = wls.Switchs.share
        if (this.leftCount < this.totalCount || !wls.Switchs.share) {
            this.find("SCLayerMgr").setCurShowList(2)
            return 
        }

        //分享t
        this.pushView("UIBankruptcyShare", {"func":function(){
            this.curTime = 0
        }.bind(this)})
    },

});