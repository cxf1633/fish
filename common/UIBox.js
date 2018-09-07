"use strict";

//-----------------------------------------------------
// 礼包合集
//-----------------------------------------------------

// 礼包基类
wls.namespace.UIChestBase = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Box
    },
    onCreate: function(id)
    {
        window.test = this;
        this.id = id;
        this.config = wls.Config.get("gif", id);
        this.tConfig = this.find("DAPlayer").getTypeConfig(this.config.type);
        this.initUI();
        this.initReward();
    },

    initUI: function()
    {
        wls.CreateMask(this); 
        var filename = this.fullPath("battle/box/" + this.tConfig.res);
        var ccnode = wls.LoadStudioNode(filename, this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        ccnode.setScale(ccnode.getScale()*scale)
    },

    initReward: function()
    {

    },

    sendBuy: function()
    {
        this.setVisible(false)
        var conf = this.config
        var tb = {}
        tb.goods = conf.id;
        tb.price = conf.buy_num;
        tb.name = conf.name;
        this.showPay(tb);
        wls.rechargeId = conf.id
    },

    setIcon: function(i , id)
    {   
        var f1 = this.fullPath('battle/images/box/box_icon_' + id +'.png');
        // if([7,8,9,10].indexOf(id) > -1) 
        // {
        //     f1 = this.fullPath('battle/images/box/box_icon_003.png');
        // }
        var icon = this['item_icon_' + i];
        cc.spriteFrameCache.getSpriteFrame(f1) &&
            icon.setSpriteFrame(f1);
    },

    setItemNum : function(i, num,isX)
    {
        var unit = this['item_unit_w_' + i],
            item_num = this['item_num_' + i];

        unit && unit.setVisible(num >= 10000);
        var str =  (unit && num >= 10000) ? (num / 10000).toFixed(0) : num
        item_num.setString((isX?"x":"")+str);
    },

    setItemName:function(i, id)
    {
        var name = this['item_name_' + i];
        var f = this.fullPath('battle/images/box/box_item_name_' + this.strFormat(id , 3) + '.png');
        cc.spriteFrameCache.getSpriteFrame(f) && name.setSpriteFrame(f)
    },

    //字符串自动补全
    strFormat:function(str, num){
        str = str + '';
        while(str.length < num)
        {
            str = '0' + str;
        }
        return str;
    },

    click_btn_close: function()
    {
        this.setVisible(false);
        this.find("SCLayerMgr").hideLayerByName(this.tConfig.cls)
        if (this.tConfig.cls == "UIYiYuanChest") {
            this.find("SCLayerMgr").hideLayerByName("SingleBoxByRate")
        }
    },
    click_btn_buy: function()
    {
        this.sendBuy();
    },
});

// 一元礼包
wls.namespace.UIYiYuanChest = wls.namespace.UIChestBase.extend
({
    onCreate: function(id)
    {
        this._super(id);
    },

    initReward: function()
    {
        var reward = this.config.reward.split(';');
        for(var i = 1; this['item_icon_' + i]; i++)
        {
            var num = reward[(i - 1) * 2 + 1];
            this.setIcon(i, reward[( i - 1) * 2]);
            this.setItemNum(i, num);
        }
    },
});

