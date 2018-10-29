webpackJsonpvendor([20],{

/***/ 245:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_ezdev_pcview_handler_Handler__ = __webpack_require__(18);
/**
 * Created by suntf on 2017/7/24
 */


/* harmony default export */ __webpack_exports__["default"] = (new __WEBPACK_IMPORTED_MODULE_0_ezdev_pcview_handler_Handler__["default"]({
    resolveTpl: function resolveTpl(tpl) {

        return __webpack_require__(288)("./" + tpl + ".html");
    },
    initHandler: function initHandler() {
        this.options = {
            leftId: 'leftcontent',
            rightId: 'rightcontent',
            roleListId: 'roleList',
            rightTreeId: 'tree_id',
            rightTreeUrl: 'system/core/user/orgusertree',
            pageId: 'pager',
            selectedRoleId: '',
            selectedRescId: '',
            lastIds: '',
            selectedRoleObj: {}
        };
    },

    initRoleList: function initRoleList() {
        var args = {
            contentId: "list",
            data: "search_LIKE_name=&page=1",
            form: "searchForm",
            tpl: "list",
            url: "/system/core/role/list"
        };
        $('.pagination2').jqPagination({
            current_page: 1, //设置当前页 默认为1
            max_page: 1,
            page_string: '第{current_page}页,共{max_page}页',
            paged: function (page) {
                $("#" + this.options.leftId + ' #page').val(page);
                this.searchNew(args).then(function () {
                    $("#example2 tr:first").click();
                });
            }.bind(this)
        });
        //this.searchRoleList();
    },
    /*新的查询方法*/
    searchNew: function searchNew(args) {
        args.form = args.form || 'searchForm';
        if (args.url) {
            args.contentId = args.contentId || 'list';
            var form = $("#" + args.form);
            if (form.length > 0) {
                args.data = form.serialize();
                args.tpl = args.tpl || 'list';
                return this.render(args).then(function (data) {
                    var maxpage = parseInt(data.data.totalPages);
                    var curpage = parseInt(data.data.pageNum);
                    $(".pagination2").jqPagination("option", {
                        max_page: maxpage,
                        current_page: curpage,
                        trigger: false
                    });
                }.bind(this));
            } else {
                throw new Error("参数无效，DOM中无法找到id为[" + args.form + "]的Form！");
            }
        } else {
            throw new Error("参数无效，请传递如{url:/demo/mybatisuser/pages-(必选),type:post-(默认),tpl:list-(默认),contentId:list-(默认)}的JS对象");
        }
    },
    /*新的查询方法ed*/
    onSearchNewed: function onSearchNewed(args) {
        this.initUserTree(args);
        $("#example2 tr:first").click();
    },
    /**
     * 点击角色，取得授权用户，更新用户tree
     */
    initUserTree: function initUserTree(args) {
        this.dialog = null;
        var tree_setting = {
            check: {
                enable: true,
                chkboxType: { "Y": "ps", "N": "ps" }
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            view: {
                fontCss: function fontCss(treeId, treeNode) {
                    return !!treeNode.highlight ? { color: "blue", "font-weight": "bold" } : { color: "#000", "font-weight": "normal" };
                }
            }
        };
        $.ajax({
            cache: false,
            async: false, // 同步加载
            type: "POST",
            url: this.options.rightTreeUrl,
            dataType: "json",
            success: function (data) {
                var nodes = data.data;
                $.each(nodes, function (i, item) {
                    if (item.type == 'user') {
                        item.iconSkin = "user";
                    }
                });
                $.fn.zTree.init($("#" + this.options.rightTreeId), tree_setting, nodes);
                var zTree = $.fn.zTree.getZTreeObj("" + this.options.rightTreeId);
                var root = zTree.getNodesByFilter(function (node) {
                    return node.level == 0;
                }, true);
                zTree.expandNode(root, true, false, false); //默认展开第一级
            }.bind(this)
        });
    },
    /**
     * 点击角色，取得授权用户，更新用户tree
     */
    selRole: function selRole(args) {
        this.options.selectedRoleObj = args;
        $.fn.zTree.destroy("dataRuleTree");
        var roleid = args.objid;
        var rolename = args.objname;
        //点击过后的tr变成蓝色，其他tr恢复原色
        $("#" + roleid).addClass("active").siblings().removeClass('active');
        if (!roleid) {
            $("#" + this.options.rightId + " #btnSure").attr('disabled', true);
        } else {
            $("#" + this.options.rightId + " #btnSure").attr('disabled', false);
        }
        $("#" + this.options.rightId + " #hidRoleid").val(roleid);
        $("#" + this.options.rightId + " #spnCurRole").text(rolename);
        if (roleid) {
            var url = "system/core/role/usersbyroleid/" + roleid;
            $.ajax({
                cache: false,
                async: false, // 同步加载
                type: "GET",
                url: url,
                dataType: "json",
                success: function (data) {
                    var zTree = $.fn.zTree.getZTreeObj(this.options.rightTreeId);
                    zTree.checkAllNodes(false); //用户数选择状态初始化
                    if (data.data.length > 0) {
                        data.data.forEach(function (item, i) {
                            var node = zTree.getNodeByParam("id", item.id);
                            if (node) {
                                node.checked = true;
                                //zTree.updateNode(node,true);//父节点级联选中
                                zTree.updateNode(node);
                                zTree.expandNode(node.getParentNode(), true, false, false); //展开选中节点
                            }
                        });
                    }
                }.bind(this)
            });
        }
    },
    bindUsers: function bindUsers() {
        //选中角色
        var roleid = $("#" + this.options.rightId + " #hidRoleid").val();
        //选中用户
        var treeObj = $.fn.zTree.getZTreeObj(this.options.rightTreeId);
        var chknodes = treeObj.getCheckedNodes(true);
        var nodes = "";
        chknodes.forEach(function (item, i) {
            if (item.type == 'user') {
                nodes += item.id + ",";
            }
        });
        if (roleid.length == 0) {
            //TODO:替换为标准提示框
            layer.msg("\u8BF7\u9009\u62E9\u7ED1\u5B9A\u7684\u89D2\u8272");
            return;
        }
        var param = { "roleid": roleid, "userids": nodes };
        var url = "system/core/authorize/bindroleusers";
        $.ajax({
            cache: false,
            data: param,
            type: "POST",
            url: url,
            dataType: "json",
            success: function (data) {}.bind(this)
        });
    },
    bindReset: function bindReset() {
        var element = this.options.selectedRoleObj;
        this.selRole(element);
    }
}));

/***/ }),

/***/ 288:
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./index.html": 289,
	"./list.html": 290
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 288;

/***/ }),

