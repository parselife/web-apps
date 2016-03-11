/**
 *  HeaderFooterSettings.js
 *
 *  Created by Julia Radzhabova on 02/03/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!documenteditor/main/app/template/HeaderFooterSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/CheckBox'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.HeaderFooterSettings = Backbone.View.extend(_.extend({
        el: '#id-header-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'HeaderFooterSettings'
        },

        initialize: function () {
            var me = this;
            this._initSettings = true;

            this._state = {
                PositionType: c_pageNumPosition.PAGE_NUM_POSITION_TOP,
                Position: 12.5,
                DiffFirst: false,
                DiffOdd: false,
                SameAs: false,
                DisabledControls: false
            };
            this.spinners = [];
            this.lockedControls = [];
            this._locked = false;

            this.render();

            var _arrPosition = [
                [c_pageNumPosition.PAGE_NUM_POSITION_TOP,     c_pageNumPosition.PAGE_NUM_POSITION_LEFT,      'icon-right-panel btn-colontitul-tl', 'headerfooter-button-top-left', this.textTopLeft],
                [c_pageNumPosition.PAGE_NUM_POSITION_TOP,     c_pageNumPosition.PAGE_NUM_POSITION_CENTER,    'icon-right-panel btn-colontitul-tc', 'headerfooter-button-top-center', this.textTopCenter],
                [c_pageNumPosition.PAGE_NUM_POSITION_TOP,     c_pageNumPosition.PAGE_NUM_POSITION_RIGHT,     'icon-right-panel btn-colontitul-tr', 'headerfooter-button-top-right', this.textTopRight],
                [c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM,  c_pageNumPosition.PAGE_NUM_POSITION_LEFT,      'icon-right-panel btn-colontitul-bl', 'headerfooter-button-bottom-left', this.textBottomLeft],
                [c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM,  c_pageNumPosition.PAGE_NUM_POSITION_CENTER,    'icon-right-panel btn-colontitul-bc', 'headerfooter-button-bottom-center', this.textBottomCenter],
                [c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM,  c_pageNumPosition.PAGE_NUM_POSITION_RIGHT,     'icon-right-panel btn-colontitul-br', 'headerfooter-button-bottom-right', this.textBottomRight]
            ];

            this._btnsPosition = [];
            _.each(_arrPosition, function(item, index, list){
                var _btn = new Common.UI.Button({
                    cls: 'btn-options huge',
                    iconCls: item[2],
                    posWhere:item[0],
                    posAlign:item[1],
                    hint: item[4]
                });
                _btn.render( $('#'+item[3])) ;
                _btn.on('click', _.bind(this.onBtnPositionClick, this));
                this._btnsPosition.push( _btn );
                this.lockedControls.push(_btn);
            }, this);

            this.numPosition = new Common.UI.MetricSpinner({
                el: $('#headerfooter-spin-position'),
                step: .1,
                width: 85,
                value: '1.25 cm',
                defaultUnit : "cm",
                maxValue: 55.88,
                minValue: 0
            });
            this.spinners.push(this.numPosition);
            this.lockedControls.push(this.numPosition);

            this.lblPosition = $(this.el).find('#headerfooter-label-position');

            this.chDiffFirst = new Common.UI.CheckBox({
                el: $('#headerfooter-check-diff-first'),
                labelText: this.textDiffFirst
            });
            this.lockedControls.push(this.chDiffFirst);

            this.chDiffOdd = new Common.UI.CheckBox({
                el: $('#headerfooter-check-diff-odd'),
                labelText: this.textDiffOdd
            });
            this.lockedControls.push(this.chDiffOdd);

            this.chSameAs = new Common.UI.CheckBox({
                el: $('#headerfooter-check-same-as'),
                labelText: this.textSameAs
            });
            this.lockedControls.push(this.chSameAs);

            this.numPosition.on('change', _.bind(this.onNumPositionChange, this));
            this.chDiffFirst.on('change', _.bind(this.onDiffFirstChange, this));
            this.chDiffOdd.on('change', _.bind(this.onDiffOddChange, this));
            this.chSameAs.on('change', _.bind(this.onSameAsChange, this));
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
                scope: this
            }));
        },

        setApi: function(api) {
            this.api = api;
            return this;
        },

        ChangeSettings: function(prop) {
            if (this._initSettings) {
                this.createDelayedElements();
                this._initSettings = false;
            }

            this.disableControls(this._locked);

            if (prop) {
                var value = prop.get_Type();
                if (this._state.PositionType !== value) {
                    if (value == c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM)
                        this.lblPosition[0].innerHTML = this.textHeaderFromBottom;
                    else
                        this.lblPosition[0].innerHTML = this.textHeaderFromTop;
                    this._state.PositionType = value;
                }

                value = prop.get_Position();
                if ( Math.abs(this._state.Position-value)>0.001 ) {
                    this.numPosition.setValue(Common.Utils.Metric.fnRecalcFromMM(value), true);
                    this._state.Position = value;
                }

                value = prop.get_DifferentFirst();
                if ( this._state.DiffFirst!==value ) {
                    this.chDiffFirst.setValue(value, true);
                    this._state.DiffFirst=value;
                }

                value = prop.get_DifferentEvenOdd();
                if ( this._state.DiffOdd!==value ) {
                    this.chDiffOdd.setValue(value, true);
                    this._state.DiffOdd=value;
                }

                value = prop.get_LinkToPrevious();
                if ( this._state.SameAs!==value ) {
                    this.chSameAs.setDisabled(value===null);
                    this.chSameAs.setValue(value==true, true);
                    this._state.SameAs=value;
                }
            }
        },

        onBtnPositionClick: function(btn, eOpts){
            if (this.api)
                this.api.put_PageNum(btn.options.posWhere, btn.options.posAlign);
            this.fireEvent('editcomplete', this);
        },

        onNumPositionChange: function(field, newValue, oldValue, eOpts){
            if (this.api)
                this.api.put_HeadersAndFootersDistance(Common.Utils.Metric.fnRecalcToMM(field.getNumberValue()));
            this.fireEvent('editcomplete', this);
        },

        onDiffFirstChange: function(field, newValue, oldValue, eOpts){
            if (this.api)
                this.api.HeadersAndFooters_DifferentFirstPage(field.getValue()=='checked');
            this.fireEvent('editcomplete', this);
        },

        onDiffOddChange: function(field, newValue, oldValue, eOpts){
            if (this.api)
                this.api.HeadersAndFooters_DifferentOddandEvenPage((field.getValue()=='checked'));
            this.fireEvent('editcomplete', this);
        },

        onSameAsChange: function(field, newValue, oldValue, eOpts){
            if (this.api)
                this.api.HeadersAndFooters_LinkToPrevious((field.getValue()=='checked'));
            this.fireEvent('editcomplete', this);
        },

        updateMetricUnit: function() {
            if (this.spinners) {
                for (var i=0; i<this.spinners.length; i++) {
                    var spinner = this.spinners[i];
                    spinner.setDefaultUnit(Common.Utils.Metric.metricName[Common.Utils.Metric.getCurrentMetric()]);
                    spinner.setStep(Common.Utils.Metric.getCurrentMetric()==Common.Utils.Metric.c_MetricUnits.cm ? 0.01 : 1);
                }
            }
        },

        createDelayedElements: function() {
            this.updateMetricUnit();
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
            }
        },

        textHeaderFromTop:      'Header from Top',
        textHeaderFromBottom:   'Header from Bottom',
        textPosition:           'Position',
        textOptions:            'Options',
        textDiffFirst:          'Different first page',
        textDiffOdd:            'Different odd and even pages',
        textPageNum:            'Insert Page Number',
        textTopLeft:            'Top Left',
        textTopRight:           'Top Right',
        textTopCenter:          'Top Center',
        textBottomLeft:         'Bottom Left',
        textBottomRight:        'Bottom Right',
        textBottomCenter:       'Bottom Center',
        textSameAs:             'Link to Previous'
    }, DE.Views.HeaderFooterSettings || {}));
});