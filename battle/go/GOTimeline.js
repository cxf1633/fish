// 鱼的时间线
wls.namespace.GOTimeline = cc.Node.extend
({
    onCreate: function(id)
    {
        FG.FishTimelineRoot.addChild(this);
        this.alive = true;
        this.startid = id;
        this.data = {};
        this.idx = 0;
    },

    isAlive: function()
    {
        return this.alive;
    },

    gotoFrame: function()
    {
        var curFrame = FG.ClientFrame;
        for (var i = 0; i <= curFrame; i++)
        {
            this.updateFrame(i);
        }
    },

    // 更新帧
    updateFrame: function(curFrame)
    {
        while (true)
        {
            // 全部帧都跑完
            if (!wls.Config.get("timeline", this.startid + this.idx, this.data))
            {
                this.alive = false;
                return;
            }
            // 不属于当前帧的
            if (this.data.frame > curFrame)
            {
                return;
            }
            this.idx = this.idx + 1;
            this.bornFish(curFrame);
        }
    },

    // 创建鱼
    bornFish: function(curFrame)
    {
        if (this.data.fishid == 100)
        {
            this.find("SCGameLoop").addFishArray(this.data.pathid, this.data.id, curFrame);
        }
        else
        {
            var pathid = this.data.pathid + 300000000;
            if (!this.find("SCPool").isCanBornFish(this.data.id, 0, pathid, curFrame))
            {
                return;
            }
            var go = this.find("SCPool").createFish(this.data.fishid);
            go.setFishID(this.data.id, 0);
            go.setPath(pathid);
            go.bornFrame = curFrame;
            go.gotoFrame();
            if (go.isAlive())
            {
                this.find("SCGameLoop").addFish(go);
                this.doBossWarnning(go);
            }
        }
    },

    doBossWarnning: function(fish)
    {
        //return;
        if (FG.bGameStatus) return;
        if (fish.timelineid < 0) return;
        var trace_type = fish.config.trace_type;
        if (trace_type != 5 && trace_type != 10)
        {
            return;
        }
        this.find("EFBossComing").play(fish.config.id - 100000000, fish.config.score);
        FG.PlayMusic(10)
    },

    // 从列表中移除
    removeFromList: function()
    {
        this.removeFromParent(true);
    },
});
