/****************************************************************
 * 作者：xiaos
 * 日期：2018-08-08
 * 描述：免费鱼币
 ****************************************************************/
wls.namespace.UIFreeCoin = ccui.Layout.extend({
    NAME_LIST: {
        1: "xshl",
        2: "mrqd",
        3: "yftx",
        4: "yqyl",
        6: "fxyl",
        7: "mrcj",
    },
    getZorder: function () {
        return wls.ZOrder.Pop
    },
    onCreate: function () {
        wls.CreateMask(this);
        var node = wls.LoadPopupView(this.fullPath("hall/uifreecoin.json"), this)
        node.setPosition(display.width / 2, display.height / 2)
        this.btn_item_demo.setVisible(false)
        this.addChild(node)
        this.pageview_items.addEventListener(this.scrollEvent.bind(this))
        this.itemList = []
        this.createPages()
        this.btn_left.setVisible(false)
        this.btn_right.setVisible(this.pageview_items.getPages().length > 1)
        this.adaptClose(this.btn_close)
    },

    createPages: function () {
        var configs = wls.SplitArray(wls.Config.getConfig("990000131"))
        //新手豪礼领取完放列表最后
        var info = this.find("DAPlayer").getFreeFishCoinInfo(1)
        if (info.receiveCount >= 7 && info.isReceive == true) {
            configs.splice(0, 1)
            configs.push(1)
        }
        
        var pageNum = configs.length <= 6 ? 1 : Math.floor(configs.length / 6) + 1

        //按页分组
        var dataList = [];
        for (var i = 0; i < pageNum; i++) {
            var datas = configs.slice(i*6, i*6+6);
            dataList.push(datas)
        }

        for (var key = 0; key < pageNum; key++) {
            var layout = ccui.Layout.create()
            layout.setBackGroundColor(cc.c3b(255, 0, 0))
            layout.setBackGroundColorOpacity(0)
            layout.setBackGroundColorType(1)
            this.addItems(layout, dataList[key])
            this.pageview_items.addPage(layout)
        }
    },

    addItems: function (layout, configs) {
        var size = this.pageview_items.getContentSize()
        var itemSize = cc.size(this.btn_item_demo.getContentSize().width + 30, this.btn_item_demo.getContentSize().height)
        var ROW = 2
        var COL = 3
        var totalWidth = itemSize.width * COL
        var totalHeight = itemSize.height * ROW
        var configCount = parseInt(wls.Config.get("share", 9).awardnum)
        for (var row = 1; row <= ROW; row++) {
            for (var col = 1; col <= COL; col++) {
                var key = (row - 1) * COL + (col - 1)
                var type = configs[key] || 0
                var item = this.btn_item_demo.clone()
                var x = size.width / 2 - totalWidth / 2 + itemSize.width / 2 + (col - 1) * itemSize.width
                var y = size.height - (size.height / 2 - totalHeight / 2 + itemSize.height / 2 + (row - 1) * itemSize.height) - (2 - row) * 10
                item.setVisible(true)
                item.setPosition(x, y)
                layout.addChild(item)
                if (type == 0) {
                    continue
                }

                item.loadTextures(this.fullPath("hall/images/free_coin/freemoney_btn_bg.png"),
                    this.fullPath("hall/images/free_coin/freemoney_btn_bg.png"),
                    this.fullPath("hall/images/free_coin/freemoney_btn_bg.png"), 1)
                var icon = ccui.ImageView.create()
                icon.loadTexture(this.fullPath("hall/images/free_coin/freemoney_icon_" + type + ".png"), 1)
                icon.setPosition((itemSize.width - 30) / 2, itemSize.height * 0.58)
                item.addChild(icon)
                var name = ccui.ImageView.create()
                name.loadTexture(this.fullPath("hall/images/free_coin/freemoney_name_" + type + ".png"), 1)
                name.setPosition((itemSize.width - 30) / 2, itemSize.height * 0.15)
                item.addChild(name)
                wls.OnClicked(item, this, "btn_" + [this.NAME_LIST[parseInt(type)]])
                item.setTag(type)
                this.itemList.push(item)

                var info = this.find("DAPlayer").getFreeFishCoinInfo(type)
                if (info == undefined || info == null) {
                    continue
                }

                //小红点
                var dot = ccui.ImageView.create()
                dot.loadTexture(this.fullPath("hall/images/free_coin/com_tips_1.png"), 1)
                dot.setPosition((itemSize.width - 30) * 0.9, itemSize.height * 0.9)
                dot.setTag(1)
                item.addChild(dot)
                if (info.isReceive || (item.getTag()==7 && this.find("DAPlayer").getLoginDrawTimes()<=0) 
                    || (item.getTag()==6 && info.receiveCount >= configCount)) {
                    dot.setVisible(false)
                }
                
                if (type == 1 && info.receiveCount >= 7 && info.isReceive == true) {
                    var bg = ccui.ImageView.create()
                    bg.loadTexture(this.fullPath("hall/images/free_coin/freemoney_bg_9.png"), 1)
                    bg.setPosition((itemSize.width - 30) / 2, (itemSize.height) / 2)
                    bg.setAnchorPoint(cc.p(0.5, 0.5))
                    item.addChild(bg)
                    item.setEnabled(false)
                    continue
                }
            }
        }

    },

    updataDot: function () {
        for (var i = 0; i < this.itemList.length; i++) {
            var item = this.itemList[i]
            var dot = item.getChildByTag(1)
            var info = this.find("DAPlayer").getFreeFishCoinInfo(item.getTag())
            if (info.isReceive) {
                dot.setVisible(false)
            } else {
                dot.setVisible(true)
            }

            if (item.getTag()==7 && this.find("DAPlayer").getLoginDrawTimes()>0) {
                dot.setVisible(true)
            }
        }
    },

    updataList: function () {
        var layout = this.pageview_items.getChildren();
        for (var i = layout.length - 1; i > -1; i--) {
            layout[i].removeFromParent(true);
        }
        this.createPages()
    },

    scrollEvent: function (sender, event) {
        var totalNum = this.pageview_items.getPages().length
        var idx = this.pageview_items.getCurPageIndex()
        this.btn_left.setVisible(idx != 0)
        this.btn_right.setVisible(idx != totalNum - 1)
    },

    click_btn_right: function () {
        var idx = this.pageview_items.getCurPageIndex()
        this.pageview_items.scrollToPage(idx + 1)
    },

    click_btn_left: function () {
        var idx = this.pageview_items.getCurPageIndex()
        this.pageview_items.scrollToPage(idx - 1)
    },

    click_btn_close: function () {
        if (this.find("UIHallPanel")) {
            this.find("UIHallPanel").updateFreeCoin();
        }
        if (this.find("WNFreeCoin")) {
            this.find("WNFreeCoin").updateFreeCoin()
        }
        this.setVisible(false);
    },
    //新手豪礼
    click_btn_xshl: function () {
        this.pushView("UINewerGift");
    },
    //每日签到
    click_btn_mrqd: function () {
        this.pushView("UISignIn");
    },
    //有福同享
    click_btn_yftx: function () {
        this.pushView("UIFreeCoinShare");
    },
    //邀请有礼
    click_btn_yqyl: function () {
        cc.log("click_btn_yqyl");
        this.pushView("UIFreeCoinYQYL");
    },
    //分享有礼
    click_btn_fxyl: function () {
        cc.log("click_btn_fxyl");
        this.pushView("UIWechatShare")
    },
    //每日抽奖
    click_btn_mrcj: function () {
        cc.log("click_btn_mrcj");
        this.pushView("UIDial")
    },
})