// 幸运宝箱
wls.namespace.UILuckChest = wls.namespace.UIChestBase.extend
({
    onCreate: function(id)
    {
        this._super(id);
    },

    initReward: function()
    {
        var config = this.config;
        var reward = config.reward.split(';');

        var count = reward.length/2
        var dis = 150
        var leftPos = 125 - (count - 1) * dis
        for(var i = 1; this['img_item_' + i]; i++)
        {
            var num = reward[(i - 1) * 2 + 1];
            if(!num) 
            {
                this['img_item_' + i].setVisible(false);
                continue;
            }
            this['img_item_' + i].setVisible(true);
            this['img_item_' + i].setPositionX(leftPos+ (i - 1) *dis)
            var unit = this['item_unit_w_' + i],
                icon = this['item_icon_' + i],
                name = this['item_name_' + i],
                item_num = this['item_num_' + i];

            this.setItemName(i, reward[( i - 1) * 2]);
            this.setIcon(i, reward[( i - 1) * 2]);
            this.setItemNum(i, num);

            if( num >= 10000)
            {
                item_num.setPositionX(unit.getPositionX() - item_num.getContentSize().width + unit.getContentSize().width);
            }else
            {
                item_num.setPositionX(160);
            }
        }

        var wordPic = this.fullPath("battle/images/box/box_lucky_title_text_"+config.buy_num/100+".png")
        this.spr_info.setSpriteFrame(wordPic)


        //TODO: 需要根据服务器时间设置还有多长时间结束
        var self = this
        var time = self.find("DAPlayer").luckBoxEndTime - (wls.GetCurTimeFrame() + wls.serverTimeDis)
        this.time = time
        this.updateShowTimer(this.time);
        this.startTimer('updateTimer', 1 , 1 , -1)
        var seq = cc.Sequence.create(cc.DelayTime.create(time),cc.CallFunc.create(function () {
            self.post("onEventUpdateBox");
            self.setVisible(false);
        }))
        seq.setTag(3131)
        this.spr_info.stopActionByTag(3131)
        this.spr_info.runAction(seq)
    },

    // 更新时间显示
    updateTimer: function()
    {
        this.time -= 1; 
        this.updateShowTimer(this.time);
    },

    updateShowTimer: function (time)
    {
        var h = Math.floor(time / (60 * 60)),
            m = Math.floor(time / 60 % 60),
            s = Math.floor(time % 60);
        h = this.strFormat(h , 2);
        m = this.strFormat(m , 2);
        s = this.strFormat(s , 2);
        this.text_time.setString('限时购买' + h + ':' + m +':' +s);
    },

});

//锻造礼包
wls.namespace.UIForgedChest = wls.namespace.UIChestBase.extend
({
    onCreate:function(id)
    {
        this._super(id);
        this.adaptClose(this.btn_close)
    },

    initReward: function()
    {
        var config = this.config;
        this.fnt_buy_price.setString(Math.round(config.buy_num / 100) + '');
        this.fnt_value.setString(config.value + 'y');
        // this.img_descript.width = this.fnt_value.getContentSize().width + 240;
        this.pricePosX = this.pricePosX || this.fnt_buy_price.getPositionX()
        var reward = config.reward.split(';');

        for(var i = 1; this['img_item_' + i]; i++)
        {
            var num = reward[(i - 1) * 2 + 1];
            if(!num) 
            {
                this['img_item_' + i].setVisible(false);
                continue;
            }
            var unit = this['item_unit_w_' + i],
                icon = this['item_icon_' + i],
                name = this['item_name_' + i],
                item_num = this['item_num_' + i];

            this.setIcon(i, reward[( i - 1) * 2]);
        }

        this.txt_prop_1.setString(config.name);

        var allWidth = this.fnt_buy_price.getContentSize().width + this.spr_buy_cell.getContentSize().width
        var pos = this.pricePosX + (this.fnt_buy_price.getContentSize().width - allWidth/2)
        this.fnt_buy_price.setPositionX(pos)
        this.spr_buy_cell.setPositionX(pos)

    },
});

