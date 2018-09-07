"use strict";
//-----------------------------------------------------
// 分段符
//-----------------------------------------------------

// 核心
window.wls =
{
    init: function()
    {
        this.warn("初始化wls");
        this.PreUrl = ""; // 工作区前缀
        if (window.wx) this.PreUrl = window.wx.env.USER_DATA_PATH + "/";
        this.rpd = 180 / Math.PI;
        this.dpr = Math.PI / 180;
        this.bInitJmsg = false;
        this.bInitConfig = false;
        this.serverTimeDis = 0;
        this.Modules = {}
        this.InitSwitchs();
        this.ISFIRST_IN = true //是否今天第一次登录
        this.Switchs = {}
        this.LoginType = 0 //0登录进入 1.大厅本地刷新  2.游戏退出
        this.GameState = 1 //0登录 1.大厅  2.游戏内
        this.CostType = 0 //0.花费鱼币 1.花费子弹  2.花费子弹和鱼币
        this.rechargeId = 0 //充值id
        this.ZOrder =
        {
            Normal     : 0,     // 正常
            limitPop   : 10,    // boss来临等临时ui
            Pop        : 30,    // 弹窗
            Award      : 50,    // 奖励弹框
            Box        : 60,    // 礼包弹窗
            GreenHand  : 110,   // 引导
            Toast      : 180,   // 吐司
            Loading    : 200,   // 加载界面
            Dialog     : 250,   // 对话框
            Exit_Dialog: 300,   // 退出框
            Test       : 1000,  // 测试面板
        }
    },

    CheckPath: function(a)
    {
        if (this.IsMiniProgrom())
        {
            return this.PreUrl + a;
        }
        else
        {
            return a;
        }
    },

    // 初始化捕鱼游戏开关
    InitSwitchs: function()
    {
        this.Switchs = {};
        this.Switchs.oneYuanChest = true;

    },

    CreateMask: function(target, opacity, block)
    {
        if (opacity == null) { opacity = 168; }
        if (block == null) { block = true; }
        var mask = ccui.Layout.create()
        target.addChild(mask, -100)
        mask.setContentSize(display.width, display.height)
        mask.setBackGroundColor(cc.c3b(0, 0, 0))
        mask.setBackGroundColorOpacity(opacity)
        mask.setBackGroundColorType(1)
        mask.setTouchEnabled(block);
        return mask
    },

    // 加载studio工程文件
    LoadStudioNode: function(filename, target)
    {
        var ret = ccs.load(this.PreUrl + filename, this.PreUrl);
        var ccnode = ret.node
        if (target)
        {
            target.newScale = 1
            this.BindUI(ccnode, target);
            if (ret.action)
            {
                target.inner_action = ret.action;
                ccnode.runAction(ret.action);
            }
        }
        if (ret.action) { ccnode.inner_action = ret.action; } 
        return ccnode;
    },

    // 加载弹窗界面
    LoadPopupView: function(filename, target)
    {
        var ccnode = this.LoadStudioNode(filename, target);
        ccnode.setScale(wls.MinScale);
        if (target) { target.newScale = wls.MinScale }
        return ccnode
    },

    //适配微信 关闭按键
    AdaptationWeChat: function(btn,target)
    {
        return 1
        var topPos = cc.p(display.width - 292,display.height - 160)
        var curPos = wls.getWordPosByNode(btn)
        var size = btn.getContentSize()
        var scaleX = 1
        var scaleY = 1
        var newScale = 1
        if (curPos.x + size.width/2 >topPos.x) {
            scaleX = (topPos.x  - size.width/2)/curPos.x
        }
        if (curPos.y + size.height/2 > topPos.y ) {
            scaleY = (topPos.y  - size.height/2)/curPos.y
        }
        if (scaleY < 1 && scaleX < 1) {
            newScale = scaleX > scaleY ? scaleX:scaleY
        }
        target.newScale = target.newScale*newScale
        return newScale
    },

    // 加载studio工程文件
    LoadStudioLayout: function(filename, target)
    {
        var ccnode = this.LoadStudioNode(filename, target);
        var layout = ccui.Layout.create();
        var list = [];
        for (var i = 0; i < ccnode.childrenCount; i++)
        {
            list.push(ccnode.children[i]);
        }
        for (var i = 0; i < list.length; i++)
        {
            var obj = list[i];
            obj.retain();
            obj.removeFromParent(false);
            layout.addChild(obj);
            obj.release();
        }
        return layout;
    },

    // 绑定结点
    BindUI: function(node, target)
    {
        for (var i = 0; i < node.childrenCount; i++)
        {
            var obj = node.children[i];
            var name = obj.getName();
            if (obj._className == "Button")
            {
                this.BindBtnEvent(obj, name, target);
            }
            if (obj.childrenCount > 0)
            {
                this.BindUI(obj, target);
            }
            target[name] = obj;
        }
    },

    // 绑定按扭事件
    BindBtnEvent: function(btn, name, target)
    {
        btn.addTouchEventListener(function(sender, type) {
            if (type == ccui.Widget.TOUCH_ENDED)
            {
                var callbackName = "click_" + name;
                var s = target.find ? target.find("SCSound") : null;
                if (target[callbackName])
                {
                    target[callbackName]();
                    if (s) s.playBtnEffect(btn.__soundName, name);
                }
                else
                {
                    cc.log(target._goName, "no function " + callbackName);
                }
            }
        }, target);
    },

    OnClicked: function(btn, target, name)
    {
        if (name == null)
        {
            name = btn.getName();
        }
        btn.addTouchEventListener(function(sender, type) {
            if (type == ccui.Widget.TOUCH_ENDED)
            {
                var callbackName = "click_" + name;
                var s = target.find ? target.find("SCSound") : null;
                if (target[callbackName])
                {
                    target[callbackName](btn);
                    if (s) s.playBtnEffect(btn.__soundName, name);
                }
                else
                {
                    cc.log(target._goName, "no function " + callbackName);
                }
            }
        }, target);
    },

    CallAfter: function(node, interval, name, args)
    {
        var callback = function()
        {
            if (typeof name == "function")
            {
                name(args);
                return;
            }
            if (node[name]) { node[name](args);}
        }
        var c1 = cc.delayTime(interval);
        var c2 = cc.callFunc(callback);
        var act = new cc.Sequence(c1, c2);
        node.runAction(act);
    },
    
    // 循环调用
    CallLoop: function(node, interval, tag, func)
    {
        var callback = function()
        {
            func();
        }
        var c1 = cc.delayTime(interval);
        var c2 = cc.callFunc(callback);
        var act = cc.repeatForever(cc.sequence(c1, c2));
        act.setTag(tag);
        node.runAction(act);
    },

    // 打印结点
    log: function(node)
    {
        cc.each(node, function(val, i){   
            cc.log(i, "=", val);
        });   
    },

    warn: function(str)
    {
        cc.log("++++++++++++++++++++++++++++++");
        cc.log(str);
        cc.log("++++++++++++++++++++++++++++++");
    },

    CreateAnimation: function(strFormat, inteval)
    {
        var animation = new cc.Animation();
        var i = 0;
        while (true)
        {
            var frameName = strFormat + "_" + ((i < 10) ? ("0" + i) : i) + ".png";
            var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameName)
            if (spriteFrame == null) break;
            animation.addSpriteFrame(spriteFrame);
            i = i + 1;
        }
        animation.setDelayPerUnit(inteval);
        return animation;
    },
    
    CreateDisorderAni: function(strFormat, inteval,firstIdx,endIdx,startIdx)
    {
        var animation = new cc.Animation();
        for (var i = firstIdx; i <= endIdx; i++) {
            var idx = i + startIdx
            if (idx > endIdx) {
                idx = idx - endIdx -1
            }
            var frameName = strFormat + "_" + ((idx < 10) ? ("0" + idx) : idx) + ".png";
            var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameName)
            if (spriteFrame == null) break;
            animation.addSpriteFrame(spriteFrame);
        }
        animation.setDelayPerUnit(inteval);
        return animation;
    },

    Atan2: function(y, x)
    {
        return Math.atan2(y, x) * this.rpd;
    },

    // 角度转弧度
    DegreeToRadian: function(degree)
    {
        return degree * this.dpr;
    },

    BindTimelineAction: function(target)
    {
        var action = target.getActionManager().getActionByTag(target.getTag(), target);
        target.action = action;
    },

    PlayTimelineAction: function(target, tag, loop)
    {
        loop = loop == null ? true : loop;
        var action = target.getActionManager().getActionByTag(target.getTag(), target);
        if (action)
        {
            target.action = action;
            if (tag)
            {
                action.play(tag, loop);
            }
            else
            {
                action.gotoFrameAndPlay(0, loop);
            }
        }
    },

    Invoke: function(target, funcName)
    {
        var func = target[funcName];
        if (!func)
        {
            return;
        }
        // 在参数首位固定添加调用对象
        [].splice.call(arguments, 0, 2, target);
        return Function.call.apply(func.bind(target), arguments);
    },

    // 浅拷贝对象
    Copy: function(obj)
    {
        var newobj = {};
        for ( var attr in obj) 
        {
            newobj[attr] = obj[attr];
        }
        return newobj;
    },

    // 初始配置
    InitConfig: function()
    {
        if (this.bInitConfig) return;
        this.bInitConfig = true;
        this.Config = new wls.namespace.FishConfig();
        this.Config.onCreate();
    },

    // 数组中是否存在值
    HasValueAndRemove: function(list, val)
    {
        for (var i = list.length - 1; i > -1; i--)
        {
            if (list[i] == val)
            {
                list.splice(i, 1);
                return true;
            }
        }
        return false;
    },

    // 是否是微信小程序
    IsMiniProgrom: function()
    {
        return window.wx !== undefined;
    },

    //-----------------------------------------------------
    // 协议解析
    //-----------------------------------------------------
    InitJMsg: function()
    {
        if (this.bInitJmsg) return;
        this.bInitJmsg = true;
        var filename = "games/fish/assets/config/MessageDef.txt"
        cc.loader.loadTxt(wls.CheckPath(filename), function(err, data) {
            if (err)
            {
                cc.error(err);
                return;
            }
            JsJmsg.init(data);
        }.bind(this));
    },

    ParseMsg: function(msg)
    {
        if (this.bInitJmsg)
        {
            var ret = JsJmsg.decode(msg);
            var tb = {};
            tb.type = ret[0];
            tb.data = ret[1];
            return tb;
        }
        else
        {
            var tb = JSON.parse(msg.readStringALength(msg.wLen));
            return tb;
        }
    },

    PacketMsg: function(msg, type, data)
    {
        if (this.bInitJmsg)
        {
            JsJmsg.encode(type, msg, data);
        }
        else
        {
            var tb = {};
            tb.type = type;
            tb.data = data;
            msg.writeStringA(JSON.stringify(tb));
        }
    },

    //-----------------------------------------------------
    // other
    //-----------------------------------------------------

    PrefixInteger: function(num, length) {
        return (Array(length).join('0')+num).slice(-length)
    },
    
    ChangeParentNode: function(node, newParent, zorder) {
        node.retain()
        var oldParent = node.getParent()
        if (oldParent) {
            oldParent.removeChild(node, false)
        }
        newParent.addChild(node, zorder || 1)
        node.release()
    },

    getWordPosByNode: function(go)
    {
        if (go == null) {return}
        return (go.getParent()).convertToWorldSpace(go.getPosition())
    },

    jumpingNumber: function(widget, total_time,aimCount, curCount, callback) 
    {
        widget.stopActionByTag(202)
        widget.curTime = 0
        widget.setString(Math.floor(curCount))
        var func = function ( )
        {
            widget.curTime = widget.curTime +0.05
            var curNumCount = curCount + (widget.curTime/total_time)*(aimCount - curCount)
            widget.setString(Math.floor(curNumCount))
            if ((aimCount >= curCount && curNumCount >= aimCount) || (aimCount < curCount && curNumCount <= aimCount) )
            {
                widget.setString(Math.floor(aimCount))
                if (callback != null ) {callback()}
            }
        }
        var act = cc.RepeatForever.create( cc.Sequence.create(cc.DelayTime.create(0.05),cc.CallFunc.create(func)))
        act.setTag(202)
        widget.runAction(act)
    },
    getFormatTimeBySeconds: function(seconds)
    {
        var hour = wls.PrefixInteger(Math.floor(seconds / 3600),2)
        var minute = wls.PrefixInteger((seconds - seconds % 60) / 60%60,2)
        var sec = wls.PrefixInteger(seconds % 60,2)
        return hour+":"+minute+":"+sec
    },
    
    GetCurTimeFrame : function()
    {
        return Number(Math.round(new Date().getTime()/1000))
    },

    GetCurTimeData: function()
    {
        var time = new Date().getTime()
        wls.serverTimeDis? (time = time + wls.serverTimeDis*1000):0
        return new Date(time)
    },

    GetTimeFrameByData: function(year,month,day,hour,minute,sec)
    {
        var data = new Date()
        year != null ? year = data.setFullYear(year) : 0
        month != null ? year = data.setMonth(month-1) : 0
        day != null ? year = data.setDate(day) : 0
        hour != null ? year = data.setHours(hour) : 0
        minute != null ? year = data.setMinutes(minute) : 0
        sec != null ? year = data.setSeconds(sec) : 0
        var time = Math.round(data.getTime()/1000)
        return time
    },


    DownloadPic: function(url, callfunc) {
        var folder = CacheHelper.getOneDayCacheFolder()
		DownloadUtils.getDownloadedImg(url, folder, function(err, filePath) {
		    if (err) {
		    	this._downloaId = DownloadUtils.downloadImg(url, folder, function(err, filePath) {
		    	    if (!err) {
                        callfunc(filePath)
                        cc.log("DownloadPic   filePath="+filePath)
		    	    }
		    	}.bind(this))
		    	return
		    }
            callfunc(filePath)
            cc.log("DownloadPic   filePath-------="+filePath)
		}.bind(this))
    },

    // 随机low-high 区间的整数
    Range: function(low, high)
    {
        var max = Math.max(low, high);
        var min = Math.min(low, high);
        var r = Math.floor(Math.random() * 100000);
        return r % (max - min + 1) + min;
    },

    format: function(str,key,params)
    {
        var list = str.split(key)
        var newStr = ""
        for (var index = 0; index < list.length; index++) {
            newStr = newStr + list[index] + (params[index] || "")
        }
        return newStr
    },

    connectPropTb: function(tb1,tb2)
    {
        for (var index = 0; index < tb2.length; index++)
        {
            var element = tb2[index];
            element.propCount = 1
            element.ifSenior = true
            tb1.push(element);
        }
        return tb1
    },

    GetVersion: function() {
        return "1.0.1"
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

    //自动排列精灵位置  orderType:0中心向两边  1.在父节点大小不变，排序  2.父节点大小适配   off：启始的偏移量
    autoSortPos:function(list,parent,orderType,off){
        var allWidth = 0
        for (var i = 0; i < list.length; i++) {
            if (!list[i].isVisible()) continue
            list[i].itemScaleWidth = list[i].getContentSize().width* list[i].getScaleX()
            allWidth = allWidth + list[i].itemScaleWidth
        }
        var leftPosX = 0
        if (orderType == 0) {
            leftPosX = -allWidth/2
        } else if (orderType == 1) {
            var parWidth = parent.getContentSize().width
            leftPosX = (parWidth - allWidth)/2
        } else if (orderType == 2) {
            off = off|| 10
            var parWidth = parent.getContentSize().width
            parent.setContentSize(cc.size(allWidth+off*2,parent.getContentSize().height))
            leftPosX = off
        }

        for (var i = 0; i < list.length; i++) {
            if (!list[i].isVisible()) continue
            var point = list[i].getAnchorPoint()
            list[i].setPositionX(leftPosX + list[i].itemScaleWidth*point.x)
            leftPosX = leftPosX + list[i].itemScaleWidth
        }
    },

    //TextField To EditBox
    TextFieldToEditBox: function(textField) {
        var parent = textField.getParent()
        var size = textField.getContentSize()
        var anchor = textField.getAnchorPoint()
        var pos = textField.getPosition()
        var placeHolder = textField.getPlaceHolder()
        var placeHolderColor = cc.c3b(255, 255, 255)
        var textColor = textField._realColor
        var fontSize = textField.getFontSize()
        var fontName = textField.getFontName()
        var content = textField.getString()
        var isPwd = textField.isPasswordEnabled()
        var maxLen = textField.getMaxLength()
        var edit = EditBox.create(size)
        .addToEx(parent)
        .move(pos)
        .setPlaceHolder(placeHolder)
        .setPlaceholderFontSize(fontSize)
        .setFontSize(fontSize)
        .setFontColor(textColor)
        .setInputMode(cc.EDITBOX_INPUT_MODE_ANY)
        .setInputFlag(isPwd ? EDITBOX_INPUT_FLAG_PASSWORD : cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_ALL_CHARACTERS)
        .setString(content)
        .setMaxLength(maxLen==0?999:maxLen)
        //.setAnchorPoint(anchor)
        parent.removeChild(textField)
        edit.setAnchorPoint(anchor)
        return edit
    },

    clock: function() {
        return Date.now();
    },

    //-----------------------------------------------------
    // 分割字符
    //-----------------------------------------------------

    // 默认用(,)分割
    SplitArray: function(str) {
        return str.split(/,|;/);
    },

    // 分割位置，返回用
    SplitPosList: function(str) {
        return str.split(/,|;/);
    },

    //-----------------------------------------------------
    // 分享信息
    //-----------------------------------------------------
    GetShareInfo: function(stype) {
        stype = stype || "";
        var inst = UserData.getInstance();
        stype = stype.replace("-", "_");
        if (!inst.userWebData) return;
        var shareDataTb;
        if (inst.userWebData.other) shareDataTb = inst.userWebData.other[stype];
        if (!shareDataTb) shareDataTb = inst.userWebData.share
        if (!shareDataTb) return;
        var OldShareTime = HallShareDateLogic._timeDate(inst.GetShareTime())
        var LocalShareTime = HallShareDateLogic._timeDate(new Date().getTime())
        var shareTb =
        {
            pic  : shareDataTb.pic ,
            text : shareDataTb.text ,
            icon : shareDataTb.icon ,
            url  : shareDataTb.url ,
            id   : shareDataTb.id ,
            domain : shareDataTb.domain ,
            wx_id : shareDataTb.wx_id ,
            bShare :  (OldShareTime === LocalShareTime) ? false : true , //是否已经分享过的标识
            share_id : shareDataTb.share_id ,
        }
        return shareTb
    },
};

