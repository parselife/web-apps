define([
    'text!spreadsheeteditor/main/app/template/LeftMenu.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/view/About',
    /** coauthoring begin **/
    'common/main/lib/view/Comments',
    'common/main/lib/view/Chat',
    /** coauthoring end **/
    'common/main/lib/view/SearchDialog',
    'spreadsheeteditor/main/app/view/FileMenu'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    var SCALE_MIN = 40;
    var MENU_SCALE_PART = 300;

    SSE.Views.LeftMenu = Backbone.View.extend(_.extend({
        el: '#left-menu',

        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: function() {
            return {
                /** coauthoring begin **/
                'click #left-btn-comments': _.bind(this.onCoauthOptions, this),
                'click #left-btn-chat': _.bind(this.onCoauthOptions, this),
                /** coauthoring end **/
                'click #left-btn-support': function() {
                    var config = this.mode.customization;
                    config && !!config.feedback && !!config.feedback.url ?
                        window.open(config.feedback.url) :
                        window.open('http://support.onlyoffice.com');
                }
            }
        },

        initialize: function () {
            this.minimizedMode = true;
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
            }));

            this.btnFile = new Common.UI.Button({
                action: 'file',
                el: $('#left-btn-file', this.el),
                hint: this.tipFile + Common.Utils.String.platformKey('Alt+F'),
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });

            this.btnSearch = new Common.UI.Button({
                action: 'search',
                el: $('#left-btn-search', this.el),
                hint: this.tipSearch + Common.Utils.String.platformKey('Ctrl+F'),
                disabled: true,
                enableToggle: true
            });

            this.btnAbout = new Common.UI.Button({
                action: 'about',
                el: $('#left-btn-about', this.el),
                hint: this.tipAbout,
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });

            this.btnSupport = new Common.UI.Button({
                action: 'support',
                el: $('#left-btn-support', this.el),
                hint: this.tipSupport,
                disabled: true
            });

            /** coauthoring begin **/
            this.btnComments = new Common.UI.Button({
                el: $('#left-btn-comments', this.el),
                hint: this.tipComments +  Common.Utils.String.platformKey('Ctrl+Shift+H'),
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });

            this.btnChat = new Common.UI.Button({
                el: $('#left-btn-chat', this.el),
                hint: this.tipChat + Common.Utils.String.platformKey('Alt+Q'),
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });

            this.btnComments.hide();
            this.btnChat.hide();

            this.btnComments.on('click',        _.bind(this.onBtnMenuClick, this));
            this.btnChat.on('click',            _.bind(this.onBtnMenuClick, this));
            /** coauthoring end **/

            this.btnSearch.on('click',          _.bind(this.onBtnMenuClick, this));
            this.btnAbout.on('toggle',          _.bind(this.onBtnMenuToggle, this));
            this.btnFile.on('toggle',           _.bind(this.onBtnMenuToggle, this));

            var menuFile = new SSE.Views.FileMenu({});
            menuFile.options = {alias:'FileMenu'};
            this.btnFile.panel = menuFile.render();
            this.btnAbout.panel = (new Common.Views.About({el: $('#about-menu-panel'), appName: 'Spreadsheet Editor'})).render();

            return this;
        },

        onBtnMenuToggle: function(btn, state) {
            if (state) {
                this.btnFile.pressed && this.fireEvent('file:show', this);

                btn.panel['show']();
                this.$el.width(SCALE_MIN);

                if (this.btnSearch.isActive())
                    this.btnSearch.toggle(false);
            } else {
                (this.btnFile.id == btn.id) && this.fireEvent('file:hide', this);
                btn.panel['hide']();
            }
            if (this.mode.isEdit) SSE.getController('Toolbar').DisableToolbar(state==true);
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },

        onBtnMenuClick: function(btn, e) {
            this.btnFile.toggle(false);
            this.btnAbout.toggle(false);

            if (btn.options.action == 'search') {
            } else {
                if (btn.pressed) {
                    if (!(this.$el.width() > SCALE_MIN)) {
                        this.$el.width(Common.localStorage.getItem('sse-mainmenu-width') || MENU_SCALE_PART);
                    }
                } else {
                    Common.localStorage.setItem('sse-mainmenu-width',this.$el.width());
                    this.$el.width(SCALE_MIN);
                }
            }

//            this.btnChat.id == btn.id && !this.btnChat.pressed && this.fireEvent('chat:hide', this);
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },

        /** coauthoring begin **/
        onCoauthOptions: function(e) {
            if (this.mode.canCoAuthoring) {
                if (this.mode.canComments) {
                    if (this.btnComments.pressed && this.btnComments.$el.hasClass('notify'))
                        this.btnComments.$el.removeClass('notify');
                    this.panelComments[this.btnComments.pressed?'show':'hide']();
                    this.fireEvent((this.btnComments.pressed) ? 'comments:show' : 'comments:hide', this);
                }
               if (this.mode.canChat) {
                   if (this.btnChat.pressed) {
                       if (this.btnChat.$el.hasClass('notify'))
                           this.btnChat.$el.removeClass('notify');

                       this.panelChat.show();
                       this.panelChat.focus();
                   } else
                        this.panelChat['hide']();
               }
            }
        },

        setOptionsPanel: function(name, panel) {
            if (name == 'chat') {
                this.panelChat = panel.render('#left-panel-chat');
            } else if (name == 'comment') {
                this.panelComments = panel;
            }
        },

        markCoauthOptions: function(opt, ignoreDisabled) {
            if (opt=='chat' && this.btnChat.isVisible() &&
                    !this.btnChat.isDisabled() && !this.btnChat.pressed) {
                this.btnChat.$el.addClass('notify');
            }
            if (opt=='comments' && this.btnComments.isVisible() && !this.btnComments.pressed &&
                                (!this.btnComments.isDisabled() || ignoreDisabled) ) {
                this.btnComments.$el.addClass('notify');
            }
        },
        /** coauthoring end **/

        close: function(menu) {
            this.btnFile.toggle(false);
            this.btnAbout.toggle(false);
            this.$el.width(SCALE_MIN);
            /** coauthoring begin **/
            if (this.mode.canCoAuthoring) {
                if (this.mode.canComments) {
                    this.panelComments['hide']();
                    if (this.btnComments.pressed)
                        this.fireEvent('comments:hide', this);
                    this.btnComments.toggle(false, true);
                }
                if (this.mode.canChat) {
                    this.panelChat['hide']();
                    this.btnChat.toggle(false, true);
                }
            }
            /** coauthoring end **/
        },

        isOpened: function() {
            var isopened = this.btnFile.pressed || this.btnSearch.pressed;
            /** coauthoring begin **/
            !isopened && (isopened = this.btnComments.pressed || this.btnChat.pressed);
            /** coauthoring end **/
            return isopened;
        },

        disableMenu: function(menu, disable) {
            this.btnFile.setDisabled(false);
            this.btnAbout.setDisabled(false);
            this.btnSupport.setDisabled(false);
            this.btnSearch.setDisabled(false);
            /** coauthoring begin **/
            this.btnComments.setDisabled(false);
            this.btnChat.setDisabled(false);
            /** coauthoring end **/
        },

        showMenu: function(menu) {
            var re = /^(\w+):?(\w*)$/.exec(menu);
            if (re[1] == 'file') {
                if (!this.btnFile.pressed) {
                    this.btnFile.toggle(true);
                    this.btnFile.$el.focus();
//                    this.onBtnMenuClick(this.btnFile);
                }
                this.btnFile.panel.show(re[2].length ? re[2] : undefined);
            } else {
                /** coauthoring begin **/
                if (menu == 'chat') {
                    if (this.btnChat.isVisible() &&
                            !this.btnChat.isDisabled() && !this.btnChat.pressed) {
                        this.btnChat.toggle(true);
                        this.onBtnMenuClick(this.btnChat);
                        this.onCoauthOptions();
                        this.panelChat.focus();
                    }
                } else
                if (menu == 'comments') {
                    if (this.btnComments.isVisible() &&
                            !this.btnComments.isDisabled() && !this.btnComments.pressed) {
                        this.btnComments.toggle(true);
                        this.onBtnMenuClick(this.btnComments);
                        this.onCoauthOptions();
                        this.btnComments.$el.focus();
                    }
                }
                /** coauthoring end **/
            }
        },

        getMenu: function(type) {
            switch (type) {
            case 'file': return this.btnFile.panel;
            case 'about': return this.btnAbout.panel;
            default: return null;
            }
        },

        setMode: function(mode) {
            this.mode = mode;
            return this;
        },

        /** coauthoring begin **/
        tipComments : 'Comments',
        tipChat     : 'Chat',
        /** coauthoring end **/
        tipAbout    : 'About',
        tipSupport  : 'Feedback & Support',
        tipFile     : 'File',
        tipSearch   : 'Search'
    }, SSE.Views.LeftMenu || {}));
});
