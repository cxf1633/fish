// 月卡礼包
// 礼包基类
wls.namespace.UIMonthCardBase = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    initData: function()
    {
        //初始化每日送道具
        var config = wls.Config.getConfig(990000032);
        var list = config.split(";");
        this.everyDayList = [];
        for (var index = 0; index < list.length; ) 
        {
            var item = {propId:list[index], propCount:list[index+1]};
            this.everyDayList.push(item);
            index = index +2;
        }

        //初始化立即送道具
        config = wls.Config.getConfig(990000111);
        list = config.split(";");
        this.onceList = [];
        for (var index = 0; index < list.length; ) 
        {
            var item = {propId:list[index], propCount:list[index+1]};
            this.onceList.push(item);
            index = index +2;
        }

        this.unit = "月卡";
        this.FirstMonthcardId = 830000015;
        this.recharge = wls.Config.get("recharge", 830000015).recharge;
        this.recharge_type = wls.Config.get("recharge", 830000015).recharge_type;
    },

    updayeItemNmae: function(item, propId, propCount, itemType, itemInfo)
    {
        item.fnt_count.setString(propCount);
        var spr_name_path = this.fullPath("hall/images/monthcard/mcard_prop_"+propId+".png");
        cc.spriteFrameCache.getSpriteFrame(spr_name_path) && item.spr_unit.setSpriteFrame(spr_name_path);

        var tb = [];
        if (itemType == 1) 
        {
            if (propId > 1000) 
            {
                item.fnt_count.setString(30);
                tb.push(item.spr_unit);
                tb.push(item.spr_line);
                tb.push(item.fnt_count);
                tb.push(item.spr_day);
            } 
            else 
            {
                item.spr_line.setVisible(false);
                item.spr_day.setVisible(false);
                tb.push(item.fnt_count);
                tb.push(item.spr_unit);
            }
        } 
        else if (itemType == 0) 
        {
            if (propId > 2) 
            {
                item.fnt_count.setString("x" + propCount);
                tb.push(item.spr_unit);
                tb.push(item.fnt_count);
                tb.push(item.spr_line);
                tb.push(item.spr_day);
            } 
            else 
            {
                tb.push(item.fnt_count);
                tb.push(item.spr_unit);
                tb.push(item.spr_line);
                tb.push(item.spr_day);
            }
        }

        var allWidth = 0;
        for (var index = 0; index < tb.length; index++) 
        {
            var v = tb[index];
            v.sizeWith = v.getContentSize().width;
            v.setAnchorPoint(cc.p(0, 0.5));
            allWidth = allWidth + v.sizeWith;
        }

        tb[0].setPositionX(-allWidth/2);
        for (var i = 1; i < tb.length; i++) 
        {
            var pos = tb[i - 1].getPositionX() + tb[i - 1].sizeWith;
            tb[i].setPositionX(pos);
        }
    },

    createItem: function(propId, propCount, itemType)
    {
        var item = wls.LoadStudioLayout(this.fullPath("hall/uimonthcarditem.json"));
        wls.BindUI(item, item);

        var info = wls.Config.get("item", 200000000+parseInt(propId));
        if (itemType == 0) //小的
        {
            var sprFile = this.fullPath("hall/images/monthcard/mcard_pic_"+propId+".png");
            var sprFile_other = this.fullPath("common/images/prop/" + info.res);
            cc.spriteFrameCache.getSpriteFrame(sprFile) ? item.spr_prop.setSpriteFrame(sprFile) 
            : (cc.spriteFrameCache.getSpriteFrame(sprFile_other) && item.spr_prop.setSpriteFrame(sprFile_other));
        } 
        else if (itemType == 1) //大的
        {
            item.panel.setContentSize(cc.size(174,194));
            item.image_bg_word.setContentSize(cc.size(180,50));
            item.image_bg_word.setPositionX(174/2);
            item.node_name.setPositionX(174/2);
            item.spr_prop.setPositionX(174/2);

            var sprFile = this.fullPath("hall/images/monthcard/mcard_pic_"+propId+".png");
            var sprFile_other = this.fullPath("common/images/prop/" + info.res);
            cc.spriteFrameCache.getSpriteFrame(sprFile) ? item.spr_prop.setSpriteFrame(sprFile) 
            : (cc.spriteFrameCache.getSpriteFrame(sprFile_other) && item.spr_prop.setSpriteFrame(sprFile_other));
        }
        this.updayeItemNmae(item, propId, propCount, itemType, info);
        return item;
    },

    click_btn_close: function()
    {
        this.setVisible(false);
        this.find("SCLayerMgr").hideLayerByName(this.UIName)
    },
});

