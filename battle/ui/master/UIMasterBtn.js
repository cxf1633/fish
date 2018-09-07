//-----------------------------------------------------
// 大师赛游戏内报名按键
//-----------------------------------------------------
wls.namespace.UIMasterBtn = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Normal
    },
    onCreate: function()
    {
        var ccnode = wls.LoadPopupView(this.fullPath("battle/uishop_countdown.json"), this);
        this.addChild(ccnode);
        var btn = this.find("UIMainPanel").Node_Luckbox
        ccnode.setPosition(btn.x, btn.y);
        ccnode.setScale(this.newScale)
        this.spr_light.runAction(cc.repeatForever(cc.rotateBy(1, 60)));

        var filename = this.fullPath("battle/images/compic/com_pic_jjc.png");
        this.btn_bg.loadTextures(filename, filename, filename, 1);

    },

    click_btn_bg: function()
    {
        this.pushView("UIHallMaster")
        this.find("SCSend").sendGetMasterStatus()
    },

});