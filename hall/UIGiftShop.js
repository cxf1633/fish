/****************************************************************
 * 作者：xiaos
 * 日期：2018-07-05
 * 描述：礼品兑换商店
 ****************************************************************/
"use strict"
/*********转盘兑换记录 */
wls.namespace.UIDialRecord = ccui.Layout.extend({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function(data) {
        var rewardStr = this.getRecordRewardStr(data.props || [], data.seniorProps || [])
        var node = wls.LoadStudioNode(this.fullPath("hall/gift_dial_record.json"), this)
        var isCustomHead = !(data.avatorUrl == null || data.avatorUrl == undefined || data.avatorUrl.length == 0)
        this.addChild(node)
        this.panel.setSwallowTouches(false)
        this.img_head.setVisible(isCustomHead)
        this.text_name.setString(data.nickName || "")
        this.text_id.setString("ID:"+(data.playerId || ""))
        this.text_time.setString(data.time || "")
        this.text_reward.setString(rewardStr)
        this.text_name.setContentSize(cc.LabelTTF.create(data.nickName || "", "Arial", 20).getContentSize())
        this.text_reward.setContentSize(cc.LabelTTF.create(rewardStr, "Arial", 18).getContentSize())

        if (!isCustomHead) {return}
        wls.DownloadPic(data.avatorUrl, function(filePath){
            this.img_head.setVisible(true)
            this.img_head.loadTexture(filePath)
        }.bind(this))
    },

    getId: function() {
        return this.text_id.getString()
    },

    getRecordSize: function() {
        return this.panel.getContentSize()
    },

    getRecordRewardStr: function(props, seniorProps) {
        for (var key = 0; props.length; key++) {
            var info = props[key]
            var propId = info.propId
            var propCount = info.propCount
            var propName = wls.Config.getItemData(propId).name
            propCount = (propId == 12 ? propCount/100 : propCount)
            return propName+"x"+propCount
        }

        for (var key = 0; seniorProps.length; key++) {
            var info = seniorProps[key]
            var propId = info.propId
            var propCount = 1
            var propName = wls.Config.getItemData(propId).name
            return propName+"x"+propCount
        }

        return ""
    },
    
})

