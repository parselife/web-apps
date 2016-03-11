define([
    'text!spreadsheeteditor/main/app/template/FileMenu.template',
    'underscore',
    'common/main/lib/component/BaseView'
], function (tpl, _) {
    'use strict';

    SSE.Views.FileMenu = Common.UI.BaseView.extend(_.extend({
        el: '#file-menu-panel',

        template: _.template(tpl),

        events: function() {
            return {
                'click .fm-btn': _.bind(function(event){
                    var $item = $(event.currentTarget);
                    if (!$item.hasClass('active')) {
                        $('.fm-btn',this.el).removeClass('active');
                        $item.addClass('active');
                    }

                    var item = _.findWhere(this.items, {el: event.currentTarget});
                    if (item) {
                        var panel = this.panels[item.options.action];
                        this.fireEvent('item:click', [this, item.options.action, !!panel]);

                        if (panel) {
                            this.$el.find('.content-box:visible').hide();
                            this.active = item.options.action;
                            panel.show();
                        }
                    }
                }, this)
            };
        },

        initialize: function () {
        },

        render: function () {
            this.$el = $(this.el);
            this.$el.html(this.template());

            this.items = [];
            this.items.push(
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-return',this.el),
                    action  : 'back',
                    caption : this.btnReturnCaption,
                    canFocused: false
                }),
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-save',this.el),
                    action  : 'save',
                    caption : this.btnSaveCaption,
                    canFocused: false
                }),
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-edit',this.el),
                    action  : 'edit',
                    caption : this.btnToEditCaption,
                    canFocused: false
                }),
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-download',this.el),
                    action  : 'saveas',
                    caption : this.btnDownloadCaption,
                    canFocused: false
                }),
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-save-desktop',this.el),
                    action  : 'save-desktop',
                    caption : this.btnSaveAsCaption,
                    canFocused: false
                }),
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-print',this.el),
                    action  : 'print',
                    caption : this.btnPrintCaption,
                    canFocused: false
                }),
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-recent',this.el),
                    action  : 'recent',
                    caption : this.btnRecentFilesCaption,
                    canFocused: false
                }),
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-create',this.el),
                    action  : 'new',
                    caption : this.btnCreateNewCaption,
                    canFocused: false
                }),
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-info',this.el),
                    action  : 'info',
                    caption : this.btnInfoCaption,
                    canFocused: false
                }),
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-rights',this.el),
                    action  : 'rights',
                    caption : this.btnRightsCaption,
                    canFocused: false
                }),
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-settings',this.el),
                    action  : 'opts',
                    caption : this.btnSettingsCaption,
                    canFocused: false
                }),
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-help',this.el),
                    action  : 'help',
                    caption : this.btnHelpCaption,
                    canFocused: false
                }),
                new Common.UI.MenuItem({
                    el      : $('#fm-btn-back',this.el),
                    action  : 'exit',
                    caption : this.btnBackCaption,
                    canFocused: false
                })
            );

            var me = this;
            this.panels = {};
            require(['spreadsheeteditor/main/app/view/FileMenuPanels'], function(){
                me.panels = {
                    'saveas'    : (new SSE.Views.FileMenuPanels.ViewSaveAs({menu:me})).render(),
                    'opts'      : (new SSE.Views.FileMenuPanels.Settings({menu:me})).render(),
                    'info'      : (new SSE.Views.FileMenuPanels.DocumentInfo({menu:me})).render(),
                    'rights'    : (new SSE.Views.FileMenuPanels.DocumentRights({menu:me})).render(),
                    'help'      : (new SSE.Views.FileMenuPanels.Help({menu:me})).render()
                };

                me.$el.find('.content-box').hide();
            });

            return this;
        },

        show: function(panel) {
            if (this.isVisible() && panel===undefined) return;

            if (!panel)
                panel = this.active || ((this.mode.canDownload && (!this.mode.isDesktopApp || !this.mode.isOffline)) ? 'saveas' : 'info');
            this.$el.show();
            this.selectMenu(panel);
            if (this.mode.isEdit) SSE.getController('Toolbar').DisableToolbar(true);
            this.api.asc_enableKeyEvents(false);
        },

        hide: function() {
            this.$el.hide();
            if (this.mode.isEdit) SSE.getController('Toolbar').DisableToolbar(false);
            this.api.asc_enableKeyEvents(true);
        },

        applyMode: function() {
            this.items[5][this.mode.canPrint?'show':'hide']();
            this.items[6][this.mode.canOpenRecent?'show':'hide']();
            this.items[7][this.mode.canCreateNew?'show':'hide']();
            this.items[7].$el.find('+.devider')[this.mode.canCreateNew?'show':'hide']();

            this.items[3][(this.mode.canDownload && (!this.mode.isDesktopApp || !this.mode.isOffline))?'show':'hide']();
            this.items[4][(this.mode.canDownload && this.mode.isDesktopApp && this.mode.isOffline)?'show':'hide']();
//            this.hkSaveAs[this.mode.canDownload?'enable':'disable']();

            this.items[1][this.mode.isEdit?'show':'hide']();
            this.items[2][!this.mode.isEdit&&this.mode.canEdit?'show':'hide']();

            this.items[9][(!this.mode.isOffline && this.document&&this.document.info&&(this.document.info.sharingSettings&&this.document.info.sharingSettings.length>0 ||
                                                                                       this.mode.sharingSettingsUrl&&this.mode.sharingSettingsUrl.length))?'show':'hide']();

            this.items[10][this.mode.isEdit?'show':'hide']();
            this.items[10].$el.find('+.devider')[this.mode.isEdit?'show':'hide']();

            this.mode.canBack ? this.$el.find('#fm-btn-back').show().prev().show() :
                                    this.$el.find('#fm-btn-back').hide().prev().hide();

            this.panels['opts'].setMode(this.mode);
            this.panels['info'].setMode(this.mode).updateInfo(this.document);
            this.panels['rights'].setMode(this.mode).updateInfo(this.document);

            if ( this.mode.canCreateNew ) {
                if (this.mode.templates && this.mode.templates.length) {
                    $('a',this.items[7].$el).text(this.btnCreateNewCaption + '...');
                    this.panels['new'] = ((new SSE.Views.FileMenuPanels.CreateNew({menu: this, docs: this.mode.templates})).render());
                }
            }

            if ( this.mode.canOpenRecent ) {
                if (this.mode.recent){
                    this.panels['recent'] = (new SSE.Views.FileMenuPanels.RecentFiles({menu:this, recent: this.mode.recent})).render();
                }
            }

            this.panels['help'].setLangConfig(this.mode.lang);
        },

        setMode: function(mode, delay) {
            if (mode.isDisconnected) {
                this.mode.canEdit = this.mode.isEdit = false;
                this.mode.canOpenRecent = this.mode.canCreateNew = false;
            } else {
                this.mode = mode;
            }

            if (!delay) this.applyMode();
        },

        setApi: function(api) {
            this.api = api;
            if (this.panels['opts']) this.panels['opts'].setApi(api);
            this.api.asc_registerCallback('asc_onDocumentName',  _.bind(this.onDocumentName, this));
        },

        loadDocument: function(data) {
            this.document = data.doc;
        },

        selectMenu: function(menu) {
            if ( menu ) {
                var item    = this._getMenuItem(menu),
                    panel   = this.panels[menu];
                if ( item && panel ) {
                    $('.fm-btn',this.el).removeClass('active');
                    item.$el.addClass('active');

                    this.$el.find('.content-box:visible').hide();
                    panel.show();

                    this.active = menu;
                }
            }
        },

        _getMenuItem: function(action) {
            return _.find(this.items, function(item) {
                return item.options.action == action;
            });
        },

        onDocumentName: function(name) {
            this.document.title = name;
            this.panels['info'].updateInfo(this.document);
        },

        btnSaveCaption          : 'Save',
        btnDownloadCaption      : 'Download as...',
        btnInfoCaption          : 'Document Info...',
        btnRightsCaption        : 'Access Rights...',
        btnCreateNewCaption     : 'Create New',
        btnRecentFilesCaption   : 'Open Recent...',
        btnPrintCaption         : 'Print',
        btnHelpCaption          : 'Help...',
        btnReturnCaption        : 'Back to Document',
        btnToEditCaption        : 'Edit Document',
        btnBackCaption          : 'Go to Documents',
        btnSettingsCaption      : 'Advanced Settings...',
        btnSaveAsCaption        : 'Save as'
    }, SSE.Views.FileMenu || {}));
});
