//-----------------------------------------------------
// 8人免费场游戏内标题
//-----------------------------------------------------
wls.namespace.UIArenaTitle = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Normal
    },
    onCreate: function()
    {
        var ccnode = wls.LoadPopupView(this.fullPath("battle/arena/uiarenatitle.json"), this);
        this.addChild(ccnode);
        this.sizeBg = this.img_bg.getContentSize()
        ccnode.setPosition(display.width/2, display.height-this.sizeBg.height/2);
    },

    setTitlePicById: function(id)
    {
        var filename = ""
        if (id == 500001003) {
            filename = "battle/images/compic/title_yqs.png"
        } else if (id == 500001002) {
            filename = "battle/images/compic/title_sjs.png"
        } else if (id == 500001001) {
            filename = "battle/images/compic/title_8rmfc.png"
        }
        this.setTitlePic(filename)
    },

    setTitlePic: function(picPath)
    {
        var filename = this.fullPath(picPath);
        this.spr_title_name.setSpriteFrame(filename);
    },

    getEndTime: function() {
        return this.endTime
    },

    updateTime: function()
    {
        var curTimeFrane = wls.GetCurTimeFrame() + wls.serverTimeDis
        var leftTime = this.endTime - curTimeFrane
        if (leftTime < 0) { leftTime = 0 }
        var time = wls.strFormat(Math.floor(leftTime/60),2)+";" + wls.strFormat(leftTime%60,2)
        this.fnt_time.setString(time)
    },

    startTime: function(endTime)
    {
        this.endTime = endTime
        var self = this
        var seq = cc.Sequence.create(cc.CallFunc.create(function () {
            self.updateTime()
        }),cc.DelayTime.create(0.2))
        var rep = cc.RepeatForever.create(seq)
        rep.setTag(1010)
        this.stopActionByTag(1010)
        this.runAction(rep)
    },


});