//新手豪礼
wls.namespace.UINewerGift = ccui.Layout.extend({
    getZorder: function () {
        return wls.ZOrder.Pop + 1;
    },

    onCreate: function () {
        wls.CreateMask(this, 0);
        var node = wls.LoadPopupView(this.fullPath("hall/uinewergift.json"), this)
        node.setPosition(display.width / 2, display.height / 2)
        this.addChild(node)
        this.adaptClose(this.btn_close)

        this.initData();
        this.initUI();
    },

    initData: function () {
        this.listAll = [];
        this.itemsPos = [];
        this.curConfig = null;
        this.isHide = false
        this.flashSp = null

        var newerGiftInfo = this.find("DAPlayer").getFreeFishCoinInfo(1)
        if (newerGiftInfo == null || newerGiftInfo.length == 0) {
            this.giftDay = 0;
            this.isReceive = false;
        } else {
            this.giftDay = newerGiftInfo.receiveCount;
            this.isReceive = newerGiftInfo.isReceive;
        }

        var self = this
        var callback = function (ret) {
            var list = self["listAll"]
            if (list && ret.type == 1) {
                list.push(ret);
            }
        };
        wls.Config.ForEachNew("freefishcoin", callback);

        for (var index = 0; index < this.listAll.length; index++) {
            var data = this.listAll[index];
            data.rewardProps = []
            var rewardProps = data.reward_props.split(";");
            for (var i = 0; i < rewardProps.length;) {
                var prop = {}
                prop.propId = parseInt(rewardProps[i]);
                prop.propCount = parseInt(rewardProps[i + 1]);
                data.rewardProps.push(prop)
                i += 2;
            }
            delete data.reward_props;

        }

        var giftDay = this.giftDay >= 7 ? 6 : this.giftDay;
        if (this.listAll[giftDay].rewardProps.length == 2) {
            this.itemsPos.push(this.node_L)
            this.itemsPos.push(this.node_R)
        } else {
            this.itemsPos.push(this.scroll_props)
        }

        this.curConfig = this.listAll[giftDay];
    },

    initUI: function () {
        var giftDay = this.isReceive == false ? this.giftDay + 1 : this.giftDay
        this.fnt_day.setString(giftDay);

        this.btn_share.setVisible(false)
        this.btn_recv.setPositionX(this.img_bg.getContentSize().width/2)

        if (this.isReceive) {
            this.com_pic_lq.setVisible(false)
            this.com_pic_mrlq.setVisible(true)
        } else {
            this.com_pic_lq.setVisible(true)
            this.com_pic_mrlq.setVisible(false)
        }

        this.initScrollView();
    },

    initScrollView: function () {
        var firstItem = this.createItem();
        this.setItemData(firstItem, this.listAll[0])
        this.itemSize = cc.size(firstItem.panel.getContentSize().width, firstItem.panel.getContentSize().height);
        this.intervalW = (this.scroll_props.getContentSize().height - this.itemSize.height) / 2;
        var pos = cc.p(this.intervalW * 2 + this.itemSize.width / 2, this.itemSize.height / 2);
        firstItem.setPosition(pos);
        this.beginX = firstItem.getPositionX();
        this.scroll_props.addChild(firstItem);
        firstItem.setTag(0)
        firstItem.btn_buy.setTag(0)
        wls.OnClicked(firstItem.btn_buy, this);

        this.flashNode = null;
        var giftDay = this.isReceive == false ? this.giftDay + 1 : this.giftDay
        //可以领取的发光
        if (giftDay == this.listAll[0].time_parameter) {
            this.flashNode = firstItem;
        }

        //设置列表滚动区域
        this.scroll_props.setInnerContainerSize(cc.size(this.beginX + (this.listAll.length-0.5)*this.itemSize.width + this.intervalW*3, this.scroll_props.getContentSize().height));
        this.initScrollPos(this.beginX, this.itemSize, this.intervalW)

        this.index = 1;
        this.startTimer("loadItem", 0.05, 200, -1);
    },

    loadItem: function () {
        var pos = cc.p(this.beginX + this.index*this.itemSize.width + this.intervalW, this.itemSize.height/2);
        var item = this.createItem();
        item.setPosition(pos);
        this.setItemData(item, this.listAll[this.index])
        item.setTag(this.index)
        item.btn_buy.setTag(this.index)
        this.scroll_props.addChild(item);
        wls.OnClicked(item.btn_buy, this);

        //可以领取的发光
        var giftDay = this.isReceive == false ? this.giftDay + 1 : this.giftDay
        if (giftDay == this.listAll[this.index].time_parameter) {
            this.flashNode = item;
        }

        this.index += 1;
        if (this.index >= this.listAll.length) {
            this.showLight()
            this.stopTimer(200);
        }
    },

    showLight: function () {
        //可以领取的发光
        if (!this.isReceive && this.flashNode != null) {
            var sp = cc.Sprite.create();
            var frameName = this.fullPath("hall/images/free_coin/freemoney_bg_glow2.png");
            sp.initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame(frameName));
            var itemSize = this.flashNode.panel.getContentSize()
            sp.setPosition(itemSize.width / 2, itemSize.height / 2);
            sp.setBlendFunc(gl.SRC_ALPHA, gl.ONE)
            this.flashNode.panel.addChild(sp, 100);

            var du = 0.5;
            var fade_1 = cc.fadeTo(du, 128); //逐渐变暗
            var fade_2 = cc.fadeTo(du, 255); //逐渐变亮
            sp.runAction(cc.RepeatForever.create(cc.sequence(fade_1, fade_2)));
            this.flashSp = sp;
        }
    },

    initScrollPos: function (beginX, itemSize, intervalW) {
        var pos = cc.p(0, 0);
        var scrollSize = this.scroll_props.getInnerContainerSize();
        var giftDay = this.isReceive == false ? this.giftDay + 1 : this.giftDay
        if (giftDay > this.listAll.length / 2 && giftDay < this.listAll.length) {
            pos = cc.p(-(this.listAll.length / 2 * itemSize.width - beginX + intervalW * 4), 0);
        } else if (giftDay == this.listAll.length) {
            pos = cc.p(-scrollSize.width / 2 + intervalW * 4, 0);
        }
        this.scroll_props.getInnerContainer().setPosition(pos)
    },

    createItem: function () {
        var item = wls.LoadStudioLayout(this.fullPath("hall/uinewergiftitem.json"));
        wls.BindUI(item, item);
        return item;
    },

    setItemData: function (item, valTab) {
        item.fnt_item_day.setString(valTab.time_parameter)

        var itemSize = item.panel.getContentSize()
        for (var i = 0; i < valTab.rewardProps.length; i++) {
            var prop = cc.Sprite.create();
            var filename = this.fullPath("common/images/prop/prop_" + wls.PrefixInteger(valTab.rewardProps[i].propId, 3) + ".png")
            prop.setSpriteFrame(filename)
            prop.setAnchorPoint(cc.p(0.5, 0.5))
            if (valTab.rewardProps.length == 2) {
                prop.setScale(0.8)
                prop.setPosition(cc.p((i + 1) * itemSize.width / 3, itemSize.height / 2))
            } else {
                prop.setPosition(cc.p(itemSize.width / 2, itemSize.height / 2))
            }

            var gift = wls.Config.getItemData(valTab.rewardProps[i].propId)

            if (i < 2) {
                var text_word = ccui.Text.create()
                text_word.ignoreContentAdaptWithSize(true)
                text_word.setFontSize(28)
                text_word.setColor(cc.c3b(30, 47, 101))
                text_word.setString(gift.name + " x" + valTab.rewardProps[i].propCount)
                item["node_txt" + (i + 1)].addChild(text_word)
            }

            item.panel.addChild(prop)
        }

        item.arena_tick.setLocalZOrder(10)

        if (valTab.if_share == 0) {
            item.freemoney.setVisible(false)
        }

        item.text_name.setVisible(false)

        var giftDay = this.isReceive == false ? this.giftDay + 1 : this.giftDay
        if ((valTab.time_parameter < giftDay) || (valTab.time_parameter == giftDay && this.isReceive)) {
            item.arena_tick.setVisible(true)
            item.panel.setColor(cc.c3b(192, 189, 209))
        } else {
            item.arena_tick.setVisible(false)
        }

    },

    getFreeReward: function (resp) {
        this.isReceive = true

        if (this.isReceive) {
            this.com_pic_lq.setVisible(false)
            this.com_pic_mrlq.setVisible(true)
        } else {
            this.com_pic_lq.setVisible(true)
            this.com_pic_mrlq.setVisible(false)
        }

        var item = this.scroll_props.getChildByTag(this.giftDay);
        if (item != null) {
            item.arena_tick.setVisible(true)
            item.panel.setColor(cc.c3b(192, 189, 209))
        }

        var info = this.find("DAPlayer").getFreeFishCoinInfo(1)
        if (info.receiveCount >= 7 && info.isReceive == true) {
            this.isHide = true
        }

        if (this.flashSp != null) {
            this.flashSp.removeFromParent(true);
        }

        var viewid = 0

        if (resp.props.length > 0) {
            if (wls.GameState == 2) {
                viewid = FG.SelfViewID;
                var cannon = this.find("GOCannon" + FG.SelfViewID);
                var propData = null
                for (var key = 0; key < resp.props.length; key++) {
                    propData = resp.props[key]
                    cannon.willOpProp(propData.propId, propData.propCount)
                }
            }
            this.createGameObject("UIAwardResult").onShow("1", viewid, resp.props, function () {}.bind(this), true, this.curConfig.share_props);
        } else {
            var props = [];
            for (var index = 0; index < resp.shareProps.length; index++) {
                var element = resp.shareProps[index];
                props.push(element);
            }
            for (var index = 0; index < resp.vipProps.length; index++) {
                var element = resp.vipProps[index];
                props.push(element);
            }
            if (wls.GameState == 2) {
                viewid = FG.SelfViewID;
                var cannon = this.find("GOCannon" + FG.SelfViewID);
                var propData = null
                for (var key = 0; key < props.length; key++) {
                    propData = props[key]
                    cannon.willOpProp(propData.propId, propData.propCount)
                }
            }
            this.createGameObject("UIAwardResult").onShow("1", viewid, props, function () {}.bind(this), true);
        }
    },

    click_btn_buy: function (sender) {
        if (this.isReceive) {
            this.toast(wls.Config.getLanguage(800000452));
            return
        }
        if (this.giftDay == sender.getTag()) {
            this.sendMsg("sendFreeFishCoinReward", 1, false, 0);
        }
    },

    click_btn_close: function () {
        if (this.isHide) {
            this.find("UIFreeCoin").updataList()
        } else {
            this.find("UIFreeCoin").updataDot()
        }

        this.setVisible(false);
    },

    click_btn_recv: function () {
        if (this.isReceive) {
            this.toast(wls.Config.getLanguage(800000452));
            return
        }
        this.sendMsg("sendFreeFishCoinReward", 1, false, 0);
    },
})

