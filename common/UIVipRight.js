// vip特权界面
wls.namespace.UIVipRight = cc.Node.extend({
    getZorder: function () {
        return wls.ZOrder.Pop
    },
    onCreate: function () {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("hall/uivipright.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        var scale = wls.AdaptationWeChat(this.btn_close, this)
        ccnode.setScale(ccnode.getScale() * scale)

        for (var i = 1; i <= 4; i++) {
            var item = this["node_prop_" + i];
            wls.BindUI(item, item);
        }
        this.initView();
        this.adaptClose(this.btn_close);
    },
    onActive: function (zorder) {
        var isGet = this.find("DAPlayer").getVipAwardState()
        // this.btn_get.setVisible(!isGet);
        
        var path = null;
        if(isGet){
            path = this.fullPath("common/images/btn/com_pic_jryl.png");
            this.btn_get.setEnabled(false);
        }
        else{
            path = this.fullPath("common/images/btn/com_pic_lq.png");
        }
        var node = this.btn_get.getChildByName("img_lq");
        node.loadTexture(path, 1);
        //重置尺寸
        node.ignoreContentAdaptWithSize(true);

        // this.spr_word_yl.setVisible(isGet);
        this.initView(this.find("DAPlayer").getVipLevel())
        var data = this.find("DAPlayer").getVipData();

        this.updataByVipLv(this.find("DAPlayer").getVipLevel())
        this.setLocalZOrder(zorder || this.getZorder());
    },

    initView: function (vipLv) {
        if (vipLv == null) {
            vipLv = this.find("DAPlayer").getVipLevel();
        }
        this.config = wls.Config.getAll("vip");
        this.configCount = Object.getOwnPropertyNames(this.config.list).length;
        this.updataByVipLv(vipLv);
        var data = this.find("DAPlayer").getVipData();
        var perStr = "" + data.has_cost + "/" + data.lvlup_need;
        if (data.lvlup_need <= 0) {
            this.node_top.setVisible(false);
            this.node_top_2.setVisible(true);
        } else {
            this.node_top.setVisible(true);
            this.node_top_2.setVisible(false);
            this.fnt_vip_cur.setString(vipLv);
            this.fnt_vip_next.setString(vipLv + 1);
            this.bar_vip.setPercent(data.percent);
            this.fnt_vip_exp.setString(data.percent + "&100");
            var needMoney = (data.lvlup_need - data.has_cost) / 100;
            this.fnt_money_num.setString(needMoney);
            //元，可升级到vip7
            var str = wls.Config.getLanguage(800000097) + "VIP" + (vipLv + 1);
            this.txt_money_tip.setString(str);
            var pos = this.fnt_money_num.getPosition();
            var size = this.fnt_money_num.getContentSize();
            pos.x = pos.x + size.width;
            this.txt_money_tip.setPosition(pos);
        }
        //VIP物品奖励
        var rewardData = wls.Config.get("vip", 840000000 + vipLv);
        this.proplist = {}
        if (rewardData.daily_items_reward == 0) {
            this.node_bottom.setVisible(false);
            this.node_bottom_2.setVisible(true);
            this.txt_vip_note.setString(wls.Config.getLanguage(800000213));
        } else {
            this.node_bottom.setVisible(true);
            this.node_bottom_2.setVisible(false);
            var strArray = rewardData.daily_items_reward.split(";")
            for (var i = 1; i <= 4; i++) {
                var itemId = Number(strArray[(i - 1) * 2]);
                var itemCount = Number(strArray[(i - 1) * 2 + 1]);
                var itemData = wls.Config.get("item", 200000000 + itemId);
                var filename = this.fullPath("common/images/prop/" + itemData.res);
                var item = this["node_prop_" + i];
                item.img_icon.loadTexture(filename, 1);
                item.fnt_item_count.setString(itemCount);
                this.proplist[itemId] = item;
            }
        }
    },

    updataByVipLv: function (vipLv) {
        if (vipLv <= 1) {
            vipLv = 1;
        }
        //cc.log("vipLv ==", vipLv);
        if (vipLv <= 1) {
            this.btn_left.setVisible(false);
            this.btn_right.setVisible(true);
        } else if (vipLv >= this.configCount - 1) {
            this.btn_right.setVisible(false);
            this.btn_left.setVisible(true);
        } else {
            this.btn_right.setVisible(true);
            this.btn_left.setVisible(true);
        }
        this.curIndex = vipLv;
        this.fnt_vip_num.setString(vipLv);

        var cannonConfig = null;
        wls.Config.ForEach("cannonoutlook", function (val) {
            if (val.type == vipLv + 1) {
                cannonConfig = val;
                return true;
            }
        });
        this.img_gun_name.loadTexture(this.fullPath("hall/images/vip/" + cannonConfig.rec), 1);
        this.spr_gun.setSpriteFrame(this.fullPath("battle/cannon/" + cannonConfig.cannon_img));

        vipConfig = null;
        wls.Config.ForEach("vip", function (val) {
            if (val.vip_level == vipLv) {
                vipConfig = val;
                return true;
            }
        });

        //cc.log("show_text ==>", vipConfig.show_text);
        //VIP权利 富文本
        var showData = this.splitVipShowText(vipConfig.show_text);
        this.createRichText(showData);
    },
    splitVipShowText: function (show_text) {
        var tempArray = new Array;
        var strArray = show_text.split(";")
        for (var key in strArray) {
            var subStr = strArray[key];
            var start = subStr.indexOf("[");
            var end = subStr.indexOf("]");
            var data = {};
            if (start < 0 || end < 0) {
                data.type = 0;
                data.size = 28;
                data.word = subStr;
            } else {
                data.front = subStr.substring(0, start);
                data.behind = subStr.substring(end, subStr.length - 1);

                subStr = subStr.substring(start + 1, end);
                var subArray = subStr.split("|");
                data.r = subArray[0];
                data.g = subArray[1];
                data.b = subArray[2];
                data.a = subArray[3];
                data.size = subArray[4];
                data.word = subArray[5];
                data.type = 1;
            }
            tempArray.push(data);
        }
        return tempArray;
    },
    createRichText: function (showData) {
        this.listview.setVisible(true);
        this.listview.removeAllChildren()
        var fontSize = 28;
        if (showData.length > 5) {
            fontSize = 24;
            this.listview.setItemsMargin(16);
        } else {
            this.listview.setItemsMargin(30);
        }

        for (var i = showData.length - 1; i >= 0; i--) {
            var data = showData[i];
            if (data.type != 0) {
                fontSize = data.size
            }
        }

        //for(var i in showData){
        for (var i = showData.length - 1; i >= 0; i--) {
            var custom_item = ccui.Layout.create()
            custom_item.nodeType = "cocosStudio"
            //设置内容大小  
            custom_item.setContentSize(cc.size(420, fontSize))
            custom_item.setAnchorPoint(0.5, 0.5)

            var richText = ccui.RichText.create();
            //richText.ignoreContentAdaptWithSize(true)

            var data = showData[i];
            var item = null;
            var str = ""
            if (data.type == 0) {
                str = str + data.word
                item = ccui.RichElementText.create(i + 1, cc.c3b(255, 255, 255), 255, data.word, "Arial", fontSize);
                richText.pushBackElement(item);
            } else {
                if (data.front != null) {
                    str = str + data.front
                    item = ccui.RichElementText.create(i + 1, cc.c3b(255, 255, 255), 255, data.front, "Arial", data.size);
                    richText.pushBackElement(item);
                }
                str = str + data.word
                item = ccui.RichElementText.create(i + 1, cc.c3b(data.r, data.g, data.b), data.a, data.word, "Arial", data.size);
                richText.pushBackElement(item);
                if (data.behind != null) {
                    str = str + data.behind
                    item = ccui.RichElementText.create(i + 1, cc.c3b(255, 255, 255), 255, data.behind, "Arial", data.size);
                    richText.pushBackElement(item);
                }
            }
            var txt = ccui.Text.create(str, "Arial", fontSize)
            txt.ignoreContentAdaptWithSize(true)
            //设置位置  
            richText.setPosition(cc.p(40 + txt.getContentSize().width / 2, custom_item.getContentSize().height / 2));
            //往布局中添加一个按钮  
            custom_item.addChild(richText)
            //往ListView中添加一个布局  
            this.listview.insertCustomItem(custom_item, 0)
        }
    },
    click_btn_get: function () {
        this.sendMsg("sendGetVipDailyReward")
    },
    getVipReward: function () {
        // this.btn_get.setVisible(false);
        // this.spr_word_yl.setVisible(true);
        var node = this.btn_get.getChildByName("img_lq");
        node.loadTexture(this.fullPath("common/images/btn/com_pic_jryl", 1));
    },
    click_btn_left: function () {
        this.curIndex -= 1;
        this.updataByVipLv(this.curIndex);
    },
    click_btn_right: function () {
        this.curIndex += 1;
        this.updataByVipLv(this.curIndex);
    },
    click_btn_recharge: function () {
        this.activeGameObject("UIShop");
        this.setVisible(false);
    },
    click_btn_close: function () {
        this.setVisible(false);
    },


    onGetVipDailyReward: function (resp) {
        if (!resp.success) {
            return
        }
        this.getVipReward()
        this.find("DAPlayer").setVipAwardState(true)

        var viewid = wls.GameState == 1 ? 0 : FG.SelfViewID
        wls.connectPropTb(resp.props, resp.seniorProps)
        //添加道具
        for (var key = 0; key < resp.props.length; key++) {
            var val = resp.props[key];
            var pos = wls.getWordPosByNode(this.proplist[val.propId])
            var flyData = {
                viewid: viewid,
                propData: val,
                firstPos: pos,
                maxScale: 1,
                isJump: false,
                zorder: wls.ZOrder.Award + 1
            }
            this.find("EFItems").play(flyData);
        }
        this.setVisible(false);
    }
});