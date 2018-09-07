// 锻造界面
wls.namespace.UIForged = ccui.Layout.extend({
    getZorder: function () {
        return wls.ZOrder.Pop
    },
    onCreate: function () {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("hall/uiforged_main.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        var scale = wls.AdaptationWeChat(this.btn_close, this)
        ccnode.setScale(ccnode.getScale() * scale)
        this.adaptClose(this.btn_close);
        //初始化数据
        this.bItemEnough = true; //材料
        this.bCrystalEnough = false; //红宝石
        this.bPowerEnough = false; //结晶能量
        this.is_open_crystal_energy = false;
        //拥有的物品数量
        this.ownsCntList = [];
        for (var i = 7; i <= 10; i++) {
            var ownsCnt = this.find("DAPlayer").getPropAmount(i);
            this.ownsCntList[i] = ownsCnt;
        }
        //需要的物品数量
        this.needCntList = [];
        //提取节点下的所有子节点
        this.nodeList_1 = {};
        this.getNodeList(this.node_1, this.nodeList_1);
        this.nodeList_2 = {};
        this.getNodeList(this.node_2, this.nodeList_2);
        //充值注释
        // if (FISH_DISABLE_CHARGE || (!this.find("DAPlayer").isGameOpenGif())) {
        //     this.img_forgedbox.setVisible(false);
        // }
        // else{
        //     this.img_forgedbox.setVisible(true);
        //     wls.OnClicked(this.img_forgedbox, this);
        //     var du = 0.5;
        //     var scale_1 =  cc.scaleTo(du,0.65);
        //     var scale_2 =  cc.scaleTo(du,0.75);
        //     this.img_forgedbox.runAction(cc.RepeatForever.create(cc.sequence(scale_1, scale_2)));
        // }

        wls.OnClicked(this.img_label_1, this, "labelPage");
        wls.OnClicked(this.img_label_2, this, "labelPage");
        wls.OnClicked(this.img_hook_bg, this);

        //上一个播放的动画名字
        this.lastAniName = null;
        //回调的时候会填充这个值
        this.resultData = null;
        var self = this;
        this.inner_action.setLastFrameCallFunc(function () {
            if (self.lastAniName == "forgeding") {
                if (self.resultData.isSuccess) {
                    self.playTimeLine("success", false);
                } else {
                    self.playTimeLine("fail", false);
                }
            } else if (self.lastAniName == "success" || self.lastAniName == "fail") {
                if (!self.resultData) return;
                var funcName = "forged_" + self.pageIndex + "_" + self.lastAniName;
                cc.log("funcName ==>>>", funcName);
                self[funcName]();
                self.playTimeLine("normal", true);
                self.setAllBtnEnabled(true);
            }
        });
        //播放待机动画
        this.playTimeLine("normal", true);
        //1,倍率锻造 2分身锻造
        this.pageIndex = -1;
        this.updateView(1);
        
        //隐藏分身锻造功能
        this.img_label_2.setVisible(false);
    },
    playTimeLine: function (name, loop) {
        this.lastAniName = name;
        this.inner_action.play(name, loop);
        var soundName = cc.formatStr("forged_%s.mp3", name);
        if (name != "normal") {
            this.find('SCSound').playEffect(soundName, loop);
        }
    },
    //锻造宝箱 注释
    // click_img_forgedbox:function(){
    //     this.find("SCLayerMgr").showLayerByName("UIForgedChest",true)
    // },

    onEventPlayerDataModified: function () {
        this.updateView(this.pageIndex);
    },

    //点击标签页
    click_labelPage: function (sender) {
        var index = 1;
        if (sender.name != "img_label_1") {
            index = 2;
        }
        this.updateLabelPage(index);
        this["updateNode_" + index]();
    },
    updateLabelPage: function (index) {
        if (this.pageIndex == index) {
            return;
        }
        this.pageIndex = index;
        var pageFileName_1 = null;
        var pageFileName_2 = null;
        var titleFileName = null;
        if (this.pageIndex == 1) {
            pageFileName_1 = this.fullPath("hall/images/forged/forged_btn_bldz_1.png");
            pageFileName_2 = this.fullPath("hall/images/forged/forged_btn_fsdz_0.png");
            titleFileName = this.fullPath("hall/images/forged/forged_title_bldz.png");
        } else {
            pageFileName_1 = this.fullPath("hall/images/forged/forged_btn_bldz_0.png");
            pageFileName_2 = this.fullPath("hall/images/forged/forged_btn_fsdz_1.png");
            titleFileName = this.fullPath("hall/images/forged/forged_title_fsdz.png");
        }
        if (pageFileName_1 && pageFileName_2 && titleFileName) {
            this.img_label_1.loadTexture(pageFileName_1, 1);
            this.img_label_2.loadTexture(pageFileName_2, 1);
            this.spr_txt.setSpriteFrame(titleFileName);
            this.node_1.setVisible(false);
            this.node_2.setVisible(false);
            this["node_" + this.pageIndex].setVisible(true);
        } else {
            cc.log("pic path error!================>>>>>");
            return;
        }
    },
    updateView: function (pageIndex) {
        //刷新数据
        //
        this.maxGunRate = this.find("DAPlayer").getMaxGunRate();
        this.curGunData = wls.Config.get("cannon", this.maxGunRate);

        var index = 1;
        if (pageIndex) {
            index = pageIndex;
        }
        this.updateLabelPage(index);

        this.fnt_gun_times_num.setString(this.curGunData.times);
        this.fnt_gun_times_num_0.setString(this.curGunData.times);
        //刷新炮台外观
        var gunOutLookData = this.find("DAPlayer").getVipMaxGunOutLook();
        var gunFileName = this.fullPath("battle/cannon/" + gunOutLookData.cannon_img);
        this.img_gun_0.loadTexture(gunFileName, 1);
        this.img_gun_1.loadTexture(gunFileName, 1);
        //获得鱼币数量
        this.fnt_fishticket.setString(this.curGunData.fishticket_drop);
        //刷新
        this["updateNode_" + index]();
    },
    getNodeList: function (node, object) {
        for (var i = 0; i < node.childrenCount; i++) {
            var obj = node.children[i];
            var name = obj.getName();
            if (obj.childrenCount > 0) {
                this.getNodeList(obj, object);
            }
            if (object[name]) {
                cc.log(cc.formatStr("node is exist! name:%s    parentname1:%s   parentname2:%s",
                    name, node.getName(), object[name].getParent().getName()));
            } else {
                object[name] = obj;
            }
        }
    },
    updateNode_1: function () {
        if (this.maxGunRate < 10000) {
            this.nodeList_1["node_max_hide"].setVisible(true);
            //隐藏提示
            var curNode = this["node_" + this.pageIndex].getChildByName("node_max_hide");
            this.setHelpIsShow(false);
            var nextGunRate = wls.Config.getNextGunRate(this.maxGunRate);
            var nextGunData = wls.Config.get("cannon", nextGunRate);
            this.nodeList_1["fnt_next_times"].setString(nextGunData.times);
            this.nodeList_1["fnt_crystal"].setString(nextGunData.unlock_gem);
            var crystalCnt = this.find("DAPlayer").getGem();
            this.bCrystalEnough = crystalCnt >= nextGunData.unlock_gem;
            var powerCnt = this.find("DAPlayer").getPropAmount(11);
            this.bPowerEnough = powerCnt >= nextGunData.succ_need;
            this.nodeList_1["txt_num"].setString(powerCnt + "/" + nextGunData.succ_need);
            this.nodeList_1["img_hook"].setVisible(this.is_open_crystal_energy);
            //刷新锻造材料
            this.bItemEnough = this.updataItems(nextGunData.unlock_item);
        } else {
            this.nodeList_1["node_max_hide"].setVisible(false);
            this.bItemEnough = this.updataItems("7;0;8;0;9;0;10;0");
        }
    },
    updataItems: function (unlock_item) {
        var bItemEnough = true;
        var dataList = unlock_item.split(";");
        for (var i = 1; i <= 4; i++) {
            var itemId = Number(dataList[(i - 1) * 2]);
            var needCnt = Number(dataList[(i - 1) * 2 + 1]);
            //记录需要的物品数量
            this.needCntList[itemId] = needCnt;
            var itemData = wls.Config.get("item", 200000000 + itemId);
            var filename = this.fullPath("common/images/prop/" + itemData.res);
            var item = this["node_prop_" + i];
            item.getChildByName("img_prop").loadTexture(filename, 1);
            var ownsCnt = this.ownsCntList[itemId];
            if (needCnt == 0) {
                item.getChildByName("fnt_item").setString(ownsCnt + "&--");
            } else {
                item.getChildByName("fnt_item").setString(ownsCnt + "&" + needCnt);
                if (ownsCnt < needCnt) {
                    bItemEnough = false;
                }
            }
        }
        return bItemEnough;
    },
    click_btn_help: function () {
        this.setHelpIsShow(true);
    },
    setHelpIsShow: function (isShow) {
        var go = null;
        if (this.pageIndex == 1) {
            go = this["node_" + this.pageIndex].getChildByName("node_max_hide").getChildByName("img_tips_bg");
        } else {
            go = this["node_" + this.pageIndex].getChildByName("img_tips_bg");
        }
        go.stopAllActions()
        if (!isShow) {
            go.setVisible(false);
            return;
        }
        go.setVisible(true);
        go.runAction(cc.Sequence.create(cc.DelayTime.create(4), cc.Hide.create()));
    },
    //点击开启使用结晶能量
    click_img_hook_bg: function () {
        this.setHelpIsShow(false);
        this.is_open_crystal_energy = !this.is_open_crystal_energy;
        this.img_hook.setVisible(this.is_open_crystal_energy);
    },
    //倍率锻造按钮
    click_btn_forged_1: function () {
        this.setHelpIsShow(false);
        if (!this.bItemEnough) {
            var result = this.find("SCLayerMgr").showLayerByName("UIForgedChest", true)
            if (!result) {
                this.dialog(1, wls.Config.getLanguage(800000200));
            }
            return;
        }
        if (!this.bCrystalEnough) {
            this.dialog(1, wls.Config.getLanguage(800000464));
            return;
        }
        //开启能量结晶,但是不够，弹提示框
        if (this.is_open_crystal_energy && !this.bPowerEnough) {
            this.dialog(1, wls.Config.getLanguage(800000202));
            return;
        } else {
            var bRet = this.is_open_crystal_energy;
            bRet = bRet && this.bPowerEnough;
            this.sendMsg("sendForge", bRet);
        }
    },
    onReceive_1: function (resp) {
        if (resp.playerId != this.find("DAPlayer").getPlayerId()) return;
        if (resp.isSuccess) {
            //消耗能量结晶
            var delCrystalPower = this.find("DAPlayer").getPropAmount(11) - resp.newCrystalPower
            this.find("EFItems").updatePropCount(3, null, {
                propId: 11,
                propCount: -delCrystalPower
            })
        }
        //消耗物品
        for (var k in this.ownsCntList) {
            this.ownsCntList[k] = this.ownsCntList[k] - this.needCntList[k];
            this.find("EFItems").updatePropCount(3, null, {
                propId: k,
                propCount: -this.needCntList[k]
            })
        }
        //消耗水晶
        var newGunData = wls.Config.get("cannon", this.find("DAPlayer").getMaxGunRate());
        this.find("EFItems").updatePropCount(3, null, {
            propId: 2,
            propCount: -newGunData.unlock_gem
        })
        //刷新界面
        this.updateView(1);
        //填充回调数值
        this.resultData = resp;
        //播放动画
        this.playTimeLine("forgeding", false);
        this.setAllBtnEnabled(false);
    },
    forged_1_success: function () {
        var self = this;
        self.activeGameObject("UIForgedSuccess").initWithInfo(self.resultData.newGunRate);
        self.find("DAPlayer").setMaxGunRate(self.resultData.newGunRate)
        if (wls.GameState == 2) {
            var cannon = self.find("GOCannon" + FG.SelfViewID);
            cannon.setMaxGunRate(self.resultData.newGunRate);
            cannon.requestNewGunRate(self.resultData.newGunRate)
        }
        self.getScene().addProps([{
            propId: 1,
            propCount: 0
        }])
    },
    forged_1_fail: function () {
        var self = this;
        var str = wls.Config.getLanguage(800000201);
        var curCrystalPower = self.find("DAPlayer").getPropAmount(11);
        var num = String(self.resultData.newCrystalPower - curCrystalPower)
        self.dialog(1, str.replace(/%s/g, num));
        self.getScene().addProps([{
            propId: 11,
            propCount: self.resultData.newCrystalPower - curCrystalPower
        }])
    },
    updateNode_2: function () {
        this.setHelpIsShow(false);
        //7_2;8_2;9_2;10_2;2_100;7_5;8_5;9_5;10_5;2_200
        var itemConfig = [];
        itemConfig[1] = "7;2;8;2;9;2;10;2";
        itemConfig[2] = "7;5;8;5;9;5;10;5";
        var gemConfig = [];
        gemConfig[1] = "2;100";
        gemConfig[2] = "2;200";

        // var config = wls.Config.getConfig("990000136");
        var sep = this.find("DAPlayer").seperateGunType + 1; //默认是0，双重1，三重2
        if (sep >= 1 && sep <= 2) {
            var filename = "forged_pic_scfs" + sep + ".png";
            this.nodeList_2["img_title"].loadTexture(filename, 1);
        } else { //达到最高级，不需要刷新界面
            this.btn_forged_2.setEnabled(false);
            return;
        }
        //刷新物品
        var unlock_item = itemConfig[sep];
        this.bItemEnough = this.updataItems(unlock_item);
        //红宝石
        var gemList = gemConfig[sep].split(";");
        var gem = gemList[1];
        this.nodeList_2["fnt_crystal"].setString(gem);
        var crystalCnt = this.find("DAPlayer").getGem();
        this.bCrystalEnough = crystalCnt >= gem;
    },

    //分身锻造按钮
    click_btn_forged_2: function () {
        this.setHelpIsShow(false);
        if (!this.bItemEnough) {
            var result = this.find("SCLayerMgr").showLayerByName("UIForgedChest", true)
            if (!result) {
                this.dialog(1, wls.Config.getLanguage(800000200));
            }
            return;
        }
        if (!this.bCrystalEnough) {
            this.dialog(1, wls.Config.getLanguage(800000464));
            return;
        }
        //
        this.sendMsg("sendSeperateForge", this.find("DAPlayer").seperateGunType + 1);
    },
    onReceive_2: function (resp) {
        if (resp.playerId != this.find("DAPlayer").getPlayerId()) return;
        cc.log("resp.errorCode==>", resp.errorCode);
        if (resp.errorCode == 0 || resp.errorCode == -4) {
            if(resp.errorCode == 0){
                resp.isSuccess = true;
            }
            if(resp.errorCode == -4){
                resp.isSuccess = false;
            }
            //消耗物品
            for (var k in this.ownsCntList) {
                this.ownsCntList[k] = this.ownsCntList[k] - this.needCntList[k];
                this.find("EFItems").updatePropCount(3, null, {
                    propId: k,
                    propCount: -this.needCntList[k]
                })
            }
            //消耗水晶
            var newGunData = wls.Config.get("cannon", this.find("DAPlayer").getMaxGunRate());
            this.find("EFItems").updatePropCount(3, null, {
                propId: 2,
                propCount: -newGunData.unlock_gem
            })
        } else if (resp.errorCode == -1) {
            this.dialog(1, wls.Config.getLanguage("炮台类型错误"));
            return;
        } else if (resp.errorCode == -2) {
            this.dialog(1, wls.Config.getLanguage("炮台不存在或最大炮倍错误"));
            return;
        } else if (resp.errorCode == -3) {
            this.dialog(1, wls.Config.getLanguage("锻造材料不足"));
            return;
        }
        //刷新界面
        this.updateView(2);
        //填充回调数值
        this.resultData = resp;
        //播放动画
        this.playTimeLine("forgeding", false);
        this.setAllBtnEnabled(false);
    },
    forged_2_success: function () {
        cc.log("forged_2_success");
    },
    forged_2_fail: function () {
        cc.log("forged_2_fail");
    },
    //设置所有按钮禁用
    setAllBtnEnabled: function (bEnabled) {
        this.img_label_1.setTouchEnabled(bEnabled);
        this.img_label_2.setTouchEnabled(bEnabled);
        this.btn_close.setEnabled(bEnabled);
        this.nodeList_1["img_hook_bg"].setTouchEnabled(bEnabled);
        this.nodeList_1["btn_ckxq"].setEnabled(bEnabled);
        this.nodeList_1["btn_help"].setEnabled(bEnabled);
        this.nodeList_1["btn_forged_1"].setEnabled(bEnabled);

        this.nodeList_2["btn_help"].setEnabled(bEnabled);
        this.nodeList_2["btn_forged_2"].setEnabled(bEnabled);
    },
    click_btn_ckxq: function () {
        this.setHelpIsShow(false);
        this.pushView("UIForgedDetail");
    },
    click_btn_close: function () {
        this.setVisible(false);
    },
});

// 锻造界面查看详情
wls.namespace.UIForgedDetail = ccui.Layout.extend({
    getZorder: function () {
        return wls.ZOrder.Pop + 1
    },
    onCreate: function () {
        wls.CreateMask(this);
        var ccnode = wls.LoadStudioNode(this.fullPath("hall/uiforged_detail.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        var gunData = this.find("DAPlayer").getVipMaxGunOutLook();
        this.filename = this.fullPath("battle/cannon/" + gunData.cannon_img)
        this.items = {};
        // this.initScrollView();

        //初始化配置表
        this.configs = [];
        var self = this;
        var maxGunRate = this.find("DAPlayer").getMaxGunRate();
        wls.Config.ForEachNew("cannon", function (val) {
            if (val.times > maxGunRate) {
                self.configs.push(val);
            }
        })
        this.configs.sort(function (a, b) {
            return a.times - b.times;
        })
        var cell_h_count = 4.2 // 格子横向数
        var cell_v_count = 1 // 格子纵向数
        var cellCountSize = this.scroll_list.getContentSize()
        // 计算出每个格子的宽高
        this.cellW = cellCountSize.width / cell_h_count
        this.cellH = cellCountSize.height / cell_v_count
        this.scroll_list.setInnerContainerSize(cc.size(this.cellW * this.configs.length + 10, this.cellH));
        this.index = 0;
        this.img_bg_demo.setVisible(false);
        this.scheduleUpdate();
    },
    onActive:function(){
        this.scroll_list.jumpToLeft();
    },
    update: function (dt) {
        var config = this.configs[this.index];
        var item = this.img_bg_demo.clone();
        item.setVisible(true);
        wls.BindUI(item, item);
        item.img_gun.loadTexture(this.filename, 1);
        item.fnt_times.setString(config.times);
        item.fnt_num.setString(config.fishticket_drop);
        item.setPosition(this.cellW / 2 + this.cellW * this.index, this.cellH / 2);
        this.scroll_list.addChild(item);
        this.items[config.type] = item;
        this.index += 1;
        if (this.index >= this.configs.length) {
            this.unscheduleUpdate();
        }
    },
    click_btn_close: function () {
        this.setVisible(false);
    }
});

// 锻造成功界面
wls.namespace.UIForgedSuccess = ccui.Layout.extend({
    getZorder: function () {
        return wls.ZOrder.Pop + 1
    },
    onCreate: function () {
        wls.CreateMask(this);
        var ccnode = wls.LoadStudioNode(this.fullPath("hall/uiforged_success.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
    },

    initWithInfo: function (newGunRate) {
        this.fnt_gun_times_1.setString(newGunRate);
        this.fnt_gun_times_2.setString(newGunRate);
        this.inner_action.play("show", false);
        this.spr_light.runAction(cc.RepeatForever.create(cc.RotateBy.create(5, 360)));
    },

    click_btn_sure: function () {
        this.setVisible(false);
    },
});