//每日签到
wls.namespace.UISignIn = ccui.Layout.extend({
    getZorder: function () {
        return wls.ZOrder.Pop + 1;
    },

    onCreate: function () {
        wls.CreateMask(this, 0);
        var node = wls.LoadPopupView(this.fullPath("hall/uisignin.json"), this);
        node.setPosition(display.width / 2, display.height / 2);
        this.addChild(node);
        this.adaptClose(this.btn_close)
        this.img_item_demo.setVisible(false);
        this.img_item_demo.getChildByName("img_fxfb").setVisible(false);
        this.img_item_demo.getChildByName("img_vipfb").setVisible(false);
        this.configs = [];
        this.curConfig = null;
        var self = this;
        wls.Config.ForEachNew("freefishcoin", function (ret) {
            if (ret.type == 2) {
                self.configs.push(ret);
            }
        });
        if (FISH_DISABLE_CHARGE) {
            this.spr_tip.setVisible(false);
            this.btn_cktq.setVisible(false);
        }
        //初始化签到日历
        this.itemList = [];
        var info = this.find("DAPlayer").getFreeFishCoinInfo(2);
        this.info = info;
        var days = 1;
        if (!info.isReceive && info.receiveCount < 21) {
            days = info.receiveCount + 1;
        } else {
            days = info.receiveCount;
        }
        if (!info.isReceive && info.receiveCount == 21) {
            // cc.log("21为已经签到21天。就不存在isReceive =false的情况");
            return;
        }
        this.fnt_day.setString(days);
        this.days = days;
        var countX = 7; // 格子横向数
        this.cellW = this.img_item_demo.getContentSize().width;
        this.cellH = this.img_item_demo.getContentSize().height;

        //创建日历的数量
        this.index = 0;
        var ssize = cc.size(this.cellW * countX, this.cellH * Math.ceil(this.configs.length / countX));
        this.scrollview.setInnerContainerSize(ssize);
        this.scheduleUpdate();
    },
    update: function (dt) {
        var config = this.configs[this.index];
        var item = this.img_item_demo.clone();
        this.itemList.push(item);
        item.setVisible(true);
        item.config = config;
        item.getChildByName("img_finish").setVisible(this.info.receiveCount > this.index);
        item.getChildByName("fnt_item_day").setString(config.time_parameter);
        if (this.info.receiveCount > this.index) item.setColor(cc.c3b(162, 159, 189))
        // 签到奖励
        var rewardProps = config.reward_props.split(";");
        var itemData = wls.Config.getItemData(Number(rewardProps[0]));
        if (itemData) {
            item.getChildByName("img_icon").loadTexture(this.fullPath("common/images/prop/" + itemData.res), 1);
        }
        item.getChildByName("txt_num").setString("x" + rewardProps[1]);

        // item.getChildByName("img_fxfb").setVisible(config.if_share > 0);
        // 分享奖励
        // config.share_props
        //if_vip vip等级数量
        item.getChildByName("img_vipfb").setVisible(config.if_vip > 0);
        if (config.if_vip > 0) {
            var path = cc.formatStr("hall/images/free_coin/freemoney_vippic_%s.png", config.if_vip);
            item.getChildByName("img_vipfb").getChildByName("img_vipnum").loadTexture(this.fullPath(path), 1);
        }

        //vip奖励
        // config.vip_props

        //可以领取的发光
        if (!this.info.isReceive && this.days == config.time_parameter) {
            this.createEffect(item);
        }
        var countX = 7; // 格子横向数
        var totalHeight = this.cellH * Math.ceil(this.configs.length / countX);
        var x = this.cellW / 2 + this.cellW * (this.index % countX);
        var y = totalHeight - this.cellH / 2 - this.cellH * Math.floor(this.index / countX);
        item.setPosition(x, y);
        item.setTag(this.index + 1)
        this.scrollview.addChild(item);
        wls.OnClicked(item, this);

        this.index += 1;
        if (this.index >= this.configs.length) {
            this.unscheduleUpdate();
        }
    },

    //可以领取的发光
    createEffect:function(item){
        var sp = cc.Sprite.create();
        var frameName = this.fullPath("hall/images/free_coin/freemoney_bg_glow1.png");
        sp.initWithSpriteFrame(cc.spriteFrameCache.getSpriteFrame(frameName));
        var itemSize = item.getContentSize()
        sp.setPosition(itemSize.width / 2, itemSize.height / 2);
        sp.setBlendFunc(gl.SRC_ALPHA, gl.ONE)
        item.addChild(sp, 100);
        var du = 0.5;
        var fade_1 = cc.fadeTo(du, 128); //逐渐变暗
        var fade_2 = cc.fadeTo(du, 255); //逐渐变亮
        sp.runAction(cc.RepeatForever.create(cc.sequence(fade_1, fade_2)));
        this.flashSp = sp;
    },
    click_img_item_demo: function (sender) {
        var info = this.find("DAPlayer").getFreeFishCoinInfo(2);
        this.curConfig = sender.config;
        var days = 1;
        if (!info.isReceive && info.receiveCount < 21) {
            days = info.receiveCount + 1;
        } else {
            days = info.receiveCount;
        }
        if (days == this.curConfig.time_parameter) {
            // var resp = {};
            // resp.errorCode = 0;//0成功1失败
            // resp.freeType = 2;
            // resp.playerID = 123;
            // resp.props = [];
            // var prop = {}
            // prop.propId = 1;
            // prop.propCount  = 500;
            // resp.props.push(prop);
            // resp.shareProps = [];
            // resp.vipProps = [];

            // this.onReceive(resp);

            //发消息
            this.sendMsg("sendFreeFishCoinReward", 2, false, 0);
        } 
        if (info.isReceive) {
            this.toast(wls.Config.getLanguage(800000452));
        }
    },
    //服务端回复
    onReceive: function (resp) {
        if (resp.errorCode == 1) {
            cc.log("签到失败！");
            return;
        }
        this.flashSp.removeFromParent(true);
 
        var viewid = 0;
        if (wls.GameState == 2) {
            viewid = FG.SelfViewID;
            var cannon = this.find("GOCannon" + FG.SelfViewID);
            var propData = null
            for (var key = 0; key < resp.allProps.length; key++) {
                propData = resp.allProps[key]
                cannon.willOpProp(propData.propId, propData.propCount)
            }
        }
        if (resp.props.length > 0) {
            this.createGameObject("UIAwardResult").onShow("2", viewid, resp.allProps, function () {}.bind(this), true, this.curConfig.share_props);
        }
        else{
            this.createGameObject("UIAwardResult").onShow("2", viewid, resp.allProps, function () {}.bind(this), true);
        }
    

        var item = this.scrollview.getChildByTag(this.curConfig.time_parameter);
        if (item != null) {
            item.getChildByName("img_finish").setVisible(true)
            item.setColor(cc.c3b(162, 159, 189))
        }

    },
    click_btn_close: function () {
        this.find("UIFreeCoin").updataDot()
        this.setVisible(false);
    },
    click_btn_cktq: function () {
        this.find("UIFreeCoin").click_btn_close();
        this.click_btn_close();
        this.pushView("UIVipRight");
    }
});

