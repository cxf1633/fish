// 鱼组
wls.namespace.GOArray = cc.Node.extend
({
    onCreate: function(args)
    {
        FG.FishTimelineRoot.addChild(this);
        this.alive = true;
        this.startid = args[0];
        this.data = {};
        this.bornFrame = 0;
        this.idx = 0;
        this.timelineid = args[1];
        this.array = {};
        this.maxframe = 0;
        this.initArray();
    },

    isAlive: function()
    {
        return this.alive;
    },

    initArray: function()
    {
        var id = this.startid;
        while (true)
        {
            if (wls.Config.get("fisharray", id, this.data) == null)
            {
                break;
            }
            id++;
            var frame = this.data.frame;
            this.maxframe = frame > this.maxframe ? frame : this.maxframe;
            var list = this.array[frame];
            if (list == null)
            {
                this.array[frame] = [];
                list = this.array[frame];
            }
            list.push(this.data.id);
        }
        //wls.warn(1);
        //cc.log(this.array);
    },

    gotoFrame: function()
    {
        var curFrame = FG.ClientFrame;
        for (var i = this.bornFrame; i <= curFrame; i++)
        {
            if (!this.alive) return;
            this.updateFrame(i);
        }
    },

    // 更新帧
    updateFrame: function(curFrame)
    {
        var frame = curFrame - this.bornFrame;
        if (frame >= this.maxframe)
        {
            this.alive = false;
        }
        var list = this.array[frame];
        if (list == null) return;
        for (var i = list.length - 1; i >= 0; i--)
        {
            if (wls.Config.get("fisharray", list[i], this.data))
            {
                this.bornFish(curFrame);
            }
        }
    },

    bornFish: function(curFrame)
    {
        var pathid = this.data.trace + 300000000;
        if (!this.find("SCPool").isCanBornFish(this.timelineid, this.data.id, pathid, curFrame))
        {
            //cc.log("不能生成鱼")
            return;
        }
        //cc.log(this.timelineid, this.data.frame + "++++++++++create fish " + this.data.fishid);
        var go = this.find("SCPool").createFish(this.data.fishid);
        go.setFishID(this.timelineid, this.data.id);
        go.setPath(pathid);
        go.offsetx = this.data.offsetx;
        go.offsety = this.data.offsety;
        go.bornFrame = curFrame;
        go.gotoFrame();
        if (go.isAlive())
        {
            this.find("SCGameLoop").addFish(go);
        }
    },

    // 从列表中移除
    removeFromList: function()
    {
        this.removeFromParent(true);
    },
});