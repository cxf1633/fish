// 背景界面
wls.namespace.UIBackGround = cc.Layer.extend
({
    getZorder:function () {
        return wls.ZOrder.Normal
    },
    onCreate: function()
    {
        this.config = wls.Config.get("room", wls.RoomIdx + 910000000);
        this.bgs = wls.SplitArray(this.config.bg_img);
        this.index = 0;
        this.bg = this.createBG(this.bgs[0]);
        this.initLayer();
        this.addBubble(display.width * 0.2, display.height * 0.2)
        this.addBubble(display.width * 0.8, display.height * 0.3)
        this.addBubble(display.width * 0.5, display.height * 0.7)
        //this.initJoinTips();
    },

    createBG: function(filename, opacityCnt)
    {
        var bg = new ccui.ImageView();
        if(opacityCnt != undefined){
            bg.setOpacity(opacityCnt);
        }
        bg.setPosition(display.width / 2, display.height / 2);
        bg.setScale(wls.MainScale * 1.05);
        var list = [];
        var f = this.fullPath("bg/" + filename);
        list.push(f);
        var self = this;
        Loader.load(list, function() {
            bg.loadTexture(wls.CheckPath(f), 0);
            self.addChild(bg, -1);
        }, false);
        return bg;
    },

    initLayer: function()
    {
        FG.FishRoot = cc.Node.create();
        this.addChild(FG.FishRoot);

        FG.BulletRoot = cc.Node.create();
        this.addChild(FG.BulletRoot);

        FG.NetRoot = cc.Node.create();
        this.addChild(FG.NetRoot);

        FG.FishTimelineRoot = cc.Node.create();
        this.addChild(FG.FishTimelineRoot);
        FG.FishTimelineRoot.setVisible(false);

        FG.SkillRoot = cc.Node.create();
        this.addChild(FG.SkillRoot);

        FG.EffectRoot_1 = cc.Node.create();
        this.addChild(FG.EffectRoot_1);
    },

    // 请等待提示
    initJoinTips: function()
    {
        this.waitList = [];
        for (var i = 0; i < 4; i++)
        {
            var sp = cc.Sprite.create();
            sp.setSpriteFrame(this.fullPath("battle/images/battleUI/bl_pic_ddjr.png"))
            this.addChild(sp);
            var act = cc.repeatForever(cc.sequence(cc.fadeTo(0.8, 0), cc.delayTime(0.2), cc.fadeTo(0.8, 255)));
            sp.runAction(act);
            sp.setPosition(FG.AimPosList[i]);
            this.waitList[i] = sp;
        }
    },

    showWaiting: function(viewid, bVisible)
    {
        this.find("UIMainPanel").showInviteBtn(viewid, bVisible)
    },

    onEventPlayerLeave: function(viewid)
    {
        if (this.find("WNPlayerInfoPanel").viewid == viewid){this.find("WNPlayerInfoPanel").close()};
        this.showWaiting(viewid, true);
    },

    readyBG:function(){
        if (this.bgs.length < 2) return;
        this.index += 1;
        if(this.index >= this.bgs.length)
        {
            this.index = 0;
        }
        var filename = this.bgs[this.index];
        if(filename){
            this.nextBG = this.createBG(filename, 0);
        }
        else{
            cc.log("filename =", filename);
        }
    },
    changeBG: function()
    {
        var oldBG = this.bg;
        this.bg = this.nextBG;
        oldBG.runAction(cc.sequence(cc.fadeOut(1), cc.removeSelf()));
        this.bg.runAction(cc.sequence(cc.delayTime(0.2), cc.fadeIn(0.5)));
    },

    shake: function(interval, times)
    {
        this.stopActionByTag(111);
        this.setPosition(0, 0);
        var pos = cc.p(0, 0);
        var self = this;
        var move = function() {
            times = times - 1;
            self.stopActionByTag(112);
            self.setPosition(pos);
            var offset = 30 / 20 * times;
            var tarPos = cc.p(wls.Range(-offset, offset), wls.Range(-offset, offset));
            var m1 = cc.moveBy(interval / 2, tarPos);
            var m2 = m1.reverse();
            var act = cc.repeatForever(cc.sequence(m1, m2));
            act.setTag(112);
            self.runAction(act);
        };
        var act = cc.repeat(cc.sequence(cc.callFunc(move), cc.delayTime(interval)), times);
        act.setTag(111);
        this.runAction(act);
    },

    addBubble: function(x, y)
    {
        if (wls.IsMiniProgrom()) return;
        var emitter = cc.ParticleSystem.create(this.fullPath("common/particle/effect_paopao_01.plist"))  
        this.addChild(emitter)
        emitter.setPosition(x, y)
    },
})