//有福同享
wls.namespace.UIFreeCoinShare = ccui.Layout.extend({
    getZorder: function () {
        return wls.ZOrder.Pop + 1;
    },

    onCreate: function (opacity) {
        wls.CreateMask(this, opacity || 0);
        var node = wls.LoadPopupView(this.fullPath("hall/uifreecoinshare.json"), this);
        node.setPosition(display.width / 2, display.height / 2);
        this.addChild(node);
        this.adaptClose(this.btn_close)

        this.initView(this["img_share1"], 3);
        this.initView(this["img_share2"], 5);
    },

    initView: function (node, type) {
        var gunRate = this.find("DAPlayer").getMaxGunRate();
        var config = null;
        wls.Config.ForEachNew("freefishcoin", function (ret) {
            if (ret.type == type) {
                if (typeof (ret.blessed_cannon) != "string") {
                    cc.log("blessed_cannon is not string!");
                    return;
                }
                var v = ret.blessed_cannon.split(";");
                if (gunRate >= Number(v[0]) && gunRate <= Number(v[1])) {
                    config = ret;
                    return true;
                }
            }
        });
        if (!config) {
            cc.log("get config fail!");
            return;
        }
        if (typeof (config.reward_props) != "string") {
            cc.log("reward_props is not string!");
            return;
        }
        var tempStr = node.getChildByName("txt_1").getString();
        var tempStr = cc.formatStr(tempStr, config.reward_limit);
        node.getChildByName("txt_1").setString(tempStr);

        var v = config.reward_props.split(";");
        var propType = v[0]; //
        var propNum = v[1];
        node.getChildByName("fnt_num").setString("x" + propNum);
        var str = node.getChildByName("txt_2").getString();
        var formatStr = cc.formatStr(str, propNum);
        node.getChildByName("txt_2").setString(formatStr);
    },

    click_btn_close: function () {
        this.setVisible(false);
    },
    click_btn_share: function () {
        this.click_btn_close()
        this.notify()

        ShareHelper.shareYouFuTongXiang(function () { })
    },
    //通知服务器分享成功
    notify: function () {
        this.sendMsg("sendFreeFishCoinReward", 3, true, 0);
    },
    //服务端回复
    onReceive: function (resp) {
        if (resp.errorCode == 1) {
            cc.log("有福同享 失败！");
            return;
        }

        this.find("UIFreeCoin").updataDot()

        var viewid = 0
        if (wls.GameState == 2) {
            viewid = FG.SelfViewID;
            var cannon = this.find("GOCannon" + FG.SelfViewID);
            var propData = null
            for (var key = 0; key < resp.allProps.length; key++) {
                propData = resp.allProps[key]
                cannon.willOpProp(propData.propId, propData.propCount)
            }
        }
        this.createGameObject("UIAwardResult").onShow("3", viewid, resp.allProps, function () {}.bind(this), true);
    },
});