/***/ 289:
/***/ (function(module, exports, __webpack_require__) {

var $imports = __webpack_require__(1);
module.exports = function ($data) {
    'use strict';
    $data = $data || {};
    var $$out = '', $escape = $imports.$escape, path = $data.path;
    $$out += '<!-- Content Header (Page header) -->\r\n<link href="common/css/style.css" rel="stylesheet">\r\n<script type="text/javascript" src="plugins/ztree/jquery.ztree.all-3.5.js"></script>\r\n<script type="text/javascript" src="plugins/ztree/jquery.ztree.core-3.5.js"></script>\r\n<script type="text/javascript" src="plugins/ztree/jquery.ztree.excheck-3.5.js"></script>\r\n<script type="text/javascript" src="plugins/ztree/jquery.ztree.exedit-3.5.js"></script>\r\n<script type="text/javascript" src="plugins/ztree/jquery.ztree.exhide-3.5.js"></script>\r\n<link href="plugins/ztree/zTreeStyle.css" rel="stylesheet">\r\n<!--左侧的分页-->\r\n<link href="common/css/pageStyle.css" rel="stylesheet"><!--page页面-->\r\n<script type="text/javascript" src="plugins/jQuery/jquery.jqpagination.js"></script>\r\n<section class="content-header">\r\n    <h1>\r\n        授权管理\r\n        <small>角色用户绑定</small>\r\n    </h1>\r\n</section>\r\n\r\n<!-- Main content -->\r\n<section class="content">\r\n    <div class="row">\r\n        <!--左侧-->\r\n        <div class=col-md-2 id="leftcontent">\r\n            <div class="con-left">\r\n                <form id="searchForm" class="form-inline">\r\n                    <div class="zTree-box srcoll-box">\r\n                        <div class="input-group" style="width: 100%">\r\n                            <input type="text" id="txtSearch" name="search_LIKE_name" class="form-control"\r\n                                   placeholder="请输入角色名称">\r\n                            <span class="input-group-btn">\r\n                                       <button id="btnSearch" type="button" class="btn btn-primary"\r\n                                               e-event="href:/';
    $$out += $escape(path);
    $$out += '/searchNew?url=/system/core/role/list,auto:true">\r\n                                            <i class="fa fa-search"></i>\r\n                                        </button>\r\n                                        <div  e-event="href:/';
    $$out += $escape(path);
    $$out += '/initRoleList,auto:true"></div>\r\n\t\t\t\t\t\t        \t</span>\r\n                        </div>\r\n                        <div class="box" style="max-height: 850px; overflow: auto; margin-top: 10px">\r\n                        <!--<div class="box" style="min-height: 600px;margin-top: 10px">-->\r\n                            <div class="authorize-role-list scroll-box" id="list" style="overflow-x: auto;height:550px;"></div>\r\n                            <div class="gigantic pagination2">\r\n                                <a href="#" class="first" data-action="first">&laquo;</a>\r\n                                <a href="#" class="previous" data-action="previous">&lsaquo;</a>\r\n                                <input type="text" readonly="readonly"/>\r\n                                <a href="#" class="next" data-action="next">&rsaquo;</a>\r\n                                <a href="#" class="last" data-action="last">&raquo;</a>\r\n                            </div>\r\n                            <!-- 左侧分页 -->\r\n                            <input type=\'hidden\' id=\'page\' name=\'pageNumber\' value=\'1\'>\r\n                        </div>\r\n\r\n\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n        <!--右侧-->\r\n        <div class="col-md-10" id="rightcontent">\r\n            <div class="box"> <!--style="min-height: 645px"-->\r\n                <div class="box-header">\r\n                    为角色&nbsp;<span class="color-blue" style="color: #1E5E9C;" id="spnCurRole"></span>&nbsp;绑定用户\r\n                    <input type="hidden" id="hidRoleid">\r\n                </div>\r\n                <div class="box-body">\r\n                    <div class="Tables_wrapper form-inline dt-bootstrap">\r\n                        <div class="con-left" >\r\n                            <div class="row-fluid">\r\n                                <div class="zTree-box">\r\n                                    <div id="tree_id" class="ztree" style="max-height: 580px; overflow: auto"></div>\r\n                                </div>\r\n                                <div class="box-footer col-sm-12">\r\n                                    <button e-event="href:/';
    $$out += $escape(path);
    $$out += '/bindUsers" class="btn btn-instagram"\r\n                                            id="save_btn" type="button" title="保存"\r\n                                            e-permission="core_authorize_bindroleusers">\r\n                                        <i class="fa fa-floppy-o"></i>&nbsp;保存\r\n                                    </button>\r\n                                    <button e-event="href:/';
    $$out += $escape(path);
    $$out += '/bindReset" class="btn btn-primary "\r\n                                            id="back_btn" type="button" title="取消">\r\n                                        <i class="fa fa-mail-reply"></i>&nbsp;取消\r\n                                    </button>\r\n                                </div>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n\r\n        </div>\r\n    </div>\r\n    <!-- /.row -->\r\n\r\n</section>\r\n<!-- /.content -->\r\n';
    return $$out;
};

/***/ }),