/*********兑换转盘 */
wls.namespace.UIGiftDial = ccui.Layout.extend({
    getZorder:function () {
        return wls.ZOrder.Pop+1
    },
    onCreate: function(data) {
        wls.CreateMask(this)
        var node = wls.LoadPopupView(this.fullPath("hall/gift_shop_dial.json"), this)
        node.setPosition(display.width/2, display.height/2)
        this.addChild(node)
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        node.setScale(node.getScale()*scale)
        this.adaptClose(this.btn_close)
        this.sendMsg("sendFishTicketDial")     
        this.listview_records.setBounceEnabled(true)
        this.listview_records.setScrollBarEnabled(true)
        this.testId = 1
        this.curIndex = 1
        this.history = []
        this.rolling = false

        var costInfo = wls.SplitArray(wls.Config.getConfig("990000116"))
        var rewardsTab = wls.SplitArray(wls.Config.getConfig("990000115"))
        
        this.updatePanel()
        this.fnt_cost.setString(costInfo[1])
        this.probabilityTab = [{"probability":10},{"probability":10},{"probability":10},{"probability":10},{"probability":10},{"probability":15},{"probability":15},{"probability":15},{"probability":5}]
        for (var key = 0; key < rewardsTab.length; key+=3) {
            var propId = parseInt(rewardsTab[(key)])
            var propCount = parseInt(rewardsTab[key+1])
            var info = wls.Config.getItemData(propId)
            var propName = info.name
            var pic = "common/images/prop/"+info.res
            var unit = (propId == 12 ? wls.Config.getLanguage("800000210") : "")
            propCount =  (propId == 12 ? propCount/100 : propCount)
            var nameStr = propName+"x"+propCount+unit
            this["item"+(key/3+1)+"_icon"].setVisible(propId != 0)
            this["item"+(key/3+1)+"_name"].setVisible(propId != 0)
            this["think"+(key/3+1)].setVisible(propId == 0)
            this["item"+(key/3+1)+"_name"].setString(propId == 0 ? "" : nameStr)
            this["item"+(key/3+1)+"_name"].setContentSize(cc.LabelTTF.create(nameStr, "Arial", 24).getContentSize())
            this["item"+(key/3+1)+"_icon"].loadTexture(this.fullPath(pic), 1)
            this.probabilityTab[key/3].name = (propId == 0 ? "谢谢参与" : info.name)
            this.probabilityTab[key/3].num = propCount
        }
        //闪光灯 1秒一次
        this.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.CallFunc.create(function(){
            for (var key = 1; key <= 8; key+=2) {
                var pos = this["point"+(key+1)].getPosition()
                this["point"+(key+1)].setPosition(this["point"+key].getPosition())
                this["point"+key].setPosition(pos)
            }
        }.bind(this)), cc.DelayTime.create(1))))
    },

    onEventPlayerDataModified: function () {
        this.updatePanel();
    },
    
    updatePanel: function() {
        this.fnt_num.setString(this.find("DAPlayer").getPropAmount(18))
        this.fnt_times.setString(this.find("DAPlayer").getLeftLotteryTimes())
    },

    startRotateAct: function(targetIndex, rotateActEnd) {
        this.waiting(false, "StartDial")
        this.rolling = true
        var INTERVAL = 40
        var angle = 0
        var playMusic = function(sender) {
            if (sender.getRotation() >= angle+INTERVAL) {
                angle = sender.getRotation()
                //播放音乐
                this.find("SCSound").playEffect("rolling_01.mp3", false)
            }
        }.bind(this)
        var endAct = function(sender) {
            this.curIndex = targetIndex
            //播放完成动画
            this.inner_action.play("getreward", false)
            this.runAction(cc.Sequence.create(cc.DelayTime.create(1), cc.CallFunc.create(function(){
                //显示出奖励
                rotateActEnd()
                
            }.bind(this)), cc.DelayTime.create(1), cc.CallFunc.create(function(){this.rolling = false}.bind(this))))
        }.bind(this)

        var targetAngle = 720+(360-((targetIndex-1)*INTERVAL-(this.curIndex-1)*INTERVAL))
        var rotateAct = cc.Sequence.create(cc.EaseSineIn.create(cc.RotateBy.create(1.5, 1440)), cc.EaseExponentialOut.create(cc.RotateBy.create(2.5, targetAngle)), cc.CallFunc.create(endAct))
        var playMusicAct = cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(0.1), cc.CallFunc.create(playMusic)))
        playMusicAct.setTag(15432)
        this.spr_dial_bg.stopActionByTag(15432)
        this.spr_dial_bg.runAction(rotateAct)
        this.spr_dial_bg.runAction(playMusicAct)
    },

    //显示单条记录ui
    showRecord: function(data) {
        var record = this.createUnnamedObject("UIDialRecord", data)
        var itemNum = this.listview_records.getItems().length
        var layout = ccui.Layout.create()
        layout.setSwallowTouches(false)
        layout.setContentSize(record.getRecordSize().width, record.getRecordSize().height)
        layout.setBackGroundColor(cc.c3b(0, 0, 0))
        layout.setBackGroundColorOpacity(0)
        layout.setBackGroundColorType(1)
        record.setPosition(record.getRecordSize().width/2, record.getRecordSize().height/2)
        wls.ChangeParentNode(record, layout)
        this.listview_records.insertCustomItem(layout, 0)

        if (itemNum+1 > 20) { this.listview_records.removeLastItem() }
    },

    addDialRecords: function(data, time) {
        this.stopActionByTag(10115)
        var showRecordFunc = function(){
            for (var key = 0; key < data.length; key++) {
                var info = data[key]
                data.splice(key, 1)
                if (info.props.length == 0 && info.seniorProps.length == 0) { continue }
                this.showRecord(info)
                break
            }
            if (data.length == 0) { this.stopActionByTag(10115) }
        }.bind(this)
        var seq = cc.Sequence.create(cc.DelayTime.create(5), cc.CallFunc.create(showRecordFunc))
        var act = cc.RepeatForever.create(seq)
        act.setTag(10115)
        this.history = this.history.concat(data)
        if (time) { 
            this.runAction(act)
        } else { 
            for (var key = data.length-1; key >= 0; key--) {
                if (data[key].props.length == 0 && data[key].seniorProps.length == 0) { continue }
                this.showRecord(data[key])
                data.splice(key, 1)
            }
        }
    },

    click_btn_close: function() {
        if (this.rolling) { return }
        this.setVisible(false)
        this.activeGameObject("UIGiftShop")
        this.sendMsg("sendExitFishTicketDial") 
    },
    
    click_btn_start: function() {
        
        if (this.find("DAPlayer").getLeftLotteryTimes() <= 0) {
            this.toast(wls.Config.getLanguage(800000424))
            return
        }
        if (this.find("DAPlayer").getPropAmount(18) < parseInt(this.fnt_cost.getString())) { 
            this.toast(wls.Config.getLanguage(800000051))
            return
        }
        if (this.rolling) { return }
        this.waiting(true, "StartDial")
        this.sendMsg("sendStartExcDial") 
    },

    click_btn_help: function() {
        this.createGameObject("UIProbability", this.probabilityTab).setPanelPosByNode(this.btn_help)
    },
})