//邀请有礼
wls.namespace.UIFreeCoinYQYL = ccui.Layout.extend({
    getZorder: function () {
        return wls.ZOrder.Pop + 1;
    },

    onCreate: function () {
        wls.CreateMask(this, 0);
        var node = wls.LoadPopupView(this.fullPath("hall/uifreecoin_yqyl.json"), this);
        node.setPosition(display.width / 2, display.height / 2);
        this.addChild(node);
        this.adaptClose(this.btn_close)
        this.configs = [];
        var self = this;
        wls.Config.ForEachNew("freefishcoin", function (ret) {
            if (ret.type == 4) {
                self.configs[ret.id] = ret;
            }
        });
        //刷新第一步
        var playerId = this.find("DAPlayer").getPlayerId();
        this.text_id.setString(playerId);
        //刷新第二步
        for (var id = 1; id < 4; id++) {
            this.updateItem(id);
        }
        //刷新新手福利
        var config = this.configs[470004004];
        var list = config.reward_props.split(";");
        var propType = list[0];
        var propNum = list[1];
        var itemData = wls.Config.get("item", 200000000 + Number(propType));
        var filename = this.fullPath("common/images/prop/" + itemData.res);
        this.img_icon.loadTexture(filename, 1);
        this.fnt_num.setString("x" + propNum);
        //刷新领取福利按钮
        var data = this.find("DAPlayer").getFreeFishCoinInfo(4);
        var tplayerId = data.inviteId;
        if(tplayerId != 0){
            this.txf_input.setString(tplayerId);
            this.txf_input.setTouchEnabled(false);
        }
        this.btn_lqfl.setEnabled(!data.isReceive);
    },
    updateItem: function (id) {
        var config = this.configs[470004000 + id];
        var list = config.reward_props.split(";");
        var propType = list[0];
        var propNum = list[1];
        //物品数据
        var itemData = wls.Config.get("item", 200000000 + Number(propType));

        var node = this["img_item_bg_" + id];
        var icon = node.getChildByName("img_icon");
        var filename = this.fullPath("common/images/prop/" + itemData.res);
        icon.loadTexture(filename, 1);
        //
        var text1 = node.getChildByName("text_1");
        var tempStr = text1.getString();
        var text1Str = cc.formatStr(tempStr, config.invite_friendcannon);
        text1.setString(text1Str);

        var text3 = node.getChildByName("text_3");
        var text1Str = propNum + itemData.name;
        text3.setString(text1Str);
    },
    click_btn_close: function () {
        this.setVisible(false);
    },
    click_btn_fzid: function () {
        // this.dialog(2, "已将游戏ID复制至系统剪贴板");
        if(wls.IsMiniProgrom()){
            GiftDateLogic.createWeiXinCopy(text)
        }
    },
    //领取奖励
    click_btn_lqjl: function () {
        this.sendMsg("sendFreeFishCoinReward", 4, true, 0);
    },
    //领取福利
    click_btn_lqfl: function () {
        var friendId = this.txf_input.getString();
        this.sendMsg("sendFreeFishCoinReward", 4, true, friendId);
    },
    onReceive: function (resp) {
        // cc.log(resp.errorCode);
        if(resp.errorCode == 0){//0，成功
            this.showAwardResult(resp.props);
        }
        else if(resp.errorCode == 10){//10领取福利成功
            this.showAwardResult(resp.props);
            this.btn_lqfl.setEnabled(false);
        }
        else if(resp.errorCode == 2){//不是新手
            this.dialog(2, wls.Config.getLanguage(800000477));
        }
        else if(resp.errorCode == 3 || resp.errorCode == 5){//3,已绑定邀请人5,id错误
            this.dialog(2, wls.Config.getLanguage(800000478));
        }
        else if(resp.errorCode == 4 || resp.errorCode == 6){//4没有邀请的玩家 6,邀请者未达到要求可让被邀请者获得奖励的条件
            var num = resp.freeFishCoinInfo.inviteCount || "0";
            this.activeGameObject("UIFreeCoinYQYL_Fail", num);
        }
        else{
            cc.log("未知errorCode =", resp.errorCode);
        }
    },
    showAwardResult:function(props){
        var viewid = 0
        if (wls.GameState == 2) {
            viewid = FG.SelfViewID;
            var cannon = this.find("GOCannon" + FG.SelfViewID);
            var propData = null
            for (var key = 0; key < props.length; key++) {
                propData = props[key]
                cannon.willOpProp(propData.propId, propData.propCount)
            }
        }
        this.createGameObject("UIAwardResult").onActive("UIFreeCoinYQYL", viewid, props, function () {}.bind(this), true);
    },
});

