// 主界面panel
wls.namespace.UIMainPanel = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Normal
    },
    onCreate: function()
    {
        var ccnode = wls.LoadStudioNode(this.fullPath("battle/MainPanel.json"));
        this.addChild(ccnode);
        this.ccnode = ccnode;
        for (var i = 0; i < ccnode.childrenCount; i++)
        {
            var obj = ccnode.children[i];
            var name = obj.getName();
            this[name] = obj;
        }
        this.getScene().setGameObjectRoot(this.Node_Cannon);
        for (var i = 1; i <= 4; i++)
        {
            this.initInvite(i);
            this.getScene().createNamedObject("GOCannon", "GOCannon" + i, i);
        }
        this.getScene().setGameObjectRoot(null);

        //内网开启秘籍
        this.Node_GameSecrect.setVisible(wls.EnableDebug);
        
        // panel
        this.wrapGameObject(this.Set_Right, "WNSetPanel");
        this.wrapGameObject(this.Node_Jackpot, "WNJackpotPanel");
        this.wrapGameObject(this.Node_Lvlup_Gun, "WNGunUpgrade");
        this.wrapGameObject(this.Node_Skill, "UISkillPanel");
        this.wrapGameObject(this.Node_Gun_Change, "WNSelfCannonMenu");
        this.wrapGameObject(this.Node_Luckbox, "WNLuckBox");
        this.wrapGameObject(this.Node_Tips, "WNSelfChairTips");
        this.wrapGameObject(this.Node_Emoji, "WNEmojiPanel");
        this.wrapGameObject(this.Node_Player_Info, "WNPlayerInfoPanel");
        this.wrapGameObject(this.Node_Task, "WNNewBieTask");
        this.wrapGameObject(this.Node_DisplayEmoji, "WNEmojiDisplay");
        this.wrapGameObject(this.Node_Shop, "WNShop");
        this.wrapGameObject(this.Node_GameSecrect, "WNSecrect");
        this.wrapGameObject(this.Node_freeCoin, "WNFreeCoin");
        this.wrapGameObject(this.Node_BonusPool, "WNBonusPool");

        // 特效层
        this.wrapGameObject(this.Node_BossCome, "EFBossComing");
        this.wrapGameObject(this.Node_GroupCome, "EFGroupComing");

        this.wrapGameObject(FG.EffectRoot_1, "EFFishCatched");
        this.wrapGameObject(this.Node_BonusWheel1, "EFBonusWheel", 1).rename("EFBonusWheel1");
        this.wrapGameObject(this.Node_BonusWheel2, "EFBonusWheel", 2).rename("EFBonusWheel2");
        this.wrapGameObject(this.Node_BonusWheel3, "EFBonusWheel", 3).rename("EFBonusWheel3");
        this.wrapGameObject(this.Node_BonusWheel4, "EFBonusWheel", 4).rename("EFBonusWheel4");
        this.wrapGameObject(this.Node_Coins, "EFCoins");
        this.wrapGameObject(this.Node_Items, "EFItems");
        this.wrapGameObject(this.Node_Lighting, "EFLighting");
        this.wrapGameObject(this.Node_Labels, "EFLabels");
        this.wrapGameObject(this.Node_MagicProp,"EFMagicProp")

        // 弹窗特效
        this.wrapGameObject(this.Node_LevelUp, "EFLevelUp");
        this.wrapGameObject(this.Node_Windfall, "EFWindfall");
        this.wrapGameObject(this.Node_Megawin, "EFMegawin");
        this.wrapGameObject(this.Node_Bounswin, "EFBonuswin");
        
        this.initViewPos()
    },
    
    initViewPos: function(key) {
        this.Node_Shop.y = this.Node_Shop.getPositionY()*wls.ScaleY//display.height - 130;
        this.Node_Luckbox.y = this.Node_Luckbox.getPositionY()*wls.ScaleY//display.height - 260;
        this.Node_Lvlup_Gun.y = this.Node_Lvlup_Gun.getPositionY()*wls.ScaleY
        this.Node_Jackpot.y = this.Node_Jackpot.getPositionY()*wls.ScaleY
        this.Node_GameSecrect.y = this.Node_GameSecrect.getPositionY()*wls.ScaleY
        this.Set_Right.y = this.Set_Right.getPositionY()*wls.ScaleY
        this.Node_freeCoin.y = this.Node_freeCoin.getPositionY()*wls.ScaleY
        this.Node_BonusPool.y = this.Node_BonusPool.getPositionY()*wls.ScaleY

        var off = display.width == 1280? 0:wls.OffsetX
        this.Node_Shop.x = display.width - off - 85;
        this.Node_Luckbox.x = display.width - off - 85;
        this.Node_freeCoin.x = display.width - off - 85;
        this.Set_Right.x = display.width - off - 85
        this.Node_BonusPool.x = display.width - off - 85

    },

	initInvite: function(key) {
        var nodePos = this.Node_Invite.convertToNodeSpace(cc.p(FG.AimPosList[key-1]))
        var act = cc.repeatForever(cc.sequence(cc.fadeTo(0.8, 0.2 * 255), cc.delayTime(0.2), cc.fadeTo(0.8, 255)));
        var btn = this.Node_Invite.getChildByName("btn_invite_"+key)
        btn.runAction(act);
        btn.setPosition(nodePos)
        wls.OnClicked(btn, this, "btn_invite")
    },

    showInviteBtn: function(viewid, isVisible) {
        this.Node_Invite.getChildByName("btn_invite_"+viewid).setVisible(isVisible)
    },

    click_btn_invite: function() {
        this.pushView("UIFreeCoinShare", 170);
    },
    setTitleIsShow: function(isShow) {
        if (this.title) {
            this.title.setVisible(isShow)
        }
    },

});

//-----------------------------------------------------
// 秘籍
//-----------------------------------------------------
wls.namespace.WNSecrect = wls.WrapNode.extend
({
    onCreate: function()
    {
        wls.BindUI(this, this);
    },

    click_btn_gameSecrect: function()
    {
        this.find("UITestPanel").setVisible(true);
    },
});