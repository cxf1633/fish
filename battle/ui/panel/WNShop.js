//-----------------------------------------------------
// 捕鱼大厅商城
//-----------------------------------------------------
wls.namespace.WNShop = wls.WrapNode.extend
({
    onCreate: function()
    {
        wls.BindUI(this, this);
        this.id = 0;
        this.setScale(wls.MinScale)
        this.spr_light.runAction(cc.repeatForever(cc.rotateBy(1, 60)));
        this.setVisible(FG.RoomConfig.ENABLE_SHOP&& !FISH_DISABLE_CHARGE );
    },

    click_btn_bg: function()
    {
        var self = this;
        var callFun = function () {
            var showData = {}
            showData.shopType = 1
            var coin = self.find("DAPlayer").getMoney()
            if (coin >= 600000 && self.find("DAPlayer").getMaxGunRate() < 1000) {
                showData.shopType = 2
            }
            showData.shareType = "UIRechargeShare"
            self.find("SCLayerMgr").setCurShowList(5,showData)
        }
        if (!this.find("SKHourglass") || this.find("SKHourglass").rechargeCheck(callFun)) {
            callFun()
        }
    },

    isShowLight: function(isShow)
    {
        this.spr_light.setVisible(isShow)
    },
   
});