//炮倍礼包
wls.namespace.UIGunRateChest = wls.namespace.UIChestBase.extend
({
    onCreate:function(id)
    {
        this._super(id);
    },

    initReward: function()
    {
        var config = this.config;
        this.fnt_new_price.setString(Math.round(config.buy_num / 100) + '');
        this.fnt_old_price.setString(config.value);
        this.fnt_rate_per.setString(config.discount)

        var perTb = {
            830001017: "20%",830001018 : "10%",830001019 : "8%",830001020 : "5%"
        }
        this.fnt_per.setString(perTb[config.id])

        var reward = config.reward.split(';');
        var itemList = []
        for (var i = 0; i < reward.length; i++) {
            var propId = reward[i];
            if (propId == 8 || propId == 9 || propId == 10) {
                i++;
                continue
            }
            //var item = this.img_item.clone()
            var item = this.getItem()
            this.panel.addChild(item)
            this.updateItem(item,propId,reward[i+1])
            itemList.push(item)
            i++;
        }
        this.img_item.setVisible(false)

        var dis = 300
        var leftPos = -dis*(itemList.length -1)/2
        for (var i = 0; i < itemList.length; i++) {
            var item = itemList[i];
            item.setPositionX(leftPos+i*dis)
            item.setPositionY(10)
            if (itemList[i+1]) {
                var add = this.img_add.clone()
                this.panel.addChild(add)
                add.setPositionX(leftPos+i*dis +dis/2 )
            }
        }
        this.img_add.setVisible(false)

        this.spr_rate.setLocalZOrder(2)
        this.fnt_rate_per.setLocalZOrder(3)
    },

    updateItem:function(item,propId,propCount){
        wls.BindUI(item,item)
        var propPic = this.fullPath('battle/images/box/box_icon_' + propId + '.png')
        item.img_prop_name.loadTexture(this.fullPath("battle/images/box/box_prop_"+propId+".png"),1)
        item.img_prop_name.ignoreContentAdaptWithSize(true)
        item.img_prop.ignoreContentAdaptWithSize(true)
        item.img_prop.loadTexture(propPic,1)
        item.fnt_count.setString(propCount >= 10000?propCount/10000:propCount)
        item.img_w.setVisible(propCount >= 10000)
        
        var allwidth = item.img_prop_name.getContentSize().width +item.fnt_count.getContentSize().width
        allwidth = allwidth + (propCount >= 10000? item.img_w.getContentSize().width:0)
        item.img_prop_name.setPositionX(-allwidth/2)
        item.fnt_count.setPositionX(-allwidth/2 + item.img_prop_name.getContentSize().width )
        item.img_w.setPositionX(-allwidth/2 + item.img_prop_name.getContentSize().width + item.fnt_count.getContentSize().width)
        
        item.img_prop.setPositionY(0)
        return item
    },

    getItem:function()
    {
        var item =  cc.Node.create()
        var img_prop = ccui.ImageView.create()
        item.addChild(img_prop)
        img_prop.setPositionY(0)
        item.img_prop = img_prop

        var img_prop_name = ccui.ImageView.create()
        item.addChild(img_prop_name)
        img_prop_name.setPositionY(-138)
        item.img_prop_name = img_prop_name
        img_prop_name.setAnchorPoint(cc.p(0,0.5))

        var img_w = ccui.ImageView.create()
        img_w.loadTexture(this.fullPath("battle/images/box/box_gunrate_pic_w.png"),1)
        item.addChild(img_w)
        img_w.setPositionY(-138)
        item.img_w = img_w
        img_w.setAnchorPoint(cc.p(0,0.5))

        var fnt_count = ccui.TextBMFont.create()
        fnt_count.setFntFile(wls.CheckPath(this.fullPath("common/fnt/box_num_1.fnt")))
        item.addChild(fnt_count)
        fnt_count.setPositionY(-138)
        item.fnt_count = fnt_count
        fnt_count.setAnchorPoint(cc.p(0,0.5))

        return  item
    },

});

//尊享豪礼
wls.namespace.UINobleChest = wls.namespace.UIChestBase.extend
({
    onCreate:function(id)
    {
        this._super(id);
    },

    initReward: function()
    {
        var config = this.config;
        this.fnt_buy_price.setString(Math.round(config.buy_num / 100) + '');
        this.fnt_value.setString(config.value + '');

        var reward = config.reward.split(';');

        var sizeWidth = this.img_item_1.getContentSize().width
        for(var i = 1; this['img_item_' + i]; i++)
        {
            var num = reward[(i - 1) * 2 + 1];

            var unit = this['item_unit_w_' + i],
                icon = this['item_icon_' + i],
                name = this['item_name_' + i],
                item_num = this['item_num_' + i];

            this.setIcon(i, reward[( i - 1) * 2]);
            this.setItemNum(i, num);

            item_num.setPositionX(sizeWidth/2 - (num >= 10000 ?(unit.getContentSize().width) / 2:0));
            unit.setPositionX(item_num.getPositionX() + item_num.getContentSize().width/2 + 10);
            unit.setVisible(num >= 10000)
        }
    },
});

//水晶礼包 
wls.namespace.UIGemChest = wls.namespace.UIChestBase.extend
({
    onCreate:function(id)
    {
        this._super(id);
    },

    initReward: function()
    {
        var config = this.config;
        this.fnt_price.setString(Math.round(config.buy_num / 100) + '');
        this.fnt_old_price.setString(config.value + '');

        var reward = config.reward.split(';');

        this.fnt_count.setString(reward[1]);
        this.fnt_old_price.setVisible(!!config.value);
        this.Image_27.setVisible(!!config.value);
        this.crystalbx_pic_yj_119.setVisible(!!config.value);
    },
});