// 触摸层
wls.namespace.SCTouch = cc.Node.extend
({
    onCreate: function()
    {
        var layout = new ccui.Layout();
        this.addChild(layout);
        layout.setContentSize(display.width, display.height);
        layout.setTouchEnabled(false);
        layout.addTouchEventListener(this.touchEvent, this);
        this.layout = layout;
        this.bTimer = false;
        this.bStopTimer = false;
        this.mTouchTarget = null;
        this.mSkillList = ["SKBomb21","SKBomb22","SKBomb23","SKBomb15", "SKBomb6", "SKBomb16", "SKViolent", "SKLock"];
    },

    startTouch: function()
    {
        this.layout.setTouchEnabled(true);
    },

    touchEvent: function(sender, type)
    {
        switch (type) 
        {
            case ccui.Widget.TOUCH_BEGAN:
                this.post("onEventTouchEnded");
                this.calcEventTarget();
                this.dispathEvent("onTouchBegan", sender.getTouchBeganPosition())
                break

            case ccui.Widget.TOUCH_MOVED:
                this.dispathEvent("onTouchMoved", sender.getTouchMovePosition())
                break

            case ccui.Widget.TOUCH_ENDED:
            case ccui.Widget.TOUCH_CANCELED:
                this.dispathEvent("onTouchEnded", sender.getTouchEndPosition())
                break
        }
    },

    calcEventTarget: function()
    {
        var skill;
        for (var i = 0; i < this.mSkillList.length; i++)
        {
            skill = this.find(this.mSkillList[i]);
            if (skill && skill.isUsingSkill())
            {
                this.mTouchTarget = skill;
                return;
            }
        }
        this.mTouchTarget = this;
    },

    dispathEvent: function(eventName, pos)
    {
        if (this.mTouchTarget[eventName])
        {
            this.mTouchTarget[eventName](pos)
        }
    },

    getCannon: function()
    {
        return this.find("GOCannon" + FG.SelfViewID);
    },

    onTouchBegan: function(pos)
    {
        var cannon = this.getCannon()
        var self = this
        if (cannon.isBankrupt) {
            self.find("SCLayerMgr").setCurShowList(10)
        }
        cannon.updateAngleByPos(pos)
        this.bStopTimer = false;
        if (!this.bTimer)
        {
            this.onFire()
            this.startTimer("onFire", FG.FIRE_INTERVAL, 101, -1);
            this.bTimer = true;
        }
    },

    onTouchMoved: function(pos)
    {
        var cannon = this.getCannon()
        cannon.updateAngleByPos(pos)
    },

    onTouchEnded: function(pos)
    {
        this.test(pos);
        if (!FG.AutoFire)
        {
            this.bStopTimer = true;
        }
    },
    onEventEnterForgeGround: function() 
    {
        this.onTouchEnded(cc.p(0,0));
    },

    startAutoFire: function()
    {
        if (FG.AutoFire)
        {
            this.bStopTimer = false;
            if (!this.bTimer)
            {
                this.onFire()
                this.startTimer("onFire", FG.FIRE_INTERVAL, 101, -1);
                this.bTimer = true;
            }
        }
        else
        {
            this.stopTimer(101);
            this.bTimer = false;
        }
    },

    stopFire: function()
    {
        FG.AutoFire = false;
        this.stopTimer(101);
        this.bTimer = false;
    },

    onFire: function()
    {
        if (this.bStopTimer)
        {
            this.stopTimer(101);
            this.bTimer = false;
            return;
        }
        var cannon = this.getCannon();
        var bullet = cannon.laucherBullet();
        if (bullet == null)
        {
            this.handlerFireError();
            return;
        }
        // cannon.opCoin(-cannon.getGunRate());
        // cannon.opCount(-1);
        var rate = cannon.getGunRate()
        this.getScene().shootCost(cannon,rate)
        this.sendMsg("sendBullet", bullet.id, cannon.pointAngle,null,null,rate);
    },

    // 处理发射子弹错误
    handlerFireError: function()
    {
        var err = this.getCannon().errorCode;
        cc.warn("开射子弹错误: " + err);
        if (err == 1) // 子弹数达到上限
        {
            this.toast("子弹数达到上限");
            return;
        }
        else if(err == 2) // 炮倍未解锁
        {
            this.toast("当前炮倍未解锁");
        }
        else if(err == 3) // 金钱不够
        {

        } else if(err == 4) // 子弹数不足
        {
            //this.toast("子弹数不足");
        }
        // 关闭自动开火
        FG.AutoFire = false;
        this.stopTimer(101);
        this.bTimer = false;
    },

    isShowDialog: function()
    {
        if (this.find("UIDialog") && this.find("UIDialog").isVisible())
        {
            return true;
        }
        return false;
    },

    test: function(pos)
    {
        //this.find("EFCoins").play(pos, 12, FG.SelfViewID);
        //this.find("EFFishCatched").playBlastCoinEff(0, pos);
        //this.find("SCGameLoop").beforeGroupCome();
        //this.find("UIBackGround").changeBG();
        //this.find("EFWindfall").play(1002);
        //this.find("EFMegawin").play(10025);
        //this.find("EFBonusWheel3").play(105, 888, 0);
        //this.find("EFLevelUp").play();
        //cc.log(this.getScene().getScale());
        
        /*
        var go = this.find("EFLighting");
        go.startLighting(pos);
        for (var i = 0; i < 10; i++)
        {
            var x = Math.random() * display.width;
            var y = Math.random() * display.height;
            go.addLighting(cc.p(x, y));
        }
        go.endLighting();
        */

        //this.find("UIBackGround").shake(1 / 15, 20);
        //this.activeGameObject("UIShareAward");
    },

})