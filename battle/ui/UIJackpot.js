// 奖池信息
wls.namespace.UIJackpot = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("battle/lottery/uilotterylayer.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        ccnode.setScale(ccnode.getScale()*scale)
        this.adaptClose(this.btn_close)
        // 贝壳
        for (var i = 1; i <= 6; i++)
        {
            var shell = this["node_shell_" + i]
            wls.BindUI(shell, shell)
            var action = shell.getActionManager().getActionByTag(shell.getTag(), shell);
            action.play("open", false);
        }

        // 按钮 
        for (var i = 1; i <= 6; i++)
        {
            var btn = this["btn_reward_" + i];
            btn.idx = i-1;
            wls.OnClicked(btn, this, "btn_reward");
        }

        // 配置数据
        this.configs = [];
        for (var i = 1; i <= 6; i++)
        {
            var ret = wls.Config.get("reward", 940000000 + i, ret);
            var unit = {};
            unit.limit = parseInt(ret.limit);
            unit.reward = [];
            var allRows = wls.SplitArray(ret.reward);
            for (var j = 0; j <= allRows.length - 3; j += 3)
            {
                var u = {};
                u.propId = parseInt(allRows[j]);
                u.propCount = parseInt(allRows[j + 1]);
                u.type = parseInt(allRows[j + 2]);
                u.res = wls.Config.get("item", 200000000 + u.propId).res;
                unit.reward.push(u);
            }
            this.configs.push(unit);
        }
        cc.log(this.configs);

        this.text_word_nextreward.setString(wls.Config.getLanguage(800000082));
        this.text_word_nextreward.setVisible(false);
        this.text_word_curreward.setString(wls.Config.getLanguage(800000079));
        this.text_word_notice.setString(wls.Config.getLanguage(800000080));
        this.text_word_pool.setString(wls.Config.getLanguage(800000081));

        //灯泡闪动
        this.lampBlink(this.node_bulb1, 0);
        this.lampBlink(this.node_bulb2, 0.5);
    },

    onActive: function()
    {
        this.updateView();
    },
    
    updateView: function()
    {
        var self = this;
        var data = self.find("DABattle").getJackpot();

        this.curKill = data.killRewardFishInDay;
        this.aniKill = data.drawRequireRewardFishCount;
        this.allPoolCoin = data.rewardRate;

        this.lotteryLv = null;
        this.tag = this.getCurLevelReward();

        this.setData();
        this.initUI(this.tag);
    },

    //根据当前的金币，判断属于哪个级别奖励
    getCurLevelReward: function()
    {
        for (var index = 0; index < this.configs.length; index++) 
        {
            var limitCur = this.configs[index].limit;
            var limitNext = this.configs[index+1] == null ? null : this.configs[index+1].limit;
            if (limitNext == null || (this.allPoolCoin < limitNext && this.allPoolCoin >= limitCur)) 
            {
                return index;
            }
        }
    },

    setData: function()
    {
        this.curLVCoin = this.configs[this.tag].limit;
        this.nextLVCoin = this.configs[this.tag + 1] == null ? null : this.configs[this.tag + 1].limit;
    },

    //界面初始化
    initUI: function(index)
    {
        this.initLotteryReward(index);
        this.initCurLottery(index);
        this.initLotteryProcess();
        this.switchLotteryState();
    },

    //设置奖池奖励
    initLotteryReward: function(idx)
    {
        var reward = this.configs[idx].reward;
        this.rewardArr = reward
        for (var i = 1; i <= 6; i++)
        {
            var shell = this["node_shell_" + i];
            var data = reward[i - 1];
            if (data)
            {
                shell.setVisible(true);
                var str = data.id == 12 ? (data.propCount / 100) + "y" : data.propCount
                shell.fnt_prop_count.setString(str);
                var filename = this.fullPath("common/images/prop/" + data.res);
                shell.spr_prop.setSpriteFrame(filename);
            }
            else
            {
                shell.setVisible(false);
            }
        }
    },

    //设置当前奖池
    initCurLottery: function(idx)
    {
        this.fnt_curcoin.setString(this.allPoolCoin);
        for (var i = 1; i <= 6; i++)
        {
            var btn = this["btn_reward_" + i];
            btn.setTouchEnabled(i != (idx+1));
            btn.setBright(i != (idx+1));
            this["spr_curreward_" + i].setVisible(i == (idx+1));
        }
    },

    //设置奖池进度
    initLotteryProcess: function()
    {
        //杀鱼节点更新
        this.fnt_killbar_num.setString(this.curKill + "&" + this.aniKill);
        var per = this.curKill / this.aniKill * 100;
        per = per>100 ? 100 : per;
        this.bar_killfish_count.setPercent(per);

        //奖金池节点更新
        cc.log("this.allPoolCoin:"+this.allPoolCoin+"&this.curLVCoin:"+this.curLVCoin)
        this.fnt_poolbar_num.setString(this.allPoolCoin + "&" + this.curLVCoin);
        cc.log("this.allPoolCoin:"+this.allPoolCoin+" this.curLVCoin:"+this.curLVCoin)
        var per2 = (this.curLVCoin > 0) ? (this.allPoolCoin / this.curLVCoin * 100) : (this.allPoolCoin > 0 ? 100 : 0);
        var lockFish = this.btn_startlottery.getChildByName("spr_word_ckjjy");
        var isMatchCoin = per2 >= 100;
        cc.log("isMatchCoin:"+isMatchCoin)
        this.spr_word_kscj.setVisible(isMatchCoin);
        lockFish.setVisible(!isMatchCoin);
        cc.log("per2:"+per2)
        this.bar_coinpool.setPercent(per2);
    },

    //切换可否抽奖，进度状态
    switchLotteryState: function()
    {
        if (this.curKill < this.aniKill) 
        {
            this.node_killfish.setVisible(true);
            this.node_coinpool.setVisible(false);
            this.text_word_nextreward.setVisible(false);
        } 
        else if (this.nextLVCoin == null || this.allPoolCoin < this.nextLVCoin) 
        {
            this.node_killfish.setVisible(false);
            this.node_coinpool.setVisible(true);
            this.text_word_nextreward.setVisible(false);
        }
        else if (this.allPoolCoin >= this.nextLVCoin) 
        {
            this.node_killfish.setVisible(false);
            this.node_coinpool.setVisible(false);
            this.text_word_nextreward.setVisible(true);
        }
    },

    //灯炮闪烁
    lampBlink: function(light, delayTime)
    {
        light.setOpacity(0);//透明度
        var seq = cc.sequence(cc.delayTime(delayTime), cc.callFunc(function()
        { 
            light.stopAllActions();
            var seqAct = cc.sequence(
                cc.fadeTo(0.25,255),//逐渐变亮
                cc.delayTime(0.25),//延时动作
                cc.fadeTo(0.25,0),//逐渐变暗
                cc.delayTime(0.25));
            light.runAction(cc.RepeatForever.create(seqAct));
        }));
        light.runAction(seq);
    },

    //得到距离下一级差多少
    getDisNextCoin: function()
    {
        for (var index = 0; index < this.configs.length; index++) 
        {
            var limitCur = this.configs[index].limit;
            if (this.allPoolCoin < limitCur) 
            {
                return limitCur - this.allPoolCoin;
            }
        }
        return 0;
    },

    //开始抽奖
    startLottery: function()
    {
        this.pushView("UILotteryStart");
        this.find("UILotteryStart").initBeforeLotteryUI(this.tag, this.rewardArr);
    },

    click_btn_startlottery: function()
    {
        //查看图鉴
        var lockFish = this.btn_startlottery.getChildByName("spr_word_ckjjy");
        if (lockFish.isVisible()) 
        {
            this.setVisible(false);
            this.pushView("UIHandBook");
            return;
        }

        var disCoin = this.getDisNextCoin();
        if (disCoin > 0) 
        {
            var strAll = wls.Config.getLanguage(800000313);
            var pos = strAll.indexOf("%d");
            var strBegin = strAll.substring(0, pos);
            var strEnd = strAll.substr(pos+2);
            var str = strBegin + disCoin + strEnd;
            var self = this;
            this.dialog(3, str, function(ret)
            {
                if (ret == 1) 
                {
                    self.startLottery();
                    self.setVisible(false);
                }
            });
        }
        else
        {
            this.startLottery();
            this.setVisible(false);
        }
    },

    click_btn_reward: function(sender)
    {
        this.tag = sender.idx;
        this.setData();
        this.initUI(this.tag);
    },

    click_btn_close: function()
    {
        this.setVisible(false);
    },
    
    click_btn_lookfish: function()
    {
        this.setVisible(false);
        this.pushView("UIHandBook");
    },
    click_btn_help: function() {
        var probabilityTab = []
        var rate = [ 10, 20, 10, 20, 15, 25]
        for (var i = 0; i < this.rewardArr.length; i++) {
            var element = this.rewardArr[i];
            var tb = {}
            tb.probability = rate[i]
            tb.name  = wls.Config.getItemData(element.propId).name
            tb.num  = element.propCount
            probabilityTab.push(tb)
        }

        this.createGameObject("UIProbability", probabilityTab).setPanelPosByNode(this.btn_help)
    },
});