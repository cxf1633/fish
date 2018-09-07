// 起航奖励
wls.namespace.UINewerReward = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Box
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadStudioNode(this.fullPath("hall/uinewerreward.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        
        this.initData();
        this.initView();

        this.actTime = 1.58;

        this.inner_action.play("run_act", true);
    },

    initData: function()
    {
        var config = wls.Config.get("level", 980000001).level_reward;
        var list = config.split(";")
        this.rewardList = [];
        for (var index = 0; index < list.length; ) 
        {
            var item = {propId:list[index], propCount:list[index+1]};
            this.rewardList.push(item);
            index = index +2;
        }

        for (var index = 0; index < this.rewardList.length; index++) 
        {
            cc.log("propId:"+this.rewardList[index].propId+" propCount:"+this.rewardList[index].propCount);
        }
    },

    initView: function()
    {
        var dis = 148;
        var posLeft = dis*(this.rewardList.length-1)/2;
        for (var index = 0; index < this.rewardList.length; index++) 
        {
            var propId = this.rewardList[index].propId;
            var propCount = this.rewardList[index].propCount;
            var spr = this.createProp(propId, propCount);
            this.node_list.addChild(spr);
            this["prop_"+propId] = spr;
            spr.setPositionX(-posLeft + index*dis);
        }
    },

    createProp: function(propId, propCount) 
    {
        var item = wls.LoadStudioLayout(this.fullPath("hall/uineweritem.json"));
        wls.BindUI(item, item);

        var info = wls.Config.get("item", 200000000+parseInt(propId));
        var sprFile = this.fullPath("common/images/prop/" + info.res);
        cc.spriteFrameCache.getSpriteFrame(sprFile) && item.spr_prop.setSpriteFrame(sprFile);
        item.fnt_count.setString(propCount);

        return item;
    },

    showAct: function()
    {
        this.btn_get.setVisible(false);

        var self = this;
        var callFun = function()
        {
            self.btn_get.setVisible(true);
        };

        cc.log("width:"+display.width+" self.scaleX_"+this.scaleX+" result:"+display.width/this.scaleX)
        this.panel.setPositionX(display.width/this.scaleX);

        var moveAct = cc.MoveTo.create(1.5, cc.p(0, 0));
        var speedAct = cc.EaseExponentialOut.create(moveAct);
        var seq = cc.Sequence.create(speedAct, cc.CallFunc.create(callFun));

        seq.setTag(5050);
        this.panel.stopActionByTag(5050);
        this.panel.runAction(seq);
    },

    endAct: function()
    {
        this.btn_get.setVisible(false);
        this.node_list.setVisible(false);

        var self = this;
        var callFun = function()
        {
            self.btn_get.setVisible(true);
            self.node_list.setVisible(true);
            self.setVisible(false);
            self.find("MainBtns").click_btn_msw();
            self.removeFromScene();
        };
        var moveAct = cc.MoveTo.create(this.actTime+0.05, cc.p(-display.width/this.scaleX, this.panel.getPositionY()))
        var speedAct = cc.EaseExponentialIn.create(moveAct);
        var seq = cc.Sequence.create(speedAct, cc.CallFunc.create(callFun));

        seq.setTag(4040);
        this.panel.stopActionByTag(4040);
        this.panel.runAction(seq);
    },

    //领取新手奖励
    onGetNewerReward: function(resp)
    {
        var props = resp.props;
        var seniorProps = resp.seniorProps;

        wls.connectPropTb(props, seniorProps);

        //自己添加道具
        for (var key = 0; key < props.length; key++) 
        {
            var val = props[key];
            var propId = this.rewardList[key].propId;
            var img_item = this["prop_" + propId];
            var pos = wls.getWordPosByNode(img_item)
            var flyData = {
                viewid     : 0,
                propData   : val,
                firstPos   : pos,
                maxScale   : 1,
                isJump     : false,
                refreshType: 2,
                zorder     : wls.ZOrder.Box+1
            }
            this.actTime = this.find("EFItems").play(flyData);
        }
        this.endAct();
    },

    click_btn_get: function()
    {
        this.btn_get.setEnabled(false);
        this.sendMsg("sendGetNewerReward")
    },
});