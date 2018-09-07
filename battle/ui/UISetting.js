// 设置界面
wls.namespace.UISetting = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadStudioNode(this.fullPath("common/ui/uisoundset.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        this.adaptClose(this.btn_close)

        var go = this.find("SCSound");
        this.switchMusic(go.bMusic);
        this.switchEffect(go.bEffect);
    },

    click_btn_close: function()
    {
        this.setVisible(false);
    },

    click_btn_music_close: function()
    {
        this.find("SCSound").bMusic = true;
        this.switchMusic(true);
        this.find("SCSound").resumeMusic();
        this.find("SCSound").save();
    },

    click_btn_music_open: function()
    {
        this.find("SCSound").bMusic = false;
        this.switchMusic(false);
        this.find("SCSound").stopMusic();
        this.find("SCSound").save();
    },

    click_btn_effect_close: function()
    {
        this.find("SCSound").bEffect = true;
        this.switchEffect(true);
        this.find("SCSound").save();
    },

    click_btn_effect_open: function()
    {
        this.find("SCSound").bEffect = false;
        this.find("SCSound").stopAllEffect();
        this.switchEffect(false);
        this.find("SCSound").save();
    },

    switchMusic: function(bOpen)
    {
        this.btn_music_close.setVisible(!bOpen)
        this.btn_music_open.setVisible(bOpen)
    },

    switchEffect: function(bOpen)
    {
        this.btn_effect_close.setVisible(!bOpen)
        this.btn_effect_open.setVisible(bOpen)
    },
});