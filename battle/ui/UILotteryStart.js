// 开始抽奖界面//--todo 音效没加 点击分享 新手引导跳转
wls.namespace.UILotteryStart = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("battle/lottery/uilotterystart.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        this.adaptClose(this.btn_close)
        this.setVisible(false);
        this.initUI();
    },

    //界面初始化
    initUI: function()
    {
        this.text_notice.setString(wls.Config.getLanguage(800000005));
        this.shwTime = parseInt(wls.Config.getConfig(990000023));
        var shareData = this.getFirstShareData();
        // this.fnt_share_coin.setString(shareData[1].propCount)
        //this.text_notice.ignoreContentAdaptWithSize(true)
    },

    //获取首次分享数据
    getFirstShareData: function()
    {
        var shareDataList = wls.Config.getConfig(990000114);
        var shareData = wls.SplitArray(shareDataList);
        var result = [];
        for (var j = 0; j <= shareData.length - 4; j += 4)
        {
            var data = {};
            data.propId = parseInt(shareData[j + 1]);
            data.propCount = parseInt(shareData[j + 2]);
            result.push(data);
        }
        return result;
    },

    //初始化没有抽奖前的UI
    initBeforeLotteryUI: function(LVTag, propArr)
    {
        this.LVTag = LVTag;
        this.propArr = propArr;
        this.setVisible(true);
        this.switchLotteryState(true);

        var action = this.getActionManager().getActionByTag(this.node_sixshell.getTag(), this.node_sixshell);
        action.gotoFrameAndPause(0);
        action.play("openall", false);
        this.animation = action;

        for (var i = 0; i < 6; i++) 
        {
            var propId = propArr[i].propId;
            var propCount = propArr[i].propId == 12 ? ((propArr[i].propCount / 100) + "y") : propArr[i].propCount;
            var shell = this["node_shell_"+(i+1)];
            wls.BindUI(shell, shell);
            shell.setVisible(true);
            var action = shell.getActionManager().getActionByTag(shell.getTag(), shell);
            action.play("open", false);

            shell.Panel_shell.idx = i+1;
            wls.OnClicked(shell.Panel_shell, this, "btn_reward");
            shell.Panel_shell.setTouchEnabled(false);

            shell.fnt_prop_count.setString(propCount);
            var res = "common/images/prop/" + wls.Config.getItemData(propId).res;
            shell.spr_prop.setSpriteFrame(this.fullPath(res));
        }
    },

    //设置各个node状态
    switchLotteryState: function(isBefore)
    {
        this.spr_light.setVisible(!isBefore);
        this.btn_startlottery.setVisible(isBefore);
        this.btn_startlottery.setTouchEnabled(isBefore);
        this.image_text_bg.setVisible(!isBefore);
    },

    //点击每个奖品--发送抽奖请求
    click_btn_reward: function(sender)
    {
        this.setSixTouchEnable(false);
        this.choseIndex = sender.idx;
        cc.log("this.choseIndex:"+this.choseIndex);
        this.text_notice.stopAllActions();
        FG.SendMsg("sendStartLottery", this.LVTag);
    },

    //设置六个奖品可否点击
    setSixTouchEnable: function(falg)
    {
        for (var i = 0; i < 6; i++) 
        {
            var shell = this["node_shell_"+(i+1)];
            shell.Panel_shell.setTouchEnabled(falg);
        }
    },

    //开始抽奖
    click_btn_startlottery: function()
    {
        this.btn_startlottery.setVisible(false);
        this.btn_close.setVisible(false);

        var self = this;
        var time = this.shwTime;
        this.animation.play("move", false);
        this.animation.clearFrameEventCallFunc();
        this.animation.setFrameEventCallFunc(function(name){
            if (name.getEvent() == "moveEnd") 
            {
                self.setSixTouchEnable(true);
                self.image_text_bg.setVisible(true);
                var arr = [
                    cc.DelayTime.create(1),
                    cc.CallFunc.create(function () 
                    {//时间完了，自动抽奖
                        time = time -1;
                        if (null == self.choseIndex) 
                        {
                            var str = wls.Config.getLanguage(800000084)+"..."+time;
                            self.text_notice.setString(str);
                            if (time == 0) 
                            {
                                var sender = {};
                                sender.idx = parseInt(Math.random()*5 + 1);
                                self.click_btn_reward(sender);
                            }
                        }
                        else
                        {
                            self.text_notice.stopAllActions();
                        }
                    })
                ];
                self.text_notice.setString(wls.Config.getLanguage(800000084)+"..."+time);
                var repeatAct = cc.RepeatForever.create(cc.Sequence.create(arr));
                self.text_notice.runAction(repeatAct);
            }
        });
    },

    //抽奖后刷新界面
    refreshUIAfterLottery: function(resp)
    {
        this.resp = resp;
        //道具动画与数据处理
        this.rewardArr = this.getLotteryArr(resp);
        var id = this.rewardArr.propId;
        var count = this.rewardArr.propCount;
        var cannon = this.find("GOCannon" + resp.viewid);
        cannon.willOpProp(id,count)
        this.serverIndex = this.getViewIndexByReward(id, count);
        if (this.serverIndex == null ) {
            this.serverIndex = 6
            var shell = this.node_shell_6
            shell.fnt_prop_count.setString(count);
            var res = "common/images/prop/" + wls.Config.getItemData(id).res;
            shell.spr_prop.setSpriteFrame(this.fullPath(res));
        }
        this.playLotteryResultAct();
    },

    //获取服务端返回的抽奖物品id，个数
    getLotteryArr: function(resp)
    {
        var props = resp.props;
        if (props.length > 0) 
        {
            return props[0];
        } else {
            this.dialog(1, wls.Config.getLanguage(800000086));
            this.removeFromScene()
        }

        return {propId:1,propCount:1};
    },

    //根据服务端返回的奖品id，个数。判断是第几个shell
    getViewIndexByReward: function(propId, propCount)
    {
        for (var i = 0; i < 6; i++) 
        {
            var Id = this.propArr[i].id;
            var Count = this.propArr[i].amount;
            if (Id == propId && Count == propCount) 
            {
                return i+1;
            }
        }
        return null 
    },

    //选完奖品后，播放获取动画
    playLotteryResultAct: function()
    {
        //交换当前选择贝壳和目标贝壳的位置
        var fromShell = this["node_shell_" + this.choseIndex];
        var toShell = this["node_shell_" + this.serverIndex];
        var posX = fromShell.getPositionX();
        var posY = fromShell.getPositionY();
        fromShell.setPosition(cc.p(toShell.getPositionX(), toShell.getPositionY()));
        toShell.setPosition(cc.p(posX, posY));

        var self = this;
        var sequenceAct = cc.Sequence.create(
            cc.scaleTo(0.28, 0.8),
            cc.CallFunc.create(function ()  //打开当前贝壳
            {
                self.image_text_bg.setVisible(false);
                var action = toShell.getActionManager().getActionByTag(toShell.getTag(), toShell);
                action.play("open", false);
            }),
            cc.DelayTime.create(0.3),
            cc.CallFunc.create(function ()  //隐藏其他5个贝壳
            {
                for (var index = 1; index <= 6; index++) 
                {
                    if (self.serverIndex != index) 
                    {
                        self["node_shell_" + index].setVisible(false);
                    }
                }
            }),
            cc.DelayTime.create(0.28),
            cc.moveTo(0.4, cc.p(0, -90)),
            cc.DelayTime.create(0.04),
            cc.CallFunc.create(function ()  //隐藏其他5个贝壳
            {
                self.showAwardResult();
            })
        );
        toShell.runAction(sequenceAct);
    },

    //显示结果
    showAwardResult: function()
    {
        if (this.rewardArr == null ) {return}
        var self = this
        this.createGameObject("UIAwardResult").onActive("UILotteryStart",FG.SelfViewID,[this.rewardArr],null,false)
        this.removeFromScene()
    },

    click_btn_close: function()
    {
        this.setVisible(false);
    },
});