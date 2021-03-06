//#region Copyright, Version, and Description
/*
 *  Functions to enable Breeze to use POST for queries when
 *  special parameters are passed using the .withParameters function.
 *
 * Copyright 2014 IdeaBlade, Inc.  All Rights Reserved.  
 * Use, reproduction, distribution, and modification of this code is subject to the terms and 
 * conditions of the IdeaBlade Breeze license, available at http://www.breezejs.com/license
 *
 * Author: Steve Schmidt
 * Version: 1.1.0 - revised: eliminated return object, configAjaxAdapter method; add ajaxPostEnabled flag
 *          1.0.6 - original
 * 
 * Special parameters:
 *  $method: ‘POST’ or ‘GET’ (the default)
 *  $encoding: ‘JSON’ or x-www-form-urlencoded (the default)
 *  $data: contains the data to be sent to the server
 *
 * Installation: 
 *    play script after breeze
 *    call breeze.ajaxpost() if you change the ajax adapter (e.g, in Angular apps)
 *
 * Example:
 *   var query = breeze.EntityQuery.from('SimilarCustomersPOST')
 *            .withParameters({ 
 *                $method: 'POST',
 *                $encoding: 'JSON',
 *               $data: { CompanyName: 'Hilo Hattie', ContactName: 'Donald', City: 'Duck', Country: 'USA', Phone: '808-234-5678' } 
 *           });
 *
 */
//#endregion
(function (definition, window) {
    if (window.breeze) {
        definition(window.breeze);
    } else if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // CommonJS or Node
        var b = require('breeze');
        definition(b);
    } else if (typeof define === "function" && define["amd"] && !window.breeze) {
        // Requirejs / AMD 
        define(['breeze'], definition);
    } else {
        throw new Error("Can't find breeze");
    }
}(function (breeze) {
    'use strict';
    breeze.ajaxpost = function(ajaxAdapter) {
        wrapAjaxImpl(ajaxAdapter);
    };

    breeze.ajaxpost(); // immediately wrap whatever is the current ajax adapter

    ////////////////////

    function wrapAjaxImpl(ajaxAdapter) {
        if (!ajaxAdapter) {
            ajaxAdapter = breeze.config.getAdapterInstance("ajax");
        }
        if (ajaxAdapter.ajaxPostEnabled){
            return; // already wrapped it.
        }

        var ajaxFunction = ajaxAdapter.ajax;
        if (ajaxFunction) {
            ajaxAdapter.ajax = function (settings) {
                processSettings(settings);
                return ajaxFunction.call(ajaxAdapter, settings);
            };
            ajaxAdapter.ajaxPostEnabled = true;
        }
    }

    // Handle the POST-specific properties in the settings - $method, $data, $encoding
    function processSettings(settings) {
        var parameters = settings && settings.params;
        if (!parameters) return settings;

        // wrapped data; handle the special properties
        settings.type = parameters.$method || settings.type; // GET is default method

        var data = parameters.$data;
        if (data) {
         // if $data exists, assume all of other parameters are guidance for building a POST
            if (parameters.$encoding === 'JSON') {
                // JSON encoding 
                settings.processData = false; // don't let JQuery form-encode it 
                settings.contentType = "application/json; charset=UTF-8";

                if (typeof (data) === 'object') {
                    settings.data = JSON.stringify(data); // encode parameters as JSON
                } else {
                    settings.data = data;
                }
            } else {
                settings.data = data;
            }
            // must be null or jQuery ajax adapter won't see settings.data
            settings.params = null; 
        }

        return settings;
    }

}, this));