/*********订单界面 */
wls.namespace.UIGiftOrder = ccui.Layout.extend({
    getZorder:function () {
        return wls.ZOrder.Pop+1
    },
    onCreate: function(data) {
        wls.CreateMask(this)
        var node = wls.LoadPopupView(this.fullPath("hall/gift_shop_order.json"), this)
        node.setPosition(display.width/2, display.height/2)
        this.addChild(node)
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        node.setScale(node.getScale()*scale)
        this.adaptClose(this.btn_close)
        this.input_name = wls.TextFieldToEditBox(this.input_name)
        this.input_phone = wls.TextFieldToEditBox(this.input_phone)
        this.input_addr = wls.TextFieldToEditBox(this.input_addr)

        this.price = parseInt(data.price || 10000)
        this.type = parseInt(data.type)
        this.goodsId = data.id

        this.unit = wls.Config.getItemData(18).name
        this.text_name.setString(data.name || "")
        this.fnt_num.setString(1)
        this.text_total_num.setString(data.total || 0)
        this.text_price.setString((data.price || 10000)+this.unit)
        this.text_postage.setString(data.postage || 0)
        this.btn_exchange.setBright(parseInt(this.text_total_num.getString()) > 0)
        this.btn_exchange.setTouchEnabled(parseInt(this.text_total_num.getString()) > 0)

        //请求下载图片
        wls.DownloadPic(data.pic || "", function(filePath) {
            var oldSize = this.spr_item_icon.getContentSize()
            this.spr_item_icon.setTexture(filePath)
            var newSize = this.spr_item_icon.getContentSize()
            this.spr_item_icon.setScaleX(oldSize.width/newSize.width)
            this.spr_item_icon.setScaleY(oldSize.height/newSize.height)
        }.bind(this))
    },

    click_btn_exchange: function() {
        var goodsname = this.text_name.getString()
        var name = this.input_name.getString()
        var phone = this.input_phone.getString()
        var addr = this.input_addr.getString()
        var buyNum = parseInt(this.fnt_num.getString())
        var diqu = LocalConfig.getInstance().GetRegionCode()

        if (this.type == 0) {
            if (name == "" || name == null) {
                this.toast(wls.Config.getLanguage(800000400))
                return
            }
            if (phone == "" || phone == null) {
                this.toast(wls.Config.getLanguage(800000402))
                return
            }
            if (addr == "" || addr == null) {
                this.toast(wls.Config.getLanguage(800000403))
                return
            }
        } else if (this.type == 2) {
            if (phone == "" || phone == null) {
                this.toast(wls.Config.getLanguage(800000402))
                return
            }
        } else {
            if (name == "" || name == null) {
                this.toast(wls.Config.getLanguage(800000400))
                return
            }
            if (phone == "" || phone == null) {
                this.toast(wls.Config.getLanguage(800000402))
                return
            }
        }
        //发送请求
        GiftDateLogic.sendBuyGoodWeb(this.goodsId, this.type, buyNum, name, phone, diqu, addr, function(result){
            if (result && result.status == 0) {
                this.click_btn_close()
                var content = wls.Config.getLanguage(800000426).replace(/[\\]n/g, '\n')
                content = wls.format(content,"%s",[result.data.data])
                this.dialog(1, content)
                cc.log(result.data.data)
                this.sendMsg("sendGetHallInfo")
                if (isMiniGame()) {
                    GiftDateLogic.createWeiXinCopy(result.data.data)
                } else {
                    //Helper.CopyToClipboard(result.data.data)
                }
            } else {
                this.toast(wls.Config.getLanguage(800000438))
            }
        }.bind(this))
    },

    click_btn_add: function() {
        var needCostNum = (parseInt(this.fnt_num.getString())+1)*this.price
        if (needCostNum <= this.find("DAPlayer").getPropAmount(18) && (parseInt(this.fnt_num.getString())+1) <= parseInt(this.text_total_num.getString())) {
            this.fnt_num.setString(parseInt(this.fnt_num.getString())+1)
            this.text_price.setString(needCostNum+this.unit)
        }
    },

    click_btn_dec: function() {
        var needCostNum = (parseInt(this.fnt_num.getString())-1)*this.price
        if ((parseInt(this.fnt_num.getString())-1) > 0) {
            this.fnt_num.setString(parseInt(this.fnt_num.getString())-1)
            this.text_price.setString(needCostNum+this.unit)
        }
    },

    click_btn_close: function() {
        this.setVisible(false)
        this.activeGameObject("UIGiftShop")
    },
})

