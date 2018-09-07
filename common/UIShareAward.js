// boss, 获得鱼券 分享
wls.namespace.UIShareAward = cc.Node.extend
({
    getZorder:function () {
        return wls.ZOrder.Box+10
    },
    onCreate: function()
    {
        wls.CreateMask(this);
        var ccnode = wls.LoadStudioNode(this.fullPath("battle/share/uishareaward.json"), this);
        this.addChild(ccnode);
        ccnode.setPosition(display.width / 2, display.height / 2);

        this.btn_share_circle.setVisible(false)
        this.btn_share_friend.setPositionX(0)
        

    },

    onActive: function(shareType,showData)
    {
        this.initPlayerInfo()
        this.initAward(showData.propId,showData.propCount)
        this.capture()
    },

    initPlayerInfo: function()
    {
        this.txt_name.setString(this.find("DAPlayer").nickname)
        //this.txt_name.ignoreContentAdaptWithSize(true)
        this.txt_time.setString(wls.GetCurTimeData().toLocaleDateString())
        //this.txt_time.ignoreContentAdaptWithSize(true)
        
        //头像
        var self = this
        var size = self.img_head.getContentSize()
        var info = GameApp.GetHallManager().GetUserInfo();
        cc.log("initPlayerInfo   filePath=")
        var fun = function(filePath) {
            cc.log("DownloadPic   filePath=")
            cc.log(filePath)
            var photo = ccui.ImageView.create()
            photo.loadTexture(filePath,1)
            photo.setContentSize(cc.size(size.width, size.width))
            photo.setPosition(cc.p(self.img_head.getPositionX(),self.img_head.getPositionY()))
            photo.setScale(self.img_head.getScale())
            self.node_playerinfo.addChild(photo)
            size = cc.size(size.width*self.img_head.getScaleX(),size.height*self.img_head.getScaleY())
            photo.setScale(size.width / photo.getContentSize().width)
        }
        wls.DownloadPic(info.avatarpath||"",fun)
        
    },

    initAward: function(propId,propCount)
    {
        this.spr_prop.setSpriteFrame(this.fullPath("battle/images/share/bl_share_prop_"+wls.strFormat(propId,3)+".png"));
        this.fnt_prop_count.setString(propId == 12?(propCount/100 + "y"):propCount)
        this.spr_cell.setVisible(propId == 12)
        var allWidth = this.fnt_prop_count.getContentSize().width*this.fnt_prop_count.getScaleX()
        allWidth = allWidth + (this.spr_cell.isVisible()?this.spr_cell.getContentSize().width:0)
        this.fnt_prop_count.setPositionX(-allWidth/2 +this.fnt_prop_count.getContentSize().width/2*this.fnt_prop_count.getScaleX() )
        this.spr_cell.setPositionX(this.fnt_prop_count.getPositionX() + this.fnt_prop_count.getContentSize().width/2*this.fnt_prop_count.getScaleX())
    },

    capture: function()
    {
        var imgPath = CacheHelper.getOneDayCacheFolder() + "honor_rank_share.jpg"
        log(imgPath)
        if (FileUtils.isFileExist(imgPath))
        {
            FileUtils.removeFile(imgPath)
        }
        // //var size = this.img_bg.getContentSize()
        // //var view = HonorShareView.create(this._selfRankData, this._userInfo.prestige)
        // var rtx = cc.RenderTexture.create(1136, 640, 0x2, 0x88f0)
        // //var rtx = cc.RenderTexture.create(size.width, size.height, 0x2, 0x88f0)
        // rtx.begin()
        // cc.director.getRunningScene().visit();
        // rtx.end()
        // rtx.saveToFile(imgPath, cc.IMAGE_FORMAT_JPEG, false)
        // this._shareImg = imgPath
        // var photo = ccui.ImageView.create()
        // photo.loadTexture(imgPath,1)
        // photo.setScale(0.5)
        // this.addChild(photo,10000)


    },

    click_btn_close: function()
    {
        this.removeFromScene()
    },

    click_btn_share_friend: function()
    {
        var shareInfo = wls.GetShareInfo() || {}
        ShareHelper.doShare({text:shareInfo.text}, function(res) {
            if (res.errMsg == "shareAppMessage:ok") {
                //成功
            }
        }.bind(this))
    },

    click_btn_share_circle: function()
    {
        var shareInfo = wls.GetShareInfo() || {}
        ShareHelper.doShare({text:shareInfo.text}, function(res) {
            if (res.errMsg == "shareAppMessage:ok") {
                //成功
            }
        }.bind(this))
    },
});