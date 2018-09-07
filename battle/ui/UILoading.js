// 加载界面
wls.namespace.UILoading = cc.Layer.extend
({
    getZorder:function () {
        return wls.ZOrder.Loading
    },
    onCreate: function()
    {
        //this.setLocalZOrder(200);
        var ccnode = wls.LoadStudioNode(this.fullPath("common/ui/uiLoadingLayer.json"), this);
        this.addChild(ccnode);
        this.Node_4.setPosition(display.width / 2, display.height / 2);
        this.text_message.setString("");
        this.img_bg.setScale(wls.MainScale);
        this.mLoadRes = [];
        this.idx = 0;
        this.sliderScale = this.slider_loading.getScale();

        this.updatePercent(0);
        this.calcLoadRes();
        this.updateTips();
        this.startTimer("updateLoad", 0.01, 101, -1);
        this.startTimer("updateTips", 1.5, 102, -1);
        wls.PlayTimelineAction(this.node_ani, "act", true);
    },

    calcLoadRes: function()
    {
        var fishIds = ["fish_boss", "fish_shark", "fish_small", "fish_whale"];
        for (var i = 0; i < fishIds.length; i++)
        {
            this.addPlist("plist/fish/" + fishIds[i]);
        }
        this.addPlist("plist/fish/fish_com");
        this.addPlist("plist/nets/net_all");
        this.addPlist("plist/bullet");
        this.addPlist("plist/game_fiscoin");
        this.addPlist("battle/images/blast");
        this.addPlist("battle/images/bomb");
        this.addPlist("battle/images/combo");
        this.addPlist("battle/images/nuclear");
        this.addPlist("battle/images/magicprop_ani");
        
        //加载没有提前加载的plist
        wls.LoadStudioNode(this.fullPath("common/ui/uicompic.json"));
        
    },

    updateLoad: function()
    {
        if (this.idx >= this.mLoadRes.length)
        {
            this.stopTimer(101);
            this.gotoNextState();
            return;
        }
        if (this.mLoadRes[this.idx].type == 1)
        {
            this.loadPlist(this.mLoadRes[this.idx].filename);
        }
        this.idx++;
        this.updatePercent(this.idx / this.mLoadRes.length * 100);
    },

    updatePercent: function(per)
    {
        var self = this;
        self.slider_loading.setPercent(per)
        var scaleY = self.sliderScale
        var scaleDis = 3

        if (per > 100-scaleDis)
        {
            scaleY = (100 - per)/scaleDis*scaleY
        }
        if (per <= scaleDis)
        {
            scaleY = per/scaleDis*scaleY
        }
        
        this.text_per.setString(Math.ceil(per)+"%")
    },

    // 更新提示
    updateTips: function()
    {
        var id = Math.floor(Math.random() * 9);
        var str = wls.Config.getLanguage(800000059 + id);
        this.text_message.setString(str);
    },

    addPlist: function(filename)
    {
        filename = this.fullPath(filename + ".plist");
        var unit = {}
        unit.type = 1;
        unit.filename = wls.CheckPath(filename);
        this.mLoadRes.push(unit);
    },

    loadPlist: function(filename)
    {
        cc.spriteFrameCache.addSpriteFrames(filename);
    },
});