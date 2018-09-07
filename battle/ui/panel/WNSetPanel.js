//-----------------------------------------------------
// 左边设置按钮集
//-----------------------------------------------------
wls.namespace.WNSetPanel = wls.WrapNode.extend
({
    onCreate: function()
    {
        wls.BindUI(this, this);
        //this.setPosition(this.x, display.height / 2);
        this.isOpen = true;
        // this.openX = this.x;
        // this.closeX = this.x + this.image_bg.getContentSize().width;
        this.btn_openlist.setVisible(false);
    },

    onEventTouchEnded: function()
    {
        if (!this.bStartListen) {return;}
        this.bStartListen = false;
        this.close();
    },

    click_btn_exit: function()
    {
        this.getScene().doExit();
    },

    click_btn_openlist: function()
    {
        this.open();
    },

    click_btn_hide: function()
    {
        this.close();
    },

    click_btn_sound: function()
    {
        this.pushView("UISetting");
        //this.close();
    },

    click_btn_pokedex: function()
    {
        this.pushView("UIHandBook");
        //this.close();
    },

    click_btn_swallowTouches: function()
    {
    },

    openTouchBegan: function()
    {
        this.bStartListen = true;
    },

    open: function()
    {
        this.openTouchBegan();
        this.show(true,true)
    },

    close: function()
    {
        this.show(false,true)
    },
    show: function(bVisible,isAct)
    {
        if (this.bOpen == bVisible) { return }
        this.bOpen = bVisible
        this.getScene().uiShowAct(this.image_bg,this.btn_openlist,bVisible,isAct)
    },
});