"use strict";
import store from '../../vuex';
import Layout from './layout';

import Vue from 'vue';
import Vuex from 'vuex';

import { mapActions } from 'vuex';

export default class module {

    constructor(el) {

        new Vue({
            el,
            store,
            render: h => h(Layout)
        });
    }
}
