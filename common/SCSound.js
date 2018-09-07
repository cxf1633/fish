// 声音控制器
wls.namespace.SCSound = cc.Node.extend
({
    onCreate: function() 
    {
        this.path = "games/fish/assets/sound/";
        this.bMusic = true;
        this.bEffect = true;
        this.curMusicFilename = "";
        this.load();
        if(wls.IsMiniProgrom())
        {
            this.initWXAudio();
        }
    },

    // 微信音效接口不同
    initWXAudio: function()
    {
        if (!wls.WXAudio)
        {
            wls.WXAudio = {}
            var a = wls.WXAudio;
            a.fireAudioContext = [];
            a.fireIdx = 0;
            a.effectStack = [];
            for (var i = 0; i < 5; i++) 
            {
                var b = wx.createInnerAudioContext();
                var c = wx.createInnerAudioContext();
                var unit = {};
                unit.ac = b;
                unit.used = false;
                a.effectStack.push(unit);
                a.fireAudioContext.push(c);
            }
        }
        var self = this;
        wx.onAudioInterruptionBegin(function() {}),
        wx.onAudioInterruptionEnd(function() {
            self.resumeMusic();
        })
    },

    onEventEnterForgeGround: function() 
    {
        setTimeout(function() {
            this.resumeMusic();
        }.bind(this), 0.2)
    },

    load: function()
    {
        var str = cc.sys.localStorage.getItem("FishSetting");
        var tb = {};
        if(str) 
        {
			tb = JSON.parse(str);
        }
        this.bMusic = tb.bMusic == null ? true : tb.bMusic;
        this.bEffect = tb.bEffect == null ? true : tb.bEffect;
    },

    save: function()
    {
        var tb = {};
        tb.bMusic = this.bMusic;
        tb.bEffect = this.bEffect;
        var str = JSON.stringify(tb);
        cc.sys.localStorage.setItem("FishSetting", str);
    },

    playMusic: function(filename, loop)
    {
        if (filename == null || filename == "") {return}
        this.curMusicFilename = filename;
        if (!this.bMusic) return;
        filename = this.path + filename
        var l = loop == undefined ? true : loop
        var f = wls.CheckPath(filename);
        if (cc.loader.cache[f])
        {
            this.doPlayMusic(f, l);
            return
        }
        Loader.load([filename], function() {
            if (!this.bMusic) return;
            this.doPlayMusic(f, l);
        }.bind(this), false)
    },

    playEffect: function(filename, loop, bFire)
    {
        if (filename == null || filename == "") {return}
        if (!this.bEffect) return;
        var l = loop == undefined ? false : loop
        filename = this.path + filename
        var f = wls.CheckPath(filename);
        if (cc.loader.cache[f])
        {
            if (!this.bEffect) return;
            this.doPlayEffect(f, l, bFire);
            return
        }
        Loader.load([filename], function() {
            if (!this.bEffect) return;
            this.doPlayEffect(f, l, bFire);
        }.bind(this), false)
    },
    
    // 播放游戏背景音乐
    playGameMusic: function(idx)
    {
        var fileName = ""
        if (idx == 0) {
            fileName = wls.Config.get("config", 990000014).data
        } else if (idx == 10 ) {
            fileName = "music_bosscome.mp3"
        } else if (idx > 0 ) {
            fileName = wls.Config.get("room", idx + 910000000).bg_music
        }
        this.playMusic(fileName);
    },

    stopAllEffect: function()
    {
        cc.audioEngine.stopAllEffects()
    },

    resumeMusic: function()
    {
        if (!this.bMusic) return;
        this.playMusic(this.curMusicFilename, true)
    },

    stopMusic: function()
    {
        cc.audioEngine.stopMusic()
        var a = wls.WXAudio;
        if (a && a.bgAC) {
            a.bgAC.stop();
        }
    },

    // 按钮音效
    playBtnEffect: function(filename, btnname)
    {
        if (filename)
        {
            if (filename != "") this.playEffect(filename);
            return;
        }
        if (btnname == "btn_close")
        {
            this.playEffect("exit_01.mp3");
            return;
        }
        this.playEffect("com_btn01.mp3");
    },

    // 执行播放音乐
    doPlayMusic: function(filename, loop)
    {
        cc.audioEngine.stopMusic()
        cc.audioEngine.playMusic(filename, loop);
    },

    // 执行播放音效
    doPlayEffect: function(filename, loop, bFire)
    {
        if (!wls.IsMiniProgrom())
        {
            cc.audioEngine.playEffect(filename, loop);
            return;
        }
        if (bFire)
        {
            this.doPlayFireEffect(filename, loop);
            return;
        }
        var a = wls.WXAudio;
        var l = a.effectStack.length;
        for (var i = 0; i < l; i++)
        {
            var unit = a.effectStack[i];
            if (!unit.used) 
            {
                unit.used = true;
                var d = unit.ac;
                d.src = filename;
                d.play();
                var e = unit;
                d.onEnded(function() {
                    e.used = false;
                    e.ac.offEnded();
                });
                break
            }
        }
    },

    // 播放发射子弹接口
    doPlayFireEffect: function(filename)
    {
        var a = wls.WXAudio;
        a.fireIdx++;
        if (a.fireIdx >= a.fireAudioContext.length)
        {
            a.fireIdx = 0;
        }
        var b = a.fireAudioContext[a.fireIdx];
        b.src = filename;
        b.play()
    },
});