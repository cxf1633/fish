//-----------------------------------------------------
// 免费鱼币
//-----------------------------------------------------
wls.namespace.WNFreeCoin = wls.WrapNode.extend
({
    onCreate: function()
    {
        wls.BindUI(this, this);
        this.id = 0;
        this.setScale(wls.MinScale)
        
        this.spr_light.setVisible(false)

        var filename = this.fullPath("battle/images/gunupgrade/bl_btn_mfyb.png");
        cc.log(filename);
        this.btn_bg.loadTextures(filename, filename, filename, 1);
        var itemSize = cc.size(this.btn_bg.getContentSize().width, this.btn_bg.getContentSize().height)

        //小红点
        // var dot = ccui.ImageView.create() 
        // dot.loadTexture(this.fullPath("hall/images/hall_pic_dot.png"), 1)
        // dot.setPosition(itemSize.width*0.85, itemSize.height*0.8)
        // dot.setName("red_point")
        // this.btn_bg.addChild(dot)
        // this.btn_bg.getChildByName("red_point").setVisible(false)

        this.updateFreeCoin()
        this.setVisible(FG.RoomConfig.ENABLE_FREEMONEY)
    },

    updateFreeCoin: function()
    {
        var configs = wls.Config.getConfig("990000131").split(";")
        for (var i = 0; i < configs.length; i++) {
            var id = configs[i];
            var info = this.find("DAPlayer").getFreeFishCoinInfo(id)
            var configCount = parseInt(wls.Config.get("share", 9).awardnum)
            if (!info.isReceive && (id!=6||id!=7)) {
                this.isShowEff(true);
                return
            }
            else if ((6==id && info.receiveCount<configCount) || (7==id && this.find("DAPlayer").getLoginDrawTimes()>0)) {
                this.find("MainBtns").setBtnState("btn_mfyb", true);
                return
            }
        }
        this.isShowEff(false);
    },

    click_btn_bg: function()
    {
        this.pushView("UIFreeCoin")
    },

    isShowEff: function(isShow)
    {
        if (isShow) {
            //wls.PlayTimelineAction(this, "jump", true)
            this.spr_light.runAction(cc.RepeatForever.create(cc.RotateBy.create(1, 60)))
        } else {
            //wls.PlayTimelineAction(this, "nojump", true)
            this.spr_light.stopAllActions()
            
        }
        this.spr_light.setVisible(isShow)
        //this.btn_bg.getChildByName("red_point").setVisible(isShow)
    },
   
});