wls.init();
wls.namespace = {}; // 类名空间

// 场景基类
wls.GameScene = cc.Node.extend
({
    ctor: function () 
    {
        this._super();
        this.init();
    },

    init: function()
    {
        this.mbSleep = false; // 场景是否休眠
        this.mAssetsPath = "";
        this.mGameObjects = {};
        this.mTimerObjects = [];
        this.mTimerList = [];
        this.mPushViewList = [];
        this.mRoot = this;
        this.scheduleUpdate();
        this.initResolution();
        this.onCreate();
        NotificationCenter.addNotification(this, Event.ON_PAY_RESULT);
    },

    onCreate: function()
    {

    },

    isSleep: function()
    {
        return this.mbSleep;
    },

    setSleep: function(b)
    {
        this.mbSleep = b
    },

    event_on_pay_result: function(result)
    {
        if (this.isSleep()) return;
        cc.log(result);
        this.onPayResult(result.status == 0);
    },

    // 支付结果
    onPayResult: function(bSuccess)
    {
        
    },

    destroy: function()
    {
        NotificationCenter.removeNotificationByName(this, Event.ON_PAY_RESULT);
        this.unscheduleUpdate();
        this.post("cleanup");
    },

    // 初始分辨率
    initResolution: function()
    {
        if (display.width == 1280)
        {
            wls.MainScale = display.height / 720;
            wls.ScaleX = 1;
            wls.ScaleY = wls.MainScale;
            wls.OffsetX = 0;
        }
        else
        {
            wls.MainScale = display.width / 1280;
            wls.ScaleX = wls.MainScale;
            wls.ScaleY = 1;
            wls.OffsetX = isIOS() ? display.width * 0.05 : 0; // ios才用流海
        }
        wls.FishPathSX = display.width / 1280
        wls.FishPathSY = display.height / 720
        wls.MainScale = wls.ScaleY > wls.ScaleX ? wls.ScaleY : wls.ScaleX;
        wls.MinScale = wls.ScaleY > wls.ScaleX ? wls.ScaleX : wls.ScaleY;
        cc.log(wls.MainScale, wls.ScaleX, wls.ScaleY);
    },

    update: function(dt)
    {
        //var t1 = wls.clock();
        if (dt > 1.0) dt = 1.0;
        this.updateAllTimer(dt);
        //cc.log("updateScene ++++++++++++++++++++++", wls.clock() - t1);
    },

    // 设置对象的父结点
    setGameObjectRoot: function(root)
    {
        this.mRoot = root || this;
    },

    // 创建对象(支持不定长参数)
    createGameObject: function(clsName, args)
    {
        cc.log("创建对象 " + clsName);
        var cls = wls.namespace[clsName];
        var go = new cls();
        go._goName = clsName;
        go._Scene = this;
        this.mRoot.addChild(go,go.getZorder ?go.getZorder():0);
        this.mGameObjects[clsName] = go;
        this.extendGameObject(go);
        go.onCreate(args);
        return go;
    },

    // 创建自己命名的对象
    createNamedObject: function(clsName, name, args)
    {
        var go = this.createGameObject(clsName, args);
        delete this.mGameObjects[clsName];
        this.mGameObjects[name] = go;
        go._goName = name;
        return go;
    },

    // 无名对象
    createUnnamedObject: function(clsName, args)
    {
        //cc.log("创建无名对象 " + clsName);
        var cls = wls.namespace[clsName];
        var go = new cls();
        go._goName = clsName;
        go._Scene = this;
        this.mRoot.addChild(go);
        this.extendGameObject(go);
        go.onCreate(args);
        return go;
    },

    // 创建无名结点(不主动加到场景结点)
    createUnnamedNode: function(clsName, args)
    {
        //cc.log("创建无名结点 " + clsName);
        var cls = wls.namespace[clsName];
        var go = new cls();
        go._goName = clsName;
        go._Scene = this;
        this.extendGameObject(go);
        go.onCreate(args);
        return go;
    },

    // 给结点扩展类
    wrapGameObject: function(node, clsName, args)
    {
        cc.log("包装对象 " + clsName);
        var cls = wls.namespace[clsName];
        var go = node;
        go._goName = clsName;
        go._Scene = this;
        this.mGameObjects[clsName] = go;
        this.extendGameObject(go);
        var o = Object.getOwnPropertyNames(cls.prototype);
        for (var i in o)
        {
            var name = o[i];
            if (name != "constructor" && name != "__pid")
            {
                go[name] = cls.prototype[name];
            }
        };
        go.onCreate(args);
        return go;
    },

    // 弹出窗口
    pushView: function(name, args)
    {
        var go = this.activeGameObject(name, args);
        this.mPushViewList.push(go);
        return go 
    },

    // 激活对象（显示）
    activeGameObject: function(name, args)
    {
        var go = this.mGameObjects[name];
        if (go == null)
        {
            go = this.createGameObject(name, args);
        }
        go.setVisible(true);
        if (go["onActive"])
        {
            go["onActive"](args);
        }
        return go;
    },

    // 从列表中移除对象
    removeObjectFromList: function(list, go)
    {
        for (var i = list.length - 1; i > -1; i--)
        {
            if (list[i] == go)
            {
                list.splice(i, 1);
                break;
            }
        }
    },

    // 通过名字，移除对象
    removeGameObject: function(goName)
    {
        var go = this.find(goName);
        if (go == null) return;
        cc.log("+++++++++++++移除对象", goName);
        delete this.mGameObjects[goName];
        this.removeObjectFromList(this.mTimerObjects, go);
        go.removeFromParent(true);
    },

    // 查找对象
    find: function(goName)
    {
        return this.mGameObjects[goName];
    },

    // 开启定时器
    startTimer: function(target, funcName, interval, id, repeat)
    {
        if (!target._bTimerObject)
        {
            target._bTimerObject = true;
            this.mTimerObjects.push(target);
        }
        var timer = {};
        timer.target = target;
        timer.id = id;
        timer.cur = 0;
        timer.interval = interval;
        timer.cnt = 0;
        timer.repeat = repeat;
        timer.alive = true;
        timer.func = function(){ target[funcName](); }
        timer.funcName = funcName;
        target.mTimerList.push(timer);
    },

    stopTimer: function(target, id)
    {
        var list = target.mTimerList;
        for (var i = list.length - 1; i >= 0; i--)
        {
            var timer = list[i];
            if (id == timer.id)
            {
                timer.alive = false;
                break;
            }
        }
    },

    resetTimer: function(target, id)
    {
        var list = target.mTimerList;
        for (var i = list.length - 1; i >= 0; i--)
        {
            var timer = list[i];
            if (id == timer.id)
            {
                timer.cur = 0;
                break;
            }
        }
    },

    // 更新所有计时器
    updateAllTimer: function(dt)
    {
        this.updateObjectTimer(this, dt);
        var i = 0;
        var l = this.mTimerObjects.length;
        for (i = 0; i < l; i++)
        {
            this.updateObjectTimer(this.mTimerObjects[i], dt);  
        }
    },

    updateObjectTimer: function(obj, dt)
    {
        if (obj && obj.mTimerList.length > 0)
        {
            var list = obj.mTimerList;
            for (var i = list.length - 1; i >= 0; i--)
            {
                var timer = list[i];
                if (timer.alive)
                {
                    timer.cur += dt;
                    if (timer.cur >= timer.interval)
                    {
                        timer.cur -= timer.interval;
                        timer.cnt++;
                        if (timer.repeat > 0 && timer.cnt >= timer.repeat)
                        {
                            timer.alive = false;
                        }
                        //var t1 = wls.clock();
                        timer.func();
                        //cc.log(timer.funcName, wls.clock() - t1);
                    }
                }
                else
                {
                    list.splice(i, 1);
                }
            }
        }
    },

    post: function(eventName, args)
    {
        cc.log("抛送事件", eventName);
        for (var key in this.mGameObjects)
        {
            var obj = this.mGameObjects[key];
            if (obj && obj[eventName])
            {
                obj[eventName](args);
            }
        }
    },

    dialog: function(modeType, strmsg, callback, strhook)
    {
        var go = this.find("UIDialog");
        if (go == null) return;
        go.updateView(modeType, strmsg, strhook);
        go.setCallback(callback);
    },

    toast: function(str)
    {
        var go = this.find("UIToast");
        if (go == null) return;
        go.showText(str);
    },

    waiting: function(isShow,keyName,waitStr,callBack)
    {
        var go = this.find("UIWaiting");
        if (go == null) return;
        go.updateKey(isShow,keyName,waitStr,callBack)
    },

    rename: function(go, name)
    {
        delete this.mGameObjects[go._goName];
        this.mGameObjects[name] = go;
    },

    // 监听返回键
    listenKeyBackEvent: function()
    {
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event)
            {
                if (keyCode == 27) //按键T
                {
                    this.onKeyBack();
                }
            }.bind(this),
        }, this);
    },

    // 返回键
    onKeyBack: function() 
    {
        if (wls.IsMiniProgrom()) return;
        var go = this.find("UIGreenHand")
        if (go && go.runGreen != null) {
            return 
        }
        if (this.find("UIDialog") && this.find("UIDialog").isVisible())
        {
            return;
        }
        var l = this.mPushViewList.length;
        while (l > 0)
        {
            l = l - 1;
            var ui = this.mPushViewList[l];
            this.mPushViewList.splice(l, 1);
            if (ui && ui.getParent() && ui.isVisible() && ui.doKeyBack())
            {
                return;
            }
        }
        this.doExit();
    },

    // 显示支付
    showPay: function(tb)
    {
        var self = this;
        var cancelFunc = function() {
            self.doCancelPay();
        }
        tb.price = tb.price/100
        //ON_PAY_RESULT
        PayHelper.showPay(tb, cancelFunc, wls.RoomID, wls.GameID);
        if (this.find("SCSend")) {
            this.find("SCSend").sendGotoCharge()
        }
    },

    doCancelPay: function() {},

    doExit: function()
    {

    },
    waitOverTime: function() {},

    sendMsg: function()
    {
        
    },

    adaptClose: function(obj) {
        obj.setPosition(obj.getParent().convertToNodeSpace(cc.p(67, display.height-70)))
    },

    // 扩展对象的方法
    extendGameObject: function(go)
    {
        var target = this;
        go.nextStateName = "";
        go.mTimerList = [];
        go._bTimerObject = false;

        // 返回键
        go.doKeyBack = function()
        {
            if (go.click_btn_close) {
                go.click_btn_close()
            } else {
                go.setVisible(false);
            }
            return true;
        }

        go.pushView = function(name, args)
        {
            return target.pushView(name, args);
        }

        go.setNextStateName = function(name)
        {
            this.nextStateName = name;
        }

        go.gotoNextState = function()
        {
            cc.log("+++++++++++++++++++gotoNextState", this.nextStateName);
            var name = this.nextStateName;
            this.nextStateName = null;
            wls.Invoke(target, name);
        }
        // 查找对象
        go.find = function(goName)
        {
            return target.find(goName);
        }

        // 移除对象
        go.removeFromScene = function(goName)
        {
            if (goName == null) { goName = go._goName;}
            return target.removeGameObject(goName);
        }

        go.removeGameObject = function(goName)
        {
            return target.removeGameObject(goName);
        }

        // 获得场景
        go.getScene = function()
        {
            return target;
        }

        go.createGameObject = function(clsName, args)
        {
            return target.createGameObject(clsName, args);
        }

        go.createUnnamedObject = function(clsName, args)
        {
            return target.createUnnamedObject(clsName, args);
        }

        go.createUnnamedNode = function(clsName, args)
        {
            return target.createUnnamedNode(clsName, args);
        }

        go.wrapGameObject = function(node, clsName, args)
        {
            return target.wrapGameObject(node, clsName, args);
        }

        go.activeGameObject = function(name, args)
        {
            return target.activeGameObject(name, args);
        }

        // 资源的全路径
        go.fullPath = function(filename)
        {
            return target.mAssetsPath + filename
        }

        // 开启定时器
        go.startTimer = function(funcName, interval, id, repeat)
        {
            return target.startTimer(go, funcName, interval, id, repeat);
        }

        go.stopTimer = function(id)
        {
            return target.stopTimer(go, id);
        }

        go.resetTimer = function(id)
        {
            target.resetTimer(go, id);
        }

        // 抛送事件
        go.post = function(eventName, args)
        {
            return target.post(eventName, args);
        }

        go.dialog = function(modeType, strmsg, strhook)
        {
            return target.dialog(modeType, strmsg, strhook);
        }

        go.toast = function(str){ return target.toast(str); }
        go.waiting = function(isShow,keyName,waitStr,callBack){ return target.waiting(isShow,keyName,waitStr,callBack);}
        go.rename = function(name){ return target.rename(go, name);}
        go.showPay = function(tb, cancelFunc){ return target.showPay(tb, cancelFunc) }
        go.sendMsg = function() 
        { 
            target.sendMsg.apply(target, arguments); 
        }

        go.adaptClose = function(obj) { target.adaptClose(obj) }
    },
});


// 包装结点类
wls.WrapNode = cc.Class.extend
({

});

wls.ExitGameArgs = [];
wls.ExitGameErrorCode = 0 // 退出游戏的错误码

wls.Loaded_Hall_Assets = false;
wls.Loaded_Battle_Assets = false;
wls.RoomIdx = 1; // 第几个房间
wls.GameID = 0; // 捕鱼游戏id
wls.RoomID = 0; // 房间id
wls.EnableDebug = false; //是否开启秘籍
wls.InitiativeLeave = false; // 主动离开房间