// 鱼潮
wls.namespace.GOGroup = cc.Node.extend
({
    onCreate: function(id)
    {
        FG.FishTimelineRoot.addChild(this);
        this.alive = true;
        this.startid = id;
        this.data = {};
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
            if (wls.Config.get("fishgroup", id, this.data) == null)
            {
                return;
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
        var frame = curFrame;
        if (frame >= this.maxframe)
        {
            this.alive = false;
        }
        var list = this.array[frame];
        if (list == null) return;
        for (var i = list.length - 1; i >= 0; i--)
        {
            if (wls.Config.get("fishgroup", list[i], this.data))
            {
                this.bornFish(curFrame);
            }
        }
    },

    // 创建鱼
    bornFish: function(curFrame)
    {
        this.find("SCGameLoop").addFishArray(this.data.arrId, this.data.id, curFrame);
    },

    // 从列表中移除
    removeFromList: function()
    {
        this.removeFromParent(true);
    },
});
