// 引导
wls.namespace.UIGreenHand = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.GreenHand
    },
    onCreate: function(bEnable)
    {
        this.bEnable = bEnable;
        this.initStencil()
        this.initUI()
        this.initData()
        this.hideAllUI()
        this.reset()
    },

    initData: function () {
        this.GREEN_LIST = {
            iFirstUpGun    : {FUN: "iFirstUpGun",ORDER    : 2},//解锁炮倍
            iFirstLimitGun : {FUN: "iFirstLimitGun",ORDER : 5},//体验限时炮台
            iFirstGetProp18: {FUN: "iFirstGetProp18",ORDER: 10},//新手鱼券获得打开兑换商店
        }
        




    },

    initStencil: function(shareType,showData)
    {
        //挖空
        var stencil = new cc.LayerColor(cc.color(0, 0, 0, 100))
        stencil.ignoreAnchorPointForPosition(false)
        stencil.setAnchorPoint(cc.p(0.5,0.5))
        this.stencil = stencil

        var clip = cc.ClippingNode.create() 
        clip.setStencil(stencil)
        clip.setInverted(true)
        clip.setAlphaThreshold(1) 
        this.addChild(clip, -1)
        this.clip = clip

        //半透明遮罩
        var mask = ccui.Layout.create()
        clip.addChild(mask)
        mask.setContentSize(display.width, display.height)
        mask.setBackGroundColor(cc.c3b(0, 0, 0))
        mask.setBackGroundColorOpacity(128)
        mask.setBackGroundColorType(1)
        this.clip.setVisible(false)
        this.mask = mask

        //触摸
        var self = this
        var touchEvent = function (sender, type) {
            switch (type) 
            {
                case ccui.Widget.TOUCH_BEGAN:
                    self.onTouchBegan(sender.getTouchBeganPosition())
                    break
                case ccui.Widget.TOUCH_MOVED:
                    self.onTouchMoved(sender.getTouchBeganPosition())
                    break
                case ccui.Widget.TOUCH_ENDED:
                case ccui.Widget.TOUCH_CANCELED:
                    break
            }
        }
        var layout = new ccui.Layout();
        this.addChild(layout,1);
        layout.setContentSize(display.width, display.height);
        layout.setTouchEnabled(true);
        layout.addTouchEventListener(touchEvent, this);
        this.panel_touch = layout

    },

    initUI: function () {
        //手指
        var finger = wls.LoadPopupView(this.fullPath("common/ui/uiguideeffect.json"));
        finger.runAction(finger.inner_action)
        this.addChild(finger,10);
        this.finger = finger
        this.finger.setPosition(display.width/2,display.height/2)
        this.finger.inner_action.play("guide",true)
        
        //中文提示
        var notice = wls.LoadPopupView(this.fullPath("common/ui/uiguideword.json"));
        this.addChild(notice,9);
        wls.BindUI(notice,notice)
        this.notice = notice
        this.notice.setPosition(display.width/2,display.height/2)

    },

    setStencilShow: function(pos,size,anPoint,fingerPos)
    {
        this.aimPos = fingerPos || pos
        this.stencil.setAnchorPoint(anPoint||cc.p(0.5,0.5))
        this.clip.setVisible(true)
        this.panel_touch.setVisible(true)
        this.stencil.setVisible(true)
        this.mask.setVisible(true)
        this.stencil.setContentSize(size)
        this.stencil.setPosition(pos)
        this.setFingerAct(fingerPos || pos)
        var newOrd = this.getLocalZOrder()+1
        newOrd > wls.ZOrder.GreenHand + 5? newOrd = wls.ZOrder.GreenHand:0
        this.setLocalZOrder(newOrd);
    },

    setFingerAct: function(curPos)
    {
        if (this.aimPos == null||this.aimPos.x < 0||this.aimPos.y < 0 ) {
            this.finger.setVisible(false)
            return
        }
        this.finger.setVisible(true)
        var self = this
        var act = cc.Sequence.create(cc.MoveTo.create(1,this.aimPos),cc.CallFunc.create(function () {
            self.finger.inner_action.play("guide",true)
        }))
        act.setTag(101)
        this.finger.setPosition(curPos)
        this.finger.stopActionByTag(101)
        this.finger.runAction(act)
        this.finger.inner_action.play("finger",false)
    },

    setTouchFun: function(fun)
    {
        this.touchFun = fun
    },

    hideAllUI: function()
    {
        this.clip.setVisible(false)
        this.finger.setVisible(false)
        this.finger.stopActionByTag(101)
        this.panel_touch.setVisible(false)
        this.stencil.setVisible(false)
        this.mask.setVisible(false)
        this.notice.setVisible(false)
    },

    onTouchBegan: function(pos)
    {
        var size = this.stencil.getContentSize()
        if (cc.rectContainsPoint(cc.rect(0,0,size.width,size.height), this.stencil.convertToNodeSpace(pos))){
            if ( this.touchFun != null) {
                this.touchFun() 
                this.touchFun = null
                this.stencil.setContentSize(cc.size(0,0))
            }
            return 
        }
        this.setFingerAct(pos)
    },

    onTouchMoved: function(pos)
    {

        
    },

    //清除数据
    reset: function () {
        this.aimPos = null 
        this.playIdx = 0
        this.isRunning = false
        this.waitName = ""
        this.runGreen = null 
        this.showData = null
        this.touchFun = null 
    },

    startGreen: function () {
        this.playIdx = 0
        var self = this
        this.isRunning = false
        var seq = cc.Sequence.create(cc.CallFunc.create(function () {
            self.checkPlayNexFun()
        }),cc.DelayTime.create(0.4))
        this.runAction(cc.RepeatForever.create(seq))
    },
    stopGreen: function () {
        //清除数据
        this.reset()

        //清除ui
        this.hideAllUI()

        this.stopAllActions()
    },

    checkPlayNexFun: function () {
        if (this.isRunning) {return}
        var fun = this.funList[this.playIdx]
        if (fun) {
            this.touchFun = null
            fun()
            this.isRunning = true 
        } else {
            this.stopGreen()
        }
    },

    playNextAct: function (keyName) {
        if (!this.isRunning) { return }
        if (keyName != this.waitName) {return}
        this.playIdx = this.playIdx + 1
        this.isRunning = false
        // this.checkPlayNexFun()
    },

    trigger: function (keyName,data) {
        if (!this.bEnable) return;
        var greenData = this.GREEN_LIST[keyName]
        if (greenData == null) {return}
        if (this.runGreen != null && this.runGreen.ORDER > greenData.ORDER ) {
            return
        }
        this.stopGreen()
        this.runGreen = greenData
        this.showData = data
        this.find("SCLayerMgr").hideAllLayer()
        if (this[greenData.FUN]) {this[greenData.FUN]()}
        
    },




    //引导解锁炮倍
    iFirstUpGun: function () {
        var self = this 
        var fun_1 = function () {
            self.waitName = "openUpGunList"
            var node = self.find("WNGunUpgrade")
            var go = node.img_bg_1
            var pos = wls.getWordPosByNode(go)
            var scale = node.newScale || node.getScale()
            var goSize = go.getContentSize()
            var size  = cc.size(goSize.width*scale,(goSize.height+10)*scale)
            var anPoint = go.getAnchorPoint()
            self.setStencilShow(pos,size,anPoint)
            self.setTouchFun(function () {
                node.click_img_bg_1()
            })
        }

        var fun_2 = function () {
            self.waitName = "clickUpGun"
            var node = self.find("UIUnlockCannon")
            var go = node.node_items[2].btn_lock
            var pos = wls.getWordPosByNode(go)
            var scale = node.newScale || node.getScale()
            var goSize = go.getContentSize()
            var size  = cc.size((goSize.width + 10)*scale,(goSize.height + 10)*scale)
            self.setStencilShow(pos,size)
            self.setTouchFun(function () {
                node.click_btn_lock()
            })
        }
        var fun_3 = function () {
            self.waitName = "showUpGunWord"
            self.notice.setVisible(true)
            //self.notice.txt_notice.setString(wls.Config.getLanguage())
            self.notice.txt_notice.setString("恭喜成功解锁炮台！\n炮台倍数越高，击杀鱼获得鱼币越多哦！")
            self.setStencilShow(cc.p(display.width/2,display.height/2),cc.size(display.width,display.height),null,cc.p(-1000,-1000))
            self.setTouchFun(function () {
                self.playNextAct("showUpGunWord")
            })
        }

        this.funList = []
        this.funList.push(fun_1)
        this.funList.push(fun_2)
        this.funList.push(fun_3)
        this.startGreen()
    },

    //引导使用限时炮台
    iFirstLimitGun: function () {
        var self = this 
        var fun_1 = function () { //等待道具飞行结束
            self.waitName = "prop_fly_end"
            var node = self.find("WNNewBieTask")
            self.setStencilShow(cc.p(display.width/2,display.height/2),cc.size(0,0),null,cc.p(-1000,-1000))
            wls.CallAfter(node,3,function () {
                self.playNextAct("prop_fly_end")
            })
        }

        var fun_2 = function () {
            self.waitName = "GunMenuOpen"
            var node = self.find("WNSelfCannonMenu")
            var pos = wls.getWordPosByNode(node)
            var scale = node.newScale || node.getScale()
            var size  = cc.size(150*scale,100*scale)
            self.setStencilShow(pos,size)
            self.setTouchFun(function () {
                node.open()
                wls.CallAfter(node,0.1,function () {
                    self.find("UIGreenHand").playNextAct("GunMenuOpen")
                })
            })
        }
        var fun_3 = function () {
            self.waitName = "clickChangeLayer"
            var item = wls.Config.getItemData(self.showData.propId)
            self.showData.gunType = item.use_outlook
            var node = self.find("WNSelfCannonMenu")
            var go = node.btn_changecannon
            var goSize = go.getContentSize()
            var pos = wls.getWordPosByNode(go)
            var scale = node.newScale || node.getScale()
            var size  = cc.size(goSize.width*scale,goSize.height*scale)
            self.setStencilShow(pos,size)
            self.setTouchFun(function () {
                node.click_btn_changecannon()
                self.find("UIChangeGun").jumpByGunType(self.showData.gunType)
                self.find("UIGreenHand").playNextAct("clickChangeLayer")
            })
        }
        var fun_4 = function () {
            self.waitName = "clickChangeGun"
            var node = self.find("UIChangeGun")
            var go = node.items[self.showData.gunType].btn_taste
            var clickFun = function () {
                node.click_btn_taste(go)
            }
            if (!go.isVisible()) {
                go = node.items[self.showData.gunType].btn_use
                clickFun = function () {
                    node.click_btn_use(go)
                }
            }
            var pos = wls.getWordPosByNode(go)
            var scale = node.newScale || node.getScale()
            var goSize = go.getContentSize()
            var size  = cc.size((goSize.width)*scale,(goSize.height)*scale)
            self.setStencilShow(pos,size)
            self.setTouchFun(function () {
                clickFun()
                self.find("UIGreenHand").playNextAct("clickChangeGun")
            })
        }

        this.funList = []
        this.funList.push(fun_1)
        this.funList.push(fun_2)
        this.funList.push(fun_3)
        this.funList.push(fun_4)
        this.startGreen()
    },

    //引导打开兑换商城
    iFirstGetProp18: function () {
        var self = this 
        var fun_1 = function () {//飞行到中间
            self.waitName = "fishCard_fly_end"
            var fun = function () {
                self.find("UIGreenHand").playNextAct("fishCard_fly_end")
                self.checkPlayNexFun()
            }
            var flyData = {
                viewid     : FG.SelfViewID,
                propData   : self.showData,
                firstPos   : self.showData.firstPos,
                endPos     : cc.p(display.width/2,display.height/2),
                maxScale   : 1,
                refreshType: 0,
                zorder     : wls.ZOrder.GreenHand+10,
                callFun    : fun,
                endScale   : 1.2,
            }
            var actTime = self.find("EFItems").play(flyData);
            self.setStencilShow(cc.p(display.width/2,display.height/2),cc.size(0,0),null,cc.p(-1000,-1000))
        }

        var fun_2 = function () {//点击打开
            self.waitName = "clickOpenFishCardShop"
            var fishcardaward = wls.LoadPopupView(self.fullPath("common/ui/uifishcardaward.json"));
            self.addChild(fishcardaward,3);
            wls.BindUI(fishcardaward,fishcardaward)
            fishcardaward.setPosition(display.width/2,display.height/2)
            fishcardaward.spr_light.runAction(cc.repeatForever(cc.rotateBy(1, 60)));
            fishcardaward.setScale(wls.MinScale)

            var str = wls.Config.getLanguage(800000075)+wls.Config.getItemData(self.showData.propId).name +"*"+ self.showData.propCount
            fishcardaward.txt_word.setString(str)

            var go = fishcardaward.btn_open
            var pos = wls.getWordPosByNode(go)
            self.setStencilShow(cc.p(display.width/2,display.height/2),cc.size(0,0),null,pos)
            fishcardaward.click_btn_open = function () {
                self.find("UIGreenHand").playNextAct("clickOpenFishCardShop")
                fishcardaward.removeFromParent()
                self.pushView("UIGiftShop")
            }
            wls.OnClicked(go,fishcardaward,"btn_open")
        }

        this.funList = []
        this.funList.push(fun_1)
        this.funList.push(fun_2)
        this.startGreen()
    },


});