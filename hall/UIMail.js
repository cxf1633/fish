"use strict";
// 邮件界面
wls.namespace.UIMail = ccui.Layout.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("hall/mail_panel.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        ccnode.setScale(ccnode.getScale()*scale)

        this.adaptClose(this.btn_close)

        this.text_notice.setString(wls.Config.getLanguage(800000197));
    },

    onActive: function()
    {
        this.unreadMails = this.find("DAHall").getMails();
        var mailNum = this.unreadMails.length;

        var items = this.scroll_list.getChildren();
        for (var i = items.length - 1; i > -1; i--)
        {
            items[i].removeFromParent(true);
        }

        if (mailNum > 0) 
        {
            this.mail_item = this.createMailItem();
            this.spr_words_nomail.setVisible(false);
            this.createMailList(this.unreadMails);
        }
    },

    setListSize: function(unreadMails)
    {
        var mailNum = unreadMails.length;
        var scrollSize = this.scroll_list.getContentSize();
        var height = this.mail_item.img_bg.getContentSize().height;
        var newScrollSize = cc.size(scrollSize.width, (height*mailNum < scrollSize.height ? scrollSize.height : height*mailNum));
        this.scroll_list.setScrollBarEnabled(false);
        this.scroll_list.setInnerContainerSize(newScrollSize);
    },

    createMailList: function(unreadMails)
    {
        this.setListSize(unreadMails);

        var mailNum = unreadMails.length;
        this.scrollSize = this.scroll_list.getInnerContainerSize();
        this.itemSize = this.mail_item.img_bg.getContentSize();
        this.intervalW = (this.scrollSize.width - this.itemSize.width)/2;

        var height = ((this.itemSize.height*mailNum < this.scrollSize.height) ? (this.scrollSize.height-this.itemSize.height/2) : (mailNum*this.itemSize.height-this.itemSize.height/2));
        this.mail_item.setPosition(this.scrollSize.width/2, height-this.intervalW*1.5);
        this.setMailInfo(this.mail_item, unreadMails[0]);
        this.scroll_list.addChild(this.mail_item);
        this.itemY = this.mail_item.getPositionY();

        this.index = 1;
        this.startTimer("loadItem", 0.05, 200, -1);
    },

    loadItem: function () {
        if (this.index >= this.unreadMails.length) {
            this.scroll_list.jumpToPercentVertical(0);
            this.stopTimer(200);
            return
        }

        var item = this.createMailItem();
        this.setMailInfo(item, this.unreadMails[this.index]);
        item.setPosition(this.scrollSize.width/2, this.itemY - this.itemSize.height + this.intervalW*0.6)
        this.scroll_list.addChild(item);
        this.itemY = item.getPositionY();

        this.index += 1;
    },

    createMailItem: function()
    {
        var item = wls.LoadStudioNode(this.fullPath("hall/mail_item.json"));
        wls.BindUI(item, item);
        return item;
    },

    setMailInfo: function(item, info)
    {
        item.setTag(info.id);
        item.btn_look.item = item;
        item.text_word_title.setString("标　题：");
        item.text_title.setString(info["title"]);
        item.text_sender.setString(info["sender"]);
        item.text_time.setString(info["sendTime"].slice(5));
        wls.OnClicked(item.btn_look, this);
    },

    removeMailItem: function(mailId)
    {
        this.find("DAHall").updateMails(mailId);
        this.find("UIHallPanel").updateMail();

        var items = this.scroll_list.getChildren();

        for (var i = items.length - 1; i > -1; i--)
        {
            if (items[i].getTag() == mailId)
            {
                items[i].removeFromParent(true);
                break;
            }
        }

        if (items.length == 0) 
        {
            this.spr_words_nomail.setVisible(true);
            return;
        }

        var scrollSize = this.scroll_list.getInnerContainerSize();
        var mailNum = items.length;
        var itemSize = items[0].img_bg.getContentSize();
        var height = (itemSize.height*mailNum < this.scroll_list.getContentSize().height ? this.scroll_list.getContentSize().height-itemSize.height/2 : mailNum*itemSize.height-itemSize.height/2);
        var newSizeHeight = (itemSize.height*mailNum < this.scroll_list.getContentSize().height ? this.scroll_list.getContentSize().height : itemSize.height*mailNum);
        var newScrollSize = cc.size(scrollSize.width, newSizeHeight);
        this.scroll_list.setInnerContainerSize(newScrollSize);

        items[0].setPositionY(height-this.intervalW*1.5);
        for (var index = 1; index < mailNum; index++) 
        {
            items[index].setPositionY(items[index-1].getPositionY()-itemSize.height+this.intervalW*0.6)
        }
    },

    // 邮件信息界面
    onGetMailDetail: function(data)
    {
        if (data.success) 
        {
            this.activeGameObject("UIMailBody").initWithData(data);
        }
    },

    //邮件已读
    onMakeMailAsRead: function(data)
    {
        if (data.success) 
        {
            this.removeMailItem(data.id);
        }
    },

    click_btn_look: function(sender)
    {
        var mailId = sender.item.getTag();
        this.sendMsg("sendGetMailDetail",mailId)
    },

    click_btn_close: function()
    {
        this.setVisible(false);
    },
});

