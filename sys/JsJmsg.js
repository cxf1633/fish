"use strict";

var JsJmsg = {
    init : function(str) {
        var msgReg =/([A-z0-9_]+)\s*=\s*([0-9]*)\s*{([^}]*)\s*}/g
        this.nameToTypes = new Map()
        this.idToTypes = new Map()

        for(;;) {
            var msgObj = msgReg.exec(str)

            if(msgObj == null) {
                break
            }
            var msg = this.procmsg(msgObj)
            this.nameToTypes[msg.typeName] = msg
            this.idToTypes[msg.typeId] = msg
        }

        this.pool = [];
        for (var i = 0; i < 4; i++)
        {
            var stream = new SerialStream();
            stream.bUsed = false;
            this.pool.push(stream);
        }

        this.tmpMsg = new SerialStream();

        this.rm = {}
        this.rm["int"] = this["read_int"].bind(this);
        this.rm["int64"] = this["read_int64"].bind(this);
        this.rm["string"] = this["read_string"].bind(this);
        this.rm["wstring"] = this["read_wstring"].bind(this);
        this.rm["bool"] = this["read_bool"].bind(this);

        this.wm = {}
        this.wm["int"] = this["write_int"].bind(this);
        this.wm["int64"] = this["write_int64"].bind(this);
        this.wm["string"] = this["write_string"].bind(this);
        this.rm["wstring"] = this["read_wstring"].bind(this);
        this.wm["bool"] = this["write_bool"].bind(this);

    },
    procmsg : function(msgObj) {
        var msg = {}
        msg.nameToFields = new Map()
        msg.idToFields = new Map()
        var fieldReg = /([A-z0-9_]+)\s*:\s*([A-z\[\]0-9]*)\s*=\s*([0-9]+)/g
        if(msgObj.length != 4) {
            return
        }
        msg.typeName = msgObj[1]
        msg.typeId = parseInt(msgObj[2])

        for (; ;) {
            var fieldobj = fieldReg.exec(msgObj[3])

            if (fieldobj == null) {
                break
            }
            var field = this.procField(fieldobj)
            msg.nameToFields[field.fieldName] = field
            msg.idToFields[field.fieldId] = field
        }
       return msg
    },

    getStream: function()
    {
        var ret = null;
        for (var i = this.pool.length - 1; i >= 0; i--)
        {
            if (!this.pool[i].bUsed)
            {
                //cc.log("++++++++++++++use pool");
                ret = this.pool[i];
                break;
            }
        }
        if (ret == null)
        {
            //cc.log("++++++++++++++new SerialStream");
            ret = new SerialStream();
            this.pool.push(ret);
        }
        ret.position = 0;
        ret.bUsed = true;
        return ret;
    },

    createNewStream : function() {
        var stream = this.getStream();//new SerialStream();
        return stream
    },
    writeStream : function(destStream, srcStream) {
       var len = srcStream.position
        srcStream.position = 0
        for (var i = 0; i < len; i++) {
            destStream.WriteByte(srcStream.ReadByte())
        }
    },
    procField: function (fieldobj) {
        var regexArray = /\[\]([A-z0-9]+)/
        var field = {}
        if(fieldobj.length != 4) {
            return
        }
        field.fieldName = fieldobj[1]
        field.fieldId = parseInt(fieldobj[3])

        var matchItems = regexArray.exec(fieldobj[2])
        if (matchItems != null) {
            field.isArray = true
            field.fieldType = matchItems[1]
        } else {
            field.isArray = false
            field.fieldType = fieldobj[2]
        }
        return field
    },
    readEncodedInt: function (stream) 
    {
        var data1 = stream.ReadByte()
        if(data1 < 128) 
        {
            return data1
        } 
        else 
        {
            data1 = data1 - 128
        }
        var tmp = this.tmpMsg;
        tmp.position = 11;
        tmp.WriteByte(data1);
        for (var i = 10; i >= 8; i--)
        {
            tmp.position = i;
            tmp.WriteByte(stream.ReadByte());
        }
        tmp.position = 8;
        return tmp.ReadDword();
    },

    writeEncodedInt :function(stream, data) 
    {
        if(data < 128) 
        {
            stream.WriteByte(data)
            return 1;
        }
        var tmp = this.tmpMsg;
        tmp.position = 8;
        tmp.WriteDword(data + 0x80000000);
        for (var i = 11; i >= 8; i--)
        {
            tmp.position = i;
            stream.WriteByte(tmp.ReadByte());
        }
        return 4;
    },

    // 读取32位整形
    read_int: function(stream)
    {
        var tmp = this.tmpMsg;
        for (var i = 11; i >= 8; i--)
        {
            tmp.position = i;
            tmp.WriteByte(stream.ReadByte());
        }
        tmp.position = 8;
        return tmp.ReadInt();
    },

    write_int: function(stream, data)
    {
        var tmp = this.tmpMsg;
        tmp.position = 8;
        tmp.WriteInt(data);
        for (var i = 11; i >= 8; i--)
        {
            tmp.position = i;
            stream.WriteByte(tmp.ReadByte());
        }
    },

    // 读取64位整形
    read_int64: function(stream)
    {
        var tmp = this.tmpMsg;
        for (var i = 15; i >= 8; i--)
        {
            tmp.position = i;
            tmp.WriteByte(stream.ReadByte());
        }
        tmp.position = 8;
        return tmp.ReadLonglong();
    },

    write_int64: function(stream, data)
    {
        var tmp = this.tmpMsg;
        tmp.position = 8;
        tmp.WriteLonglong(data);
        for (var i = 15; i >= 8; i--)
        {
            tmp.position = i;
            stream.WriteByte(tmp.ReadByte());
        }
    },

    Utf8ToUnicode: function(bytes) 
    {
        var bstr = "";
        var byte;
        var i = 0;
        var length = bytes.length;
        while (i < length)
        {
            byte = bytes[i];
            if ((byte & 0x80) == 0)
            {
                bstr += String.fromCharCode(byte & 0x7F);  
                i++;
            }
            else if ((byte & 0xE0) == 0xC0)
            {
                bstr += String.fromCharCode(((byte & 0x3F) << 6) | (bytes[i + 1] & 0x3F));
                i += 2;
            }
            else if ((byte & 0xF0) == 0xE0)
            {
                bstr += String.fromCharCode(((byte & 0x0F) << 12) | ((bytes[i + 1] & 0x3F) << 6) | (bytes[i + 2] & 0x3F));  
                i += 3;
            }
            else
            {
                cc.error("不解析utf8 4字节以上的");
                break;
            }
        }
        return bstr;
    },

    // 读字符串(utf-8)
    read_string : function(stream) 
    {
        var length = this.readEncodedInt(stream)
        var buffer = [];
        for (var i = 0; i < length; i++)
        {
            buffer.push(stream.ReadByte());
        }
        return this.Utf8ToUnicode(buffer);
    },

    // 读字符串(unicode)
    read_wstring : function(stream) 
    {
        var length = this.readEncodedInt(stream)
        var buffer = [];
        for (var i = 0; i < length; i++)
        {
            buffer.push(stream.ReadByte());
        }
        var ret = "";
        var r = 0;
        for (var i = 0; i < length; i += 2)
        {
            r = (buffer[i + 1] << 8) + buffer[i];
            if (r > 0)
            {
                ret += String.fromCharCode(r);
            }
            else
            {
                break;
            }
        }
        return ret;//this.Utf8ToUnicode(buffer);
    },

    // 写字符串
    write_string : function(stream, str) 
    {
        this.writeEncodedInt(stream, str.length)
        var length = str.length;
        for (var i = 0; i < length; i++) {
            stream.writeUint8(str.charCodeAt(i));
        }
    },

    // 写字符串
    write_wstring : function(stream, str) 
    {
        this.writeEncodedInt(stream, str.length)
        var length = str.length;
        for (var i = 0; i < length; i++) {
            stream.writeUint8(str.charCodeAt(i));
        }
    },

    // 读bool
    read_bool : function(stream) 
    {
        return stream.ReadByte() > 0;
    },

    // 写bool
    write_bool : function(stream, data) 
    {
        stream.WriteByte(data ? 1 : 0);
    },

    // 读单个字段值
    getFieldValueFromMsg: function (msg, fieldInfo)
     {
        var func = this.rm[fieldInfo.fieldType];
        if (func)
        {
            return func(msg);
        }
        else
        {
            return this.decode(msg, fieldInfo.typeName)[1];
        }
    },

    // 读数组
    getFieldArrayFromMsg : function(msg, fieldInfo) 
    {
        var len = this.readEncodedInt(msg)
        var ret = new Array()
        var func = this.rm[fieldInfo.fieldType];
        if (func)
        {
            for(var i = 0; i < len; i++) 
            {
                ret[i] = func(msg);
            }
        }
        else
        {
            for (var i = 0; i < len; i++) 
            {
                var data = this.decode(msg, fieldInfo.fieldType)[1]
                ret[i] = data
            }
        }
        return ret
    },

    // 写单个值
    setFieldValueToMsg :function(msg, fieldInfo, data) 
    {
        //记录原来的位置
        var oldPos = msg.position
        var newStream = this.createNewStream()
        //写入字段id
        this.writeEncodedInt(newStream, fieldInfo.fieldId)
        // 写入数据
        var func = this.wm[fieldInfo.fieldType];
        if (func)
        {
            func(newStream, data);
        }
        else
        {
            this.encode(fieldInfo.fieldType, newStream, data)
        }
        this.writeEncodedInt(msg, newStream.position)
        this.writeStream(msg, newStream)
        newStream.bUsed = false;
    },

    // 写入数组
    setFieldArrayToMsg :function(msg, fieldInfo, data) 
    {
        var len = data.length
        var newStream= this.createNewStream()
        //写入字段id
        this.writeEncodedInt(newStream, fieldInfo.fieldId)
        this.writeEncodedInt(newStream, data.length)
        var func = this.wm[fieldInfo.fieldType];
        if (func)
        {
            for (var i = 0; i < len; i++) 
            {
                func(newStream, data[i]);
            }
        }
        else
        {
            for (var i = 0; i < len; i++) 
            {
                this.encode(fieldInfo.fieldType, newStream, data[i])
            }  
        }
        this.writeEncodedInt(msg, newStream.position)
        this.writeStream(msg, newStream)
        newStream.bUsed = false;
    },

    fillTypeFieldsFromMsg: function(msg, typeInfo, ret) {
        while (true) 
        {
            var fieldLen = this.readEncodedInt(msg)   
            //print("read field len:"..fieldLen)
            if(fieldLen == 0) {
                break
            }

            //缓存当前未知
            var oldPos = msg.position
            var fieldId = this.readEncodedInt(msg)

            //计算字段头长度
            var fieldIdLen = msg.position - oldPos
            var fieldInfo = typeInfo.idToFields[fieldId]
            if(fieldInfo == null){
                //跳过未知字段
                msg.position += fieldLen - fieldIdLen
            } else if (!fieldInfo.isArray) {
                ret[fieldInfo.fieldName] = this.getFieldValueFromMsg(msg, fieldInfo)
            } else {
                ret[fieldInfo.fieldName] = this.getFieldArrayFromMsg(msg, fieldInfo)
            }
        }
    },
    fillTypeFieldsToMsg : function(msg, typeInfo, data) {
        for(var fieldName in data) {
            var fieldValue = data[fieldName]
            var fieldInfo = typeInfo.nameToFields[fieldName]

            if(fieldInfo == null) {
            } else if (!fieldInfo.isArray) {
                this.setFieldValueToMsg(msg, fieldInfo, fieldValue)
            } else {
                this.setFieldArrayToMsg(msg, fieldInfo, fieldValue)
            }
        }
        this.writeEncodedInt(msg, 0)
    },
    //输入参数，消息
    //输出：消息名，解码后的table
    decode : function(msg) {
        var msgId = this.readEncodedInt(msg)
        var ret = {}
        //print("read msg id:")
        //消息不存在
        var typeInfo = this.idToTypes[msgId]
        if(typeInfo == null) {
            return ["", ret]
        } else {
            this.fillTypeFieldsFromMsg(msg, typeInfo, ret)
            return [typeInfo.typeName, ret]
        }
    },
    //输入参数：消息名，messageHeader对象，需要编码的table
    //输出参数: 无
    encode: function(typeName, msg, data) {
        var typeInfo = this.nameToTypes[typeName]

        if (typeInfo == null) {
            return
        } else {
            this.writeEncodedInt(msg, typeInfo.typeId)
            this.fillTypeFieldsToMsg(msg, typeInfo, data)
        }
    }
}