/*********礼品item */
wls.namespace.UIGiftItem = ccui.Layout.extend({
    onCreate: function(data) {
        cc.log(data)
        var node = wls.LoadStudioNode(this.fullPath("hall/gift_shop_item.json"), this,false)
        this.addChild(node)
        this.btn_buy.setSwallowTouches(false)
        this.isDialItem = (data["type"] == 0)
        this.isExcCallCharge = (data["type"] == 1)
        this.spr_effect.setVisible(false)
        this.spr_times.setVisible(false)
        this.spr_effect_1.setVisible(false)

        this.data = data
        

        if (this.isDialItem) {
            this.initAsDialItem(data)
            return
        }

        if (this.isExcCallCharge) {
            this.initAsExcCallChargeItem(data)
            return
        }

        this.initAsGiftItem(data)
    },

    updateItem: function() {
        if (this.isDialItem) {
            //更新转盘item
            var dialCostInfo = wls.Config.getConfig("990000116").split(";")
            var costPropId = dialCostInfo[0]
            var costPropNum = dialCostInfo[1]
            var times = this.find("DAPlayer").getLeftLotteryTimes()
            var isEnought = costPropNum <= this.find("DAPlayer").getPropAmount(18)
            this.spr_effect.setVisible(times > 0 && isEnought)
            this.spr_times.setVisible(times > 0)
            if (times > 0) {
                this.text_times.setString(times+"次")
                this.inner_action.play("clickEffect", isEnought)
            }
        } else if (this.isExcCallCharge) {
            var needCallRechargeNum = parseInt(wls.Config.getConfig("990000122"))
            var curCallRechargeNum = this.find("DAPlayer").getPropAmount(12)
            var isCanRecharge = ((curCallRechargeNum/100) >= (needCallRechargeNum/100))
            this.spr_effect_1.setVisible(isCanRecharge)
            if (isCanRecharge) {
                this.inner_action.play("clickEffect1", true)
            }
        }
    },

    initAsDialItem: function(data) {
        var dialCostInfo = wls.Config.getConfig("990000116").split(";")
        var costPropId = dialCostInfo[0]
        var costPropNum = dialCostInfo[1]

        this.fnt_price.setString(costPropNum)
        
        this.img_icon.loadTexture(this.fullPath("hall/images/free_coin/freemoney_icon_5.png"), 1)
        this.btn_buy.loadTextures(this.fullPath("hall/images/exchange_shop/exchangeshop_bg_15.png"),
                                    this.fullPath("hall/images/exchange_shop/exchangeshop_bg_15.png"),
                                    this.fullPath("hall/images/exchange_shop/exchangeshop_bg_15.png"), 1)
        this.btn_buy.setScale9Enabled(true)
        this.btn_buy.setCapInsets({x : 37, y : 133, width : 4, height : 7})
        this.text_name.setString("渔券抽奖")
        this.text_name.setColor(cc.c3b(201, 83, 39))
        
        this.updateItem()
    },

    initAsExcCallChargeItem: function(data) {
        var needCallRechargeNum = parseInt(wls.Config.getConfig("990000122"))
        var title = wls.Config.getLanguage("800000428")
        var sprUnit = cc.Sprite.create()
        var unitFrame = cc.spriteFrameCache.getSpriteFrame(this.fullPath("hall/images/exchange_shop/exchangeshop_pic_y.png"))

        this.money_icon.loadTexture(this.fullPath("hall/images/exchange_shop/exchangeshop_icon_hfj.png"), 1)
        this.img_icon.loadTexture(this.fullPath("hall/images/exchange_shop/exchangeshop_icon_hf.png"), 1)
        this.img_icon.setContentSize(cc.size(139, 139))
        this.money_icon.setScale(1)
        this.money_icon.setContentSize(cc.size(54, 36))
        this.money_icon.setPositionX(this.money_icon.getPositionX())
        this.fnt_price.setString((needCallRechargeNum/100))
        this.fnt_price.setPositionX(this.fnt_price.getPositionX()+5)
        this.text_name.setString(title)
        this.text_name.setContentSize(cc.LabelTTF.create(title, "Arial", 20).getContentSize())
        this.text_name.setPositionX(0)
        sprUnit.initWithSpriteFrame(unitFrame)
        sprUnit.setPositionX(this.fnt_price.getPositionX()+this.fnt_price.getContentSize().width+sprUnit.getContentSize().width/2)
        sprUnit.setPositionY(this.fnt_price.getPositionY())
        this.addChild(sprUnit)

        this.updateItem()
    },

    initAsGiftItem: function(data) {
        //请求下载图片
        wls.DownloadPic(data.goodPic || "", function(filePath) {
            var size = this.img_icon.getContentSize()
            this.img_icon.loadTexture(filePath)
            this.img_icon.setScaleX(size.width/this.img_icon.getContentSize().width)
            this.img_icon.setScaleY(size.height/this.img_icon.getContentSize().height)
            this.img_icon.setContentSize(size)
        }.bind(this))
        //请求商品详情
        GiftDateLogic.sendGiftBuyInfoWeb(parseInt(data.goodId), parseInt(data.goodCateGoryId), function(data){
            this.postage = parseInt(data.goodPostage)/800
            this.type = parseInt(data.goodType)
            this.total = parseInt(data.goodStock)
            this.isGetInfo = true
        }.bind(this))

        //
        this.isGetInfo = false
        this.pic = data.goodPic
        this.id = data.goodId
        this.postage = 0
        this.categoryId = data.goodCateGoryId
        this.text_name.setString(data.goodName)
        this.text_name.setContentSize(cc.LabelTTF.create(data.goodName,  undefined,  20).getContentSize())
        this.fnt_price.setString(data.goodPrice)
        this.money_icon.setPositionY(this.fnt_price.getPositionY())
    },

    click_btn_buy: function(sender) {
        var touchBeginPos = this.btn_buy.getTouchBeganPosition()
        var touchEndPos = this.btn_buy.getTouchEndPosition()
        if ((touchEndPos.x-touchBeginPos.x >= -6) && (touchEndPos.x-touchBeginPos.x <= 6) && 
            (touchEndPos.y-touchBeginPos.y >= -6) && 
            (touchEndPos.y-touchBeginPos.y <= 6)) {
                cc.log("click buy")
                if (this.isExcCallCharge) {
                    //打开话费兑换
                    this.data.closePanel()
                    this.createGameObject("UIPhoneChargesExc")
                    return
                }

                if (this.find("DAPlayer").getPropAmount(18) < parseInt(this.fnt_price.getString())) {
                    //钱不够
                    this.toast(wls.Config.getLanguage(800000404))
                    return
                }

                if (this.isDialItem) {
                    //打开转盘
                    this.data.closePanel()
                    this.createGameObject("UIGiftDial")
                    
                    return
                }

                if (!this.isGetInfo) {
                    //还没有获取到详细信息
                    return
                }

                //打开订单界面
                var data = {
                    "pic":this.data.goodPic,
                    "id":this.data.goodId,
                    "type":this.type,
                    "name":this.data.goodName,
                    "price":this.data.goodPrice,
                    "total":this.total,
                    "postage":this.postage,
                }
                this.createGameObject("UIGiftOrder", data)
                this.data.closePanel()

            }
    },

})

