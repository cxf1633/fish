// 测试界面
wls.namespace.UITestPanel = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Test
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadStudioNode(this.fullPath("battle/TestPanel.json"), this);
        this.addChild(ccnode);

        this.listenKeyEvent();
        this.createSecretLayer();

        this.Panel_2.setVisible(false);

        this.setVisible(false);
        this.startTimer("updateFrame", 0.00, 2, -1);
        this.initSwitchPanel();

        this.btn_reload.x = this.btn_reload.x - 550
        this.btn_show_frame.x = this.btn_show_frame.x - 550
        this.btn_close.x = this.btn_close.x - 550
        this.btn_publish.x = this.btn_publish.x - 550
        this.btn_secrect.x = this.btn_secrect.x - 550
        this.btn_publish.setTitleText("显示MainPanel");
        this.btn_reload.setTitleText("子结点显示开关");
    },

    initSwitchPanel: function()
    {
        var node = cc.Node.create()
        node.setVisible(false);
        this.display_node = node;
        this.Node_Btn.addChild(node);
        var sx = 380;
        var sy = 600;
        var ccnode = this.find("UIMainPanel").ccnode;
        var list = []
        for (var i = 0; i < ccnode.childrenCount; i++)
        {
            var obj = ccnode.children[i];
            if (obj._goName)
            {
                var unit = {}
                unit.name = obj._goName;
                unit.node = obj;
                list.push(unit);
            }
        }
        var t = {}
        t.name = "GOCannon";
        t.node = this.find("UIMainPanel").Node_Cannon;
        list.push(t);

        var x = sx;
        var idx = 0
        for (var i = 0; i < list.length; i++)
        {
            var unit = list[i];
            var btn = new ccui.Button();
            //var btn = this.btn_publish.clone();
            btn.bindNode = unit.node;
            btn.setTitleText(unit.name);
            btn.setTitleFontSize(16);
            //btn.setTitleFontColor(cc.c3b(255, 255, 255));
            btn.setTag(2);
            btn.setPosition(x, sy);
            node.addChild(btn);
            x = x + 200
            idx++;
            if (idx == 4)
            {
                idx = 0
                x = sx;
                sy = sy - 80;
            }
            btn.addTouchEventListener(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED)
                {
                    var bool = !sender.bindNode.isVisible();
                    sender.bindNode.setVisible(bool);
                }
            });
        }
        
    },

    updateFrame: function()
    {
        var go = this.find("SCGameLoop")
        this.Text_ServerFrame.setString(go.mServerFrame)
        this.Text_ClientFrame.setString(go.mClientFrame)
        this.Text_Timeline.setString(cc.g_NumberOfDraws)
    },

    listenKeyEvent: function()
    {
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event)
            {
                if (keyCode == 84) //按键T
                {
                    /*self.Node_Btn.setVisible(!self.Node_Btn.isVisible());
                    if (!self.Node_Btn.isVisible()) 
                    {
                        self.secretLayer.setVisible(false);
                    }*/
                    self.setVisible(!self.isVisible());
                }
            }.bind(self),
        }, self);
    },

    click_btn_show_frame: function()
    {
        var bool = !this.Panel_2.isVisible();
        this.Panel_2.setVisible(bool);
        cc.director.setDisplayStats(bool);
    },

    click_btn_reload: function()
    {
        this.display_node.setVisible(!this.display_node.isVisible());
    },

    click_btn_publish: function()
    {
        var b = this.find("UIMainPanel").isVisible();
        this.find("UIMainPanel").setVisible(!b);
    },

    click_btn_secrect: function()
    {
        cc.log("click_btn_secrect");
        this.secretLayer.setVisible(!this.secretLayer.isVisible());
    },

    //秘籍面板
    createSecretLayer: function()
    {
        var inputLayer = new ccui.Layout();
        inputLayer.setAnchorPoint(cc.p(0.5, 0.5));
        inputLayer.setPosition(cc.p(display.width / 2 - 200, display.height / 2));
        inputLayer.setContentSize(cc.size(200, 200));
        inputLayer.setBackGroundColorType(1);
        inputLayer.setBackGroundColor(cc.c3b(0, 0, 0));
        this.addChild(inputLayer, 1888);
        this.secretLayer = inputLayer;
        this.secretLayer.setVisible(false);

        var propNumEdit = EditBox.create(cc.size(150 , 40))
        .addToEx(inputLayer)
        .move(inputLayer.getContentSize().width/2, inputLayer.getContentSize().height*0.4)
        .setPlaceHolder("NUMBER")
        .setPlaceholderFontSize(20)
        .setFontSize(25)
        .setFontColor(cc.c3b(146, 62, 13))
        .setPlaceholderFontColor(cc.c3b(146, 100, 100))
        .setPlaceholderFontSize(20)
        .setInputMode(cc.EDITBOX_INPUT_MODE_EMAILADDR)
        .setInputFlag(cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_ALL_CHARACTERS)
        .setMaxLength(16)
        .setString("10000")


        var propIdEdit = EditBox.create(cc.size(150 , 40))
        .addToEx(inputLayer)
        .move(inputLayer.getContentSize().width/2, inputLayer.getContentSize().height*0.6)
        .setPlaceHolder("ID")
        .setPlaceholderFontSize(20)
        .setFontSize(25)
        .setFontColor(cc.c3b(146, 62, 13))
        .setPlaceholderFontColor(cc.c3b(146, 100, 100))
        .setPlaceholderFontSize(20)
        .setInputMode(cc.EDITBOX_INPUT_MODE_EMAILADDR)
        .setInputFlag(cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_ALL_CHARACTERS)
        .setMaxLength(16)
        .setString("1")

        var self = this
        var sendSecretMessage = function(pSender, eventName)
        { 
            if (eventName == ccui.Widget.TOUCH_ENDED) 
            {
                var num = parseInt(propNumEdit.getString());
                var id = parseInt(propIdEdit.getString());
                var data = {};
                data.newProps = [];
                var prop = {};
                prop.propId = id;
                prop.propCount = num;
                data.newProps.push(prop);
                FG.SendMsg("sendAddMoney", data);
                self.getScene().doReChargeSucceed()
            }
        };

        var addBt = new ccui.Button();
        addBt.setTitleText("add");
        addBt.setTitleFontSize(30);
        addBt.setTag(2);
        addBt.setPosition(cc.p(inputLayer.getContentSize().width/2, inputLayer.getContentSize().height*0.2));
        addBt.addTouchEventListener(sendSecretMessage);
        inputLayer.addChild(addBt);
    },

    click_btn_close: function()
    {
        this.setVisible(false);
    },
});
