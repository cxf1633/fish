//-----------------------------------------------------
// 鱼被捕获表现特效
//-----------------------------------------------------
wls.namespace.EFFishCatched = wls.WrapNode.extend
({
    onCreate: function()
    {

    },

    // 爆炸
    playBlastEff: function(delay, pos)
    {
        var eff = cc.Sprite.create();
        this.addChild(eff);
        eff.setPosition(pos);
        eff.setScale(1.5);
        var filename = this.fullPath("battle/images/effect/blast1");
        var animation = FG.CreateAnimation(filename, 1 / 15.0);
        var act = cc.sequence(cc.delayTime(delay), cc.animate(animation), cc.removeSelf());
        eff.runAction(act);
    },

    // 爆金币
    playBlastCoinEff: function(delay, pos)
    {
        var eff = cc.Sprite.create();
        this.addChild(eff);
        eff.setPosition(pos);
        eff.setScale(1.5);
        var filename = this.fullPath("battle/images/effect/blast2");
        var animation = FG.CreateAnimation(filename, 1 / 15.0);
        var act = cc.sequence(cc.delayTime(delay), cc.animate(animation), cc.removeSelf());
        eff.runAction(act);
    },

    // 爆光圈
    playBlastCircleEff: function(delay, pos)
    {
        var eff = cc.Sprite.create();
        var frameName = this.fullPath("battle/images/effect/blast3.png");
        var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameName)
        eff.initWithSpriteFrame(spriteFrame)
        this.addChild(eff);
        eff.setScale(2);
        eff.setOpacity(255 * 0.3);
        eff.setPosition(pos);

        eff.runAction(cc.scaleTo(1.5, 12))
        eff.runAction(cc.fadeTo(0.05, 255));
        var act = cc.sequence(cc.delayTime(delay), cc.fadeTo(0.3, 0), cc.removeSelf());
        eff.runAction(act);
    },

    shake: function(p1, p2)
    {
        this.find("UIBackGround").shake(p1, p2);
    },

    playSound: function(config)
    {
        if (config.music_res != "0" && Math.random() * 100 < parseInt(config.music_rate))
        {
            FG.PlayEffect(config.music_res);
        }
        var t = parseInt(config.trace_type);
        if (t == 7)
        {
            FG.PlayEffect("lightning_01.mp3");
        }
        else if(t == 8)
        {
            FG.PlayEffect("capture_01.mp3");
        }
        else if (t == 6)
        {
            FG.PlayEffect("bomb_01.mp3");
        }
        else if (t >= 3)
        {
            FG.PlayEffect("capture_01.mp3");
        }
    },

    // 播放捕到鱼效果
    play: function(fish, viewid, score, fishScore)
    {
        var pos = fish.getPosition();
        if (fish.config.trace_type == 7)
        {
            this.find("EFLighting").startLighting(pos);
        }
        else
        {
            this.find("EFLighting").addLighting(pos);
        }
        fish.onCatched();
        this.playSound(fish.config);
        score > 0 ? this.find("EFCoins").playFishDropOut(pos, fish.config.coin_num, viewid, score, fishScore):0
        var funname = "display" + fish.config.death_effect;
        if (this[funname])
        {
            this[funname](fish);
        }
        else
        {
            cc.error("无效的死亡特效" + fish.config.death_effect);
            fish.removeFromScreen();
        }
    },

    display1: function(fish)
    {
        var callback = function()
        {
            fish.setActionSpeed(1.0);
            fish.removeFromScreen();
        };
        fish.setActionSpeed(2.0);
        fish.runAction(cc.sequence(cc.delayTime(0.7), cc.callFunc(callback)));
    },

    display2: function(fish)
    {
        this.playBlastEff(0, fish.getPosition());
        var callback = function()
        {
            fish.setActionSpeed(1.0);
            fish.removeFromScreen();
        };
        fish.setActionSpeed(0.0);
        fish.runAction(cc.sequence(cc.scaleBy(0.1, 1.5), cc.rotateBy(2.0, 360 * 4), cc.callFunc(callback)));
    },

    display3: function(fish)
    {
        this.playBlastEff(0, fish.getPosition());
        this.playBlastCoinEff(0.2, fish.getPosition());
        var callback = function()
        {
            fish.setActionSpeed(1.0);
            fish.removeFromScreen();
        };
        fish.setActionSpeed(0.0);
        fish.runAction(cc.sequence(cc.scaleBy(0.1, 1.5), cc.rotateBy(2.0, 360 * 4), cc.callFunc(callback)));
    },

    display4: function(fish)
    {
        this.shake(1 / 15, 20);
        var pos = fish.getPosition();
        this.playBlastEff(0, pos);
        this.playBlastCoinEff(0.2, pos);
        this.playBlastCircleEff(0.2, pos);
        var callback = function()
        {
            fish.setActionSpeed(1.0);
            fish.removeFromScreen();
        };
        fish.setActionSpeed(0.0);
        fish.runAction(cc.sequence(cc.scaleBy(0.1, 1.5), cc.rotateBy(1.1, 360 * 3), cc.callFunc(callback)));
    
    },

    display5: function(fish)
    {
        this.shake(1 / 15, 20);
        var pos = fish.getPosition();
        this.playBlastEff(0, pos);
        this.playBlastCoinEff(0.2, pos);
        this.playBlastCircleEff(0.2, pos);
        var callback = function()
        {
            fish.setActionSpeed(1.0);
            fish.removeFromScreen();
        };
        fish.setActionSpeed(2.0);
        fish.runAction(cc.sequence(cc.delayTime(0.7), cc.callFunc(callback)));
    
    },

    display6: function(fish)
    {
        this.shake(1 / 15, 20);
        var pos = fish.getPosition();
        this.playBlastEff(0, pos);
        this.playBlastCoinEff(0.2, pos);
        this.playBlastCircleEff(0.2, pos);
        fish.removeFromScreen();
    },

    display7: function(fish)
    {
        var callback = function()
        {
            fish.setActionSpeed(1.0);
            fish.removeFromScreen();
        };
        fish.setActionSpeed(0.0);
        fish.runAction(cc.sequence(cc.scaleBy(0.1, 1.5), cc.rotateBy(1.1, 360 * 4), cc.callFunc(callback)));
    },
});