wls.namespace.UIFirstMonthcard = wls.namespace.UIMonthCardBase.extend
({
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("hall/uifirstmonthcard.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        ccnode.setScale(ccnode.getScale()*scale)

        this.initData();
        this.initView();
        this.UIName = "UIFirstMonthcard"
    },

    initView: function()
    {
        var posleftPosX = 0;

        var dis = 168;
        posleftPosX = -(this.everyDayList.length-1)*dis/2;
        for (var index = 0; index < this.everyDayList.length; index++) 
        {
            var v = this.everyDayList[index];
            var node = this.createItem(v.propId, v.propCount, 0);
            node.setScale(0.66);
            this.node_award.addChild(node);
            node.setPositionX(posleftPosX + index * dis);
        }

        dis = 200;
        posleftPosX = -(this.onceList.length-1)*dis/2;
        for (var index = 0; index < this.onceList.length; index++) 
        {
            var v = this.onceList[index];
            var node = this.createItem(v.propId, v.propCount, 1);
            this.node_first_award.addChild(node);
            node.setPositionX(posleftPosX + index * dis);
        }
    },

    click_btn_threetype: function()
    {
        cc.log("click_btn_threetype")
        //this.setVisible(false);
        var conf = this.config
        var tb = {}
        tb.goods = this.FirstMonthcardId;
        tb.price = this.recharge;
        tb.name = this.unit;
        this.showPay(tb);
        wls.rechargeId = this.FirstMonthcardId
        this.setVisible(false);
    },
});

wls.namespace.UIMonthcard = wls.namespace.UIMonthCardBase.extend
({
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("hall/uimonthcard.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        ccnode.setScale(ccnode.getScale()*scale)

        this.initData();
        this.initView();
        this.UIName = "UIMonthcard"
    },

    initView: function()
    {
        var dis = 270;
        var Xcount = 3;
        var posX = 0;
        var posY = 0;
        for (var index = 0; index < this.everyDayList.length; index++) 
        {
            var v = this.everyDayList[index];
            var node = this.createItem(v.propId, v.propCount, 0);
            this.panel.addChild(node);
            this["prop_"+v.propId] = node;
            if (index < Xcount) 
            {
                posX = -dis + index*dis;
                posY = 80;
            } 
            else 
            {
                posX = -dis + (index - Xcount)*dis + dis*0.5;
                posY = -120;
            }
            node.setPosition(posX, posY);
        }

        var data = this.find("DAPlayer").getMonthCardState();
        cc.log(data);
        this.setLeftMonthCardDay(data);
    },

    setLeftMonthCardDay: function(data)
    {
        if (data.leftDay <= 0) 
        {
            this.showType = 1;
        } 
        else if (data.state == 2) 
        {
            this.showType = 3;
        }
        else
        {
            this.showType = 2;
        }

        this.setShowType(this.showType, data.leftDay);
    },

    setShowType: function(showType, leftDay)
    {
        this.node_leave.setVisible(false);
        for (var index = 1; index <= 3; index++) 
        {
            this["spr_word_" + index].setVisible(false);
        }

        this["spr_word_" + showType].setVisible(true);
        this.btn_threetype.setVisible(true);
        if (showType == 3) 
        {
            this.btn_threetype.setVisible(false);
            this.node_leave.setVisible(true);
            this.fnt_daynum.setString(leftDay - 1);
        }
    },

    //月卡领取
    getMonthCardReward: function(data)
    {
        var props = data.rewardItems;
        var seniorProps = data.seniorProps;

        wls.connectPropTb(props, seniorProps);
		this.find("SCSound").playEffect("congrat_01.mp3", false);
        this.setShowType(3, 30);
        this.toast(wls.Config.getLanguage(800000156));

        this.find("DAPlayer").setMonthCardGetAward()

        //添加道具
        for (var key = 0; key < props.length; key++) 
        {
            var val = props[key];
            var img_item = this["prop_" +  val.propId];
            if (img_item == null ) {continue}
            var pos = wls.getWordPosByNode(img_item.spr_prop)
            cc.log("pos.x:"+pos.x)
            var flyData = {
                viewid  : 0,
                propData: val,
                firstPos: pos,
                maxScale: 1,
                isJump  : false,
                zorder  : wls.ZOrder.Award+1
            }
            this.find("EFItems").play(flyData);
        }

        this.btn_threetype.setEnabled(true);
    },

    click_btn_threetype: function()
    {
        cc.log("click_btn_threetype")
        this.btn_threetype.setEnabled(false);
        this.sendMsg("sendGetMonthCard")
    },
});