//邀请有礼弹窗
wls.namespace.UIFreeCoinYQYL_Fail = ccui.Layout.extend({
    getZorder: function () {
        return wls.ZOrder.Pop + 1;
    },

    onCreate: function (num) {
        var numStr = num.toString();
        wls.CreateMask(this, 50);
        var node = wls.LoadPopupView(this.fullPath("hall/uifreecoin_yqyl_fail.json"), this);
        node.setPosition(display.width / 2, display.height / 2);
        this.addChild(node);
        var richText = ccui.RichText.create();
        var item = null;
        item = ccui.RichElementText.create(1, cc.c3b(255, 255, 255), 255, "当前已邀请好友", "Arial", 24);
        richText.pushBackElement(item);
        this.numItem = ccui.RichElementText.create(2, cc.c3b(0, 255, 50), 255, numStr, "Arial", 24);
        richText.pushBackElement(this.numItem);
        item = ccui.RichElementText.create(3, cc.c3b(255, 255, 255), 255, "人", "Arial", 24);
        richText.pushBackElement(item);
        this.txt_des_2.setVisible(false);
        var pos = this.txt_des_2.getPosition();
        richText.setPosition(pos);
        node.addChild(richText, 100);
    },
    onActive: function (num) {
        var numStr = num.toString();
        this.numItem._text = numStr;
    },
    click_btn_confirm:function(){
        this.setVisible(false);
    },
});