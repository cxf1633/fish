// 大厅玩家信息栏
wls.namespace.UIPlayerInfoPanel = ccui.Layout.extend
({
    getZorder:function () {
        return wls.ZOrder.Pop
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadPopupView(this.fullPath("hall/player_info_panel.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);
        this.initUI()
        var scale = wls.AdaptationWeChat(this.btn_close,this)
        ccnode.setScale(ccnode.getScale()*scale)
        this.adaptClose(this.btn_close)
    },

    onActive: function()
    {
        this.showUI();
    },

    initUI: function()
    {
        if(wls.IsMiniProgrom())
        {
            this.image_all_bg.setContentSize(cc.size(this.image_all_bg.getContentSize().width, 400))
            var imageAllBgSize = this.image_all_bg.getContentSize()
            this.com_title_bg.setPositionY(imageAllBgSize.height)
            this.img_head_bg.setScale(0.8)

            this.btn_modify_pwd.setVisible(false)
            this.btn_set_name.setVisible(false)
            this.node_account.setVisible(false)

            this.node_name.setPositionY(imageAllBgSize.height/2*0.6)
            this.node_grade.setPositionY(imageAllBgSize.height/2*0.2)
            this.node_id.setPositionY(-imageAllBgSize.height/2*0.2)
            this.node_coin.setPositionY(-imageAllBgSize.height/2*0.6)
            this.node_crystal.setPositionY(-imageAllBgSize.height/2*0.6)
            this.fnt_vip.setPositionY(-imageAllBgSize.height/2*0.25)

            this.text_name.setContentSize(cc.size(300, this.text_name.getContentSize().height))
            this.text_id.setContentSize(cc.size(300, this.text_id.getContentSize().height))
        }
    },

    showUI: function()
    {
        var go = this.find("DAPlayer");
        this.text_account.setString(go.getAccountName());
        this.text_id.setString(go.getPlayerId());
        var name = go.getNickname()
        this.text_name.setString(name);
        this.text_coin.setString(go.getMoney());
        this.text_crystal.setString(go.getGem());
        var mValues = go.getLevelData();
        this.text_grade.setString("LV"+mValues.level+"("+mValues.curExp+"/"+mValues.needExp+")");
        this.fnt_vip.setString(go.getVipLevel())

        var width = this.text_name.getContentSize().width
        if (width > 140) {
            //截掉
            var totalWidth = 0
            var newName = ""
            for (var key = 0; key < name.length && totalWidth < 140; key++) {
                newName += name[key]
                if (/^[\x41-\x5a]/.test(name[key])) {
                    totalWidth += this.text_name.getFontSize()*0.75
                    continue
                } else if (/^[\x00-\xff]/.test(name[key])) {
                    totalWidth += this.text_name.getFontSize()/2
                    continue
                } else {
                    totalWidth += this.text_name.getFontSize()
                }
                
            }
            this.text_name.setString(newName+"..")
        }

        var self = this;
        var headUrl = hallmanager.GetUserInfo().avatarpath
        if(headUrl == "") { return }
        wls.DownloadPic(headUrl, function(filePath){
            cc.log("download head success:"+filePath)
            self.setPlayerHead(filePath)
        }.bind(this))
    },

    setPlayerHead: function(path) {
        this.img_photo.loadTexture(path)
    },

    click_btn_copy: function()
    {
        var text = this.text_id.getString();
        if(wls.IsMiniProgrom())
        {
            GiftDateLogic.createWeiXinCopy(text)
        }
    },

    click_btn_close: function()
    {
        this.setVisible(false);
    },

});
