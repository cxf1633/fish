"use strict";
// 捕鱼大厅数据(逻辑)
wls.namespace.DAHall = cc.Node.extend
({
    onCreate: function() 
    {    
        this.mails = [];   
        this.buyHistory = [];
        this.serverTimeStamp = 0;
        this.leftLotteryTimes = 5;
        this.hallInfo = {};
        this.almsInfo = {};
        this.shareLinkUsed = false
    },

    getMails: function()
    {
        return this.mails;
    },

    getRooms: function()
    {
        return this.rooms;
    },

    getBuyHistory: function()
    {
        return this.buyHistory;
    },

    getServerTimeStamp: function()
    {
        return this.serverTimeStamp;
    },

    getHallInfo: function()
    {
        return this.hallInfo;
    },

    getOldGunRate: function()
    {
        return this.oldGunRate
    },

    setOldGunRate: function(oldGunRate)
    {
        this.oldGunRate = oldGunRate
    },

    setMaxGunRate: function(maxGunRate)
    {
        this.maxGunRate = maxGunRate;
    },

    setAlmsInfo: function(info) {
        this.almsInfo = info
        this.almsInfo.isEnabled = (info.leftCount > 0)
    },

    getAlmsTime: function() {
        return this.almsInfo.cd || 0
    },

    isEnableRecvAlms: function() {
        return this.almsInfo.isEnabled || false
    },

    setHallInfo: function(resp)
    {
        this.hallInfo = resp;
        this.initMails(resp.unreadMails);
        this.initPlayer(resp.playerInfo);
        this.initBuyHistory(resp.buyHistory);
        this.serverTimeStamp = resp.serverTime;
        this.setLeftLotteryTimes(resp.leftFishTicketDrawCount)
        this.arenaServers = this.initArenaServers(resp.arenaGameServers || [])
        if (this.oldGunRate == undefined) {this.oldGunRate = resp.playerInfo.maxGunRate}
        this.almsInfo = {}
        wls.serverTimeDis = resp.serverTime - wls.GetCurTimeFrame()
        this.shareLinkUsed = resp.shareLinkUsed
        this.arenaRoomConfigs = resp.roomConfigs || []

        this.find("DAPlayer").setShareInfos(resp.shareInfo)
        this.find("DAPlayer").setShareSwitchs(resp.shareSwitchs)
        this.find("DAPlayer").updateFreeFishCoinInfo(resp.freeFishCoinInfoA);
        this.find("DAPlayer").setVipAwardState(resp.vipDailyRewardToken);
    },

    setArenaHallInfo: function(resp) {
        this.hallInfo = resp;
        this.initMails(resp.unreadMails);
        this.initPlayer(resp.playerInfo);
        this.initBuyHistory(resp.buyHistory);
        this.serverTimeStamp = resp.serverTime;
        this.setLeftLotteryTimes(resp.leftFishTicketDrawCount)
        if (this.oldGunRate == undefined) {this.oldGunRate = resp.playerInfo.maxGunRate}
        this.almsInfo = {}
        wls.serverTimeDis = resp.serverTime - wls.GetCurTimeFrame()
        this.shareLinkUsed = resp.shareLinkUsed
        this.initRoomServerConfig(resp.roomConfigs || [])
        this.find("DAPlayer").setShareInfos(resp.shareInfo)
        this.find("DAPlayer").setShareSwitchs(resp.shareSwitchs)
        this.find("DAPlayer").updateFreeFishCoinInfo(resp.freeFishCoinInfoA);
    },

    initArenaServers: function(arenaServers) {
        var servers = []
        var rooms = this.find("SCRoomMgr") ? this.find("SCRoomMgr").getRooms() : []
        for (var key = 0; key < arenaServers.length; key++) {
            var roomId = arenaServers[key]
            var room = rooms[roomId]
            if (room) {
                servers.push(roomId)
            }
        }

        return servers
    },

    initRoomServerConfig: function(roomConfig) {
        this.arenaRoomConfigs = roomConfig
        for (var key = 0; key < this.arenaRoomConfigs.length; key++) {
            this.arenaRoomConfigs[key].leftEndSecond = (this.arenaRoomConfigs[key].leftEndSecond || 0)+wls.serverTimeDis+wls.GetCurTimeFrame()
        }
    },

    getArenaServers: function() {
        if (this.arenaServers.length == 0) { cc.log("arena game servers is null")}
        return this.arenaServers
    },

    getArenaRoomConfigs: function(id) {
        for (var key = 0; key < this.arenaRoomConfigs.length; key++) {
            var roomConfig = this.arenaRoomConfigs[key]
            if (roomConfig.arenaType == id) {
                return roomConfig
            }
        }
        return {}
    },

    setShareLinkUsed: function(val)
    {
        this.shareLinkUsed = val
    },

    getShareLinkUsed: function()
    {
        return this.shareLinkUsed
    },

    initMails: function(mails)
    {
        this.mails = mails;
    },

    initBuyHistory: function(buyHistory)
    {
        this.buyHistory = buyHistory;
    },

    // 初始化房间信息
    initRooms: function(rate)
    {
        this.rooms = [];
        this.defaultRoomID = 1;
        var ids = [1, 2, 3, 5];
        for (var i = 0; i < ids.length; i++)
        {
            var ret = wls.Config.get("room", ids[i] + 910000000 + "");
            ret.id = ids[i];
            ret.bUnlock = rate >= ret.cannon_min; // 是否已解锁
            ret.bActive = ret.cannon_max > 0 ? rate < ret.cannon_max : true; // 是否可激活
            this.defaultRoomID = ret.bUnlock ? ret.id : this.defaultRoomID;
            this.rooms.push(ret);
        }
    },

    // 初始化玩家
    initPlayer: function(player)
    {
        this.find("DAPlayer").updatePlayer(player);
        this.initRooms(this.find("DAPlayer").getMaxGunRate());
    },

    setLeftLotteryTimes: function(times) {
         this.find("DAPlayer").setLeftLotteryTimes(times)
    },

    getLeftLotteryTimes: function() {
        return this.find("DAPlayer").getLeftLotteryTimes()
    },

    // 更新已读邮件
    updateMails: function(mailID)
    {
        for (var i = this.mails.length - 1; i > -1; i--)
        {
            if (this.mails[i].id == mailID)
            {
                this.mails.splice(i, 1);
                break;
            }
        }
    },
});