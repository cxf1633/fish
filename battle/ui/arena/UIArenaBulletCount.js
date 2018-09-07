//-----------------------------------------------------
// 8人免费场游戏内自己的子弹进度 --------------------
wls.namespace.UIArenaBulletCount = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Normal
    },
    onCreate: function()
    {
        var ccnode = wls.LoadPopupView(this.fullPath("battle/arena/uiarenabulletcount.json"), this);
        this.addChild(ccnode);
        this.initView()
        this.maxBulletNum = 1000
    },

    initView: function()
    {
        var p = new cc.ProgressTimer(this.spr_light);
        p.type = cc.ProgressTimer.TYPE_RADIAL;
        this.spr_light.getParent().addChild(p,98);
        p.setPercentage(100);
        p.setPosition(this.spr_light.getPosition());
        p.setVisible(true);
        this.spr_light.setVisible(false);
        p.setReverseDirection(true)
        this.bar = p

    },

    updateBulletNum: function(num) {
        this.maxBulletNum = num
    },

    updateView: function(viewid,curCount,allCount)
    {
        allCount = allCount || this.maxBulletNum
        if (this.viewid == null ) {
            this.setPosition((viewid == 1?110*wls.ScaleX:display.width - 110*wls.ScaleX),146*wls.ScaleY)
            this.viewid = viewid
        }
        var per = curCount/allCount*100
        this.bar.setPercentage(per)
        if (per <= 30) {
            this.bar.setColor(cc.c3b(255,0,0))
        } else if (per <= 60) {
            this.bar.setColor(cc.c3b(255,168,0))
        } else {
            this.bar.setColor(cc.c3b(0,255,0))
        }
        this.fnt_count.setString(curCount)

        if (curCount <= 0) { this.getScene().countOver() }
    },

    


});