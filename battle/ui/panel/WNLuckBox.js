//-----------------------------------------------------
// 幸运保箱
//-----------------------------------------------------
wls.namespace.WNLuckBox = wls.WrapNode.extend
({
    onCreate: function()
    {
        wls.BindUI(this, this);
        this.id = 0;
        //this.setPosition(display.width - 165, display.height - 133);
        this.spr_light.runAction(cc.repeatForever(cc.rotateBy(1, 60)));
        this.setVisible(false);
        this.setScale(wls.MinScale)
        this.setVisible(FG.RoomConfig.ENABLE_GIFT);
    },

    onEventUpdateBox: function() {
        this.updateBox();
    },

    updateBox: function() 
    {
        if (!FG.RoomConfig.ENABLE_GIFT) {return 0}
        var id = this.find("DAPlayer").calcBoxID();
        this.id = id;
        if (this.id <= 0) {
            this.setVisible(false)
            this.btn_bg.stopActionByTag(3131)
            this.find("WNShop").isShowLight(true)
            return 
        }
        this.find("WNShop").isShowLight(false)
        this.setVisible(true);
        var config = wls.Config.get("gif", id);
        var tConfig = this.find("DAPlayer").getTypeConfig(config.type);
        var filename = this.fullPath("battle/images/box/" + tConfig.icon);
        cc.log(filename);
        this.btn_bg.loadTextures(filename, filename, filename, 1);
        this.btn_bg.stopActionByTag(3131)
        if (id == 830001024 || id == 830001025) {
            var self = this
            var time = self.find("DAPlayer").luckBoxEndTime - (wls.GetCurTimeFrame() + wls.serverTimeDis)
            var seq = cc.Sequence.create(cc.DelayTime.create(time),cc.CallFunc.create(function () {
                self.updateBox();
            }))
            seq.setTag(3131)
            this.btn_bg.runAction(seq)
        }
    },

    click_btn_bg: function()
    {
        this.find("SCLayerMgr").setCurShowList(7,{shareType:"UIRechargeShare",boxId:this.id})  
    },
});