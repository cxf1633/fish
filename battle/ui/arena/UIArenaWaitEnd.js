//-----------------------------------------------------
// 8人免费场游戏内等待结束
//-----------------------------------------------------
wls.namespace.UIArenaWaitEnd = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Normal
    },
    onCreate: function()
    {
        var mask = wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("battle/arena/uiarenawaitend.json"), this);
        this.addChild(ccnode);
        mask.setOpacity(0)
        this.sizeBg = this.img_bg.getContentSize()
        ccnode.setPosition(display.width/2, display.height/2);
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