//-----------------------------------------------------
// 金币动画
//-----------------------------------------------------
wls.namespace.EFOther = wls.WrapNode.extend
({
    onCreate: function()
    {
    },

    /*
    showData:item的显示参数
    */
    initShowData: function(dataTab)
    {
        //层级
        dataTab.propCount = dataTab.propCount || 0;
        //初始位置
        dataTab.firstPos = dataTab.firstPos || cc.p(display.width/2,display.height/2);
        //终点位置
        if (dataTab.endPos == null) 
        {
            dataTab.endPos = wls.getWordPosByNode(this.find("UIHallPanel").node_coin);
        }
    },

    // 小金币旋转飞行动画         ---获取道具的数量，初始位置，终点位置，父节点，回调函数
    coinFlyAct: function(dataTab, parent, callback)
    {
        this.initShowData(dataTab);
        var newFishIcon = dataTab.newFishIcon
        var propCount = dataTab.propCount;
        var firstPos = dataTab.firstPos;
        var endPos = dataTab.endPos;
        var moveTime = 1;

        var item = cc.Node.create();
        item.setPosition(firstPos);
        this.addChild(item);
        var self = this;

        //生产小金币
        var dis = 20;
        for (var index = 0; index < propCount; index++) 
        {
            var spr = cc.Sprite.create();
            spr.setPositionX(-dis+ index*dis*propCount)
            item.spr = spr;
            item.addChild(spr, index);

            var filename = "game_fishcoin" + 1;
            var animation = wls.CreateAnimation(filename, 1 / 20.0);

            var animate = cc.Animate.create(animation);
            spr.runAction(cc.RepeatForever.create(animate));
            spr.runAction(cc.MoveTo.create(moveTime, cc.p(0,0)));
        }

        if (callback == null)
        {
            callback = function()
            {
            };
        }
        var callfun = cc.CallFunc.create(callback);
        var callfun2 = cc.CallFunc.create(function () {
            cc.log("------------------propFlyActEnd--")
            //FishGI.AudioControl:playEffect("sound/getprop_01.mp3")

            self.updateHallPropCount(newFishIcon);
        });

        var speedAct = cc.EaseExponentialIn.create(cc.MoveTo.create(moveTime,endPos));
        var scalect = cc.ScaleTo.create(moveTime, 0.7);
        var swAct = cc.Spawn.create(speedAct, scalect);
        item.runAction(cc.sequence(swAct, callfun2, callfun, cc.RemoveSelf.create()));
    },

    //刷新大厅数据
    updateHallPropCount: function(propCount)
    {
        this.find("DAPlayer").setMoney(this.find("DAPlayer").getMoney() + propCount)
        this.find("UIHallPanel").updateMoney()
    },
});