/*********礼品商店panel */
wls.namespace.UIGiftShop = ccui.Layout.extend({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    COL:4, 
    onCreate: function() {
        wls.CreateMask(this)
        var node = wls.LoadPopupView(this.fullPath("hall/gift_shop_panel.json"), this)
        node.setPosition(display.width / 2, display.height / 2)
        this.addChild(node)
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        node.setScale(node.getScale()*scale)
        this.scrollview_items.setBounceEnabled(true)
        this.scrollview_items.setScrollBarPositionFromCornerForVertical(cc.p(0, 0))
        this.btn_close.setPosition(-display.width/2+65, display.height/2-70)
        this.spr_temp.setVisible(false)

        //发送请求
        this.adaptClose(this.btn_close)
     },

    onActive: function() {
        if (this.giftListData) { 
            this.updatePanel()
        } else {
            GiftDateLogic.sendGiftLiPinWeb(this.onGiftItemsData.bind(this))
        }
        this.fnt_cur_num.setString(this.find("DAPlayer").getPropAmount(18))
    },

    onGiftItemsData: function(data) {
        this.scrollview_items.removeAllChildren()
        data = data || []
        data.splice(0, 0, {"type":0})
        data.splice(1, 0, {"type":1})
        this.giftListData = data
        var originContainerSize = this.scrollview_items.getInnerContainerSize()
        var itemSize = cc.size(230, 246)
        var totalItem = data.length
        var totalRow = (Math.ceil(totalItem/this.COL) == 1 ? 2 : Math.ceil(totalItem/this.COL))
        var newContainerSize = cc.size(originContainerSize.width, itemSize.height*totalRow)
        this.scrollview_items.setInnerContainerSize(newContainerSize)
        for (var key = 0; key < data.length; key++) {
            data[key].closePanel = function(){ this.click_btn_close() }.bind(this)
            var row = Math.ceil((key+1)/this.COL)
            var col = (key%this.COL)
            var item = this.createUnnamedObject("UIGiftItem", data[key])
            item.setPosition(itemSize.width/2+(col)*itemSize.width, itemSize.height/2+(totalRow-row)*itemSize.height)
            item.setTag(data[key].type != null ? data[key].type : 1)
            wls.ChangeParentNode(item, this.scrollview_items)
        }
    },

    onEventPlayerDataModified: function () {
        this.updatePanel();
    },

    updatePanel: function () {
        this.fnt_cur_num.setString(this.find("DAPlayer").getPropAmount(18))
        var items = this.scrollview_items.getChildren()
        for (var key = 0; key < items.length; key++) {
            items[key].updateItem()
        }
    },


    //打开鱼劵抽奖界面
    runDialItem: function() {
        var item = this.scrollview_items.getChildByTag(0);
        if (item != null)
        {
            item.click_btn_buy()
        }
    },

    click_btn_close: function() {
        
        this.setVisible(false)
    },

    click_btn_getway: function() {
        // var content = wls.Config.getLanguage(800000437)
        // content = content.replace(/[\\]n/g, '\n')
        // this.dialog(2, content)
        this.activeGameObject("UIGiftShopTip")
    },
})

