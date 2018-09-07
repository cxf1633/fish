// 鱼对象
wls.namespace.GOFish = cc.Node.extend
({
    onCreate: function(id)
    {
        this.actions = [];
        this.config = wls.Config.get("fish", id);
        if (this.config == null)
        {
            cc.error("未发现配置id " + id);
            id = 100000001;
            this.config = wls.Config.get("fish", id);
        }
        // 排序值(6 局部炸弹 7 连锁闪电 8 同类炸弹)
        this.sortValue = 0;
        if (this.config.trace_type == 6 || this.config.trace_type == 7 || this.config.trace_type == 8)
        {   
            this.sortValue = this.config.trace_type - 6 + 1;
        }
        this.point = {};
        this.shadow = null;
        this.sprites = [];
        this.sameid = 0;
        this.transform = {a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0}
        this.bDirty = true;
        this.startPos = cc.p(0, 0);
        this._elapsed = 0;
        this.reset();
        FG.FishRoot.addChild(this, this.config.show_layer);
        if (this.config.trace_type == 4 || this.config.trace_type == 8)
        {
            this.createComboSprite();
        }
        else
        {
            this.createActionSprite();
        }
        if (this.config.halo_res != 0)
        {
            this.createHalo();
        }
        this.setActionSpeed(1);
        this.initCollider();
    },

    destroy: function()
    {
        if (this.shadow)
        {
            this.shadow.removeFromParent(true);
        }
        this.removeFromParent(true);
    },

    // 重新设置配置
    resetConfig: function(id)
    {
        this.config = wls.Config.get("fish", id);
        if (this.config == null)
        {
            cc.error("未发现配置id " + id);
            id = 100000001;
            this.config = wls.Config.get("fish", id);
        }
        this.initCollider();
        this.actions = [];

        var filename = this.config.fish_res;
        var sp = this.sprites[0];
        var animation = FG.CreateAnimation(filename, 3 / 20.0);
        var act1 = cc.speed(cc.RepeatForever.create(cc.Animate.create(animation)), 1);
        sp.stopAllActions();
        sp.runAction(act1);
        sp.setScale(this.config.res_scale);
        this.setLocalZOrder(this.config.show_layer);
        this.actions.push(act1);

        if (FG.ENABLE_SHADOW)
        {
            var act2 = cc.speed(cc.RepeatForever.create(cc.Animate.create(animation)), 1);
            this.shadow.stopAllActions();
            this.shadow.runAction(act2);
            this.shadow.setLocalZOrder(this.config.show_layer - 1);
            this.actions.push(act2);
        }
        this.setRotation(0);
        this.flipSprite(false, false);
        this.flipSprite(true, false);
    },

    // 初始化多边形
    initCollider: function()
    {
        var tb = wls.SplitPosList(this.config.point_info);
        this.vertices = [];
        // 顶点
        for (var i = 0; i < tb.length - 1; i += 2)
        {
            this.vertices.push(cc.p(parseFloat(tb[i]), -parseFloat(tb[i + 1])));
        }
        // 法向量
        this.axis = [];
        var total = this.vertices.length - 1;
        for (var i = 0; i <= total; i++)
        {
            var next = i + 1 > total ? 0 : i + 1;
            var axis = cc.pNormalize(cc.pSub(this.vertices[i], this.vertices[next]));
            axis = cc.p(axis.y, -axis.x);
            this.axis.push(axis);
        }
    },

    // 更新矩阵
    updateTransform: function() 
    {
        var t = this.getNodeToParentTransform();
        var determinant = 1 / (t.a * t.d - t.b * t.c);
        this.transform.a = determinant * t.d;
        this.transform.b = -determinant * t.b;
        this.transform.c = -determinant * t.c;
        this.transform.d = determinant * t.a;
        this.transform.tx = determinant * (t.c * t.ty - t.d * t.tx);
        this.transform.ty = determinant * (t.b * t.tx - t.a * t.ty);
    },

    // 多边形与圆碰撞检测
    b2CollidePolygonAndCircle: function(pos, raduis)
    {
        if (this.bDirty)
        {
            this.updateTransform();
            this.bDirty = false;
        }
        var t = this.transform;
        var x = t.a * pos.x + t.c * pos.y + t.tx;
        var y = t.b * pos.x + t.d * pos.y + t.ty;
        var s = 0;
        var sx = 0;
        var sy = 0;
        for (var i = this.vertices.length - 1; i > -1; i--)
        {
            sx = x - this.vertices[i].x;
            sy = y - this.vertices[i].y;
            s = sx * this.axis[i].x + sy * this.axis[i].y;
            if (s > raduis)
            {
                return false;
            }
        }
        return true;
    },

    reset: function()
    {
        this._elapsed = 0;
        this.bMove = false;
        this.alive = false;
        this.offsetx = 0;
        this.offsety = 0;
        this.point.x = 0;
        this.point.y = 0;
        this.point.z = 0;
        this.offsetx = 0;
        this.offsety = 0;
        this.bFlipX = false;
        this.bFlipY = false;
        this.vecx = 0; // x移动向量
        this.vecy = 0;
        this.bornFrame = 0;
        this.frame = 0;
        this.intervalFrame = 0;
        this.bOutOfSceen = false;
        this.pathLength = 0;
        this.timelineid = 0;
        this.arrayid = 0;
        this.fishid = "";

        this.rotation = 0;
        this.bRed = false;
        this.setScale(1);
        this.rotation = 0;
        this.stopAllActions();
        this.setRed(false)
    },

    setFishID: function(timelineid, arrayid)
    {
        this.timelineid = parseInt(timelineid);
        this.arrayid = parseInt(arrayid);
        this.fishid = timelineid + "" + arrayid;
    },

    moveTo: function()
    {
        var src = this.getPosition();
        this.vecx = Math.floor(this.point.x - this.x);
        this.vecy = Math.floor(this.point.y - this.y);
        if (FG.SkipFrame)
        {
            this.setPosition(this.point.x, this.point.y);
        }
        else
        {
            this.bMove = true;
            this.startPos.x = src.x;
            this.startPos.y = src.y;
            this._elapsed = 0;
            this.updateMove(0);
        }
    },

    isAlive: function()
    {
        return this.alive;
    },

    setAlive: function(bo)
    {
        this.alive = bo;
    },

    isOutOfScreen: function()
    {
        return this.bOutOfSceen;
    },

    removeFromScreen: function()
    {
        if (this.timelineid > 0 && (this.config.trace_type == 5 || this.config.trace_type == 10)) {
            FG.PlayMusic(wls.RoomIdx);
        }
        this.setVisible(false);
        if (this.shadow)
        {
            this.shadow.setVisible(false);
        }
    },

    removeFromList: function()
    {
        this.bOutOfSceen = true;
    },

    update: function(dt) 
    {
        this.bDirty = true;
        this.updateMove(dt);
        this.updateShadow();
    },

    updateMove: function(dt)
    {
        if (this.bMove)
        {
            this._elapsed = this._elapsed + dt;
            var t = this._elapsed / 0.15;
            t = (1 > t ? t : 1);
            var x = this.vecx * t + this.startPos.x;
            var y = this.vecy * t + this.startPos.y;
            this.setPosition(x, y);
        }
    },

    updateShadow: function()
    {
        var s = this.shadow;
        if (s)
        {
            s.x = this.x + 40;
            s.y = this.y - 30;
            s.rotation = this.rotation;
            s.setFlippedX(this.bFlipX);
            s.setFlippedY(this.bFlipY);
        }
    },

    updateFrame: function(curFrame)
    {
        if (this.intervalFrame-- > 0)
        {
            return;
        }
        this.intervalFrame = 2;   
        if (this.frame + 4 >= this.pathLength)
        {
            this.alive = false;
            this.removeFromScreen();
            return;
        }
        this.frame = this.frame + 3;
        this.calcPoint();
        this.moveTo();
        this.updateAngle(); 
    },

    // 更新朝向
    updateAngle: function()
    {
        var rt = this.config.rotate_type;
        if (rt == 0)
        {
            this.setRotation(this.point.z + 90);
        }
        else if (rt == 2)
        {
            this.setRotation(this.point.z + 90);
            this.flipSprite(true, this.vecx > 0);
        }
        else if(rt == 3)
        {
            this.setRotation(this.point.z + 90);
            this.flipSprite(false, this.vecx > 0);
        }
    },

    // 翻转精灵
    flipSprite: function(bY, bFilp)
    {
        var s;
        for (var i = this.sprites.length - 1; i >= 0; i--)
        {
            s = this.sprites[i];
            if (s.bHalo)
            {
                if (bY)
                {
                    s.y = bFilp ? -s.sy : s.sy;
                }
                else
                {
                    s.x = bFilp ? -s.sx : s.sx;
                }
            }
            else
            {
                if (bY)
                {
                    this.bFlipY = bFilp;
                    s.setFlippedY(bFilp);
                }
                else
                {
                    this.bFlipX = bFilp;
                    s.setFlippedX(bFilp);
                }
            }
        }
    },

    calcPoint: function()
    {
        this.point.x = wls.FishPathSX * (parseFloat(this.path[this.frame]))
        this.point.y = wls.FishPathSY * (parseFloat(this.path[this.frame + 1]))
        this.point.z = parseFloat(this.path[this.frame + 2]);
        this.point.x += this.offsetx;
        this.point.y += this.offsety;
        if (FG.PlayerFlip)
        {
            this.point.x = display.width - this.point.x;
            this.point.y = display.height - this.point.y;
            this.point.z = this.point.z - 180;
        }
    },

    setPath: function(pathid)
    {
        this.path = wls.Config.get("fishpathEx", pathid).pointdata;
        this.pathLength = this.path.length;
    },

    gotoFrame: function()
    {
        var curFrame = FG.ClientFrame;
        this.frame = Math.floor((curFrame - this.bornFrame) / 3) * 3;
        this.intervalFrame = (curFrame - this.bornFrame) % 3;
        this.alive = true;
        this.bOutOfSceen = false;
        this.setVisible(true);
        if (this.shadow)
        {
            this.shadow.setVisible(true);
        }
        this.calcPoint();
        this.setPosition(this.point.x, this.point.y);
        this.updateAngle(); 
        this.updateShadow();
    },

    // 多个组合精灵
    createComboSprite: function()
    {
        var config = wls.Config.getOrigin("fishchildren", parseInt(this.config.id) + 90000000);
        var cnt = parseInt(config.fishcount);
        config.bgindex = wls.SplitArray(config.bgindex);
        config.bgscale = wls.SplitArray(config.bgscale);
        config.fishid = wls.SplitArray(config.fishid);
        config.fishscale = wls.SplitArray(config.fishscale);
        config.offset = wls.SplitPosList(config.offset);
        for (var i = 0; i < cnt; i++)
        {
            this.sameid = 100000000 + parseInt(config.fishid[i]);
            var sp = cc.Sprite.create();
            this.addChild(sp);
            sp.setScale(config.fishscale[i] / 100);
            sp.setPosition(config.offset[i * 2], config.offset[i * 2 + 1]);
            var animation = FG.CreateAnimation("fishid" + config.fishid[i], 3 / 20.0);
            var act1 = cc.speed(cc.RepeatForever.create(cc.Animate.create(animation)), 1);
            sp.runAction(act1);
            this.sprites.push(sp);

            var bg = cc.Sprite.create();
            this.addChild(bg, -1);
            bg.setSpriteFrame("fish_com_" + config.bgindex[i] + ".png");
            bg.setScale(config.bgscale[i] / 100);
            bg.setPosition(config.offset[i * 2], config.offset[i * 2 + 1]);

            var act2 = cc.speed(cc.RepeatForever.create(cc.rotateBy(3.0, 360)), 1);
            bg.runAction(act2);

            this.sprites.push(sp);
            this.sprites.push(bg);

            this.actions.push(act1);
            this.actions.push(act2);
        }
    },

    // 单个精灵
    createActionSprite: function()
    {
        var filename = this.config.fish_res;
        var sp = cc.Sprite.create();
        this.addChild(sp);
        var animation = FG.CreateAnimation(filename, 3 / 20.0);
        var act1 = cc.speed(cc.RepeatForever.create(cc.Animate.create(animation)), 1);
        sp.runAction(act1);
        this.sprites.push(sp);
        sp.setScale(this.config.res_scale);
        this.actions.push(act1);

        // 阴影
        if (FG.ENABLE_SHADOW)
        {
            var sd = cc.Sprite.create();
            FG.FishRoot.addChild(sd, this.config.show_layer - 1);
            var animation = FG.CreateAnimation(filename, 3 / 20.0);
            var act2 = cc.speed(cc.RepeatForever.create(cc.Animate.create(animation)), 1);
            sd.runAction(act2);
            sd.color = new cc.Color(0, 0, 0);
            sd.opacity = 107;
            sd.scale = 0.9;
            this.shadow = sd;
            this.actions.push(act2);
        }
    },

    // 创建光环
    createHalo: function()
    {
        this.haloSprites = [];
        var bgNameVec = wls.SplitArray(this.config.halo_res);
        var posList = wls.SplitPosList(this.config.halo_pos);
        if (this.config.halo_type == 1)
        {
            var lastSprite;
            for (var i = 0; i < bgNameVec.length; i++)
            {
                var h = cc.Sprite.create();
                this.addChild(h, -1);
                h.setSpriteFrame(bgNameVec[i]);
                h.sx = posList[0];
                h.sy = posList[1];
                h.setPosition(h.sx, h.sy)
                lastSprite = h;
                h.bHalo = true;
                this.sprites.push(h);
            }
            if (lastSprite)
            {
                var a1 = cc.sequence(cc.scaleTo(1.0, 1), cc.scaleTo(0, 0));
                var a2 = cc.sequence(cc.fadeTo(0.8, 204), cc.fadeTo(0.2, 0), cc.fadeTo(0.2, 255));
                lastSprite.runAction(cc.repeatForever(cc.spawn(a1, a2)));
            }
        }
        else if (this.config.halo_type == 2)
        {
            for (var i = 0; i < bgNameVec.length; i++)
            {
                var h = cc.Sprite.create();
                this.addChild(h, -1);
                h.setSpriteFrame(bgNameVec[i]);
                h.sx = posList[0];
                h.sy = posList[1];
                h.setPosition(h.sx, h.sy)
                h.setScale(0.9);
                h.runAction(cc.repeatForever(cc.rotateBy(12, 360)));

                h.bHalo = true;
                this.sprites.push(h);
            }
        }
        else
        {
            for (var i = 0; i < bgNameVec.length; i++)
            {
                var h = cc.Sprite.create();
                this.addChild(h, -1);
                h.setSpriteFrame(bgNameVec[i]);
                h.sx = posList[0];
                h.sy = posList[1];
                h.setPosition(h.sx, h.sy)
                h.bHalo = true;
                this.sprites.push(h);
            }
        }
    },

    setRed: function(bo)
    {
        var color = bo ? cc.c3b(255, 0, 0) : cc.c3b(255, 255, 255);
        for (var i = this.sprites.length - 1; i >= 0; i--)
        {
            this.sprites[i].setColor(color);
        }
    },

    // 变红
    onRed: function()
    {
        if (this.bRed) return; 
        this.setRed(true);
        this.bRed = true;
        var self = this;
        var c1 = cc.callFunc(function(){ self.setRed(false); });
        var c2 = cc.callFunc(function(){ self.bRed = false; });
        var act = new cc.Sequence(cc.delayTime(0.5), c1, cc.delayTime(0.5), c2);
        this.runAction(act);
    },

    // 被捕中
    onCatched: function()
    {
        this.setRed(false);
        this.stopAllActions();
        if (this.shadow)
        {
            this.shadow.setVisible(false);
        }
    },

    // 是否可以被选择
    isCanSelect: function()
    {
        if (!this.alive) return false;
        var pos = this.getPosition();
        return cc.rectContainsPoint(FG.ScreenRect, pos);
    },

    setActionSpeed: function(s)
    {
        for (var i = this.actions.length - 1; i >= 0; i--)
        {
            this.actions[i].setSpeed(s);
        }
    },

    // 淡入
    fadeIn: function()
    {
        for (var i = this.sprites.length - 1; i >= 0; i--)
        {
            this.sprites[i].setOpacity(0);
            this.sprites[i].runAction(cc.fadeIn(0.8));
        }
        if (this.shadow)
        {
            this.shadow.setOpacity(0);
            this.shadow.runAction(cc.fadeTo(0.8, 107));
        }
    },

    // 逃走
    escape: function()
    {
        if (this.timelineid < 0) return false;
        this.setRed(false);
        this.stopAllActions();
        var self = this;
        function callback()
        {
            self.removeFromScreen();
            for (var i = self.sprites.length - 1; i >= 0; i--)
            {
                self.sprites[i].setOpacity(255);
            }
        }
        var dt = 0.9;
        var rate = 800;
        var vec = cc.pNormalize(cc.p(this.vecx, this.vecy));
        var offset = cc.p(vec.x * rate, vec.y * rate);
        this.runAction(cc.sequence(cc.moveBy(dt, offset), cc.callFunc(callback)));
        for (var i = this.sprites.length - 1; i >= 0; i--)
        {
            this.sprites[i].runAction(cc.fadeOut(dt - 0.1));
        }
        if (this.shadow)
        {
            this.shadow.setVisible(false);
        }
        return true;
    },
});
