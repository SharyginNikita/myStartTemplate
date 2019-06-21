'use strict';

import state from './state';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';
import Vuex from 'vuex';
import Vue from 'vue';
import modules from './modules';

Vue.use(Vuex);

export default new Vuex.Store({
    modules,
    state,
    getters,
    mutations,
    actions,
});