/***/ 290:
/***/ (function(module, exports, __webpack_require__) {

var $imports = __webpack_require__(1);
module.exports = function ($data) {
    'use strict';
    $data = $data || {};
    var $$out = '', data = $data.data, $each = $imports.$each, item = $data.item, i = $data.i, $escape = $imports.$escape, path = $data.path;
    $$out += '<div class="col-sm-12">\r\n    <div class="Tables_wrapper form-inline dt-bootstrap no-footer">\r\n        <div class="row">\r\n            <div class="col-sm-6"></div>\r\n            <div class="col-sm-6"></div>\r\n        </div>\r\n        <div class="row">\r\n            <div class="col-sm-12 " style="padding:0 2% 0 2%">\r\n                <table id="example2" class="table table-bordered table-hover dataTable no-footer"\r\n                       role="grid" aria-describedby="example2_info" >\r\n\r\n                    <tbody>\r\n                    ';
    if (data.content.length == 0) {
        $$out += '\r\n                    <tr>\r\n                        <td class="lefttd" colspan="2">没有查询到指定的角色!</td>\r\n                      <!--  <script>\r\n                            layer.msg(`没有查询到指定的角色\uFF01`);\r\n                        </script>-->\r\n                    </tr>\r\n                    ';
    } else {
        $$out += '\r\n                    ';
        $each(data.content, function (item, i) {
            $$out += '\r\n                    <tr role="row" class="odd" e-event="href:/';
            $$out += $escape(path);
            $$out += '/selRole?objname=';
            $$out += $escape(item.name);
            $$out += '&objid=';
            $$out += $escape(item.id);
            $$out += '&contentId=tree_id" id="';
            $$out += $escape(item.id);
            $$out += '">\r\n                        <td class="lefttd active">\r\n\r\n                            <a type="seeChildDic"  class="asst_magt_btn_look "  href="javascript:">\r\n                                <!-- <span  e-event="href:/system/dictionary/seeChildDic?url=/system/core/dictionary/list&objname=';
            $$out += $escape(item.name);
            $$out += '&objid=';
            $$out += $escape(item.id);
            $$out += '" >-->\r\n                                ';
            $$out += $escape(item.name);
            $$out += '\r\n                                </span>\r\n                            </a>\r\n                        </td>\r\n\r\n\r\n\r\n                    </tr>\r\n                    ';
        });
        $$out += '\r\n                    ';
    }
    $$out += '\r\n                    </tbody>\r\n                </table>\r\n              <!--  <div class="row" id="pager" style="width: 50%"></div>-->\r\n                <!-- <div class="btnDiv">\r\n                     <input tpl="core/dictionary/deletBatch" operation="showDialog" permission="core_dictionary_deleteids"\r\n                            dialogtype="deletBatch" class="bbtn" id="deleteMore" value="批量删除" type="button" />\r\n                 </div>-->\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>';
    return $$out;
};

/***/ })

});