// 邮件信息界面
wls.namespace.UIMailBody = ccui.Layout.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop+1
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("hall/mail_body.json"), this);
        this.addChild(ccnode);
        
        ccnode.setPosition(display.width / 2, display.height / 2);
        this.adaptClose(this.btn_close)

        this.initData();
    },

    initData: function()
    {
        var self = this;
        this.wordH = this.scroll_text.getContentSize().height - 4
        this.wordW = this.scroll_text.getContentSize().width - 4
        this.itemList = new Array();
        var itemCallback = function(ret)
        {
            var itemList = self["itemList"]
            if (itemList)
            {
                itemList[ret.id] = ret;
            }
        };
        wls.Config.ForEachNew("item", itemCallback);
    },

    initWithData: function(data)
    {
        wls.connectPropTb(data.props,data.seniorProps)
        this.data = data;
        this.text_time.setString(data.sendTime.slice(5));
        this.text_title.setString(data.title);
        this.text_sender.setString(data.sender);

        this.text_title.ignoreContentAdaptWithSize(false)
        this.text_title.setContentSize(cc.size(220, this.text_title.getContentSize().height))
        this.text_sender.ignoreContentAdaptWithSize(false)
        this.text_sender.setContentSize(cc.size(245, this.text_title.getContentSize().height))
        cc.log(this.text_title.getContentSize())

        var items = this.scroll_text.getChildren();
        for (var i = items.length - 1; i > -1; i--)
        {
            items[i].removeFromParent(true);
        }

        var text_word = ccui.Text.create()
        text_word.ignoreContentAdaptWithSize(true)
        text_word.setFontSize(22)
        text_word.setAnchorPoint(0.5, 1.0)
        text_word.setColor(cc.c3b(255, 255, 255))
        this.scroll_text.addChild(text_word)
        text_word.setTag(1)

        text_word.setString(data.content);
        var textSize = text_word.getContentSize()
        var scrollSize = this.scroll_text.getContentSize()
        text_word.ignoreContentAdaptWithSize(false);
        if (textSize.width <= this.wordW && textSize.height <= this.wordH) {
            text_word.setContentSize(cc.size(this.wordW, this.wordH))
            text_word.setPosition(scrollSize.width/2, this.wordH)
            this.scroll_text.setInnerContainerSize(cc.size(scrollSize.width, this.wordH));
        }
        else if (textSize.width == this.wordW && textSize.height > this.wordH) {
            text_word.setContentSize(cc.size(textSize.width, textSize.height))
            text_word.setPosition(scrollSize.width/2, textSize.height)
            this.scroll_text.setInnerContainerSize(cc.size(scrollSize.width, textSize.height));
        }
        else {
            var num = textSize.width/this.wordW + 1
            text_word.setContentSize(cc.size(this.wordW, 26*num))
            textSize = text_word.getContentSize()
            text_word.setPosition(scrollSize.width/2, textSize.height)
            this.scroll_text.setInnerContainerSize(cc.size(scrollSize.width, textSize.height));
        }

        var items = this.scroll_props.getChildren();
        for (var i = items.length - 1; i > -1; i--)
        {
            items[i].removeFromParent(true);
        }

        if ((data.props == null || data.props.length == 0)) 
        {
            //没道具
            this.spr_gb.setVisible(true);
            this.spr_lq.setVisible(false);
        }
        else
        {
            this.spr_gb.setVisible(false);
            this.spr_lq.setVisible(true);
            var props = data.props
            this.createProp(props);
        }
    },

    createProp: function(props)
    {
        if (props.length < 6) {
            this.propLayoutCenter(props)
        } else {
            this.propLayoutLeft(props)
        }
    },

    propLayoutCenter: function(props)
    {
        var items = [];
        var propNum = props.length;
        var centerX = this.scroll_props.getInnerContainerSize().width/2;
        var scrollSize = this.scroll_props.getContentSize();
        var firstItem = this.createItem();
        var itemSize = cc.size(firstItem.panel.getContentSize().width*0.95, firstItem.panel.getContentSize().height*0.95);
        var cellWidth = scrollSize.width/12
        var beginX = (7-propNum)*cellWidth
        var firstPropConfig = this.itemList[200000000 + props[0].propId];
        var pos = cc.p(beginX, scrollSize.height/2);
        firstItem.setPosition(pos);
        this.initWithItemData(firstItem, firstPropConfig, props[0]);
        this.scroll_props.addChild(firstItem);
        items.push(firstItem);

        this.list = {}
        this.list[props[0].propId] = firstItem
        for (var index = 1; index < propNum; index++) 
        {
            var info = this.itemList[200000000 + props[index].propId];
            var item = this.createItem();
            pos = cc.p(beginX+index*cellWidth*2, scrollSize.height/2);
            item.setPosition(pos);
            this.initWithItemData(item, info, props[index]);
            this.scroll_props.addChild(item);
            items.push(item);
            this.list[props[index].propId] = item
        }
        this.scroll_props.setInnerContainerSize(cc.size(this.scroll_props.getContentSize().width, this.scroll_props.getContentSize().height));
    },

    propLayoutLeft: function(props)
    {
        var items = [];
        var propNum = props.length;
        var centerX = this.scroll_props.getInnerContainerSize().width/2;
        var scrollSize = this.scroll_props.getContentSize();
        var firstItem = this.createItem();
        var itemSize = cc.size(firstItem.panel.getContentSize().width*0.95, firstItem.panel.getContentSize().height*0.95);
        var intervalW = (this.img_bg3.getContentSize().width - this.scroll_text.getContentSize().width)/2
        var beginX = intervalW+itemSize.width/2;
        var firstPropConfig = this.itemList[200000000 + props[0].propId];
        var pos = cc.p(beginX, scrollSize.height/2);
        firstItem.setPosition(pos);
        this.initWithItemData(firstItem, firstPropConfig, props[0]);
        this.scroll_props.addChild(firstItem);
        items.push(firstItem);

        this.list = {}
        this.list[props[0].propId] = firstItem
        for (var index = 1; index < propNum; index++) 
        {
            pos = cc.p(beginX+index*(itemSize.width+intervalW), scrollSize.height/2);
            var info = this.itemList[200000000 + props[index].propId];
            var item = this.createItem();
            item.setPosition(pos);
            this.initWithItemData(item, info, props[index]);
            this.scroll_props.addChild(item);
            items.push(item);
            this.list[props[index].propId] = item
        }
        this.scroll_props.setInnerContainerSize(cc.size(pos.x+itemSize.width/2+intervalW*2, this.scroll_props.getContentSize().height));
    },

    createItem: function()
    {
        var item = wls.LoadStudioLayout(this.fullPath("hall/packback_item.json"));
        item.setScale(item.getScale()*0.95)
        wls.BindUI(item, item);
        return item;
    },

    initWithItemData: function(item, config, data)
    {
        var countStr = (data["propId"] == 12 ? (data["propCount"]/100+"y") : data["propCount"]);
        item.spr_item.setVisible(true);
        item.fnt_item_count.setVisible(true);
        item.spr_item.loadTexture(this.fullPath("common/images/prop/"+config.res), 1);
        item.fnt_item_count.setString(countStr);
        item.config = config;
        item.data = data;
    },

    click_btn_close: function()
    {
        this.setVisible(false);
    },

    click_btn_sure: function()
    {
        //发送确认邮件收取的消息
        this.sendMsg("sendMakeMailAsRead",this.data.id)
        this.setVisible(false);
    },

    //邮件已读
    onGetAward: function(resp)
    {
        if (resp.success) 
        {
            wls.connectPropTb(resp.props, resp.seniorProps);
            for (var key = 0; key < resp.props.length; key++) 
            {
                var val = resp.props[key];
                var pos = wls.getWordPosByNode(this.list[val.propId])
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
        }
    },
});