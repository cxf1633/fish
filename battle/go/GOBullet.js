// 子弹
wls.namespace.GOBullet = cc.Node.extend
({
    onCreate: function()
    {
        FG.BulletRoot.addChild(this);
        this.bullets = [];
        for (var i = 0; i < 3; i++)
        {
            this.createSingle();
        }
        this.setVisible(false);
        this.bOutOfSceen = true;
        this.vec = cc.p(0, 0);
        this.alive = false;
        this.id = "";
        this.viewid = -1;
        this.bFollow = false;
        this.bulletCnt = 1;
    },

    destroy: function()
    {
        this.removeFromParent(true);
    },

    createSingle: function()
    {
        var node = cc.Node.create();
        this.addChild(node);

        var sp = cc.Sprite.create();
        node.addChild(sp);
        sp.setAnchorPoint(0.5, 0.75);
        node.sp = sp;

        var bg = cc.Sprite.create();
        node.addChild(bg);
        bg.setAnchorPoint(0.5, 0.75);
        node.bg = bg;
        bg.setSpriteFrame(this.fullPath("plist/effect_bullet_superpos_01.png"));
        bg.setVisible(false);
        this.bullets.push(node);
    },

    updateView: function(config)
    {
        if (config == null) return;
        this.config = config;
        var f = this.fullPath("plist/" + config.bullet_img);
        this.bulletCnt = config.bullet_xplot.length / 2;
        for (var i = 0; i < this.bullets.length; i++)
        {
            var node = this.bullets[i];
            node.bg.setVisible(false);
            if (i < this.bulletCnt)
            {
                node.setPosition(config.bullet_xplot[i * 2], config.bullet_xplot[i * 2 + 1]);
                node.setVisible(true);
                node.sp.setSpriteFrame(f);
            }
            else
            {
                node.setVisible(false);
            }
        }
    },

    removeFromScreen: function()
    {
        this.setVisible(false);
        this.alive = false;
        this.find("DABattle").modifyBulletCnt(this.viewid, -1);
    },

    removeFromList: function()
    {
        this.bOutOfSceen = true;
    },

    isAlive: function()
    {
        return this.alive;
    },

    updateFrame: function()
    {
        if (this.bFollow)
        {
            this.updateFollow();
            return;
        }
        if (this.checkEdge())
        {
            this.moveToNextPoint();
        }
    },

    isOutOfScreen: function()
    {
        return this.bOutOfSceen;
    },

    laucher: function(pos, vx, vy)
    {
        this.bFollow = false;
        this.alive = true;
        this.setVisible(true);
        this.bOutOfSceen = false;
        this.setPosition(pos.x, pos.y);
        this.vec.x = vx;
        this.vec.y = vy;
        this.moveToNextPoint();
    },

    follow: function(fish, bViolent)
    {
        this.bFollow = true;
        this.flightTo();
        this.followIdx = 0;
        for (var i = 0; i < this.bulletCnt; i++)
        {
            this.bullets[i].bg.setVisible(bViolent);
        }
    },

    updateFollow: function()
    {
        this.followIdx++;
        if (this.followIdx > 2)
        {
            this.followIdx = 0;
            this.flightTo();
        }
    },

    flightTo: function()
    {
        var fish = this.find("SCGameLoop").getFollowFish(this.viewid);
        if (fish == null) return;
        var dst = fish.getPosition();
        var pos = this.getPosition();
        var offset = cc.pSub(dst, pos);
        var distance = cc.pGetLength(offset);
        var d1 = distance / FG.BulletSpeed * 0.6;
        this.runAction(cc.rotateTo(0.02, -wls.Atan2(offset.y, offset.x) + 90));
        var self = this;
        var moveToDst = function()
        {
            var f1 = self.find("SCGameLoop").getFollowFish(self.viewid);
            if (f1)
            {
                self.stopActionByTag(101);
                self.removeFromScreen();
                var net = self.find("SCPool").createNet(1);
                net.setRotation(self.getRotation());
                net.updateNetView(self.config);
                net.play(self.x, self.y);
                if (self.viewid == FG.SelfViewID)
                {
                    self.find("SCGameLoop").shootFish(self, f1);
                    f1.onRed();
                }
            }
        }

        var moveOut = function()
        {
            self.removeFromScreen();
        }
        var r = display.width / distance;
        var d2 = d1 * r;
        var outOffset = cc.p(offset.x * r, offset.y * r);
        var act = cc.sequence(cc.moveBy(d1, offset), cc.callFunc(moveToDst), cc.moveBy(d2, outOffset), cc.callFunc(moveOut));
        act.setTag(101);
        this.stopActionByTag(101);
        this.runAction(act);
    },

    moveToNextPoint: function()
    {
        var raduis = display.width + display.height
        var dstPos = cc.p(raduis * this.vec.x, raduis * this.vec.y)
        var act = cc.moveBy(raduis / FG.BulletSpeed, dstPos)
        act.setTag(101)
        this.stopActionByTag(101)
        this.runAction(act)
        this.setRotation(-wls.Atan2(this.vec.y, this.vec.x) + 90);
    },

    // 边界碰撞检测
    checkEdge: function()
    {
        var x = this.x;
        var y = this.y;
        if (x < 0)
        {
            y = y - x / this.vec.x * this.vec.y
            x = 0
            this.vec.x = -this.vec.x
            this.setPosition(x, y)
            return true
        }
        else if (x > display.width)
        {
            y = y - (x - display.width) / this.vec.x * this.vec.y
            x = display.width
            this.vec.x = -this.vec.x
            this.setPosition(x, y)
            return true
        }
        else if (y < 0)
        {
            x = x - y / this.vec.y * this.vec.x
            y = 0
            this.vec.y = -this.vec.y
            this.setPosition(x, y)
            return true
        }
        else if (y > display.height)
        {
            x = x - (y - display.height) / this.vec.y * this.vec.x
            y = display.height
            this.vec.y = -this.vec.y
            this.setPosition(x, y)
            return true
        }
    }
})