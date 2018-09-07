// 游戏主循环
wls.namespace.SCGameLoop = cc.Node.extend
({
    onCreate: function()
    {
        this.mbFreeze = false;
        this.mClientFrame = 0;
        this.mServerFrame = 0;
        this.mTimelines = [];
        this.mFishes = [];
        this.mFishMap = {};
        this.mBullets = [];

        this.mFollowFishes = {};
    },

    startUpdate: function()
    {
        this.scheduleUpdate();
        this.startTimer("updateFrame", 1.0 / 20.0, 1, -1);
        this.startTimer("updateMyCollsion", 1.0 / 10.0, 3, -1); // 自己的碰撞检测
        this.startTimer("updateOtherCollsion", 1.0 / 6.0, 4, -1); // 其他人的碰撞检测
    },

    update: function(dt)
    {
        //var t1 = wls.clock();
        var list = this.mFishes;
        var fish;
        for (var i = list.length - 1; i > -1; i--)
        {
            fish = list[i];
            if (fish.alive)
            {
                fish.update(dt);
            }
        }
        //cc.log("updateCollsion ++++++++++++++++++++++", wls.clock() - t1);
    },

    // 更新帧
    updateFrame: function()
    {
        this.updateList(this.mBullets);
        if (this.mbFreeze) return;
        this.mClientFrame += 1;
        FG.ClientFrame = this.mClientFrame;
        this.updateList(this.mTimelines);
        this.updateList(this.mFishes);
    },

    // 同步帧
    syncFrame: function(frame)
    {
        //cc.log(frame, this.mClientFrame);
        this.mServerFrame = frame;
        var r = frame - this.mClientFrame;
        if (r < 0)
        {
            this.resetTimer(1);
            return;
        }
        else if (r < 20)
        {
            return;
        }
        this.resetTimer(1);
        FG.SkipFrame = true;
        for (var i = this.mClientFrame; i <= frame; i++)
        {
            this.updateFrame();
        }
        FG.SkipFrame = false;
    },

    updateList: function(list)
    {
        for (var i = list.length - 1; i > -1; i--)
        {
            if (list[i].isAlive())
            {
                list[i].updateFrame(this.mClientFrame);
            }
            else
            {
                list[i].removeFromList();
                list.splice(i, 1);
            }
        }
    },

    // 更新自己碰撞
    updateMyCollsion: function()
    {
        if (this.mBullets.length == 0 || this.mFishes.length == 0) return;
        this.collsionCheck(true);
    },

    // 更新别人的碰撞
    updateOtherCollsion: function()
    {
        if (this.mBullets.length == 0 || this.mFishes.length == 0) return;
        this.collsionCheck(false);
    },

    collsionCheck: function(bSelf)
    {
        var l1 = this.mBullets.length;
        var l2 = this.mFishes.length;
        var pos = cc.p(0, 0);
        var bullet, fish, net;
        for (var i = 0; i < l1; i++)
        {
            bullet = this.mBullets[i];
            if (bullet.bFollow) continue;
            if (bSelf)
            {
                if (bullet.viewid != FG.SelfViewID) continue;
            }
            else
            {
                if (bullet.viewid == FG.SelfViewID) continue;
            }
            pos.x = bullet.x;
            pos.y = bullet.y;
            for(var j = 0; j < l2; j++)
            {
                fish = this.mFishes[j];
                if (fish.alive && fish.b2CollidePolygonAndCircle(pos, 36))
                {
                    net = this.find("SCPool").createNet(1);
                    net.setRotation(bullet.getRotation());
                    net.updateNetView(bullet.config);
                    net.play(bullet.x, bullet.y);
                    if (bullet.viewid == FG.SelfViewID)
                    {
                        this.checkNetCollsion(pos, bullet.id);
                    }
                    bullet.removeFromScreen();
                    break;
                }
            }
        }
    },

    // 计算被网碰到的鱼
    checkNetCollsion: function(pos, bulletid)
    {
        var l2 = this.mFishes.length;
        var fish;
        var deadFishes = [];
        for(var j = 0; j < l2; j++)
        {
            fish = this.mFishes[j];
            if (fish.b2CollidePolygonAndCircle(pos, 78))
            {
                fish.onRed();
                deadFishes.push(fish);
            }
        }
        deadFishes.sort(function(a, b){
            return a.sortValue < b.sortValue;
        });
        var effectFishes = this.calcEffectFish(deadFishes[0]);
        FG.SendMsg("sendHit", bulletid, deadFishes, effectFishes);
    },

    // 计算被核爆炸到的鱼
    calcBombFish: function(pos, range)
    {
        var l2 = this.mFishes.length;
        var fish;
        var deadFishes = [];
        var t = 0;
        for(var j = 0; j < l2; j++)
        {
            fish = this.mFishes[j];
            t = fish.config.trace_type;
            if (fish.isAlive() && t != 5 && t != 6 && t != 7 && t != 8 && t != 10)
            {
                if (fish.b2CollidePolygonAndCircle(pos, range))
                {
                    deadFishes.push(fish);
                }
            }
        }
        return deadFishes;
    },

    // 计算被局部炸弹爆炸到的鱼
    calcRangeBombFish: function(pos)
    {
        var range = 225;
        var l2 = this.mFishes.length;
        var fish;
        var deadFishes = [];
        var t = 0;
        for(var j = 0; j < l2; j++)
        {
            fish = this.mFishes[j];
            t = fish.config.trace_type;
            if (fish.isAlive() && t != 5 && t != 6 && t != 7 && t != 8 && t != 3)
            {
                if (fish.b2CollidePolygonAndCircle(pos, range))
                {
                    deadFishes.push(fish);
                }
            }
        }
        return deadFishes;
    },

    calcThunderPool: function()
    {
        var list = [];
        var l2 = this.mFishes.length;
        var fish;
        for(var j = 0; j < l2; j++)
        {
            fish = this.mFishes[j];
            t = fish.config.trace_type;
            if (fish.isAlive() && (t == 1 || t == 2 || t == 4))
            {
                list.push(fish);
                if (list.length > 50)
                {
                    break;
                }
            }
        }
        return list;
    },

    calcSameFish: function(id)
    {
        var list = [];
        var l2 = this.mFishes.length;
        var fish;
        for(var j = 0; j < l2; j++)
        {
            fish = this.mFishes[j];            
            if (fish.isAlive() && fish.config.id == id)
            {
                list.push(fish);
            }
        }
        return list;
    },

    // 跟踪子弹打到鱼
    shootFish: function(bullet, fish)
    {
        var deadFishes = [];
        deadFishes.push(fish);
        var effectFishes = this.calcEffectFish(fish);
        FG.SendMsg("sendHit", bullet.id, deadFishes, effectFishes);
    },

    //-----------------------------------------------------
    // 增加对象
    //-----------------------------------------------------

    addTimeline: function(idx, frame, bServer)
    {
        FG.ClientFrame = frame;
        this.mClientFrame = frame;
        var server = bServer ? 90000 : 0;
        var id = 320000000 + wls.RoomIdx * 100000 + idx * 1000 + server;
        var go = this.createUnnamedNode("GOTimeline", id);
        this.mTimelines.push(go);
        go.gotoFrame();
    },

    addGroup: function(idx, frame)
    {
        FG.ClientFrame = frame;
        this.mClientFrame = frame;
        var id = 330000000 + idx * 100000;
        var go = this.createUnnamedNode("GOGroup", id)
        this.mTimelines.push(go);
        go.gotoFrame();
    },

    addFish: function(fish)
    {
        this.mFishes.push(fish);
        this.mFishMap[fish.fishid] = fish;
    },

    addFishArray: function(id, timelineid, frame)
    {
        id = 310000000 + id * 1000;
        var go = this.createUnnamedNode("GOArray", [id, timelineid]);
        this.mTimelines.push(go);
        go.bornFrame = frame;
        go.gotoFrame();
    },

    addBullet: function(bullet)
    {
        this.mBullets.push(bullet);
    },

    addSummonFish: function(data)
    {
        var go = this.find("SCPool").createFish(data.fishId);
        go.setFishID(-data.playerId, data.callFishId);
        go.setPath(data.pathId);
        go.bornFrame = data.frameId;
        go.gotoFrame();
        go.fadeIn();
        this.addFish(go);
        if (this.mbFreeze)
        {
            go.setActionSpeed(0);
        }
    },

    //-----------------------------------------------------
    // 查找鱼
    //-----------------------------------------------------

    calcEffectFish: function(fish)
    {
        if (fish == null)
        {
            return [];
        }
        if (fish.config.trace_type == 6)
        {
            return this.calcRangeBombFish(fish.getPosition());
        }
        else if(fish.config.trace_type == 7)
        {
            return this.calcThunderPool();
        }
        else if(fish.config.trace_type == 8)
        {
            return this.calcSameFish(fish.sameid);
        }
        return [];
    },

    // 获得跟随的鱼
    getFollowFish: function(viewid)
    {
        return this.mFollowFishes[viewid];
    },

    // 设置跟随的鱼
    setFollowFish: function(viewid, fish)
    {
        this.mFollowFishes[viewid] = fish;
    },
    
    findByID: function(timelineid, arrayid)
    {
        return this.mFishMap[timelineid + "" + arrayid];
    },
    
    // 分数最多的
    findFishByScore: function()
    {
        var ret, fish;
        var min = 0;
        for (var i = this.mFishes.length - 1; i > -1; i--)
        {
            fish = this.mFishes[i];
            if (fish.isCanSelect())
            {
                if (fish.config.score > min)
                {
                    min = fish.config.score;
                    ret = fish;
                }
            }
        }
        return ret;
    },

    // 离点最近的
    findFishByPos: function(center)
    {
        var ret, fish;
        var cur = 0;
        var x, y = 0;
        var minDis = 150 * 150;
        for (var i = this.mFishes.length - 1; i > -1; i--)
        {
            fish = this.mFishes[i];
            if (fish.isCanSelect())
            {
                var pos = fish.getPosition();
                x = pos.x - center.x;
                y = pos.y - center.y;
                cur = x * x + y * y;
                if (cur < minDis)
                {
                    minDis = cur;
                    ret = fish;
                }
            }
        }
        return ret;
    },

    // 设置是否冰冻
    setFreeze: function(bo)
    {
        this.mbFreeze = bo;
        var s = bo ? 0 : 1;
        for (var i = this.mFishes.length - 1; i > -1; i--)
        {
            if (this.mFishes[i].isAlive())
            {
                this.mFishes[i].setActionSpeed(s);
            }
        }
    },

    isFreeze: function()
    {
        return this.mbFreeze;
    },

    // 鱼潮即将来临
    beforeGroupCome: function()
    {
        // 清除鱼线
        var list = this.mTimelines;
        for (var i = list.length - 1; i > -1; i--)
        {
            if (list[i].isAlive())
            {
                list[i].removeFromList();
            }
        }
        this.mTimelines = [];
        // 清除鱼
        for (var i = this.mFishes.length - 1; i > -1; i--)
        {
            if (this.mFishes[i].isAlive())
            {
                if (this.mFishes[i].escape())
                {
                    this.mFishes.splice(i, 1);
                }
            }
        }
    },
})