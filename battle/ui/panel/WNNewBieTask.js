//-----------------------------------------------------
// 新手任务
//-----------------------------------------------------
wls.namespace.WNNewBieTask = wls.WrapNode.extend
({
    onCreate: function()
    {
        wls.BindUI(this, this);
        this.setVisible(false);
        var action = this.getActionManager().getActionByTag(this.getTag(), this);
        this.action = action;
        this.taskid = 0;
        this.showEnterAni = true;
        this.rewardTab = [];    // 奖励道具id,数量
        this.need = 0; // 完成需要多少
        var h = this.img_bg.getContentSize().height;
        this.x = display.width / 2;
        this.showY = display.height - h / 2;
        this.hideY = display.height + h / 2;
        this.RewardTasking = false; //悬赏任务是否进行
        //this.setVisible(FG.RoomConfig.ENABLE_TASK);
    },

    calcConfig: function(config)
    {
        this.rewardTab = [];
        var tb = wls.SplitArray(config.reward);
        for (var index = 0; index < tb.length;) 
        {
            var ret = {};
            ret.itemid = parseInt(tb[index++]);
            if (index >= tb.length) return;
            ret.amount = parseInt(tb[index++]);
            this.rewardTab.push(ret);
        }
        this.need = parseInt(config.task_data);
    },

    // 重置任务
    resetTask: function(id, cur)
    {
        if (id != -1 || cur != -1) 
        {
            this.taskid = id + 450000000;
            var config = wls.Config.get("newtask", this.taskid);
            this.setVisible(false);
            if (config == null) return;

            if (this.completeSpr) 
            {
                this.panel.removeChild(this.completeSpr);
                this.completeSpr = null;
            }

            if (this.showEnterAni)
            {
                this.showEnterAni = false;

                this.y = this.hideY;
                this.stopActionByTag(101);
                if (!this.RewardTasking) 
                {
                    this.dropDownTaskWin();
                }
                

                //this.text_desc.setString(config.task_text);
                this.calcConfig(config);
            }
            this.setVisible(FG.RoomConfig.ENABLE_TASK);
            this.updateItem(config,id,cur);
            this.share_reward = config.share_reward
            
        } 
        else 
        {
            this.curTaskData = null;
            this.setVisible(false);
        }
        
    },

    dropDownTaskWin: function()
    {
        this.RewardTasking = false;
        this.runAction(cc.moveBy(0.5, cc.p(0, this.showY - this.hideY)));
    },

    drawBackTaskWin: function()
    {
        this.RewardTasking = true;
        this.runAction(cc.moveBy(0.5, cc.p(0, this.hideY - this.showY)));
    },

    isTaskPlaying: function()
    {
        return (null != this.curTaskData);
    },

    playTaskComplete: function()
    {
        var self = this;
        var callFun = function()
        {
            self.click_btn_draw();
        };

        var spawn = cc.Spawn.create(cc.ScaleTo.create(0.4, 1), cc.FadeTo.create(0.4, 255));
        var seq = cc.Sequence.create(spawn, cc.DelayTime.create(1), cc.CallFunc.create(callFun));
        this.completeSpr = cc.Sprite.create();
        this.completeSpr.setSpriteFrame(this.fullPath("battle/images/rewardtask/rt_finish.png"))
        this.completeSpr.setScale(8);
        this.completeSpr.setOpacity(0);
        this.completeSpr.runAction(seq);
        this.completeSpr.setPosition(0, 0);
        this.panel.addChild(this.completeSpr, 100);
    },

    //更新任务界面信息  taskID任務id；taskData 任務完成數量
    updateItem: function(curTaskData, taskID, taskData)
    {
        this.curTaskData = curTaskData;

        //任务奖励
        this.refreshTaskReward(curTaskData);

        //任务是否可领
        var isFinished = taskData >= parseInt(curTaskData.task_data)
        this.refreshTaskFinishState(isFinished)

        this.stopMayGetRewardAnimation();
        this.refreshTaskProcessUI(parseInt(curTaskData.task_type), taskData, curTaskData.task_data);

        //任务进度与可领奖励动画
        if (isFinished) 
        {
            this.playTaskComplete();
            return 
        }

        if (Number(curTaskData.guide_type) == 4) //
        {
            this.find("UISkillPanel").createSkillNoticeNode(4)
        }
        else if (Number(curTaskData.guide_type) == 5)
        {
            this.find("UISkillPanel").createSkillNoticeNode(3)
        }

    },

    //根据任务有沒有完成，更新界面
    refreshTaskFinishState: function(isFinished)
    {
        //this.text_desc.setVisible(!isFinished);
        this.spr_draw_effect.setVisible(isFinished);
        //this.btn_draw.setVisible(isFinished);
        //this.btn_draw.setTouchEnabled(isFinished);
    },

    //更新奖励道具信息   propId：任务奖励道具id ； propCount：任务奖励道具数量； testDes：任务描述
    refreshTaskReward: function(curTaskData)
    {
        var self = this;
        for (var index = 1; index <= 2; index++) 
        {
            self["img_item" + index].setVisible(false);
        }

        for (var i = 0; i < this.rewardTab.length; i++) 
        {
            var config = wls.Config.get("item", 200000000 + this.rewardTab[i].itemid);
            if (config == null) return;

            var offset = (this.rewardTab.length-1)*40;
            var propId = this.rewardTab[i].itemid;
            var propCount = this.rewardTab[i].amount;
            var resName = config.res;
            var img_item = self["img_item" + (i+1)];
            var icon = img_item.getChildByName("img_icon");
            var fnt = img_item.getChildByName("fnt_num");
            offset = (i == 0 ? -offset : offset);
            img_item.setVisible(true);
            img_item.setPositionX(70+offset);
            icon.setSpriteFrame(this.fullPath("common/images/prop/" + resName));
            fnt.setString(propId == 12 ? (propCount/100)+"y" : (propCount >= 10000 ? ((propCount/10000)+"w") : propCount));
        }

        this.spr_task_name.setVisible(true);
        cc.log("curTaskData.task_pic:"+curTaskData.task_pic);
        this.spr_task_name.setSpriteFrame(this.fullPath("battle/images/newbietask/"+curTaskData.task_pic));
    },

    //更新進度條  --curPro：任务完成数量 --totalPro：任务总数量
    refreshTaskProcessUI: function(taskType, curPro, totalPro) 
    {
        this.fnt_process.setString(curPro+"&"+totalPro);
        if (taskType == 5) 
        {
            //使用技能只显示几次
            this.fnt_process.setString(totalPro+"c");
        } 
        else if (taskType == 4)
        {
            //升级炮倍只显示几倍
            this.fnt_process.setString(totalPro+"b");
        }
    },

    //停止可解锁帧动画
    stopMayGetRewardAnimation: function()
    {
        //this.btn_draw.stopAllActions();
    },

    // 请求获得新任务
    getNewTask: function()
    {
        this.showEnterAni = true;
        FG.SendMsg("sendGetNewTaskInfo");
    },

    // 获得下一个任务
    getNextTask: function(resp, player)
    {
        this.updateAfterGetReward(resp, player)
        //添加别人添加金币和水晶
        if (!player.bSelf) return;
        this.taskid = 0;
        this.y = this.showY;
        var act1 = cc.moveBy(0.5, cc.p(0, this.hideY - this.showY));
        var self = this;
        var act2 = cc.callFunc(function(){
            self.setVisible(false);
            self.getNewTask();
        });
        var act = cc.sequence(act1, act2);
        act.setTag(101);
        this.runAction(act);
    },

    //领取奖励后更新界面
    updateAfterGetReward: function(resp, player)
    {
        var cannon = this.find("GOCannon" + player.viewid);
        var props = resp.props || {};
        var SeniorProps = resp.SeniorProps || {};
        var self = this;
        wls.connectPropTb(props,SeniorProps)

        //添加别人添加金币和水晶
        if (!player.bSelf) 
        {
            for (var index = 0; index < props.length; index++) 
            {
                var val = props[index];
                cannon.opProp(val.propId,val.propCount);
            }
            return;
        }

        var order = null 
        if (Number(this.curTaskData.guide_type) == 6) 
        {
            this.find("UISkillPanel").createSkillNoticeNode(17)
        } else if (Number(this.curTaskData.guide_type) == 1) 
        {
            order = wls.ZOrder.GreenHand + 6
            this.find("UIGreenHand").trigger("iFirstLimitGun",{propId:1005,propCount:1})
        }

        //自己添加道具
        for (var key = 0; key < props.length; key++) 
        {
            var val = props[key]
            var img_item = self["img_item" + (key+1)];
            var pos = wls.getWordPosByNode(img_item)
            if (val.propId == 18 && this.curTaskData.guide_type == "3" && wls.Modules.Enable_Exchange) {
                this.find("EFItems").updatePropCount(3,FG.SelfViewID,val)
                val.firstPos = pos
                this.find("UIGreenHand").trigger("iFirstGetProp18",val)
                continue
            }
            
            var flyData = {
                viewid     : FG.SelfViewID,
                propData   : val,
                firstPos   : cc.p(pos.x,pos.y - 150),
                maxScale   : 1,
                refreshType: 2,
                zorder     : order,
            }
            this.find("EFItems").play(flyData);
        }


    },

    click_btn_draw: function()
    {
        if (parseInt(this.share_reward) != 0) {
            this.pushView("UINewerTaskCompleteShare", {"config":this.share_reward, "args":this.taskid-450000000})
        }
        FG.SendMsg("sendGetNewTaskReward", this.taskid);
        //this.btn_draw.setTouchEnabled(false);
    },
});