// 对象池管理
wls.namespace.SCPool = cc.Node.extend
({
    onCreate: function()
    {
        this.fish_config = {};
        this.mFishNormalPool = []; // 普通鱼 不带光环
        this.mFishSpecailPool = []; // 特殊鱼
        this.mBulletPool = [];
        this.mNetPool = [];
        this.mKilledFishes = {};
        this.mbEanbleResizeFishPool = true;
        this.startTimer("resizeFishPool", 6, 101, -1);
        this.startTimer("resizeBulletPool", 20, 101, -1);
        this.startTimer("resizeNetPool", 25, 101, -1);
    },

    //-----------------------------------------------------
    // 鱼池管理
    //-----------------------------------------------------

    // 重置鱼池
    resizeFishPool: function()
    {
        var length = this.mFishNormalPool.length;
        //cc.log("鱼池对象数量" + length);
        if (!this.mbEanbleResizeFishPool) return;
        if (length <= 60) return;
        var fish;
        var total = length;
        var cnt = 0;
        for (var i = length - 1; i >= 0; i--)
        {
            if (total <= 60) break;
            if (cnt > 30) break;
            fish = this.mFishNormalPool[i];
            if (fish.isOutOfScreen())
            {
                fish.destroy();
                this.mFishNormalPool.splice(i, 1);
                total--;
                cnt++;
            }
        }
    },

    setEnableResizeFishPool: function(bEnable)
    {
        this.mbEanbleResizeFishPool = bEnable;
    },

    // 设置已经被击杀的鱼
    setKilledFishes: function(tb)
    {
        var val;
        for (var i = 0; i < tb.length; i++)
        {
            val = tb[i];
            this.mKilledFishes[val.timelineId + "" + val.fishArrayId] = true;
        }
        cc.log(this.mKilledFishes);
    },

    isCanBornFish: function(timelineid, arrayid, pathid, frame)
    {
        // 判断鱼是否已经死亡
        var id = timelineid + "" + arrayid;
        if (this.mKilledFishes[id])
        {
            delete this.mKilledFishes[id];
            return false;
        }

        // 判断鱼是否已经超过鱼线
        var frame = Math.ceil((FG.ClientFrame - frame) / 3);
        var length = Math.floor(wls.Config.get("fishpathEx", pathid).pointdata.length / 3);
        if (frame - length >= 0)
        {
            return false;
        }
        return true;
    },

    // 鱼
    getFish: function(id)
    {
        wls.Config.get("fish", id, this.fish_config);
        var bNormal = true;
        if (this.fish_config.trace_type == 4 || this.fish_config.trace_type == 8 || this.fish_config.halo_res != 0)
        {
            bNormal = false;
        }
        var fish;
        if (bNormal)
        {
            for (var i = this.mFishNormalPool.length - 1; i >= 0; i--)
            {
                fish = this.mFishNormalPool[i];
                if (fish.isOutOfScreen())
                {
                    fish.resetConfig(id);
                    return fish;
                }
            }
        }
        else
        {
            for (var i = this.mFishSpecailPool.length - 1; i >= 0; i--)
            {
                fish = this.mFishSpecailPool[i];
                if (fish.config.id == id && fish.isOutOfScreen())
                {
                    return fish;
                }
            }
        }
        fish = this.createUnnamedNode("GOFish", id);
        bNormal ? this.mFishNormalPool.push(fish) : this.mFishSpecailPool.push(fish);
        return fish;
    },

    // 池里鱼的对象数量
    getFishPoolCnt: function()
    {
        return this.mFishSpecailPool.length + this.mFishNormalPool.length;
    },

    createFish: function(id)
    {
        //id = 100000154;
        var go = this.getFish(id);
        go.reset();
        go.setActionSpeed(1);
        return go;
    },

    //-----------------------------------------------------
    // 子弹池管理
    //-----------------------------------------------------

    resizeBulletPool: function()
    {
        var length = this.mBulletPool.length;
        //cc.log("子弹池对象数量" + length);
        if (length <= 48) return;
        var bullet;
        var total = length;
        var cnt = 0;
        for (var i = length - 1; i >= 0; i--)
        {
            if (total <= 48) break;
            if (cnt > 15) break;
            bullet = this.mBulletPool[i];
            if (bullet.isOutOfScreen())
            {
                bullet.destroy();
                this.mBulletPool.splice(i, 1);
                total--;
                cnt++;
            }
        }
    },

    // 子弹
    getBullet: function(id)
    {
        for(var i = 0, len = this.mBulletPool.length; i < len; i++)
        {
            if (this.mBulletPool[i].isOutOfScreen())
            {
                //cc.log("pool bullet", i);
                return this.mBulletPool[i];
            }
        }
        //cc.log("+++++newk bullet", this.mBulletPool.length);
        var go = this.createUnnamedNode("GOBullet", id);
        this.mBulletPool.push(go);
        return go;
    },

    createBullet: function(id)
    {
        var go = this.getBullet(id);
        return go;
    },

    //-----------------------------------------------------
    // 渔网池管理
    //-----------------------------------------------------

    resizeNetPool: function()
    {
        var length = this.mNetPool.length;
        //cc.log("鱼网池对象数量" + length);
        if (length <= 48) return;
        var net;
        var total = length;
        var cnt = 0;
        for (var i = length - 1; i >= 0; i--)
        {
            if (total <= 48) break;
            if (cnt > 15) break;
            net = this.mNetPool[i];
            if (net.isOutOfScreen())
            {
                net.destroy();
                this.mNetPool.splice(i, 1);
                total--;
                cnt++;
            }
        }
    },

    // 渔网
    getNet: function(id)
    {
        for(var i = this.mNetPool.length - 1; i >= 0; i--)
        {
            if (!this.mNetPool[i].isVisible())
            {
                return this.mNetPool[i];
            }
        }
        var go = this.createUnnamedNode("GONet", id);
        this.mNetPool.push(go);
        return go;
    },

    createNet: function(id)
    {
        var go = this.getNet(id);
        return go;
    },
})