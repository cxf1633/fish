//-----------------------------------------------------
// 物品掉落动画
//-----------------------------------------------------
wls.namespace.EFItems = wls.WrapNode.extend
({
    onCreate: function()
    {
        this.mItemPool = [];
        this.fishCardMin = wls.Config.getConfig("990000121")
    },

    clearItem: function()
    {
        for(var i = this.mItemPool.length - 1; i >= 0; i--)
        {
            item = this.mItemPool[i];
            item.bUse = false 
            item.setVisible(false)
            item.stopAllActions()
        }
    },

    // 创建掉落道具节点
    getItem: function(propId,propCount,isShowCount)
    {
        var item;
        for(var i = this.mItemPool.length - 1; i >= 0; i--)
        {
            item = this.mItemPool[i];
            if (!item.bUse)
            {
                if (!this.initItem(item,propId,propCount,isShowCount)) { return null; }
                item.setVisible(true)
                item.bUse = true;
                return item;
            }
        }
        item = this.createItem()
        if (!this.initItem(item,propId,propCount,isShowCount)) { return null; }
        this.addChild(item);
        this.mItemPool.push(item);
        item.bUse = true;
        return item;
    },

    createItem: function()
    {
        var item = cc.Node.create();
        var light = cc.Sprite.create();
        light.setSpriteFrame(this.fullPath("common/images/com_pic_light.png"))
        light.setScale(1.4)
        light.setOpacity(255*0.5)
        item.light = light
        item.addChild(light,0)
        var spr = cc.Sprite.create();
        item.spr = spr
        item.addChild(spr,1)
        var fnt = ccui.TextBMFont.create();
        fnt.setFntFile(wls.CheckPath(this.fullPath("common/fnt/lottery_gift_num.fnt")))
        fnt.setString(0)
        fnt.setAnchorPoint(cc.p(0.5,0))
        fnt.setPosition(cc.p(0,-40))
        item.fnt = fnt
        item.addChild(fnt,2)
        return item;
    },

    initItem: function(item,propId,propCount,isShowCount)
    {
        var itemData = wls.Config.getItemData(propId);
        if ( !itemData) { return false }
        var fileName = "common/images/prop/"
        item.spr.setSpriteFrame(this.fullPath(fileName+itemData.res))
        item.fnt.setString("")
        if (isShowCount && propCount > 1 ) 
        { 
            var count = propId != 12 ? propCount : propCount/100
            count = propId != 12 ? count : count+"y"
            item.fnt.setString(count)
        }
        item.setOpacity(255);
        // item.light.runAction(cc.RepeatForever.create(cc.RotateBy.create(1,60)))
        return true;
    },
    /*
    showData:item的显示参数
    */
   initShowData: function(showData)
   {
       showData = showData || {} 
        //玩家视图id
       showData.viewid = showData.viewid || 0
       //初始位置
       showData.firstPos = showData.firstPos || cc.p(display.width/2,display.height/2)
       //是否显示数量
       showData.isShowCount == null ? showData.isShowCount = true:0;
       //是否跳动
       showData.isJump == null ? showData.isJump = true:0;
       //是否刷新数据 //0不刷新  1.不先加缓存，加数据   2.加缓存 加数据  3.直接加数据
       showData.refreshType == null ? showData.refreshType = 2:0
       //最大缩放
       showData.maxScale = showData.maxScale || 1.2 
       //收取终点时的缩放
       showData.endScale = showData.endScale || 0.8
       //延时
       showData.delayTime = showData.delayTime || 0
       //层级
       showData.zorder = showData.zorder || 0
       //回调函数
       showData.callFun = showData.callFun || function() {}
       //数据
       showData.propData = showData.propData || null

       //终点位置
       if (showData.endPos == null) {
            if (showData.viewid != 0) {
                var cannon = this.find("GOCannon" + showData.viewid);
                showData.endPos = cannon ?cannon.getCentrePos():cc.p(0,0)
            } else {
                if (showData.propData.propId == 1) {
                    showData.endPos = wls.getWordPosByNode(this.find("UIHallPanel").node_coin)
                } else if( showData.propData.propId == 2) {
                    showData.endPos = wls.getWordPosByNode(this.find("UIHallPanel").node_crystal)
                } else {
                    showData.endPos = wls.getWordPosByNode(this.find("UIHallPanel").btn_bb)
                }
            }
       }
  
       return showData
   },

    getDropPos: function(propId,dropPos,count,allCount)
    {
        var pos = cc.p(dropPos.x,dropPos.y);
        var dis = 150
        if (propId != 2 || allCount < 4) 
        { 
            pos.x = dropPos.x - (allCount - 1)*dis/2 + (count - 1)*dis;
            return {pos : pos,idx : count };
        }
        dis = 75
        var idx = 0;
        var scale = 0.8
        if (allCount == 10) 
        {
            if (count <= 3) {
                pos.x = (count - 2)*dis + dropPos.x
                pos.y = dis + dropPos.y
                idx = count
            } else if (count <= 7 )
            {
                pos.x = (count - 3 - 2.5)*dis + dropPos.x
                pos.y = dropPos.y
                idx = count- 3
            } else {
                pos.x = (count - 7 - 2)*dis + dropPos.x
                pos.y = - dis + dropPos.y
                idx = count- 7
            }
            return {pos : pos,idx : idx ,scale:scale};
        }
        if (allCount > 4) 
        {
            var midCount = Math.ceil(allCount /2 )
            idx = count <= midCount ? count : count - midCount
            pos.x = dropPos.x - (count <= midCount ? midCount -1 : allCount - midCount - 1)*dis/2 + (idx - 1)*dis
            pos.y = count <= midCount ? dropPos.y + dis/2 : dropPos.y - dis/2
        }
        return {pos : pos,idx : idx ,scale:scale};
    },
    //viewid = 0表示大厅
    play: function(showData)
    {
        this.initShowData(showData);
        if (showData.refreshType == 2) {
            this.cacheProp(showData.viewid,showData.propData)
        }
        var item = this.getItem(showData.propData.propId,showData.propData.propCount,showData.isShowCount)
        item.setPosition(showData.firstPos);
        item.setVisible(false);
        item.setScale(showData.maxScale);
        if (showData.zorder > 0) {
            item.retain()
            item.removeFromParent()
            this.getScene().mRoot.addChild(item,showData.zorder);
        } else {
            item.retain()
            item.removeFromParent()
            this.addChild(item)
        }
        item.light.stopAllActions();
        item.light.runAction(cc.RepeatForever.create(cc.RotateBy.create(1,60)))
        var self = this;
        if (showData.isJump) 
        {
            showData.delayTime = showData.delayTime + this.playJump(item,showData.maxScale,showData.delayTime);
        } 
        var act3 = cc.spawn(cc.scaleTo(0.75, showData.endScale), cc.moveTo(0.75, showData.endPos).easing(cc.easeExponentialIn()));
        var act4 = cc.callFunc(function()
        {
            self.find("SCSound").playEffect("getprop_01.mp3", false);
            item.bUse = false; 
            item.setVisible(false); 
            item.light.stopAllActions();
            if (showData.refreshType != 0)
            {
                self.updatePropCount(showData.refreshType,showData.viewid,showData.propData)
            }
            if (showData.callFun) {showData.callFun()}
        });
        var act = cc.sequence(cc.delayTime(showData.delayTime), cc.show(), cc.delayTime(0.83), act3,cc.delayTime(0.05), act4);
        item.runAction(act);
        return showData.delayTime + 0.83 + 0.75
    },

    playJump: function(item,maxScale,delayTime)
    {
        item.setScale(0.3);
        var tb = [
            cc.DelayTime.create(delayTime),
            cc.Show.create(),
            cc.ScaleTo.create(20/60,maxScale*1.05,maxScale*0.9),
            cc.ScaleTo.create(7/60,maxScale*0.9,maxScale*1.1),
            cc.ScaleTo.create(8/60,maxScale,maxScale),
        ]
        var tb2 = [
            cc.DelayTime.create(delayTime),
            cc.MoveBy.create(10/60,cc.p(0,170)),
            cc.MoveBy.create(10/60,cc.p(0,-70)),
        ]
        item.runAction(cc.Spawn.create(cc.Sequence.create(tb), cc.Sequence.create(tb2)))
        return (20+7+8 +30)/60
    },
    //缓存数据
    cacheProp: function(viewid,propData)
    {
        if (propData == null) { return }
        if (viewid == 0) { //大厅刷新数据
            return 
        }
        var cannon = this.find("GOCannon" + viewid);
        cannon.willOpProp(propData.propId,propData.propCount)

    },
    //刷新数据
    updatePropCount: function(refreshType,viewid,propData)
    {
        if (propData == null || refreshType == 0){ return }
        if (wls.GameState == 1) { //大厅刷新数据
            this.updateHallPropCount(propData)
        } else if (wls.GameState == 2) {
            this.updateGamePropCount(refreshType,viewid,propData)
        }

    },
    //刷新大厅数据
    updateHallPropCount: function(propData)
    {
        if (propData.propId == 1) {
            this.find("DAPlayer").setMoney(this.find("DAPlayer").getMoney()+propData.propCount)
            this.find("UIHallPanel").updateMoney()
        } else if (propData.propId == 2) { //其他道具刷新
            this.find("DAPlayer").setGem(this.find("DAPlayer").getGem()+propData.propCount)
            this.find("UIHallPanel").updateMoney()
        } else {
            this.getScene().addProps([propData])
        }

        // if (this.find("UIBag") && this.find("UIBag").isVisible()) {
        //     this.find("UIBag").initScrollView()
        // }
    },

    //刷新游戏内数据
    updateGamePropCount: function(refreshType,viewid,propData)
    {
        viewid = viewid || FG.SelfViewID
        var cannon = this.find("GOCannon" + viewid);
        if (viewid == FG.SelfViewID && propData.propCount > 0 ) { cannon.playAwardTip(propData.propId,propData.propCount)}
        if (refreshType == 3) {
            cannon.opProp(propData.propId,propData.propCount,propData.ifSenior?propData:null )
        } else {
            cannon.doOpProp(propData.propId,propData.propCount,propData.ifSenior?propData:null )     
        }
    },

    playHitDropProp: function (viewid, dropPos,endPos, dropProps, dropSeniorProps)
    {
        var isGem = false
        wls.connectPropTb(dropProps,dropSeniorProps)
        dropProps.sort( function(a, b){ return a.propId - b.propId ; })
        for (var index = 0; index < dropProps.length; index++)
        {
            var element = dropProps[index];
            if (element.propId == 2)
            {
                isGem = true
                for (var index2 = 0; index2 < element.propCount; index2++) 
                {
                    var posData = this.getDropPos(element.propId,dropPos,index2+1,element.propCount)
                    var showData = {
                        viewid     : viewid,
                        firstPos   : posData.pos,
                        endPos     : endPos,
                        isShowCount: false,
                        refreshType: index2 == 0?2: 0,
                        delayTime  : 0.8 + posData.idx*0.1,
                        maxScale   : posData.scale,
                        propData   :  element,
                    }
                    this.play(showData)
                }
                dropPos.y = dropPos.y + 120
                continue
            } else if (element.propId == 2004 || element.propId == 2005) {
                this.updatePropCount(2,viewid,element)
                continue
            } else if (element.propId == 18 && this.playFishCardRate(viewid,element.propId,element.propCount,dropPos)) {
                continue
            }
            var posData = this.getDropPos(element.propId,dropPos,isGem ? index :index+1,isGem ? dropProps.length-1 :dropProps.length)
            var showData = {
                viewid   : viewid,
                firstPos : posData.pos,
                endPos   : endPos,
                delayTime: 0.8 + posData.idx*0.1,
                propData : element,
            }
            this.play(showData)
        }
    },

    playFishCardRate: function (viewid,propId,propCount,dropPos)
    {
        if (propId != 18 ||this.fishCardMin >propCount ) { return false}
        var base_num = wls.Config.get("room", wls.RoomIdx + 910000000).base_num;
        var endRate = propCount/base_num
        if (Math.floor(endRate) < endRate ) { return false }
        
        var go = this.createGameObject("EFNumJump");
        var showData = {
            propId: propId,
            propCount: propCount,
            dropPos: dropPos,
            endRate :endRate,
            base_num :base_num,
            propData : {propId : propId,propCount : propCount}
        }
        go.initWithType(1,viewid,showData)
        return true 
    }

});