//获取方式
wls.namespace.UIGiftShopTip = ccui.Layout.extend({
    getZorder:function () {
        return wls.ZOrder.Pop
    },

    onCreate: function() {
        wls.CreateMask(this)
        var node = wls.LoadStudioNode(this.fullPath("hall/uigiftshoptip.json"), this);
        node.setPosition(display.width/2, display.height/2);
        this.addChild(node);
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        node.setScale(node.getScale()*scale)

        this.img_item_demo.setVisible(false);
        this.btn_close.setPosition(-display.width/2+65, display.height/2-70)

        this.initData();
        this.initScrollView();
    },

    initData: function()
    {
        this.itemList = [];
        this.taskList = [];
        var self = this;
        var callback = function(ret)
        {
            var list = self["taskList"]
            if (list && ret.show_type == 3)
            {
                list.push(ret);
            }
        };
        wls.Config.ForEachNew("task", callback);

        if (this.find("DAPlayer").getMaxGunRate() >= 1000) 
        {
            this.onHideItem()
        }

        this.taskList.sort( function(a, b){ return  b.task_turn - a.task_turn; })
        this.taskList.sort( function(a, b){ return  b.task_recommend - a.task_recommend; })
    },

    initScrollView: function()
    {
        var items = this.scrollview.getChildren();
        for (var i = items.length - 1; i > -1; i--)
        {
            items[i].removeFromParent(true);
        }

        this.cellCountSize = this.scrollview.getContentSize();

        var cellW = this.img_item_demo.getContentSize().width;
        this.cellH = this.img_item_demo.getContentSize().height;
        this.intervalW = (this.cellCountSize.width - cellW)/2;

        // for (var i = 0; i < this.taskList.length; i++) 
        // {
        //     var config = this.taskList[i];
        //     var item = this.img_item_demo.clone();
        //     this.itemList.push(item);
        //     item.setVisible(true);
        //     item.config = config;
        //     item.getChildByName("img_cornermark").setVisible(config.task_recommend == 1);
        //     item.getChildByName("task_text").setString(config.task_text);

        //     var x = cellCountSize.width/2;
        //     var y = (cellH+intervalW)*this.taskList.length - (i+0.5)*cellH - intervalW;//item锚点居中 顶部空隙与两侧保持相同
        //     item.setPosition(x, y);
        //     this.scrollview.addChild(item)

        //     wls.OnClicked(item, this);
        // }
        this.scrollview.setInnerContainerSize(cc.size(this.cellCountSize.width, (this.cellH+this.intervalW)*this.taskList.length));

        this.index = 0;
        this.startTimer("loadItem", 0.05, 200, -1);
    },

    loadItem: function () {
        var config = this.taskList[this.index];
        var item = this.img_item_demo.clone();
        item.setVisible(true);
        item.config = config;
        item.getChildByName("img_cornermark").setVisible(config.task_recommend == 1);
        item.getChildByName("task_text").setString(config.task_text);

        var x = this.cellCountSize.width/2;
        var y = (this.cellH+this.intervalW)*this.taskList.length - (this.index+0.5)*this.cellH - this.intervalW;//item锚点居中 顶部空隙与两侧保持相同
        item.setPosition(x, y);
        this.scrollview.addChild(item)

        wls.OnClicked(item, this);

        this.index += 1;
        if (this.index >= this.taskList.length) {
            this.stopTimer(200);
        }
    },

    // 马上玩，快速进入桌子
    play_msw: function()
    {
        var id = this.find("DAHall").defaultRoomID || 1;
        this.find("SCRoomMgr").doGetDesk(id);
    },

    //删除完成新手任务获得奖励项目
    onHideItem: function()
    {
        for (var i = 0; i < this.taskList.length; i++) 
        {
            if (this.taskList[i].id == 430001004) {
                this.taskList.splice(i, 1);
                break
            }
        }
    },

    click_img_item_demo: function(sender)
    {
        var task_type = sender.config.task_type
        switch(task_type)
        {
        case 1001:
          {
              this.find("UIGiftShop").click_btn_close()
              this.click_btn_close()
              if (wls.GameState != 2){
                  this.play_msw()
              }
          }
          break;
        case 1002:
          {
            this.find("UIGiftShop").runDialItem()
            this.click_btn_close()
          }
          break;
        }
    },

    click_btn_close: function() {
        this.removeFromScene()
    },
})